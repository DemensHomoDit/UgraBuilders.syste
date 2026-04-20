
import React from "react";
import { Form } from "@/components/ui/form";
import { BlogPost } from "@/services/blog/types";
import { useBlogForm } from "./hooks/useBlogForm";
import { 
  BlogFormDetails, 
  BlogFormContent, 
  BlogFormPublishControl, 
  BlogFormActions 
} from "./components";

interface BlogFormProps {
  blogPost?: BlogPost;
  onSave: (blogPost: BlogPost) => void;
  onCancel: () => void;
  userId: string;
}

const BlogForm: React.FC<BlogFormProps> = ({ 
  blogPost, 
  onSave, 
  onCancel,
  userId
}) => {
  const {
    form,
    isLoading,
    categories,
    coverImage,
    handleFormSubmit,
    handleCoverImageUpload,
    onCancel: handleCancel
  } = useBlogForm({
    blogPost,
    onSave,
    onCancel,
    userId
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <BlogFormDetails 
              form={form}
              categories={categories}
            />
            <BlogFormPublishControl form={form} />
          </div>

          <div className="space-y-6">
            <BlogFormContent
              form={form}
              coverImage={coverImage}
              onImageUpload={handleCoverImageUpload}
            />
          </div>
        </div>

        <BlogFormActions 
          isLoading={isLoading} 
          onCancel={handleCancel} 
        />
      </form>
    </Form>
  );
};

export default BlogForm;
