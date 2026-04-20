
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Review } from "@/services/review/types";
import { Project } from "@/services/project/types";
import { useToast } from "@/components/ui/use-toast";
import { db } from "@/integrations/db/client";
import reviewService from "@/services/review";

// Form validation schema
export const reviewFormSchema = z.object({
  title: z.string().min(1, "Заголовок обязателен"),
  content: z.string().min(1, "Текст отзыва обязателен"),
  author_name: z.string().min(1, "Имя автора обязательно"),
  author_email: z.string().email("Неверный формат email").or(z.string().length(0)).optional(),
  rating: z.number().min(1, "Рейтинг обязателен").max(5),
  project_id: z.string().optional(),
  is_published: z.boolean().default(false),
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;

interface UseReviewFormProps {
  review?: Review;
  onSave: (review: Review) => void;
  onCancel: () => void;
  userId: string;
}

export const useReviewForm = ({ review, onSave, onCancel, userId }: UseReviewFormProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [authorImage, setAuthorImage] = useState(review?.image_url || "");
  const { toast } = useToast();

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      title: review?.title || "",
      content: review?.content || "",
      author_name: review?.author_name || "",
      author_email: review?.author_email || "",
      rating: review?.rating || 5,
      project_id: review?.project_id || "",
      is_published: review?.is_published || false,
    },
  });

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const { data, error } = await db
          .from('projects')
          .select('id, title, areavalue, bathrooms, bedrooms, category_id, content, cover_image, created_at, created_by, description, dimensions, hasgarage, hasterrace, is_published, material, pricevalue, stories, style, tags, type, updated_at')
          .order('title');

        if (error) throw error;
        
        // Transform the data to ensure it matches the Project type
        const transformedProjects: Project[] = (data || []).map(project => ({
          ...project,
          areaValue: project.areavalue,
          priceValue: project.pricevalue,
          hasGarage: project.hasgarage,
          hasTerrace: project.hasterrace
        }));
        
        setProjects(transformedProjects);
      } catch (error) {
        console.error("Error loading projects:", error);
        toast({
          title: "Ошибка загрузки проектов",
          description: "Не удалось загрузить список проектов",
          variant: "destructive",
        });
      }
    };

    loadProjects();
  }, [toast]);

  const handleFormSubmit = async (values: ReviewFormValues) => {
    setIsLoading(true);
    try {
      const reviewData = {
        ...values,
        image_url: authorImage,
      };

      let savedReview: Review;

      if (review?.id) {
        // Обновление существующего отзыва
        savedReview = await reviewService.updateReview(review.id, reviewData);
        toast({
          title: "Отзыв обновлен",
          description: "Отзыв успешно обновлен",
        });
      } else {
        // Создание нового отзыва
        savedReview = await reviewService.createReview({
          ...reviewData,
          created_by: userId,
        });
        toast({
          title: "Отзыв создан",
          description: "Новый отзыв успешно создан",
        });
      }

      onSave(savedReview);
    } catch (error) {
      console.error("Error saving review:", error);
      toast({
        title: "Ошибка сохранения",
        description: "Не удалось сохранить отзыв",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthorImageUpload = (url: string) => {
    setAuthorImage(url);
  };

  return {
    form,
    isLoading,
    projects,
    authorImage,
    handleFormSubmit,
    handleAuthorImageUpload,
    onCancel
  };
};
