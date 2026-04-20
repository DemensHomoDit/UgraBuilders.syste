import React, { useState, useEffect } from "react";
import { db } from "@/integrations/db/client";
import ImageUploader from "@/components/shared/ImageUploader";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ReviewImagesProps {
  reviewId?: string;
  review?: any;
}

const ReviewImages: React.FC<ReviewImagesProps> = ({ review, reviewId }) => {
  const id = reviewId || review?.id;
  const [images, setImages] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchImages = async () => {
      const { data } = await db
        .from("review_images")
        .select("*")
        .eq("review_id", id)
        .order("display_order");
      if (data) setImages(data);
    };
    fetchImages();
  }, [id]);

  const handleImageUpload = async (url: string) => {
    if (!id || !url) return;
    setIsUploading(true);
    try {
      const { data, error } = await db
        .from("review_images")
        .insert({ review_id: id, image_url: url, display_order: images.length })
        .select()
        .single();
      if (error) throw error;
      if (data) setImages((prev) => [...prev, data]);
      toast.success("Изображение добавлено");
    } catch (err: any) {
      toast.error(err.message || "Ошибка добавления изображения");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    try {
      const { error } = await db.from("review_images").delete().eq("id", imageId);
      if (error) throw error;
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      toast.success("Изображение удалено");
    } catch (err: any) {
      toast.error(err.message || "Ошибка удаления изображения");
    }
  };

  if (!id) {
    return (
      <div className="text-sm text-muted-foreground p-4 border rounded-md">
        Сохраните отзыв, чтобы добавить изображения
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm">Изображения</h4>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {images.map((img) => (
            <div key={img.id} className="relative group">
              <img
                src={img.image_url}
                alt=""
                className="w-full h-24 object-cover rounded-md"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDelete(img.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <ImageUploader
        onImageUploaded={handleImageUpload}
        bucketName="review-images"
        folderPath={id}
        aspectRatio="4/3"
      />
    </div>
  );
};

export default ReviewImages;