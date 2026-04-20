
import React from "react";
import { Comment } from "@/services/comments/types";
import DeleteConfirmDialog from "../shared/DeleteConfirmDialog";

interface CommentDeleteDialogProps {
  isOpen: boolean;
  isDeleting: boolean;
  commentToDelete: Comment | null;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => Promise<void>;
}

const CommentDeleteDialog: React.FC<CommentDeleteDialogProps> = ({
  isOpen,
  isDeleting,
  commentToDelete,
  onOpenChange,
  onConfirmDelete,
}) => {
  if (!commentToDelete) {
    return null;
  }

  // Создаем уникальный идентификатор для диалога на основе ID комментария
  const dialogId = `comment-delete-${commentToDelete.id}`;

  return (
    <DeleteConfirmDialog
      title="Удалить комментарий"
      description={`Вы действительно хотите удалить комментарий пользователя ${commentToDelete.author_name}? Это действие нельзя отменить.`}
      isOpen={isOpen}
      isDeleting={isDeleting}
      onOpenChange={onOpenChange}
      onConfirmDelete={onConfirmDelete}
      dialogId={dialogId}
    />
  );
};

export default CommentDeleteDialog;
