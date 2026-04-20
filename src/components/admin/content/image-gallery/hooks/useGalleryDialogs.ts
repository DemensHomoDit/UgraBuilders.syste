
import { useState, useEffect } from "react";

interface UseGalleryDialogsProps {
  onDialogChange?: (isDialogOpen: boolean) => void;
}

const useGalleryDialogs = ({ onDialogChange }: UseGalleryDialogsProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDescriptionDialogOpen, setIsDescriptionDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Notify parent component about dialog state
  useEffect(() => {
    if (onDialogChange) {
      const dialogState = isAddDialogOpen || isDescriptionDialogOpen || isLoading;
      onDialogChange(dialogState);
    }
  }, [isAddDialogOpen, isDescriptionDialogOpen, isLoading, onDialogChange]);

  return {
    isAddDialogOpen,
    setIsAddDialogOpen,
    isDescriptionDialogOpen,
    setIsDescriptionDialogOpen,
    isLoading,
    setIsLoading
  };
};

export default useGalleryDialogs;
