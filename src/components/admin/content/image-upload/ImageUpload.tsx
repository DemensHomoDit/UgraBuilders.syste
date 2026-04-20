
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/integrations/db/client";
import { Loader2, Upload, X } from "lucide-react";

interface ImageUploadProps {
  currentImage?: string;
  onImageUploaded: (url: string) => void;
  bucketName: string;
  objectPath: string;
  className?: string;
  note?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  onImageUploaded,
  bucketName,
  objectPath,
  className = "",
  note
}) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Проверка типа файла
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, выберите изображение",
        variant: "destructive",
      });
      return;
    }
    
    // Проверка размера файла (макс. 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Ошибка",
        description: "Размер файла не должен превышать 5MB",
        variant: "destructive",
      });
      return;
    }
    
    // Создаем предпросмотр изображения
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // Загружаем файл
    await uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    
    try {
      // Проверяем существование бакета
      await db.rpc('ensure_bucket_exists', { bucket_id: bucketName });
      
      // Генерируем уникальное имя файла
      const extension = file.name.split('.').pop();
      const fileName = `${objectPath}.${extension}`;
      
      // Загружаем файл
      const { data, error } = await db.storage
        .from(bucketName)
        .upload(fileName, file, { upsert: true });
      
      if (error) throw error;
      
      // Получаем публичный URL
      const { data: publicUrlData } = db.storage
        .from(bucketName)
        .getPublicUrl(data.path);
      
      const imageUrl = publicUrlData.publicUrl;
      
      // Обновляем UI
      setPreview(imageUrl);
      onImageUploaded(imageUrl);
      
      toast({
        title: "Успех",
        description: "Изображение успешно загружено",
      });
    } catch (error: any) {
      console.error("Ошибка при загрузке изображения:", error);
      toast({
        title: "Ошибка",
        description: `Не удалось загрузить изображение: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onImageUploaded("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      {!preview ? (
        <div 
          className={`flex flex-col items-center justify-center border-2 border-dashed 
            border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 
            transition-colors ${className}`}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-8 h-8 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">
            Нажмите, чтобы загрузить изображение
          </p>
          {note && <p className="mt-1 text-xs text-gray-400">{note}</p>}
        </div>
      ) : (
        <div 
          className={`relative ${className} rounded-lg overflow-hidden group`}
        >
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-full object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Изменить"
                )}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleRemoveImage}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
