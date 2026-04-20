
import React from "react";
import DeleteConfirmDialog from "../../shared/DeleteConfirmDialog";
import { BlogPost } from "@/services/blog/types";

interface BlogDeleteDialogProps {
  isOpen: boolean;
  isDeleting: boolean;
  blogToDelete: BlogPost | null;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => Promise<void>;
}

const BlogDeleteDialog: React.FC<BlogDeleteDialogProps> = ({
  isOpen,
  isDeleting,
  blogToDelete,
  onOpenChange,
  onConfirmDelete,
}) => {
  // Создаем уникальный идентификатор для диалога на основе ID блог-поста
  const dialogId = blogToDelete ? `blog-delete-${blogToDelete.id}` : 'blog-delete-dialog';

  return (
    <DeleteConfirmDialog
      title="Вы уверены?"
      description="Это действие не может быть отменено. Запись блога и все связанные с ней изображения будут удалены навсегда."
      isOpen={isOpen}
      isDeleting={isDeleting}
      onOpenChange={onOpenChange}
      onConfirmDelete={onConfirmDelete}
      dialogId={dialogId}
    />
  );
};

export default BlogDeleteDialog;
