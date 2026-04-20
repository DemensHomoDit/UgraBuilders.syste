
import { useCallback } from 'react';
import { Project } from "@/services/project/types";
import { toast } from "sonner";
import projectDeleteService from "@/services/project/projectDeleteService";

export const useDeleteMutation = (
  isOfflineMode: boolean,
  simulateLoadingProgress: () => (() => void),
  getCachedProjects: () => Project[] | null,
  cacheProjects: (projects: Project[]) => void,
  setProjects: (setter: (prev: Project[]) => Project[]) => void,
  setIsLoading: (isLoading: boolean) => void,
  setLoadingProgress: (progress: number) => void,
  clearAllProjectCaches: (projectId: string) => void
) => {
  const handleDeleteProject = useCallback(async (projectId: string) => {
    if (!projectId) return false;
    
    if (isOfflineMode) {
      toast.error("Action unavailable in offline mode", {
        description: "Wait for internet connection to delete project"
      });
      return false;
    }
    
    setIsLoading(true);
    const stopProgressSimulation = simulateLoadingProgress();
    
    try {
      setProjects(prevProjects => {
        const filteredProjects = prevProjects.filter(p => p.id !== projectId);
        return filteredProjects;
      });
      
      const cachedProjects = getCachedProjects();
      if (cachedProjects) {
        const updatedCache = cachedProjects.filter(p => p.id !== projectId);
        cacheProjects(updatedCache);
      }
      
      const result = await projectDeleteService.deleteProject(projectId);
      
      if (result) {
        window.dispatchEvent(new CustomEvent('project-deleted', { 
          detail: { projectId: projectId, success: true }
        }));
        
        clearAllProjectCaches(projectId);
        
        return true;
      } else {
        window.dispatchEvent(new CustomEvent('project-deleted', { 
          detail: { projectId: projectId, success: false }
        }));
        
        toast.error("Failed to delete project");
        return false;
      }
    } catch (error: any) {
      console.error("Error deleting project:", error);
      toast.error("Error deleting project", {
        description: error.message || "Failed to delete project"
      });
      return false;
    } finally {
      stopProgressSimulation();
      setLoadingProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setLoadingProgress(0);
      }, 300);
    }
  }, [
    simulateLoadingProgress, 
    isOfflineMode, 
    getCachedProjects, 
    cacheProjects, 
    setProjects,
    setIsLoading,
    setLoadingProgress,
    clearAllProjectCaches
  ]);

  return {
    handleDeleteProject
  };
};
