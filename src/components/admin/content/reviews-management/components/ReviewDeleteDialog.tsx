
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
import { Review } from "@/services/review/types";
import { Loader2 } from "lucide-react";

interface ReviewDeleteDialogProps {
  isOpen: boolean;
  isDeleting: boolean;
  reviewToDelete: Review | null;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => Promise<void>;
}

const ReviewDeleteDialog: React.FC<ReviewDeleteDialogProps> = ({
  isOpen,
  isDeleting,
  reviewToDelete,
  onOpenChange,
  onConfirmDelete,
}) => {
  // Уникальные идентификаторы для ARIA атрибутов
  const titleId = reviewToDelete ? `review-delete-title-${reviewToDelete.id}` : 'review-delete-title';
  const descriptionId = reviewToDelete ? `review-delete-description-${reviewToDelete.id}` : 'review-delete-description';

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await onConfirmDelete();
  };

  return (
    <AlertDialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!isDeleting) {
          onOpenChange(open);
        }
      }}
    >
      <AlertDialogContent
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <AlertDialogHeader>
          <AlertDialogTitle id={titleId}>Удаление отзыва</AlertDialogTitle>
          <AlertDialogDescription id={descriptionId}>
            Вы уверены, что хотите удалить отзыв {'"'}
            {reviewToDelete?.title}{'"'}? Это действие невозможно отменить.
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

export default ReviewDeleteDialog;
