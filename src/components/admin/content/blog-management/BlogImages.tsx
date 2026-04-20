
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import { ImageGallery } from "../image-gallery";
import { ProjectImage } from "@/services/project/types";
import blogService from "@/services/blog";
import { BlogPost } from "@/services/blog/types";
import { toast } from "sonner";

interface BlogImagesProps {
  blogPost: BlogPost;
}

const BlogImages: React.FC<BlogImagesProps> = ({ blogPost }) => {
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadImages = async () => {
      if (blogPost?.id) {
        setIsLoading(true);
        try {
          const blogImages = await blogService.getBlogImages(blogPost.id);
          setImages(blogImages);
        } catch (error) {
          console.error(`Error loading images for blog ${blogPost.id}:`, error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadImages();
  }, [blogPost?.id]);

  const handleImageAdd = async (image: ProjectImage): Promise<void> => {
    setImages(prev => [...prev, image]);
  };

  const handleImageUpdate = async (imageId: string, data: Partial<ProjectImage>): Promise<void> => {
    const updatedImage = await blogService.updateBlogImage(imageId, data);
    if (updatedImage) {
      setImages(prev => 
        prev.map(img => img.id === imageId ? updatedImage : img)
      );
    }
  };

  const handleImageDelete = async (imageId: string): Promise<boolean> => {
    try {
      const success = await blogService.deleteBlogImage(imageId);
      if (success) {
        setImages(prev => prev.filter(img => img.id !== imageId));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Не удалось удалить изображение");
      return false;
    }
  };

  const handleImagesReorder = async (reorderedImages: ProjectImage[]): Promise<void> => {
    const orderData = reorderedImages.map((img, index) => ({
      id: img.id,
      display_order: index
    }));
    
    const success = await blogService.updateImagesOrder(orderData);
    if (success) {
      setImages(reorderedImages);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ImageIcon className="mr-2 h-5 w-5" />
          Изображения блога
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ImageGallery
          projectId={blogPost.id}
          images={images}
          onImageAdd={handleImageAdd}
          onImageUpdate={handleImageUpdate}
          onImageDelete={handleImageDelete}
          onImagesReorder={handleImagesReorder}
          folderPath="blog-images"
        />
      </CardContent>
    </Card>
  );
};

export default BlogImages;
