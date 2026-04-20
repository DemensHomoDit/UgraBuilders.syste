import { useCallback } from 'react';
import { Project } from "@/services/project/types";
import { toast } from "sonner";
import projectService from "@/services/project/index";
import { db } from "@/integrations/db/client";

export const usePublishMutation = (
  isOfflineMode: boolean,
  simulateLoadingProgress: () => (() => void),
  getCachedProjects: () => Project[] | null,
  cacheProjects: (projects: Project[]) => void,
  setProjects: (setter: (prev: Project[]) => Project[]) => void,
  setIsLoading: (isLoading: boolean) => void,
  setLoadingProgress: (progress: number) => void
) => {
  const handleTogglePublished = useCallback(async (project: Project) => {
    if (isOfflineMode) {
      toast.error("Action unavailable in offline mode", {
        description: "Wait for internet connection to change publication status"
      });
      return;
    }
    
    if (!project.id) {
      toast.error("Cannot update project without ID");
      return;
    }
    
    const currentStatus = Boolean(project.is_published);
    const newPublishedStatus = !currentStatus;
    const newStatus = newPublishedStatus ? 'published' : 'draft';
    setIsLoading(true);
    const stopProgressSimulation = simulateLoadingProgress();
    
    try {
      // Optimistic update
      setProjects(prevProjects => 
        prevProjects.map(p => 
          p.id === project.id ? { ...p, is_published: newPublishedStatus } : p
        )
      );
      
      const updateData = {
        id: project.id,
        is_published: newPublishedStatus,
        style: project.style || 'classic'
      };
      
      const result = await projectService.updateProject(project.id, updateData);
      
      if (result) {
        const cachedProjects = getCachedProjects();
        if (cachedProjects) {
          const updatedCache = cachedProjects.map(p => 
            p.id === project.id ? { ...p, ...result } : p
          );
          cacheProjects(updatedCache);
        }
        
        setProjects(prevProjects => 
          prevProjects.map(p => 
            p.id === project.id ? { ...p, ...result } : p
          )
        );
        
        window.dispatchEvent(new CustomEvent('project-updated', { 
          detail: { project: result, type: 'UPDATE' }
        }));
        
        const actualStatus = Boolean(result.is_published);
        if (actualStatus === newPublishedStatus) {
          toast.success(newPublishedStatus ? "Project published" : "Project unpublished");
        } else {
          toast.warning("Publication status differs from expected. Interface updated.");
        }
        
        await projectService.updateProjectStatus(project.id, newStatus);
        setProjects(prevProjects => 
          prevProjects.map(p => 
            p.id === project.id ? { ...p, is_published: newPublishedStatus, status: newStatus } : p
          )
        );
      } else {
        const { data: currentProject } = await db
          .from('projects')
          .select('*')
          .eq('id', project.id)
          .maybeSingle();
          
        if (currentProject) {
          setProjects(prevProjects => 
            prevProjects.map(p => 
              p.id === project.id ? { ...p, ...currentProject } : p
            )
          );
          
          const cachedProjects = getCachedProjects();
          if (cachedProjects) {
            const updatedCache = cachedProjects.map(p => 
              p.id === project.id ? { ...p, ...currentProject } : p
            );
            cacheProjects(updatedCache);
          }
        } else {
          setProjects(prevProjects => 
            prevProjects.map(p => 
              p.id === project.id ? { ...p, is_published: currentStatus } : p
            )
          );
          
          toast.error("Failed to change publication status");
        }
      }
    } catch (error: any) {
      console.error("Error changing publication status:", error);
      
      setProjects(prevProjects => 
        prevProjects.map(p => 
          p.id === project.id ? { ...p, is_published: currentStatus } : p
        )
      );
      
      toast.error("Error updating project", {
        description: error.message || "Failed to change publication status"
      });
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
    setLoadingProgress
  ]);

  return {
    handleTogglePublished
  };
};
