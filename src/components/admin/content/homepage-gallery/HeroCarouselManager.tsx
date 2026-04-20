import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/integrations/db/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2, RefreshCw, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ImageUploader from "@/components/shared/ImageUploader";
import LoadingSpinner from "@/components/account/LoadingSpinner";

// Интерфейс для элемента карусели
interface CarouselImage {
  id: string;
  image_url: string;
  title?: string;
  description?: string;
  link_url?: string;
  display_order: number;
  show_consult_button?: boolean;
  main_button_text?: string;
  consult_button_text?: string;
  status?: string;
  created_by?: string;
  updated_by?: string;
  rejection_reason?: string;
}

// Компонент карточки изображения
const CarouselImageCard = ({ 
  image, 
  index, 
  totalImages,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isLoading,
  currentUser,
  onApprove,
  onReject,
  onSendToModeration
}: { 
  image: CarouselImage; 
  index: number;
  totalImages: number;
  onEdit: (image: CarouselImage) => void;
  onDelete: (id: string) => Promise<void>;
  onMoveUp: (index: number) => Promise<void>;
  onMoveDown: (index: number) => Promise<void>;
  isLoading: boolean;
  currentUser: { id: string; role: string } | null;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onSendToModeration: (id: string) => Promise<void>;
}) => {
  return (
    <Card key={image.id} className="overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/3 h-48 relative">
          <img 
            src={image.image_url} 
            alt={image.title || `Слайд ${index + 1}`} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <div className="mb-2">
            <h3 className="font-medium">
              {image.title || `Слайд ${index + 1}`}
            </h3>
            {image.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {image.description}
              </p>
            )}
            {image.link_url && (
              <p className="text-xs text-blue-500 mt-1 truncate">
                Ссылка: {image.link_url}
              </p>
            )}
            {image.status && (
              <p className="text-xs mt-1">
                Статус: <span className={
                  image.status === 'published' ? 'text-green-600' :
                  image.status === 'pending' ? 'text-yellow-600' :
                  image.status === 'rejected' ? 'text-red-600' :
                  'text-gray-500'}>{image.status}</span>
                {image.status === 'rejected' && image.rejection_reason && (
                  <span className="ml-2 text-red-500">Причина: {image.rejection_reason}</span>
                )}
              </p>
            )}
          </div>
          <div className="mt-auto pt-2 flex justify-between items-center">
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMoveUp(index)}
                disabled={isLoading || index === 0}
                className="mr-1"
              >
                ↑
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMoveDown(index)}
                disabled={isLoading || index === totalImages - 1}
              >
                ↓
              </Button>
            </div>
            <div>
              <Button
                variant="outline"
                size="sm"
                className="mr-1"
                onClick={() => onEdit(image)}
                disabled={isLoading}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(image.id)}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {currentUser && image.status === 'pending' && currentUser.role === 'admin' && (
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="success" onClick={() => onApprove(image.id)}>Одобрить</Button>
              <Button size="sm" variant="destructive" onClick={() => onReject(image.id)}>Отклонить</Button>
            </div>
          )}
          {currentUser && (image.status === 'rejected' || image.status === 'draft') && image.created_by === currentUser.id && currentUser.role === 'editor' && (
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="default" onClick={() => onSendToModeration(image.id)}>Отправить на модерацию</Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

// Основной компонент HeroCarouselManager
const HeroCarouselManager: React.FC = () => {
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<CarouselImage | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    link_url: "",
    show_consult_button: true,
    main_button_text: "",
    consult_button_text: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null);

  // Загрузка изображений карусели при монтировании компонента
  useEffect(() => {
    loadCarouselImages();
    const fetchUser = async () => {
      const { data } = await db.auth.getSession();
      const session = data?.session;
      if (session?.user) {
        // Получаем профиль для роли
        const { data: profile } = await db
          .from('user_profiles')
          .select('id, role')
          .eq('id', session.user.id)
          .maybeSingle();
        setCurrentUser({ id: session.user.id, role: profile?.role || 'client' });
      }
    };
    fetchUser();
  }, []);

  // Загрузка изображений карусели
  const loadCarouselImages = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await db
        .from('hero_carousel')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error("Ошибка при загрузке изображений карусели:", error);
        toast.error("Не удалось загрузить изображения карусели");
        throw error;
      }
      
      setCarouselImages(data as CarouselImage[] || []);
    } catch (error: any) {
      console.error("Ошибка при загрузке изображений карусели:", error);
      toast.error("Не удалось загрузить изображения карусели");
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Обработчик загрузки изображения
  const handleImageUploaded = (url: string) => {
    setFormData(prev => ({ ...prev, image_url: url }));
  };

  // Добавление нового изображения
  const handleAddCarouselImage = async () => {
    try {
      if (!formData.image_url) {
        toast.error("Необходимо загрузить изображение");
        return;
      }
      
      setIsSubmitting(true);
      
      // Получаем максимальный порядковый номер
      const { data: maxOrderData, error: maxOrderError } = await db
        .from('hero_carousel')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1);
      
      if (maxOrderError) {
        console.error("Ошибка при получении максимального порядкового номера:", maxOrderError);
        throw maxOrderError;
      }
      
      const nextOrder = maxOrderData && maxOrderData.length > 0 
        ? (maxOrderData[0].display_order + 1) 
        : 0;

      // Вставляем новое изображение
      const { error } = await db
        .from('hero_carousel')
        .insert([{
          image_url: formData.image_url,
          title: formData.title || null,
          description: formData.description || null,
          link_url: formData.link_url || null,
          display_order: nextOrder,
          show_consult_button: formData.show_consult_button,
          main_button_text: formData.main_button_text,
          consult_button_text: formData.consult_button_text
        }]);

      if (error) {
        console.error("Ошибка при добавлении изображения:", error);
        toast.error(`Не удалось добавить изображение: ${error.message}`);
        throw error;
      }

      toast.success("Изображение добавлено в карусель");
      // Обновляем список изображений после добавления
      loadCarouselImages();
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Ошибка при добавлении изображения:", error);
      toast.error(`Не удалось добавить изображение: ${error.message || "Неизвестная ошибка"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Обновление изображения
  const handleUpdateCarouselImage = async () => {
    if (!selectedImage) return;

    try {
      setIsSubmitting(true);
      
      const { error } = await db
        .from('hero_carousel')
        .update({
          title: formData.title || null,
          description: formData.description || null,
          image_url: formData.image_url,
          link_url: formData.link_url || null,
          show_consult_button: formData.show_consult_button,
          main_button_text: formData.main_button_text,
          consult_button_text: formData.consult_button_text
        })
        .eq("id", selectedImage.id);

      if (error) {
        console.error("Ошибка при обновлении изображения:", error);
        toast.error(`Не удалось обновить изображение: ${error.message}`);
        throw error;
      }

      // Обновляем список изображений после изменения
      loadCarouselImages();
      toast.success("Изображение обновлено");
      setIsEditDialogOpen(false);
      setSelectedImage(null);
      resetForm();
    } catch (error: any) {
      console.error("Ошибка при обновлении изображения:", error);
      toast.error(`Не удалось обновить изображение: ${error.message || "Неизвестная ошибка"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Удаление изображения
  const handleDeleteCarouselImage = async (id: string) => {
    try {
      setIsLoading(true);
      const { error } = await db
        .from('hero_carousel')
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Ошибка при удалении изображения:", error);
        toast.error(`Не удалось удалить изображение: ${error.message}`);
        throw error;
      }

      setCarouselImages(carouselImages.filter(img => img.id !== id));
      toast.success("Изображение удалено из карусели");
    } catch (error: any) {
      console.error("Ошибка при удалении изображения:", error);
      toast.error(`Не удалось удалить изображение: ${error.message || "Неизвестная ошибка"}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Изменение порядка отображения
  const handleMoveImage = async (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === carouselImages.length - 1)
    ) {
      return; // Нельзя передвинуть первый элемент вверх или последний вниз
    }

    try {
      setIsLoading(true);
      
      const newIndex = direction === "up" ? index - 1 : index + 1;
      const newImages = [...carouselImages];
      const temp = newImages[index];
      newImages[index] = newImages[newIndex];
      newImages[newIndex] = temp;
      
      // Обмениваем порядковые номера
      const imageToMove = carouselImages[index];
      const imageAdjacent = carouselImages[newIndex];
      
      // Обновляем записи в базе данных
      const updates = [
        { 
          id: imageToMove.id, 
          display_order: imageAdjacent.display_order 
        },
        { 
          id: imageAdjacent.id, 
          display_order: imageToMove.display_order 
        }
      ];
      
      for (const update of updates) {
        const { error } = await db
          .from('hero_carousel')
          .update({ display_order: update.display_order })
          .eq("id", update.id);
          
        if (error) {
          console.error("Ошибка при изменении порядка изображений:", error);
          toast.error(`Не удалось изменить порядок изображений: ${error.message}`);
          throw error;
        }
      }
      
      // После успешного обновления в базе, обновляем локальное состояние
      await loadCarouselImages();
      
      toast.success("Порядок изображений обновлен");
    } catch (error: any) {
      console.error("Ошибка при изменении порядка изображений:", error);
      toast.error(`Не удалось изменить порядок изображений: ${error.message || "Неизвестная ошибка"}`);
      await loadCarouselImages(); // Перезагружаем изображения в случае ошибки
    } finally {
      setIsLoading(false);
    }
  };

  // Открытие диалога редактирования
  const openEditDialog = (image: CarouselImage) => {
    setSelectedImage(image);
    setFormData({
      title: image.title || "",
      description: image.description || "",
      image_url: image.image_url,
      link_url: image.link_url || "",
      show_consult_button: image.show_consult_button || true,
      main_button_text: image.main_button_text || "",
      consult_button_text: image.consult_button_text || ""
    });
    setIsEditDialogOpen(true);
  };

  // Сброс формы
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      image_url: "",
      link_url: "",
      show_consult_button: true,
      main_button_text: "",
      consult_button_text: ""
    });
  };

  const onApprove = async (id: string) => {
    try {
      setIsLoading(true);
      await db
        .from('hero_carousel')
        .update({ status: 'published', rejection_reason: null })
        .eq('id', id);
      toast.success('Слайд одобрен и опубликован');
      loadCarouselImages();
    } catch (e) {
      toast.error('Ошибка при одобрении слайда');
    } finally {
      setIsLoading(false);
    }
  };

  const onReject = async (id: string) => {
    const reason = window.prompt('Укажите причину отклонения:');
    if (!reason) return;
    try {
      setIsLoading(true);
      await db
        .from('hero_carousel')
        .update({ status: 'rejected', rejection_reason: reason })
        .eq('id', id);
      toast.success('Слайд отклонён');
      loadCarouselImages();
    } catch (e) {
      toast.error('Ошибка при отклонении слайда');
    } finally {
      setIsLoading(false);
    }
  };

  const onSendToModeration = async (id: string) => {
    try {
      setIsLoading(true);
      await db
        .from('hero_carousel')
        .update({ status: 'pending', rejection_reason: null })
        .eq('id', id);
      toast.success('Слайд отправлен на модерацию');
      loadCarouselImages();
    } catch (e) {
      toast.error('Ошибка при отправке на модерацию');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Карусель на главной странице</CardTitle>
        <CardDescription>
          Управляйте изображениями, которые отображаются в карусели на главной странице
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Добавить изображение
          </Button>
          <Button 
            variant="outline" 
            className="ml-2" 
            onClick={loadCarouselImages}
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Обновить
          </Button>
        </div>

        {isLoading && carouselImages.length === 0 ? (
          <div className="flex justify-center p-8">
            <LoadingSpinner />
          </div>
        ) : carouselImages.length === 0 ? (
          <div className="text-center p-8 border border-dashed rounded-md">
            <p className="text-muted-foreground">Изображения не найдены</p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Добавить изображение
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {carouselImages.map((image, index) => (
              <CarouselImageCard 
                key={image.id}
                image={image}
                index={index}
                totalImages={carouselImages.length}
                onEdit={openEditDialog}
                onDelete={handleDeleteCarouselImage}
                onMoveUp={() => handleMoveImage(index, "up")}
                onMoveDown={() => handleMoveImage(index, "down")}
                isLoading={isLoading}
                currentUser={currentUser}
                onApprove={onApprove}
                onReject={onReject}
                onSendToModeration={onSendToModeration}
              />
            ))}
          </div>
        )}
      </CardContent>

      {/* Диалог добавления изображения */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Добавить изображение в карусель</DialogTitle>
            <DialogDescription>
              Загрузите изображение и заполните информацию для отображения в карусели
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="image">Изображение</Label>
              <ImageUploader
                onImageUploaded={handleImageUploaded}
                imageUrl={formData.image_url}
                folderPath="hero-carousel"
                aspectRatio="16/9"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="title">Заголовок (опционально)</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Описание (опционально)</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="link_url">URL ссылки (опционально)</Label>
              <Input
                id="link_url"
                name="link_url"
                value={formData.link_url}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="main_button_text">Текст кнопки "Узнать больше"</Label>
              <Input
                id="main_button_text"
                name="main_button_text"
                value={formData.main_button_text}
                onChange={handleChange}
                placeholder="Узнать больше"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="consult_button_text">Текст кнопки "Получить консультацию"</Label>
              <Input
                id="consult_button_text"
                name="consult_button_text"
                value={formData.consult_button_text}
                onChange={handleChange}
                placeholder="Получить консультацию"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="show_consult_button"
                name="show_consult_button"
                checked={formData.show_consult_button}
                onChange={handleChange}
                className="w-4 h-4"
                title="Показывать кнопку 'Получить консультацию'"
              />
              <Label htmlFor="show_consult_button">Показывать кнопку "Получить консультацию"</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Отмена
            </Button>
            <Button 
              onClick={handleAddCarouselImage} 
              disabled={!formData.image_url || isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Добавить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования изображения */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Редактировать изображение</DialogTitle>
            <DialogDescription>
              Измените параметры изображения в карусели
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-image">Изображение</Label>
              <ImageUploader
                onImageUploaded={handleImageUploaded}
                imageUrl={formData.image_url}
                folderPath="hero-carousel"
                aspectRatio="16/9"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Заголовок (опционально)</Label>
              <Input
                id="edit-title"
                name="title"
                value={formData.title}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Описание (опционально)</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-link_url">URL ссылки (опционально)</Label>
              <Input
                id="edit-link_url"
                name="link_url"
                value={formData.link_url}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="main_button_text">Текст кнопки "Узнать больше"</Label>
              <Input
                id="main_button_text"
                name="main_button_text"
                value={formData.main_button_text}
                onChange={handleChange}
                placeholder="Узнать больше"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="consult_button_text">Текст кнопки "Получить консультацию"</Label>
              <Input
                id="consult_button_text"
                name="consult_button_text"
                value={formData.consult_button_text}
                onChange={handleChange}
                placeholder="Получить консультацию"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="show_consult_button"
                name="show_consult_button"
                checked={formData.show_consult_button}
                onChange={handleChange}
                className="w-4 h-4"
                title="Показывать кнопку 'Получить консультацию'"
              />
              <Label htmlFor="show_consult_button">Показывать кнопку "Получить консультацию"</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button 
              onClick={handleUpdateCarouselImage} 
              disabled={!formData.image_url || isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default HeroCarouselManager;
