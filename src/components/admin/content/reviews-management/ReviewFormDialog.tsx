
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Review } from "@/services/review/types";
import ReviewForm from "./ReviewForm";

interface ReviewFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedReview: Review | null;
  onClose: () => void;
  userId: string;
}

const ReviewFormDialog: React.FC<ReviewFormDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedReview,
  onClose,
  userId,
}) => {
  const handleDialogOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      onClose();
    }
  };

  const title = selectedReview ? "Редактирование отзыва" : "Новый отзыв";

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent 
        className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => {
          // Предотвращаем закрытие диалога при клике на фон во время загрузки
          e.preventDefault(); 
        }}
        onEscapeKeyDown={(e) => {
          // Предотвращаем закрытие диалога по нажатию Escape во время загрузки
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Заполните форму ниже для создания или редактирования отзыва
          </DialogDescription>
        </DialogHeader>
        <ReviewForm 
          review={selectedReview} 
          onSuccess={onClose} 
          userId={userId} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default ReviewFormDialog;
