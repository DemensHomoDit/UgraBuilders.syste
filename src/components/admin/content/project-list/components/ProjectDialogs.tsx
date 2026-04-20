
import React from 'react';
import { Project } from "@/services/project/types";
import ProjectFormDialog from '../ProjectFormDialog';
import DeleteConfirmDialog from '../DeleteConfirmDialog';

interface ProjectDialogsProps {
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
  selectedProject: Project | null;
  handleFormClose: () => void;
  projectToDelete: Project | null;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  onConfirmDelete: () => Promise<void>;
  isDeleting: boolean;
}

export const ProjectDialogs: React.FC<ProjectDialogsProps> = ({
  isFormOpen,
  setIsFormOpen,
  selectedProject,
  handleFormClose,
  projectToDelete,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  onConfirmDelete,
  isDeleting
}) => {
  return (
    <>
      {isFormOpen && (
        <ProjectFormDialog 
          isOpen={isFormOpen} 
          onOpenChange={setIsFormOpen}
          selectedProject={selectedProject}
          onClose={handleFormClose}
        />
      )}

      {projectToDelete && (
        <DeleteConfirmDialog 
          project={projectToDelete}
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={onConfirmDelete}
          isLoading={isDeleting}
        />
      )}
    </>
  );
};
