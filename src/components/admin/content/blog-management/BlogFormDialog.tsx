
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BlogForm from "./BlogForm";
import { BlogPost } from "@/services/blog/types";
import { ImageGallery } from "../image-gallery";
import { ProjectImage } from "@/services/project/types";
import blogService from "@/services/blog";
import { toast } from "sonner";

interface BlogFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedBlogPost: BlogPost | null;
  onClose: () => void;
  userId: string;
}

const BlogFormDialog: React.FC<BlogFormDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedBlogPost,
  onClose,
  userId
}) => {
  const [activeTab, setActiveTab] = useState("details");
  const [blogImages, setBlogImages] = useState<ProjectImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [preventClose, setPreventClose] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

  useEffect(() => {
    const loadBlogImages = async () => {
      if (selectedBlogPost?.id) {
        setIsLoading(true);
        try {
          const images = await blogService.getBlogImages(selectedBlogPost.id);
          setBlogImages(images);
        } catch (error) {
          console.error("Failed to load blog images:", error);
          toast.error("Не удалось загрузить изображения блога");
        } finally {
          setIsLoading(false);
        }
      } else {
        setBlogImages([]);
      }
    };

    if (isOpen && selectedBlogPost?.id) {
      loadBlogImages();
    }
  }, [isOpen, selectedBlogPost?.id]);

  useEffect(() => {
    if (!isOpen) {
      setActiveTab("details");
      setPreventClose(false);
      setIsImageDialogOpen(false);
    }
  }, [isOpen]);

  const handleBlogSave = (blogPost: BlogPost) => {
    onClose();
  };

  const handleImageAdd = async (image: ProjectImage): Promise<void> => {
    if (!selectedBlogPost?.id) return;
    
    try {
      setPreventClose(true);
      const blogImageData = {
        blog_id: selectedBlogPost.id,
        image_url: image.image_url,
        description: image.description || null
      };
      
      const addedImage = await blogService.addBlogImage(blogImageData);
      if (addedImage) {
        setBlogImages(prev => [...prev, addedImage]);
        toast.success("Изображение успешно добавлено");
      }
      return Promise.resolve();
    } catch (error) {
      console.error("Error adding blog image:", error);
      toast.error("Не удалось добавить изображение блога");
      return Promise.reject(error);
    } finally {
      setTimeout(() => {
        setPreventClose(false);
      }, 1000);
    }
  };

  const handleImageUpdate = async (imageId: string, data: Partial<ProjectImage>): Promise<void> => {
    try {
      setPreventClose(true);
      const updatedImage = await blogService.updateBlogImage(imageId, data);
      if (updatedImage) {
        setBlogImages(prev => 
          prev.map(img => img.id === imageId ? updatedImage : img)
        );
        toast.success("Изображение обновлено");
      }
    } catch (error) {
      console.error("Error updating blog image:", error);
      toast.error("Не удалось обновить изображение");
    } finally {
      setTimeout(() => {
        setPreventClose(false);
      }, 1000);
    }
  };

  const handleImageDelete = async (imageId: string): Promise<boolean> => {
    try {
      setPreventClose(true);
      const success = await blogService.deleteBlogImage(imageId);
      if (success) {
        setBlogImages(prev => prev.filter(img => img.id !== imageId));
        toast.success("Изображение удалено");
        return true;
      } else {
        toast.error("Не удалось удалить изображение");
        return false;
      }
    } catch (error) {
      console.error("Error deleting blog image:", error);
      toast.error("Не удалось удалить изображение");
      return false;
    } finally {
      setTimeout(() => {
        setPreventClose(false);
      }, 1000);
    }
  };

  const handleImagesReorder = async (reorderedImages: ProjectImage[]): Promise<void> => {
    try {
      setPreventClose(true);
      const orderData = reorderedImages.map((img, index) => ({
        id: img.id,
        display_order: index
      }));
      
      const success = await blogService.updateImagesOrder(orderData);
      if (success) {
        setBlogImages(reorderedImages);
        toast.success("Порядок изображений обновлен");
      }
    } catch (error) {
      console.error("Error reordering images:", error);
      toast.error("Не удалось обновить порядок изображений");
    } finally {
      setTimeout(() => {
        setPreventClose(false);
      }, 1000);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && (preventClose || isImageDialogOpen)) {
      toast.info("Дождитесь завершения текущей операции");
      return;
    }
    
    onOpenChange(open);
  };

  const handleImageDialogChange = (open: boolean) => {
    setIsImageDialogOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-5xl" onPointerDownOutside={(e) => {
        if (preventClose || isImageDialogOpen) {
          e.preventDefault();
          toast.info("Дождитесь завершения текущей операции");
        }
      }}>
        <DialogHeader>
          <DialogTitle>
            {selectedBlogPost ? "Редактировать запись блога" : "Создать новую запись блога"}
          </DialogTitle>
          <DialogDescription>
            Заполните все необходимые поля для {selectedBlogPost ? "редактирования" : "создания"} записи блога
          </DialogDescription>
        </DialogHeader>
        
        {selectedBlogPost?.id ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Детали записи</TabsTrigger>
              <TabsTrigger value="images">Изображения</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="max-h-[70vh] overflow-y-auto pr-2">
              <BlogForm 
                blogPost={selectedBlogPost}
                onSave={handleBlogSave}
                onCancel={() => {
                  if (preventClose) {
                    toast.info("Дождитесь завершения текущей операции");
                    return;
                  }
                  onOpenChange(false);
                }}
                userId={userId}
              />
            </TabsContent>
            <TabsContent value="images" className="max-h-[70vh] overflow-y-auto pr-2">
              {selectedBlogPost?.id && (
                <ImageGallery
                  projectId={selectedBlogPost.id}
                  images={blogImages}
                  onImageAdd={handleImageAdd}
                  onImageUpdate={handleImageUpdate}
                  onImageDelete={handleImageDelete}
                  onImagesReorder={handleImagesReorder}
                  onDialogChange={handleImageDialogChange}
                  folderPath="blog-images"
                />
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="max-h-[70vh] overflow-y-auto pr-2">
            <BlogForm 
              blogPost={selectedBlogPost || undefined}
              onSave={handleBlogSave}
              onCancel={() => {
                if (preventClose) {
                  toast.info("Дождитесь завершения текущей операции");
                  return;
                }
                onOpenChange(false);
              }}
              userId={userId}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BlogFormDialog;
