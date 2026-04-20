
import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Review } from "@/services/review/types";
import { ReviewFormDetails } from "./components";
import { ReviewFormAuthorInfo } from "./components";
import { ReviewFormPublishControl } from "./components";
import { ReviewFormActions } from "./components";
import { toast } from "sonner";
import reviewService from "@/services/review";
import ReviewImages from "./ReviewImages";

// Schema for review form validation
const reviewSchema = z.object({
  title: z.string().min(1, "Заголовок обязателен"),
  content: z.string().min(5, "Текст отзыва должен содержать не менее 5 символов"),
  author_name: z.string().min(1, "Имя автора обязательно"),
  author_email: z.string().email("Неверный формат email").optional().or(z.literal("")),
  rating: z.number().min(1, "Оценка обязательна").max(5),
  project_id: z.string().optional(),
  is_published: z.boolean().default(false),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  review: Review | null;
  onSuccess: () => void;
  userId: string;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ review, onSuccess, userId }) => {
  const isEditing = !!review;
  const [isLoading, setIsLoading] = useState(false);
  const [authorImage, setAuthorImage] = useState(review?.image_url || "");

  // Initialize form with default values or existing review data
  const methods = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: isEditing
      ? {
          title: review.title || "",
          content: review.content || "",
          author_name: review.author_name || "",
          author_email: review.author_email || "",
          rating: review.rating || 5,
          project_id: review.project_id ? review.project_id : "no-project",
          is_published: review.is_published !== undefined ? review.is_published : false,
        }
      : {
          title: "",
          content: "",
          author_name: "",
          author_email: "",
          rating: 5,
          project_id: "no-project",
          is_published: false,
        },
  });

  const handleAuthorImageUpload = (url: string) => {
    setAuthorImage(url);
  };

  const onSubmit = async (data: ReviewFormValues) => {
    setIsLoading(true);
    try {
      // Handle the "no-project" special value
      const formattedData = {
        ...data,
        project_id: data.project_id === "no-project" ? null : data.project_id,
        image_url: authorImage,
      };

      // If editing, update the review
      if (isEditing && review) {
        await reviewService.updateReview(review.id, formattedData);
        toast.success("Отзыв успешно обновлен");
      } else {
        // If creating, add the review
        await reviewService.createReview({
          ...formattedData,
          created_by: userId,
        });
        toast.success("Отзыв успешно создан");
      }
      
      onSuccess();
    } catch (error) {
      console.error("Error saving review:", error);
      toast.error("Ошибка при сохранении отзыва");
    } finally {
      setIsLoading(false);
    }
  };

  // Prevent form submission when pressing Enter
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && event.target instanceof HTMLElement) {
      // Allow Enter key in textarea
      if (event.target.tagName !== 'TEXTAREA') {
        event.preventDefault();
      }
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} onKeyDown={handleKeyDown}>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
            <div>
              <ReviewFormDetails />
              <ReviewFormAuthorInfo 
                authorImage={authorImage}
                onImageUpload={handleAuthorImageUpload}
              />
            </div>
            <div>
              <ReviewFormPublishControl />
              <ReviewImages review={review} />
            </div>
          </div>
          
          <ReviewFormActions 
            isLoading={isLoading} 
            onCancel={onSuccess}
            isEditing={isEditing}
          />
        </div>
      </form>
    </FormProvider>
  );
};

export default ReviewForm;
