import React, { useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Archive, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/integrations/db/client";
import { useProjectData } from "./hooks/project-data/useProjectData";
import { useProjectListState } from "./hooks/useProjectListState";
import ProjectFilters from "./ProjectFilters";
import ProjectGrid from "./ProjectGrid";
import { ProjectDialogs } from "./components/ProjectDialogs";
import { 
  ProjectErrorState, 
  ProjectEmptyState, 
  ProjectHeader,
  ProjectLoadingIndicator
} from "./components";
import { useProjectOperations } from "@/hooks/useProjectOperations";

interface ProjectListProps {
  viewMode?: "grid" | "list";
  filter?: string;
  onProjectDeleted?: () => void;
  onPublishToggled?: () => void;
  user?: { role: string };
}

const ProjectList: React.FC<ProjectListProps> = ({ 
  viewMode = "grid", 
  filter,
  onProjectDeleted,
  onPublishToggled,
  user
}) => {
  const mountedRef = useRef<boolean>(true);
  
  const {
    isFormOpen,
    selectedProject,
    projectToDelete,
    isDeleteDialogOpen,
    isDeleting,
    setIsDeleting,
    setProjectToDelete,
    setIsDeleteDialogOpen,
    handleEditProject,
    handleAddProject,
    handleFormClose,
    handleOpenDeleteDialog,
    setIsFormOpen
  } = useProjectListState();

  const {
    projects,
    categories,
    isLoading,
    loadingProgress,
    error,
    filters,
    handleFilterChange,
    loadData,
    handleTogglePublished,
    handleSendToReview,
    handleRevoke,
    handleApprove,
    handleReject
  } = useProjectData(filter);
  
  const { handleDeleteProject } = useProjectOperations();
  const [selectedProjectIds, setSelectedProjectIds] = React.useState<string[]>([]);

  const API_BASE = import.meta.env.VITE_API_BASE ?? "";

  const runBulkAction = useCallback(
    async (action: "publish" | "draft" | "delete") => {
      if (selectedProjectIds.length === 0) return;

      const { data: sessionData } = await db.auth.getSession();
      const token = sessionData?.session?.access_token;

      const response = await fetch(`${API_BASE}/api/admin/projects/bulk-action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action, ids: selectedProjectIds }),
      });

      const body = await response.json();
      if (!response.ok || !body?.success) {
        throw new Error(body?.error || "Не удалось выполнить массовое действие");
      }

      setSelectedProjectIds([]);
      await loadData();
      toast.success(`Обработано проектов: ${body?.data?.affected ?? 0}`);
    },
    [API_BASE, selectedProjectIds, loadData],
  );

  const handleTogglePublishedWrapper = useCallback(async (project) => {
    if (!project.id) return false;
    
    try {
      // Вызываем функцию переключения публикации
      const success = await handleTogglePublished(project.id);
      
      if (success) {
        // Если успешно, вызываем колбэк
        if (onPublishToggled) {
          onPublishToggled();
        }
        
        // Загружаем данные без проверки результата
        await loadData();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Ошибка при переключении публикации:", error);
      return false;
    }
  }, [handleTogglePublished, onPublishToggled, loadData]);

  const handleConfirmDelete = useCallback(async () => {
    if (!projectToDelete?.id) return;
    
    setIsDeleting(true);
    try {
      const success = await handleDeleteProject(projectToDelete.id);
      if (success && mountedRef.current) {
        if (onProjectDeleted) onProjectDeleted();
        setTimeout(() => {
          if (mountedRef.current) {
            loadData();
            setIsDeleteDialogOpen(false);
            setProjectToDelete(null);
          }
        }, 500);
      }
    } catch (error) {
      console.error("ProjectList: Error deleting project:", error);
      if (mountedRef.current) {
        setIsDeleting(false);
      }
    }
  }, [projectToDelete, handleDeleteProject, setIsDeleting, loadData, onProjectDeleted, setIsDeleteDialogOpen, setProjectToDelete]);

  const toggleProjectSelection = useCallback((projectId: string, checked: boolean) => {
    setSelectedProjectIds((prev) => {
      if (checked) {
        if (prev.includes(projectId)) return prev;
        return [...prev, projectId];
      }
      return prev.filter((id) => id !== projectId);
    });
  }, []);

  const toggleSelectAll = useCallback((checked: boolean) => {
    if (!checked) {
      setSelectedProjectIds([]);
      return;
    }
    const ids = projects.map((p) => p.id).filter(Boolean) as string[];
    setSelectedProjectIds(ids);
  }, [projects]);

  const handleBulkPublish = useCallback(async () => {
    try {
      await runBulkAction("publish");
    } catch (error: any) {
      toast.error(error?.message || "Не удалось опубликовать проекты");
    }
  }, [runBulkAction]);

  const handleBulkUnpublish = useCallback(async () => {
    try {
      await runBulkAction("draft");
    } catch (error: any) {
      toast.error(error?.message || "Не удалось снять проекты с публикации");
    }
  }, [runBulkAction]);

  const handleBulkDelete = useCallback(async () => {
    try {
      await runBulkAction("delete");
    } catch (error: any) {
      toast.error(error?.message || "Не удалось удалить проекты");
    }
  }, [runBulkAction]);

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  React.useEffect(() => {
    setSelectedProjectIds((prev) =>
      prev.filter((id) => projects.some((p) => p.id === id)),
    );
  }, [projects]);

  React.useEffect(() => {
    const handleProjectDeleted = (event: Event) => {
      const customEvent = event as CustomEvent;
      const deletedProjectId = customEvent.detail?.projectId;
      
      if (deletedProjectId && projectToDelete?.id === deletedProjectId) {
        if (mountedRef.current) {
          setIsDeleting(false);
          setProjectToDelete(null);
          setIsDeleteDialogOpen(false);
          if (onProjectDeleted) onProjectDeleted();
          setTimeout(() => {
            if (mountedRef.current) {
              loadData();
            }
          }, 500);
        }
      }
    };
    
    window.addEventListener('project-deleted', handleProjectDeleted);
    return () => {
      window.removeEventListener('project-deleted', handleProjectDeleted);
    };
  }, [projectToDelete, setIsDeleting, setProjectToDelete, setIsDeleteDialogOpen, loadData, onProjectDeleted]);

  return (
    <div className="space-y-6">
      <ProjectHeader />

      {selectedProjectIds.length > 0 && (
        <div className="flex items-center gap-2 rounded-md border p-3 bg-muted/20">
          <span className="text-sm text-muted-foreground mr-2">
            Выбрано проектов: {selectedProjectIds.length}
          </span>
          <Button size="sm" variant="outline" onClick={handleBulkPublish}>
            <Eye className="h-4 w-4 mr-1" /> Опубликовать
          </Button>
          <Button size="sm" variant="outline" onClick={handleBulkUnpublish}>
            <Archive className="h-4 w-4 mr-1" /> В черновик
          </Button>
          <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
            <Trash2 className="h-4 w-4 mr-1" /> Удалить
          </Button>
        </div>
      )}
      
      <ProjectLoadingIndicator 
        isLoading={isLoading || isDeleting} 
        progress={loadingProgress} 
      />

      <ProjectFilters 
        filters={filters} 
        categories={categories} 
        onFilterChange={handleFilterChange} 
      />

      {error && <ProjectErrorState error={error} onRetry={loadData} />}

      {projects.length === 0 && !isLoading && !error ? (
        <ProjectEmptyState onRetry={loadData} />
      ) : (
        <ProjectGrid 
          projects={projects}
          categories={categories}
          isLoading={isLoading || isDeleting}
          onAddProject={handleAddProject}
          onEditProject={(project) => handleEditProject(project.id)}
          onTogglePublished={handleTogglePublishedWrapper}
          onDeleteProject={handleOpenDeleteDialog}
          onSendToReview={handleSendToReview}
          onRevoke={handleRevoke}
          onApprove={handleApprove}
          onReject={handleReject}
          isAdmin={user?.role === 'admin'}
          userRole={user?.role}
          selectedProjectIds={selectedProjectIds}
          onToggleProjectSelect={toggleProjectSelection}
          onToggleSelectAll={toggleSelectAll}
        />
      )}

      <ProjectDialogs
        isFormOpen={isFormOpen}
        setIsFormOpen={setIsFormOpen}
        selectedProject={selectedProject}
        handleFormClose={handleFormClose}
        projectToDelete={projectToDelete}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        onConfirmDelete={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default ProjectList;
