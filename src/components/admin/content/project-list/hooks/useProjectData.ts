
import { useState, useEffect, useCallback, useRef } from 'react';
import { Project } from "@/services/project/types";
import { Category } from "@/services/categoryService";
import { useSessionSync } from "@/hooks/useSessionSync";
import { ProjectFilters, ProjectDataReturn } from './project-data/types';
import { useProjectCache } from './project-data/useProjectCache';
import { useProjectSubscription } from './project-data/useProjectSubscription';
import { useDataFetching } from './project-data/useDataFetching';
import { useProjectMutations } from './project-data/useProjectMutations';
import { useProjectFiltering } from './project-data/useProjectFiltering';

/**
 * Главный хук для работы с данными проектов
 */
export function useProjectData(filter?: string): ProjectDataReturn {
  // Refs должны быть определены перед другими хуками
  const mountedRef = useRef<boolean>(true);
  const lastFetchTimeRef = useRef<number>(0);
  const subscriptionCleanupRef = useRef<(() => void) | null>(null);

  // Состояние
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProjectFilters>({
    categoryId: 'all',
    search: '',
    showUnpublished: true,
    projectType: filter || 'all'
  });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [offlineProjects, setOfflineProjects] = useState<Project[]>([]);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Проверка состояния сети
  const sessionSync = useSessionSync();
  const isOnline = sessionSync?.isOnline ?? true;

  // Вспомогательная функция для эмуляции прогресса загрузки
  const simulateLoadingProgress = useCallback(() => {
    setLoadingProgress(0);
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        const nextProgress = prev + Math.random() * 15;
        return nextProgress >= 100 ? 100 : nextProgress;
      });
    }, 200);
    
    return () => clearInterval(interval);
  }, []);

  // Хуки для работы с данными проектов
  const { getCachedProjects, cacheProjects } = useProjectCache();
  const { setupDatabaseSubscription } = useProjectSubscription(getCachedProjects, cacheProjects);
  const { fetchProjects, loadData } = useDataFetching(
    getCachedProjects, 
    cacheProjects, 
    simulateLoadingProgress,
    setIsOfflineMode,
    setProjects,
    setOfflineProjects,
    setCategories,
    setError,
    setIsInitialLoad,
    setLoadingProgress,
    setIsLoading,
    lastFetchTimeRef
  );
  const { handleTogglePublished, handleDeleteProject } = useProjectMutations(
    isOfflineMode,
    simulateLoadingProgress,
    getCachedProjects,
    cacheProjects,
    setProjects,
    setIsLoading,
    setLoadingProgress
  );
  const { handleFilterChange, filterProjects } = useProjectFiltering(setFilters);

  // Обработчики событий реального времени
  useEffect(() => {
    const handleProjectUpdated = (event: CustomEvent) => {
      const { project, type } = event.detail;
      
      if (type === 'INSERT') {
        setProjects(prev => {
          if (prev.some(p => p.id === project.id)) return prev;
          return [project, ...prev];
        });
      } else if (type === 'UPDATE') {
        setProjects(prev => 
          prev.map(p => p.id === project.id ? project : p)
        );
      }
    };
    
    const handleProjectDeleted = (event: CustomEvent) => {
      const { projectId } = event.detail;
      setProjects(prev => {
        const filtered = prev.filter(p => p.id !== projectId);
        return filtered;
      });
    };
    
    window.addEventListener('project-updated', handleProjectUpdated as EventListener);
    window.addEventListener('project-deleted', handleProjectDeleted as EventListener);
    
    return () => {
      window.removeEventListener('project-updated', handleProjectUpdated as EventListener);
      window.removeEventListener('project-deleted', handleProjectDeleted as EventListener);
    };
  }, []);
  
  // useEffect для начальной загрузки и настройки подписки
  useEffect(() => {
    mountedRef.current = true;
    
    // Загружаем данные при первом рендере
    if (isInitialLoad) {
      loadData();
    }
    
    // Настраиваем подписку на изменения в БД только один раз
    if (subscriptionCleanupRef.current === null) {
      const cleanupSubscription = setupDatabaseSubscription();
      subscriptionCleanupRef.current = cleanupSubscription;
    }
    
    // Добавляем обработчик для обновления при возвращении на вкладку
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && mountedRef.current) {
        fetchProjects(true);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Очистка эффекта
    return () => {
      mountedRef.current = false;
      
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Не отключаем подписку здесь, т.к. она нужна и другим компонентам
      // При размонтировании всего приложения подписка будет отключена системой
    };
  }, [isInitialLoad, loadData, setupDatabaseSubscription, fetchProjects]);

  // useEffect для проверки обновления при восстановлении соединения
  useEffect(() => {
    if (isOnline && isOfflineMode && mountedRef.current) {
      fetchProjects(true);
    }
  }, [isOnline, fetchProjects, isOfflineMode]);

  // Применяем фильтры к проектам
  const filteredProjects = filterProjects(projects, offlineProjects, filters);

  // Оборачиваем handleTogglePublished для приведения его к правильному типу
  const handleTogglePublishedById = useCallback(async (id: string) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      return handleTogglePublished(project);
    }
  }, [handleTogglePublished, projects]);

  return {
    projects: filteredProjects,
    categories,
    isLoading,
    loadingProgress,
    error,
    filters,
    isOfflineMode,
    handleTogglePublished: handleTogglePublishedById,
    handleDeleteProject,
    handleFilterChange,
    loadData
  };
}
