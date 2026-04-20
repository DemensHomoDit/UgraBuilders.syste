
import { useState, useCallback } from "react";
import { Project } from "@/services/project/types";
import { useNavigate } from "react-router-dom";

export function useProjectListState() {
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAddProject = useCallback(() => {
    navigate("/account/projects/new");
  }, [navigate]);

  // Изменяем, чтобы принимать строковый ID
  const handleEditProject = useCallback((projectId: string) => {
    navigate(`/account/projects/edit/${projectId}`);
  }, [navigate]);

  const handleViewProject = useCallback((projectId: string) => {
    navigate(`/projects/${projectId}`);
  }, [navigate]);

  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
    setSelectedProject(null);
  }, []);

  const handleOpenDeleteDialog = useCallback((project: Project) => {
    setProjectToDelete(project);
    setIsDeleteDialogOpen(true);
  }, []);

  return {
    isFormOpen,
    setIsFormOpen,
    selectedProject,
    setSelectedProject,
    projectToDelete,
    setProjectToDelete,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isDeleting,
    setIsDeleting,
    handleAddProject,
    handleEditProject,
    handleViewProject,
    handleFormClose,
    handleOpenDeleteDialog,
  };
}
