
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
import { Loader2 } from "lucide-react";

interface DeleteConfirmDialogProps {
  title: string;
  description: string;
  isOpen: boolean;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => Promise<void>;
  dialogId?: string;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  title,
  description,
  isOpen,
  isDeleting,
  onOpenChange,
  onConfirmDelete,
  dialogId = 'delete-confirm-dialog'
}) => {
  // Создаем уникальные идентификаторы для ARIA атрибутов
  const titleId = `${dialogId}-title`;
  const descriptionId = `${dialogId}-description`;

  // Обработчик для предотвращения закрытия диалога во время удаления
  const handleOpenChange = (open: boolean) => {
    if (!isDeleting) {
      onOpenChange(open);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Фиксируем значение открытости диалога при начале удаления
    // чтобы избежать проблем с состоянием компонента
    if (isOpen && !isDeleting) {
      await onConfirmDelete();
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
          <AlertDialogTitle id={titleId}>{title}</AlertDialogTitle>
          <AlertDialogDescription id={descriptionId}>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            disabled={isDeleting}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            Отмена
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
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
