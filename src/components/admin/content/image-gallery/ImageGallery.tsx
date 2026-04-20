
import React from "react";
import { ProjectImage } from "@/services/project/types";
import GalleryView from "./components/GalleryView";
import GalleryDialogs from "./components/GalleryDialogs";
import useGalleryImages from "./hooks/useGalleryImages";
import { useGalleryState } from "./hooks/useGalleryState";
import { useGalleryActions } from "./hooks/useGalleryActions";

export interface ImageGalleryProps {
  projectId: string;
  images?: ProjectImage[];
  onImageAdd?: (image: ProjectImage) => Promise<void>;
  onImageUpdate?: (imageId: string, data: Partial<ProjectImage>) => Promise<void>;
  onImageDelete?: (imageId: string) => Promise<boolean>;
  onImagesReorder?: (reorderedImages: ProjectImage[]) => Promise<void>;
  onDialogChange?: (open: boolean) => void;
  folderPath?: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  projectId,
  images = [],
  onImageAdd,
  onImageUpdate,
  onImageDelete,
  onImagesReorder,
  onDialogChange,
  folderPath = `project-${projectId}`
}) => {
  const {
    isMounted,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isDescriptionDialogOpen,
    setIsDescriptionDialogOpen,
    selectedImage,
    setSelectedImage,
    isLoading,
    setIsLoading
  } = useGalleryState({ onDialogChange });

  const {
    handleAddImage,
    handleSelectImage,
    handleCloseAddDialog,
    handleCloseDescriptionDialog
  } = useGalleryActions({
    setIsAddDialogOpen,
    setSelectedImage,
    setIsDescriptionDialogOpen,
    onDialogChange
  });

  const {
    localImages,
    handleImageAdd,
    handleSaveDescription,
    handleDeleteImage,
    handleMoveUp,
    handleMoveDown
  } = useGalleryImages({
    projectId,
    images,
    onImageAdd: onImageAdd || (async () => { return Promise.resolve(); }),
    onImageUpdate: onImageUpdate || (async () => { return Promise.resolve(); }),
    onImageDelete: onImageDelete || (async () => { return Promise.resolve(true); }),
    onImagesReorder
  });

  if (!isMounted.current) {
    return null;
  }

  return (
    <>
      <GalleryView
        localImages={localImages}
        onAddImage={handleAddImage}
        onImageSelect={handleSelectImage}
        onMoveUp={index => {
          const image = localImages[index];
          if (image) return handleMoveUp(image);
          return Promise.resolve();
        }}
        onMoveDown={index => {
          const image = localImages[index];
          if (image) return handleMoveDown(image);
          return Promise.resolve();
        }}
        onDeleteImage={handleDeleteImage}
      />

      {(isAddDialogOpen || isDescriptionDialogOpen) && (
        <GalleryDialogs
          projectId={projectId}
          isAddDialogOpen={isAddDialogOpen}
          isDescriptionDialogOpen={isDescriptionDialogOpen}
          isLoading={isLoading}
          selectedImage={selectedImage}
          folderPath={folderPath}
          onCloseAddDialog={handleCloseAddDialog}
          onCloseDescriptionDialog={handleCloseDescriptionDialog}
          onImageAdd={handleImageAdd}
          onSaveDescription={handleSaveDescription}
        />
      )}
    </>
  );
};
