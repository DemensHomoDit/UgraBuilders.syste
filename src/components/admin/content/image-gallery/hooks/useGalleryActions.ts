
import { useCallback } from 'react';
import { ProjectImage } from "@/services/project/types";

interface UseGalleryActionsProps {
  setIsAddDialogOpen: (open: boolean) => void;
  setSelectedImage: (image: ProjectImage | null) => void;
  setIsDescriptionDialogOpen: (open: boolean) => void;
  onDialogChange?: (open: boolean) => void;
}

export const useGalleryActions = ({
  setIsAddDialogOpen,
  setSelectedImage,
  setIsDescriptionDialogOpen,
  onDialogChange
}: UseGalleryActionsProps) => {
  const handleAddImage = useCallback(async (): Promise<void> => {
    setIsAddDialogOpen(true);
    if (onDialogChange) onDialogChange(true);
    return Promise.resolve();
  }, [setIsAddDialogOpen, onDialogChange]);

  const handleSelectImage = useCallback(async (image: ProjectImage): Promise<void> => {
    setSelectedImage(image);
    setIsDescriptionDialogOpen(true);
    if (onDialogChange) onDialogChange(true);
    return Promise.resolve();
  }, [setSelectedImage, setIsDescriptionDialogOpen, onDialogChange]);

  const handleCloseAddDialog = useCallback(() => {
    setIsAddDialogOpen(false);
    if (onDialogChange) onDialogChange(false);
  }, [setIsAddDialogOpen, onDialogChange]);

  const handleCloseDescriptionDialog = useCallback(() => {
    setIsDescriptionDialogOpen(false);
    setSelectedImage(null);
    if (onDialogChange) onDialogChange(false);
  }, [setIsDescriptionDialogOpen, setSelectedImage, onDialogChange]);

  return {
    handleAddImage,
    handleSelectImage,
    handleCloseAddDialog,
    handleCloseDescriptionDialog
  };
};
