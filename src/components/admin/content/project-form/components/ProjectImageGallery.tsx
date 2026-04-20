import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Edit, ChevronsUpDown, X } from "lucide-react";
import { useImageUploadModal } from "@/hooks/useImageUploadModal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Project, ProjectImage } from "@/services/project/types";
import projectService from "@/services/projectService";
import { toast } from "sonner";
import ImageUploader from "@/components/shared/ImageUploader";

interface ProjectImageGalleryProps {
  project: Project;
  onImagesChange?: (hasChanges: boolean) => void;
  onDialogChange?: (open: boolean) => void;
  onMainImageChange?: (url: string) => void;
}

/**
 * Компонент галереи изображений проекта
 */
const ProjectImageGallery: React.FC<ProjectImageGalleryProps> = ({
  project,
  onImagesChange,
  onDialogChange,
  onMainImageChange
}) => {
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ProjectImage | null>(null);
  const [imageDescription, setImageDescription] = useState("");
  const [imageType, setImageType] = useState<"main" | "general" | "floor_plan">("general");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<ProjectImage | null>(null);
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const [pendingImageType, setPendingImageType] = useState<"main" | "general" | "floor_plan">("general");

  // Используем хук для управления модальным окном загрузки изображений
  const {
    isModalOpen,
    setIsModalOpen,
    isUploading,
    openModal,
    closeModal,
    handleImageUploaded: handleImageUploadedInternal
  } = useImageUploadModal({
    onImageSelected: (url) => {
      setPendingImageUrl(url);
      setPendingImageType("general");
    },
    onModalClose: () => onDialogChange?.(false)
  });

  // Загружаем изображения при монтировании компонента
  useEffect(() => {
    if (project?.id) {
      loadImages();
    }
  }, [project?.id]);

  // Уведомляем родительский компонент о статусе диалогов
  useEffect(() => {
    onDialogChange?.(isModalOpen || isEditDialogOpen || isDeleteConfirmOpen);
  }, [isModalOpen, isEditDialogOpen, isDeleteConfirmOpen, onDialogChange]);

  // Загрузка изображений с сервера
  const loadImages = async () => {
    if (!project.id) return;
    
    setIsLoading(true);
    try {
      const projectImages = await projectService.getProjectImages(project.id);
      
      // Сортируем изображения по типу и порядку отображения
      const sortedImages = projectImages.sort((a, b) => {
        // Сначала по типу (main -> general -> floor_plan)
        const typeOrder = { main: 0, general: 1, floor_plan: 2 };
        const aType = a.image_type ? typeOrder[a.image_type as keyof typeof typeOrder] : 1;
        const bType = b.image_type ? typeOrder[b.image_type as keyof typeof typeOrder] : 1;
        
        if (aType !== bType) return aType - bType;
        // Затем по порядку отображения
        return (a.display_order || 0) - (b.display_order || 0);
      });
      
      setImages(sortedImages);
    } catch (error) {
      console.error("Ошибка загрузки изображений:", error);
      toast.error("Не удалось загрузить изображения проекта");
    } finally {
      setIsLoading(false);
    }
  };

  // Добавление нового изображения
  const handleAddImage = async (imageUrl: string, type: "main" | "general" | "floor_plan" = "general") => {
    if (!project.id) return;
    
    setIsLoading(true);
    try {
      const newImage = await projectService.addProjectImage(
        project.id,
        imageUrl,
        "Новое изображение проекта",
        type
      );
      
      if (newImage) {
        setImages(prev => [...prev, newImage]);
        onImagesChange?.(true);
        toast.success("Изображение добавлено");
        if (type === "main") {
          onMainImageChange?.(imageUrl);
        }
      }
    } catch (error) {
      console.error("Ошибка добавления изображения:", error);
      toast.error("Не удалось добавить изображение");
    } finally {
      setIsLoading(false);
    }
  };

  // Открытие диалога редактирования
  const handleEditImage = (image: ProjectImage) => {
    setSelectedImage(image);
    setImageDescription(image.description || "");
    setImageType(image.image_type as "main" | "general" | "floor_plan" || "general");
    setIsEditDialogOpen(true);
  };

  // Сохранение изменений изображения
  const handleSaveImageEdit = async () => {
    if (!selectedImage) return;
    
    setIsLoading(true);
    try {
      const success = await projectService.updateImageDescription(
        selectedImage.id,
        imageDescription,
        imageType
      );
      
      if (success) {
        setImages(prev => prev.map(img => 
          img.id === selectedImage.id
            ? { ...img, description: imageDescription, image_type: imageType }
            : img
        ));
        onImagesChange?.(true);
        toast.success("Описание изображения обновлено");
        setIsEditDialogOpen(false);
      }
    } catch (error) {
      console.error("Ошибка обновления изображения:", error);
      toast.error("Не удалось обновить описание изображения");
    } finally {
      setIsLoading(false);
    }
  };

  // Открытие диалога подтверждения удаления
  const handleConfirmDelete = (image: ProjectImage) => {
    setImageToDelete(image);
    setIsDeleteConfirmOpen(true);
  };

  // Удаление изображения
  const handleDeleteImage = async () => {
    if (!imageToDelete) return;
    
    setIsLoading(true);
    try {
      const success = await projectService.deleteProjectImage(imageToDelete.id);
      
      if (success) {
        setImages(prev => prev.filter(img => img.id !== imageToDelete.id));
        onImagesChange?.(true);
        toast.success("Изображение удалено");
        setIsDeleteConfirmOpen(false);
        setImageToDelete(null);
      }
    } catch (error) {
      console.error("Ошибка удаления изображения:", error);
      toast.error("Не удалось удалить изображение");
    } finally {
      setIsLoading(false);
    }
  };

  // Разделение изображений по типам
  const mainImage = images.find(img => img.image_type === "main");
  const generalImages = images.filter(img => img.image_type === "general");
  const floorPlanImages = images.filter(img => img.image_type === "floor_plan");

  // Новый обработчик подтверждения добавления
  const handleConfirmAddImage = async () => {
    if (pendingImageUrl) {
      await handleAddImage(pendingImageUrl, pendingImageType);
      setPendingImageUrl(null);
      setPendingImageType("general");
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-md font-medium">Изображения проекта</h3>
        <Button 
          size="sm" 
          onClick={openModal}
          disabled={isLoading}
        >
          <PlusCircle className="h-4 w-4 mr-2" /> Добавить
        </Button>
      </div>

      {isLoading && (
        <div className="text-center py-4">
          <div className="animate-spin h-6 w-6 border-t-2 border-b-2 border-primary rounded-full mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Загрузка изображений...</p>
        </div>
      )}

      {!isLoading && images.length === 0 && (
        <div className="text-center py-6 border border-dashed rounded-md">
          <p className="text-muted-foreground">У проекта пока нет изображений</p>
          <Button 
            variant="outline" 
            className="mt-2" 
            onClick={openModal}
          >
            <PlusCircle className="h-4 w-4 mr-2" /> Добавить первое
          </Button>
        </div>
      )}

      {/* Основное изображение */}
      <div>
        <h4 className="font-semibold mb-2">Основное изображение</h4>
        {mainImage ? (
          <Card className="overflow-hidden border-primary border-2">
            <div className="relative h-40">
              <img
                src={mainImage.image_url}
                alt={mainImage.description || "Основное изображение"}
                className="w-full h-full object-cover"
              />
              <Badge 
                className="absolute top-2 right-2"
                variant="default"
              >
                Основное
              </Badge>
            </div>
            <CardContent className="p-3">
              <div className="text-sm truncate mb-2">
                {mainImage.description || "Без описания"}
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => handleEditImage(mainImage)} 
                  title="Редактировать"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleConfirmDelete(mainImage)}
                  title="Удалить"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-muted-foreground text-sm">Нет основного изображения</div>
        )}
      </div>

      {/* Общие изображения */}
      <div>
        <h4 className="font-semibold mb-2 mt-4">Общие фото</h4>
        {generalImages.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {generalImages.map((image) => (
              <Card key={image.id} className="overflow-hidden">
                <div className="relative h-40">
                  <img
                    src={image.image_url}
                    alt={image.description || "Общее фото"}
                    className="w-full h-full object-cover"
                  />
                  <Badge 
                    className="absolute top-2 right-2"
                    variant="secondary"
                  >
                    Общее
                  </Badge>
                </div>
                <CardContent className="p-3">
                  <div className="text-sm truncate mb-2">
                    {image.description || "Без описания"}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => handleEditImage(image)} 
                      title="Редактировать"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleConfirmDelete(image)}
                      title="Удалить"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground text-sm">Нет общих фото</div>
        )}
      </div>

      {/* Планы этажей */}
      <div>
        <h4 className="font-semibold mb-2 mt-4">Планы этажей</h4>
        {floorPlanImages.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {floorPlanImages.map((image) => (
              <Card key={image.id} className="overflow-hidden">
                <div className="relative h-40">
                  <img
                    src={image.image_url}
                    alt={image.description || "План этажа"}
                    className="w-full h-full object-cover"
                  />
                  <Badge 
                    className="absolute top-2 right-2"
                    variant="secondary"
                  >
                    План этажа
                  </Badge>
                </div>
                <CardContent className="p-3">
                  <div className="text-sm truncate mb-2">
                    {image.description || "Без описания"}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => handleEditImage(image)} 
                      title="Редактировать"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleConfirmDelete(image)}
                      title="Удалить"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground text-sm">Нет планов этажей</div>
        )}
      </div>

      {/* Диалог редактирования изображения */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактирование изображения</DialogTitle>
            <DialogDescription>Измените описание или тип изображения</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="h-40 rounded-md overflow-hidden mb-4">
              <img
                src={selectedImage?.image_url}
                alt="Предпросмотр"
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image-description">Описание</Label>
              <Input
                id="image-description"
                value={imageDescription}
                onChange={(e) => setImageDescription(e.target.value)}
                placeholder="Введите описание изображения"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image-type">Тип изображения</Label>
              <Select value={imageType} onValueChange={(value) => setImageType(value as any)}>
                <SelectTrigger id="image-type">
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Общее</SelectItem>
                  <SelectItem value="main">Основное</SelectItem>
                  <SelectItem value="floor_plan">План этажа</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveImageEdit} disabled={isLoading}>
              {isLoading ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Подтверждение удаления</DialogTitle>
            <DialogDescription>Это действие нельзя отменить</DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p>Вы уверены, что хотите удалить это изображение?</p>
            <p className="text-muted-foreground text-sm mt-2">
              Это действие нельзя отменить.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
              Отмена
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteImage} 
              disabled={isLoading}
            >
              {isLoading ? "Удаление..." : "Удалить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог загрузки нового изображения */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Загрузить изображение</DialogTitle>
            <DialogDescription>Выберите и загрузите изображение для галереи проекта</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {!pendingImageUrl ? (
              <ImageUploader
                onImageUploaded={handleImageUploadedInternal}
                folderPath={`project-${project.id}`}
                aspectRatio="16/9"
                setIsUploading={setIsLoading}
              />
            ) : (
              <div className="space-y-4">
                <img src={pendingImageUrl} alt="Загруженное изображение" className="w-full h-40 object-cover rounded" />
                <div>
                  <Label htmlFor="pending-image-type">Тип изображения</Label>
                  <Select id="pending-image-type" value={pendingImageType} onValueChange={v => setPendingImageType(v as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">Общее</SelectItem>
                      <SelectItem value="main">Основное</SelectItem>
                      <SelectItem value="floor_plan">План этажа</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setPendingImageUrl(null); }}>
                    Назад
                  </Button>
                  <Button onClick={handleConfirmAddImage} disabled={isLoading}>
                    Добавить
                  </Button>
                </DialogFooter>
              </div>
            )}
          </div>
          {!pendingImageUrl && (
            <DialogFooter>
              <Button variant="outline" onClick={closeModal} disabled={isLoading}>
                Отмена
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectImageGallery;
