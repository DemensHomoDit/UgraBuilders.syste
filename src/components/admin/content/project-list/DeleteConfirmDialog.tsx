
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Project } from "@/services/project/types";
import { Loader2 } from "lucide-react";

interface DeleteConfirmDialogProps {
  project: Project | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  project,
  isOpen,
  onOpenChange,
  onConfirm,
  isLoading = false,
}) => {
  if (!project) return null;

  // Уникальные идентификаторы для ARIA
  const titleId = `delete-project-title-${project.id}`;
  const descriptionId = `delete-project-description-${project.id}`;

  // Функция для предотвращения закрытия диалога во время загрузки
  const handleOpenChange = (open: boolean) => {
    if (!isLoading) {
      onOpenChange(open);
    }
  };

  // Обработчик для подтверждения удаления
  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Выполняем удаление только если диалог открыт и не идет процесс удаления
    if (isOpen && !isLoading) {
      onConfirm();
    }
  };

  return (
    <AlertDialog 
      open={isOpen} 
      onOpenChange={handleOpenChange}
    >
      <AlertDialogContent
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <AlertDialogHeader>
          <AlertDialogTitle id={titleId}>
            Удалить проект?
          </AlertDialogTitle>
          <AlertDialogDescription id={descriptionId}>
            Вы уверены, что хотите удалить проект "{project.title}"?
            <br />
            Это действие невозможно отменить.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Отмена</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmDelete}
            disabled={isLoading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Удаление...
              </>
            ) : (
              "Удалить"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmDialog;
