
import { useCallback } from 'react';
import { Project } from "@/services/project/types";

// Объект для хранения состояния подписки на изменения
export const subscriptionState = {
  isSubscribed: false,
  channel: null as any,
  subscribers: 0
};

// Кэш проектов 
let projectsCache: Project[] | null = null;

/**
 * Хук для кэширования проектов между компонентами
 */
export function useProjectCache() {
  // Получение кэшированных проектов
  const getCachedProjects = useCallback(() => {
    return projectsCache;
  }, []);
  
  // Обновление кэша проектов
  const cacheProjects = useCallback((projects: Project[]) => {
    projectsCache = [...projects];
  }, []);
  
  // Очистка кэша проектов
  const clearCache = useCallback(() => {
    projectsCache = null;
  }, []);

  // Проверка наличия проекта в кэше по ID
  const isProjectCached = useCallback((projectId: string): boolean => {
    if (!projectsCache) return false;
    return projectsCache.some(project => project.id === projectId);
  }, []);

  // Получение проекта из кэша по ID
  const getProjectById = useCallback((projectId: string): Project | null => {
    if (!projectsCache) return null;
    return projectsCache.find(project => project.id === projectId) || null;
  }, []);

  // Добавление или обновление проекта в кэше
  const updateProjectInCache = useCallback((project: Project) => {
    if (!projectsCache) {
      projectsCache = [project];
      return;
    }
    
    const index = projectsCache.findIndex(p => p.id === project.id);
    if (index !== -1) {
      // Обновляем существующий проект
      projectsCache = [
        ...projectsCache.slice(0, index),
        project,
        ...projectsCache.slice(index + 1)
      ];
    } else {
      // Добавляем новый проект
      projectsCache = [project, ...projectsCache];
    }
  }, []);

  // Удаление проекта из кэша по ID
  const removeProjectFromCache = useCallback((projectId: string) => {
    if (!projectsCache) return;
    projectsCache = projectsCache.filter(p => p.id !== projectId);
  }, []);

  // Получение информации о состоянии подписки
  const getSubscriptionState = useCallback(() => {
    return {
      isSubscribed: subscriptionState.isSubscribed,
      hasChannel: !!subscriptionState.channel,
      subscribers: subscriptionState.subscribers
    };
  }, []);

  return {
    getCachedProjects,
    cacheProjects,
    clearCache,
    isProjectCached,
    getProjectById,
    updateProjectInCache,
    removeProjectFromCache,
    getSubscriptionState
  };
}
