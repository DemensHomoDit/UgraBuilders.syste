
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import ReviewsList from "./ReviewsList";
import ReviewFormDialog from "./ReviewFormDialog";
import { Review } from "@/services/review/types";
import reviewService from "@/services/review";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";

const ReviewsManagement: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const data = await reviewService.getReviews();
      setReviews(data);
    } catch (error) {
      console.error("Error loading reviews:", error);
      toast.error("Не удалось загрузить отзывы");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewClick = () => {
    setSelectedReview(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (review: Review) => {
    setSelectedReview(review);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    // Задержка закрытия диалога для предотвращения проблем с событиями
    setTimeout(() => {
      setSelectedReview(null);
      setIsDialogOpen(false);
      loadReviews(); // Refresh the list after closing dialog
    }, 100);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Управление отзывами</h2>
        <p className="text-muted-foreground">
          Создавайте и управляйте отзывами клиентов
        </p>
      </div>
      <Separator />

      <ReviewsList
        reviews={reviews}
        onNewClick={handleNewClick}
        onEditClick={handleEditClick}
        onReviewsChange={loadReviews}
        isLoading={isLoading}
      />

      <ReviewFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedReview={selectedReview}
        onClose={handleDialogClose}
        userId={user?.id || ''}
      />
    </div>
  );
};

export default ReviewsManagement;
