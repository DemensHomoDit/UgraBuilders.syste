import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { db } from "@/integrations/db/client";
import { fileStorage } from "@/utils/fileStorage";
import { OurObjectImage } from "@/types/ourObjects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Trash2, Star, GripVertical } from "lucide-react";

interface ObjectGalleryManagerProps {
  objectId: string;
}

const BUCKET = "our-objects";

const ObjectGalleryManager = ({ objectId }: ObjectGalleryManagerProps) => {
  const [images, setImages] = useState<OurObjectImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settingCoverId, setSettingCoverId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadImages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await db
        .from("our_object_images")
        .select("*")
        .eq("object_id", objectId)
        .order("display_order", { ascending: true });

      if (error) {
        toast.error("Не удалось загрузить фотографии: " + error.message);
        return;
      }
      setImages((data as OurObjectImage[]) ?? []);
    } catch {
      toast.error("Ошибка загрузки фотографий");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, [objectId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Пожалуйста, выберите изображение");
      return;
    }

    setIsUploading(true);
    try {
      const imageUrl = await fileStorage.uploadFile(file, BUCKET, objectId);
      if (!imageUrl) {
        toast.error("Не удалось загрузить изображение");
        return;
      }

      const nextOrder =
        images.length > 0
          ? Math.max(...images.map((img) => img.display_order)) + 1
          : 0;

      const { data, error } = await db
        .from("our_object_images")
        .insert({
          object_id: objectId,
          image_url: imageUrl,
          caption: "",
          display_order: nextOrder,
        })
        .select("*")
        .single();

      if (error) {
        toast.error("Не удалось сохранить запись изображения: " + error.message);
        return;
      }

      setImages((prev) => [...prev, data as OurObjectImage]);
      toast.success("Фотография загружена");
    } catch {
      toast.error("Ошибка при загрузке фотографии");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCaptionChange = (id: string, caption: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, caption } : img))
    );
  };

  const handleOrderChange = (id: string, value: string) => {
    const order = parseInt(value, 10);
    if (isNaN(order)) return;
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, display_order: order } : img))
    );
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const { error } = await db
        .from("our_object_images")
        .upsert(
          images.map((img) => ({
            id: img.id,
            object_id: img.object_id,
            image_url: img.image_url,
            caption: img.caption ?? "",
            display_order: img.display_order,
          }))
        );

      if (error) {
        toast.error("Не удалось сохранить изменения: " + error.message);
        return;
      }
      toast.success("Изменения сохранены");
    } catch {
      toast.error("Ошибка при сохранении изменений");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetCover = async (imageUrl: string, imageId: string) => {
    setSettingCoverId(imageId);
    try {
      const { error } = await db
        .from("our_objects")
        .update({ cover_image: imageUrl })
        .eq("id", objectId);

      if (error) {
        toast.error("Не удалось установить обложку: " + error.message);
        return;
      }
      toast.success("Обложка обновлена");
    } catch {
      toast.error("Ошибка при установке обложки");
    } finally {
      setSettingCoverId(null);
    }
  };

  const handleDelete = async (imageId: string, imageUrl: string) => {
    setDeletingId(imageId);
    try {
      await fileStorage.deleteFile(imageUrl, BUCKET);

      const { error } = await db
        .from("our_object_images")
        .delete()
        .eq("id", imageId);

      if (error) {
        toast.error("Не удалось удалить фотографию: " + error.message);
        return;
      }

      setImages((prev) => prev.filter((img) => img.id !== imageId));
      toast.success("Фотография удалена");
    } catch {
      toast.error("Ошибка при удалении фотографии");
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Загрузка...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Загрузить фото
            </>
          )}
        </Button>

        {images.length > 0 && (
          <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving ? "Сохранение..." : "Сохранить порядок и подписи"}
          </Button>
        )}
      </div>

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
          <Upload className="h-10 w-10 text-muted-foreground opacity-40" />
          <p className="mt-3 text-muted-foreground">Фотографии ещё не добавлены</p>
          <p className="text-sm text-muted-foreground">
            Нажмите «Загрузить фото», чтобы добавить первое изображение
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="border rounded-lg overflow-hidden bg-card shadow-sm"
            >
              <div className="relative aspect-video bg-muted">
                <img
                  src={img.image_url}
                  alt={img.caption || "Фото объекта"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 text-muted-foreground">
                  <GripVertical className="h-4 w-4 opacity-50" />
                </div>
              </div>

              <div className="p-3 space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Подпись</Label>
                  <Input
                    value={img.caption ?? ""}
                    onChange={(e) => handleCaptionChange(img.id, e.target.value)}
                    placeholder="Описание фотографии"
                    className="h-8 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Порядок</Label>
                  <Input
                    type="number"
                    value={img.display_order}
                    onChange={(e) => handleOrderChange(img.id, e.target.value)}
                    className="h-8 text-sm w-24"
                    min={0}
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => handleSetCover(img.image_url, img.id)}
                    disabled={settingCoverId === img.id}
                  >
                    {settingCoverId === img.id ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <Star className="h-3 w-3 mr-1" />
                    )}
                    Обложка
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(img.id, img.image_url)}
                    disabled={deletingId === img.id}
                  >
                    {deletingId === img.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ObjectGalleryManager;
