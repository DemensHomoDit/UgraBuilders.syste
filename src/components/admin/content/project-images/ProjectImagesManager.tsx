
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/integrations/db/client";
import FileUploader from "@/components/shared/FileUploader";
import { storageUtils } from "@/utils/storage";

interface Image {
  id: string;
  project_id: string;
  image_url: string;
  description: string | null;
  display_order: number;
}

interface ProjectImagesManagerProps {
  projectId: string;
}

const ProjectImagesManager: React.FC<ProjectImagesManagerProps> = ({ projectId }) => {
  const [images, setImages] = useState<Image[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingDescriptions, setEditingDescriptions] = useState<Record<string, string>>({});
  const [isLoadingIds, setIsLoadingIds] = useState<Record<string, boolean>>({});

  // Загружаем изображения проекта
  const loadImages = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await db
        .from("project_images")
        .select("*")
        .eq("project_id", projectId)
        .order("display_order", { ascending: true });

      if (error) throw error;
      setImages(data || []);
      
      // Инициализируем состояние для редактирования описаний
      const descriptions: Record<string, string> = {};
      data?.forEach(img => {
        descriptions[img.id] = img.description || "";
      });
      setEditingDescriptions(descriptions);
    } catch (error) {
      console.error("Ошибка при загрузке изображений:", error);
      toast.error("Не удалось загрузить изображения");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadImages();
    }
  }, [projectId]);

  // Обработчик загрузки нового изображения
  const handleImageUploaded = async (url: string) => {
    try {
      // Находим максимальный порядок отображения
      const maxOrder = images.length > 0
        ? Math.max(...images.map(img => img.display_order || 0))
        : -1;
      
      // Добавляем изображение в базу данных
      const { data, error } = await db
        .from("project_images")
        .insert([{
          project_id: projectId,
          image_url: url,
          description: "",
          display_order: maxOrder + 1
        }])
        .select();

      if (error) throw error;
      
      if (data && data.length > 0) {
        setImages([...images, data[0]]);
        setEditingDescriptions(prev => ({
          ...prev,
          [data[0].id]: ""
        }));
        toast.success("Изображение добавлено");
      }
    } catch (error) {
      console.error("Ошибка при добавлении изображения:", error);
      toast.error("Не удалось добавить изображение");
    } finally {
      setIsAddingNew(false);
    }
  };

  // Обработчик удаления изображения
  const handleDeleteImage = async (id: string, imageUrl: string) => {
    try {
      setIsLoadingIds(prev => ({ ...prev, [id]: true }));
      
      // Удаляем запись из базы данных
      const { error: dbError } = await db
        .from("project_images")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;
      
      // Удаляем файл из хранилища
      await storageUtils.deleteFile(imageUrl);
      
      // Обновляем локальное состояние
      setImages(images.filter(img => img.id !== id));
      
      // Удаляем описание из состояния
      const newDescriptions = { ...editingDescriptions };
      delete newDescriptions[id];
      setEditingDescriptions(newDescriptions);
      
      toast.success("Изображение удалено");
    } catch (error) {
      console.error("Ошибка при удалении изображения:", error);
      toast.error("Не удалось удалить изображение");
    } finally {
      setIsLoadingIds(prev => ({ ...prev, [id]: false }));
    }
  };

  // Обработчик сохранения описания
  const handleSaveDescription = async (id: string) => {
    try {
      setIsLoadingIds(prev => ({ ...prev, [id]: true }));
      
      const { error } = await db
        .from("project_images")
        .update({ description: editingDescriptions[id] })
        .eq("id", id);

      if (error) throw error;
      
      // Обновляем локальное состояние
      setImages(images.map(img => 
        img.id === id ? { ...img, description: editingDescriptions[id] } : img
      ));
      
      toast.success("Описание сохранено");
    } catch (error) {
      console.error("Ошибка при сохранении описания:", error);
      toast.error("Не удалось сохранить описание");
    } finally {
      setIsLoadingIds(prev => ({ ...prev, [id]: false }));
    }
  };

  // Обработчики изменения порядка отображения
  const handleMoveUp = async (index: number) => {
    if (index <= 0) return;
    
    try {
      const newImages = [...images];
      const imageToMove = newImages[index];
      const imageAbove = newImages[index - 1];
      
      setIsLoadingIds(prev => ({ 
        ...prev, 
        [imageToMove.id]: true,
        [imageAbove.id]: true 
      }));
      
      // Меняем порядок отображения
      const tempOrder = imageToMove.display_order;
      imageToMove.display_order = imageAbove.display_order;
      imageAbove.display_order = tempOrder;
      
      // Обновляем в базе данных
      const updates = [
        { id: imageToMove.id, display_order: imageToMove.display_order },
        { id: imageAbove.id, display_order: imageAbove.display_order }
      ];
      
      for (const update of updates) {
        const { error } = await db
          .from("project_images")
          .update({ display_order: update.display_order })
          .eq("id", update.id);
          
        if (error) throw error;
      }
      
      // Меняем порядок в массиве
      [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]];
      setImages(newImages);
      
      toast.success("Порядок изображений обновлен");
    } catch (error) {
      console.error("Ошибка при изменении порядка:", error);
      toast.error("Не удалось изменить порядок");
    } finally {
      const imageToMove = images[index];
      const imageAbove = images[index - 1];
      
      setIsLoadingIds(prev => ({ 
        ...prev, 
        [imageToMove.id]: false,
        [imageAbove.id]: false 
      }));
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index >= images.length - 1) return;
    
    try {
      const newImages = [...images];
      const imageToMove = newImages[index];
      const imageBelow = newImages[index + 1];
      
      setIsLoadingIds(prev => ({ 
        ...prev, 
        [imageToMove.id]: true,
        [imageBelow.id]: true 
      }));
      
      // Меняем порядок отображения
      const tempOrder = imageToMove.display_order;
      imageToMove.display_order = imageBelow.display_order;
      imageBelow.display_order = tempOrder;
      
      // Обновляем в базе данных
      const updates = [
        { id: imageToMove.id, display_order: imageToMove.display_order },
        { id: imageBelow.id, display_order: imageBelow.display_order }
      ];
      
      for (const update of updates) {
        const { error } = await db
          .from("project_images")
          .update({ display_order: update.display_order })
          .eq("id", update.id);
          
        if (error) throw error;
      }
      
      // Меняем порядок в массиве
      [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
      setImages(newImages);
      
      toast.success("Порядок изображений обновлен");
    } catch (error) {
      console.error("Ошибка при изменении порядка:", error);
      toast.error("Не удалось изменить порядок");
    } finally {
      const imageToMove = images[index];
      const imageBelow = images[index + 1];
      
      setIsLoadingIds(prev => ({ 
        ...prev, 
        [imageToMove.id]: false,
        [imageBelow.id]: false 
      }));
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Изображения проекта</CardTitle>
        <Button
          size="sm"
          onClick={() => setIsAddingNew(true)}
          disabled={isAddingNew}
        >
          <Plus className="mr-2 h-4 w-4" /> Добавить изображение
        </Button>
      </CardHeader>
      <CardContent>
        {isAddingNew && (
          <div className="mb-6 p-4 border rounded-md">
            <h4 className="text-lg font-medium mb-2">Загрузить новое изображение</h4>
            <FileUploader
              onFileUploaded={handleImageUploaded}
              bucketName="project-images"
              folderPath={`project-${projectId}`}
            />
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingNew(false)}
              >
                Отмена
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="py-4 text-center">Загрузка изображений...</div>
        ) : images.length === 0 ? (
          <div className="py-4 text-center text-muted-foreground">
            У этого проекта нет изображений
          </div>
        ) : (
          <div className="space-y-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="border rounded-md p-4 flex flex-col md:flex-row gap-4"
              >
                <div className="w-full md:w-1/3">
                  <img
                    src={image.image_url}
                    alt={`Изображение ${index + 1}`}
                    className="w-full h-auto rounded-md object-cover"
                    style={{ maxHeight: "200px" }}
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <Textarea
                    placeholder="Добавьте описание изображения"
                    value={editingDescriptions[image.id] || ""}
                    onChange={(e) =>
                      setEditingDescriptions({
                        ...editingDescriptions,
                        [image.id]: e.target.value,
                      })
                    }
                    className="flex-1 min-h-[100px]"
                  />
                  <div className="flex justify-between mt-2">
                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMoveUp(index)}
                        disabled={
                          index === 0 ||
                          isLoadingIds[image.id] ||
                          (index > 0 && isLoadingIds[images[index - 1].id])
                        }
                        className="mr-2"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMoveDown(index)}
                        disabled={
                          index === images.length - 1 ||
                          isLoadingIds[image.id] ||
                          (index < images.length - 1 &&
                            isLoadingIds[images[index + 1].id])
                        }
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <div>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleSaveDescription(image.id)}
                        disabled={isLoadingIds[image.id]}
                        className="mr-2"
                      >
                        <Save className="h-4 w-4 mr-1" /> Сохранить
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          handleDeleteImage(image.id, image.image_url)
                        }
                        disabled={isLoadingIds[image.id]}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Удалить
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectImagesManager;
