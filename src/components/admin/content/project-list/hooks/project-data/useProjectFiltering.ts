import { useCallback } from 'react';
import { Project } from "@/services/project/types";
import { ProjectFilters } from './types';

/**
 * Хук для фильтрации проектов
 */
export function useProjectFiltering(
  setFilters: (setter: (prev: ProjectFilters) => ProjectFilters) => void
) {
  /**
   * Обработчик изменения фильтров
   */
  const handleFilterChange = useCallback((name: string, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  }, [setFilters]);

  /**
   * Фильтрует проекты на основе текущих фильтров
   */
  const filterProjects = useCallback((
    projects: Project[], 
    offlineProjects: Project[], 
    filters: ProjectFilters
  ) => {
    // Объединяем проекты из основного состояния и из офлайн-режима
    const allProjects = [...projects, ...offlineProjects];
    
    // Удаляем дубликаты
    const uniqueIds = new Set();
    const uniqueProjects: Project[] = [];
    
    for (const p of allProjects) {
      if (p.id && !uniqueIds.has(p.id)) {
        uniqueIds.add(p.id);
        uniqueProjects.push(p);
      }
    }
    
    // Применяем фильтры
    return uniqueProjects.filter(project => {
      // Фильтр по статусу публикации
      if (!filters.showUnpublished && !project.is_published) {
        return false;
      }
      
      // Фильтр по категории
      if (filters.categoryId && filters.categoryId !== 'all' && project.category_id !== filters.categoryId) {
        return false;
      }
      
      // Фильтр по типу проекта
      if (filters.projectType && filters.projectType !== 'all') {
        if (filters.projectType === 'published' && !project.is_published) return false;
        if (filters.projectType === 'draft' && project.is_published) return false;
        
        if (filters.projectType !== 'published' && 
            filters.projectType !== 'draft' && 
            filters.projectType !== 'archived' && 
            project.type !== filters.projectType) return false;
      }
      
      // Фильтр по статусу
      if (filters.status && filters.status !== 'all') {
        if (!project.status || project.status !== filters.status) {
          return false;
        }
      }
      
      // Поиск по тексту
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        return (
          (project.title && project.title.toLowerCase().includes(searchTerm)) ||
          (project.description && project.description.toLowerCase().includes(searchTerm)) ||
          (project.content && project.content.toLowerCase().includes(searchTerm))
        );
      }
      
      return true;
    });
  }, []);

  return {
    handleFilterChange,
    filterProjects
  };
}
