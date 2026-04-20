
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/integrations/db/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2, RefreshCw, Trash2, Edit, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ImageUploader from "@/components/shared/ImageUploader";
import LoadingSpinner from "@/components/account/LoadingSpinner";

// Интерфейс для элемента галереи
interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  city?: string;
  construction_year?: number;
  image_url: string;
  created_at: string;
}

const HomePageGalleryManager: React.FC = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    city: "",
    construction_year: "",
    image_url: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Загрузка элементов галереи
  const loadGalleryItems = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await db
        .from("gallery_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGalleryItems(data || []);
    } catch (error: any) {
      console.error("Ошибка при загрузке галереи:", error);
      toast.error("Не удалось загрузить элементы галереи");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGalleryItems();
  }, []);

  // Обработчик изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Обработчик загрузки изображения
  const handleImageUploaded = (url: string) => {
    setFormData(prev => ({ ...prev, image_url: url }));
  };

  // Добавление нового элемента галереи
  const handleAddGalleryItem = async () => {
    try {
      if (!formData.title || !formData.image_url) {
        toast.error("Необходимо указать название и загрузить изображение");
        return;
      }
      
      setIsSubmitting(true);

      const constructionYear = formData.construction_year 
        ? parseInt(formData.construction_year) 
        : null;

      // Проверка валидности года
      if (constructionYear && (isNaN(constructionYear) || constructionYear < 1900 || constructionYear > new Date().getFullYear())) {
        toast.error("Укажите корректный год строительства");
        setIsSubmitting(false);
        return;
      }

      // Вставляем новый элемент галереи
      const { data, error } = await db
        .from("gallery_items")
        .insert([
          {
            title: formData.title,
            description: formData.description || null,
            city: formData.city || null,
            construction_year: constructionYear,
            image_url: formData.image_url
          }
        ])
        .select();

      if (error) throw error;

      toast.success("Элемент галереи добавлен");
      setGalleryItems([data[0], ...galleryItems]);
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Ошибка при добавлении элемента галереи:", error);
      toast.error("Не удалось добавить элемент галереи");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Обновление элемента галереи
  const handleUpdateGalleryItem = async () => {
    if (!selectedItem) return;

    try {
      if (!formData.title || !formData.image_url) {
        toast.error("Необходимо указать название и загрузить изображение");
        return;
      }

      setIsSubmitting(true);

      const constructionYear = formData.construction_year 
        ? parseInt(formData.construction_year) 
        : null;

      // Проверка валидности года
      if (constructionYear && (isNaN(constructionYear) || constructionYear < 1900 || constructionYear > new Date().getFullYear())) {
        toast.error("Укажите корректный год строительства");
        setIsSubmitting(false);
        return;
      }

      const { data, error } = await db
        .from("gallery_items")
        .update({
          title: formData.title,
          description: formData.description || null,
          city: formData.city || null,
          construction_year: constructionYear,
          image_url: formData.image_url
        })
        .eq("id", selectedItem.id)
        .select();

      if (error) throw error;

      // Обновляем состояние списка элементов галереи
      setGalleryItems(
        galleryItems.map(item => 
          item.id === selectedItem.id ? data[0] : item
        )
      );

      toast.success("Элемент галереи обновлен");
      setIsEditDialogOpen(false);
      setSelectedItem(null);
      resetForm();
    } catch (error: any) {
      console.error("Ошибка при обновлении элемента галереи:", error);
      toast.error("Не удалось обновить элемент галереи");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Удаление элемента галереи
  const handleDeleteGalleryItem = async (id: string) => {
    try {
      const { error } = await db
        .from("gallery_items")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setGalleryItems(galleryItems.filter(item => item.id !== id));
      toast.success("Элемент галереи удален");
    } catch (error: any) {
      console.error("Ошибка при удалении элемента галереи:", error);
      toast.error("Не удалось удалить элемент галереи");
    }
  };

  // Открытие диалога редактирования
  const openEditDialog = (item: GalleryItem) => {
    setSelectedItem(item);
    setFormData({
      title: item.title,
      description: item.description || "",
      city: item.city || "",
      construction_year: item.construction_year ? String(item.construction_year) : "",
      image_url: item.image_url
    });
    setIsEditDialogOpen(true);
  };

  // Сброс формы
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      city: "",
      construction_year: "",
      image_url: ""
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Галерея работ на главной странице</CardTitle>
        <CardDescription>
          Управляйте фотографиями выполненных работ, которые отображаются на главной странице
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Добавить фото
          </Button>
          <Button 
            variant="outline" 
            className="ml-2" 
            onClick={loadGalleryItems}
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Обновить
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <LoadingSpinner />
          </div>
        ) : galleryItems.length === 0 ? (
          <div className="text-center p-8 border border-dashed rounded-md">
            <p className="text-muted-foreground">Элементы галереи не найдены</p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Добавить фото
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {galleryItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="relative h-48">
                  <img 
                    src={item.image_url} 
                    alt={item.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-70"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <p className="font-medium truncate">{item.title}</p>
                    {item.city && <p className="text-xs truncate">{item.city}</p>}
                  </div>
                </div>
                <div className="p-3 flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {item.construction_year && `${item.construction_year} г.`}
                  </div>
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-1"
                      onClick={() => openEditDialog(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteGalleryItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      {/* Диалог добавления элемента галереи */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Добавить фото в галерею</DialogTitle>
            <DialogDescription>
              Загрузите изображение и заполните информацию для отображения в галерее
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="image">Фотография</Label>
              <ImageUploader
                onImageUploaded={handleImageUploaded}
                imageUrl={formData.image_url}
                folderPath="gallery-items"
                aspectRatio="4/3"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="title">Название*</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
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
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">Город (опционально)</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="construction_year">Год постройки (опционально)</Label>
                <Input
                  id="construction_year"
                  name="construction_year"
                  value={formData.construction_year}
                  onChange={handleChange}
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Отмена
            </Button>
            <Button 
              onClick={handleAddGalleryItem} 
              disabled={!formData.title || !formData.image_url || isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Добавить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования элемента галереи */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Редактировать фото в галерее</DialogTitle>
            <DialogDescription>
              Измените информацию о фотографии в галерее
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-image">Фотография</Label>
              <ImageUploader
                onImageUploaded={handleImageUploaded}
                imageUrl={formData.image_url}
                folderPath="gallery-items"
                aspectRatio="4/3"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Название*</Label>
              <Input
                id="edit-title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
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
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-city">Город (опционально)</Label>
                <Input
                  id="edit-city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-construction_year">Год постройки (опционально)</Label>
                <Input
                  id="edit-construction_year"
                  name="construction_year"
                  value={formData.construction_year}
                  onChange={handleChange}
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button 
              onClick={handleUpdateGalleryItem} 
              disabled={!formData.title || !formData.image_url || isSubmitting}
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

export default HomePageGalleryManager;
