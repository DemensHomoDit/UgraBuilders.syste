
import { useCallback } from 'react';
import { db } from "@/integrations/db/client";
import { Project } from "@/services/project/types";
import { subscriptionState } from './useProjectCache';

/**
 * Хук для управления подпиской на изменения в таблице проектов
 */
export function useProjectSubscription(getCachedProjects: () => Project[] | null, cacheProjects: (projects: Project[]) => void) {
  /**
   * Настраивает подписку на изменения в базе данных
   */
  const setupDatabaseSubscription = useCallback(() => {
    // Увеличиваем счетчик подписчиков
    subscriptionState.subscribers = Math.max(0, subscriptionState.subscribers) + 1;
    
    // Логируем информацию о текущем состоянии подписки
    // Создаем подписку только если она еще не создана
    if (!subscriptionState.isSubscribed || !subscriptionState.channel) {
      const projectsSubscription = db
        .channel('projects-changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'projects' 
        }, (payload) => {
          // Безопасно извлекаем идентификаторы для логирования
          const newId = payload.new && typeof payload.new === 'object' && 'id' in payload.new ? payload.new.id : undefined;
          const oldId = payload.old && typeof payload.old === 'object' && 'id' in payload.old ? payload.old.id : undefined;
          if (payload.eventType === 'INSERT') {
            // Проверяем, что payload.new существует и имеет id
            if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
              // Обрабатываем добавление проекта
              updateProjectsList(payload.new as Project, 'INSERT');
            }
          } else if (payload.eventType === 'UPDATE') {
            // Проверяем, что payload.new существует и имеет id
            if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
              // Обрабатываем обновление проекта
              updateProjectsList(payload.new as Project, 'UPDATE');
            }
          } else if (payload.eventType === 'DELETE') {
            // Проверяем, что payload.old существует и имеет id
            if (payload.old && typeof payload.old === 'object' && 'id' in payload.old) {
              // Обрабатываем удаление проекта
              deleteProjectFromList(payload.old.id);
            }
          }
        })
        .subscribe();
      
      subscriptionState.channel = projectsSubscription;
      subscriptionState.isSubscribed = true;
    }
    
    // Функция для обновления списка проектов в состоянии и в кэше
    function updateProjectsList(project: Project, type: 'INSERT' | 'UPDATE') {
      // Обновляем состояние компонента с проектами
      window.dispatchEvent(new CustomEvent('project-updated', { detail: { project, type } }));
      
      // Обновляем кэшированные проекты
      const cachedProjects = getCachedProjects();
      if (cachedProjects) {
        let updatedCache: Project[];
        
        if (type === 'INSERT') {
          if (!cachedProjects.some(p => p.id === project.id)) {
            updatedCache = [project, ...cachedProjects];
          } else {
            return;
          }
        } else { // UPDATE
          updatedCache = cachedProjects.map(p => 
            p.id === project.id ? project : p
          );
        }
        
        cacheProjects(updatedCache);
      }
    }
    
    // Функция для удаления проекта из списка
    function deleteProjectFromList(projectId: string) {
      // Обновляем состояние компонента через кастомное событие
      window.dispatchEvent(new CustomEvent('project-deleted', { detail: { projectId } }));
      
      // Обновляем кэшированные проекты
      const cachedProjects = getCachedProjects();
      if (cachedProjects) {
        const updatedCache = cachedProjects.filter(p => p.id !== projectId);
        cacheProjects(updatedCache);
      }
    }
    
    // Возвращаем функцию очистки, которая только уменьшает счетчик подписчиков,
    // но не удаляет подписку на базу данных
    return () => {
      // Уменьшаем счетчик, но гарантируем, что он не станет отрицательным
      if (subscriptionState.subscribers > 0) {
        subscriptionState.subscribers -= 1;
      }
      // Подписка теперь сохраняется постоянно, независимо от количества подписчиков
    };
  }, [getCachedProjects, cacheProjects]);

  return {
    setupDatabaseSubscription
  };
}
