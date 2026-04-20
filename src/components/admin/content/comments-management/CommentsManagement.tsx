
import React, { useState, useEffect } from 'react';
import { toast } from "sonner";
import { Comment } from "@/services/comments/types";
import commentService from "@/services/comments/commentService";
import { Separator } from "@/components/ui/separator";
import { CommentsList } from "./";
import CommentDeleteDialog from "./CommentDeleteDialog";

const CommentsManagement: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const allComments = await commentService.getAllComments();
      setComments(allComments);
    } catch (error) {
      console.error("Error loading comments:", error);
      toast.error("Не удалось загрузить комментарии");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await loadComments();
      } catch (error) {
        console.error("Error initializing comments management:", error);
        // Fix: Use the correct toast.error format instead of object with title
        toast.error("Ошибка инициализации: Не удалось загрузить комментарии");
      } finally {
        setIsLoading(false);
      }
    };
    
    init();
  }, []);

  const handleApproveComment = async (commentId: string) => {
    try {
      const result = await commentService.approveComment(commentId);
      if (result) {
        toast.success("Комментарий одобрен");
        loadComments();
      } else {
        toast.error("Не удалось одобрить комментарий");
      }
    } catch (error) {
      console.error("Error approving comment:", error);
      toast.error("Ошибка при одобрении комментария");
    }
  };

  const handleRejectComment = async (commentId: string) => {
    try {
      const result = await commentService.rejectComment(commentId);
      if (result) {
        toast.success("Комментарий отклонен");
        loadComments();
      } else {
        toast.error("Не удалось отклонить комментарий");
      }
    } catch (error) {
      console.error("Error rejecting comment:", error);
      toast.error("Ошибка при отклонении комментария");
    }
  };

  const handleDeleteClick = (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      setSelectedComment(comment);
      setIsDeleteDialogOpen(true);
    } else {
      console.error(`Comment with ID ${commentId} not found`);
      toast.error("Комментарий не найден");
    }
  };

  const confirmDelete = async () => {
    if (!selectedComment) return;
    
    setIsLoading(true);
    
    try {
      const success = await commentService.deleteComment(selectedComment.id);
      
      if (success) {
        toast.success("Комментарий успешно удален");
        loadComments();
      } else {
        console.error(`Failed to delete comment: ${selectedComment.id}`);
        toast.error("Не удалось удалить комментарий");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Произошла ошибка при удалении комментария");
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setSelectedComment(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Управление комментариями</h2>
        <p className="text-muted-foreground">
          Модерация комментариев к записям блога
        </p>
      </div>
      <Separator />

      <CommentsList
        comments={comments}
        isLoading={isLoading}
        onApprove={handleApproveComment}
        onReject={handleRejectComment}
        onDelete={handleDeleteClick}
      />

      <CommentDeleteDialog
        isOpen={isDeleteDialogOpen}
        isDeleting={isLoading}
        commentToDelete={selectedComment}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirmDelete={confirmDelete}
      />
    </div>
  );
};

export default CommentsManagement;
