import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Review } from "@/services/review/types";
import { toast } from "sonner";
import reviewService from "@/services/review";
import ReviewsTable from "./components/ReviewsTable";
import ReviewDeleteDialog from "./components/ReviewDeleteDialog";

interface ReviewsListProps {
  reviews: Review[];
  onNewClick: () => void;
  onEditClick: (review: Review) => void;
  onReviewsChange: () => void;
  isLoading: boolean;
}

const ReviewsList: React.FC<ReviewsListProps> = ({
  reviews,
  onNewClick,
  onEditClick,
  onReviewsChange,
  isLoading,
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEditClick = (review: Review) => {
    onEditClick(review);
  };

  const handleDeleteClick = (review: Review) => {
    setReviewToDelete(review);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async (): Promise<void> => {
    if (!reviewToDelete) return;
    
    setIsDeleting(true);
    
    try {
      const success = await reviewService.deleteReview(reviewToDelete.id);
      
      if (success) {
        toast.success("Отзыв удален успешно");
        onReviewsChange();
      } else {
        console.error("Failed to delete review");
        toast.error("Не удалось удалить отзыв");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Произошла ошибка при удалении отзыва");
    } finally {
      // Добавляем небольшую задержку перед очисткой состояния
      setTimeout(() => {
        setIsDeleting(false);
        setIsDeleteDialogOpen(false);
        setReviewToDelete(null);
      }, 100);
    }
  };

  // --- Workflow actions ---
  const handleSendToReview = async (review: Review) => {
    if (!review.id) return;
    await reviewService.updateReviewStatus(review.id, 'pending');
    onReviewsChange();
  };
  const handleRevoke = async (review: Review) => {
    if (!review.id) return;
    await reviewService.updateReviewStatus(review.id, 'draft');
    onReviewsChange();
  };
  const handleApprove = async (review: Review) => {
    if (!review.id) return;
    await reviewService.updateReviewStatus(review.id, 'published');
    onReviewsChange();
  };
  const handleReject = async (review: Review) => {
    if (!review.id) return;
    await reviewService.updateReviewStatus(review.id, 'rejected');
    onReviewsChange();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-left">Отзывы клиентов</CardTitle>
          <CardDescription className="text-left">
            Управляйте отзывами клиентов о ваших проектах
          </CardDescription>
        </div>
        <Button 
          onClick={onNewClick}
          type="button"
        >
          <Plus className="mr-2 h-4 w-4" /> Добавить отзыв
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <ReviewsTable
            reviews={reviews}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
            onSendToReview={handleSendToReview}
            onRevoke={handleRevoke}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}
      </CardContent>

      <ReviewDeleteDialog
        isOpen={isDeleteDialogOpen}
        isDeleting={isDeleting}
        reviewToDelete={reviewToDelete}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirmDelete={confirmDelete}
      />
    </Card>
  );
};

export default ReviewsList;
