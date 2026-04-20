
import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import BlogFormImageUpload from "./BlogFormImageUpload";
import { BlogFormValues } from "../hooks/useBlogForm";

interface BlogFormContentProps {
  form: UseFormReturn<BlogFormValues>;
  coverImage: string;
  onImageUpload: (url: string) => void;
}

const BlogFormContent: React.FC<BlogFormContentProps> = ({
  form,
  coverImage,
  onImageUpload
}) => {
  return (
    <div className="space-y-6">
      <BlogFormImageUpload 
        coverImage={coverImage}
        onImageUpload={onImageUpload}
      />

      <FormField
        control={form.control}
        name="content"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Содержание</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Введите содержание записи"
                className="resize-none"
                rows={10}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default BlogFormContent;
