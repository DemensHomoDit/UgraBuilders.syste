import { useCallback } from 'react';
import { Project } from "@/services/project/types";
import { usePublishMutation } from './mutations/usePublishMutation';
import { useDeleteMutation } from './mutations/useDeleteMutation';
import projectUpdateService from '@/services/project/projectUpdateService';

export function useProjectMutations(
  isOfflineMode: boolean,
  simulateLoadingProgress: () => (() => void),
  getCachedProjects: () => Project[] | null,
  cacheProjects: (projects: Project[]) => void,
  setProjects: (setter: (prev: Project[]) => Project[]) => void,
  setIsLoading: (isLoading: boolean) => void,
  setLoadingProgress: (progress: number) => void
) {
  const clearAllProjectCaches = useCallback((projectId: string) => {
    try {
      sessionStorage.removeItem('cached_projects');
      sessionStorage.removeItem(`project_data_${projectId}`);
      
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.startsWith('projects_') || key.includes('project_list'))) {
          sessionStorage.removeItem(key);
        }
      }
    } catch (err) {
      console.warn('Error clearing project caches:', err);
    }
  }, []);

  const { handleTogglePublished } = usePublishMutation(
    isOfflineMode,
    simulateLoadingProgress,
    getCachedProjects,
    cacheProjects,
    setProjects,
    setIsLoading,
    setLoadingProgress
  );

  const { handleDeleteProject } = useDeleteMutation(
    isOfflineMode,
    simulateLoadingProgress,
    getCachedProjects,
    cacheProjects,
    setProjects,
    setIsLoading,
    setLoadingProgress,
    clearAllProjectCaches
  );

  // --- Workflow actions ---
  const handleSendToReview = useCallback(async (project: Project) => {
    if (!project.id) return;
    await projectUpdateService.updateProjectStatus(project.id, 'pending');
    setProjects(prev => prev.map(p => p.id === project.id ? { ...p, status: 'pending' } : p));
  }, [setProjects]);

  const handleRevoke = useCallback(async (project: Project) => {
    if (!project.id) return;
    await projectUpdateService.updateProjectStatus(project.id, 'draft');
    setProjects(prev => prev.map(p => p.id === project.id ? { ...p, status: 'draft' } : p));
  }, [setProjects]);

  const handleApprove = useCallback(async (project: Project) => {
    if (!project.id) return;
    await projectUpdateService.updateProjectStatus(project.id, 'published');
    setProjects(prev => prev.map(p => p.id === project.id ? { ...p, status: 'published' } : p));
  }, [setProjects]);

  const handleReject = useCallback(async (project: Project) => {
    if (!project.id) return;
    await projectUpdateService.updateProjectStatus(project.id, 'rejected');
    setProjects(prev => prev.map(p => p.id === project.id ? { ...p, status: 'rejected' } : p));
  }, [setProjects]);

  return {
    handleTogglePublished,
    handleDeleteProject,
    clearAllProjectCaches,
    handleSendToReview,
    handleRevoke,
    handleApprove,
    handleReject
  };
}
