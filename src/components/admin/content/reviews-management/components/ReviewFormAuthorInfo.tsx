import React from "react";
import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import ImageUploader from "@/components/shared/ImageUploader";

interface ReviewFormAuthorInfoProps {
  form?: any;
  authorImage?: string;
  onImageUpload?: (url: string) => void;
}

const ReviewFormAuthorInfo: React.FC<ReviewFormAuthorInfoProps> = ({
  authorImage,
  onImageUpload,
}) => {
  const form = useFormContext();

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="author_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Имя автора</FormLabel>
            <FormControl>
              <Input placeholder="Введите имя автора" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="author_email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email автора (необязательно)</FormLabel>
            <FormControl>
              <Input placeholder="Введите email автора" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div>
        <FormLabel>Фото автора</FormLabel>
        <ImageUploader
          onImageUploaded={onImageUpload || (() => {})}
          imageUrl={authorImage}
          bucketName="review-images"
          folderPath="authors"
          aspectRatio="1/1"
        />
      </div>
    </div>
  );
};

export default ReviewFormAuthorInfo;