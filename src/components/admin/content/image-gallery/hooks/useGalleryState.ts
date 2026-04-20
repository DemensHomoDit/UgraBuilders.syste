
import { useState, useRef, useEffect } from 'react';
import { ProjectImage } from "@/services/project/types";

interface UseGalleryStateProps {
  onDialogChange?: (open: boolean) => void;
}

export const useGalleryState = ({ onDialogChange }: UseGalleryStateProps = {}) => {
  const isMounted = useRef(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDescriptionDialogOpen, setIsDescriptionDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ProjectImage | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (onDialogChange) {
      const dialogState = isAddDialogOpen || isDescriptionDialogOpen;
      onDialogChange(dialogState);
    }
  }, [isAddDialogOpen, isDescriptionDialogOpen, onDialogChange]);

  const safeSetState = <T extends unknown>(
    setter: React.Dispatch<React.SetStateAction<T>>, 
    value: T
  ): void => {
    if (isMounted.current) {
      setter(value);
    }
  };

  return {
    isMounted,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isDescriptionDialogOpen,
    setIsDescriptionDialogOpen,
    selectedImage,
    setSelectedImage,
    isLoading,
    setIsLoading,
    safeSetState
  };
};
