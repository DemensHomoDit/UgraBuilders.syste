
import React, { memo } from "react";
import { ProjectImage } from "@/services/project/types";
import AddImageDialog from "../AddImageDialog";
import EditDescriptionDialog from "./EditDescriptionDialog";

interface GalleryDialogsProps {
  projectId: string;
  isAddDialogOpen: boolean;
  isDescriptionDialogOpen: boolean;
  isLoading: boolean;
  selectedImage: ProjectImage | null;
  folderPath: string;
  onCloseAddDialog: () => void;
  onCloseDescriptionDialog: () => void;
  onImageAdd: (image: ProjectImage) => Promise<void>;
  onSaveDescription: (imageId: string, description: string) => Promise<void>;
}

// Используем memo для предотвращения лишних перерисовок
const GalleryDialogs: React.FC<GalleryDialogsProps> = memo(({
  projectId,
  isAddDialogOpen,
  isDescriptionDialogOpen,
  isLoading,
  selectedImage,
  folderPath,
  onCloseAddDialog,
  onCloseDescriptionDialog,
  onImageAdd,
  onSaveDescription
}) => {
  return (
    <>
      {/* Диалог добавления изображения - показываем только если открыт */}
      {isAddDialogOpen && (
        <AddImageDialog
          projectId={projectId}
          isOpen={isAddDialogOpen}
          onClose={onCloseAddDialog}
          onImageAdd={onImageAdd}
          folderPath={folderPath}
        />
      )}

      {/* Диалог редактирования описания - показываем только если открыт и есть выбранное изображение */}
      {isDescriptionDialogOpen && selectedImage && (
        <EditDescriptionDialog
          image={selectedImage}
          isOpen={isDescriptionDialogOpen}
          isLoading={isLoading}
          onClose={onCloseDescriptionDialog}
          onSave={(description) => onSaveDescription(selectedImage.id, description)}
        />
      )}
    </>
  );
});

// Устанавливаем отображаемое имя для компонента
GalleryDialogs.displayName = "GalleryDialogs";

export default GalleryDialogs;
