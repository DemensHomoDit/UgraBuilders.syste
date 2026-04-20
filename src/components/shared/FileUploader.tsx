
import React, { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { storageUtils } from "@/utils/storage";
import { Upload, X, Loader2 } from "lucide-react";

interface FileUploaderProps {
  onFileUploaded: (url: string) => void;
  bucketName?: string;
  folderPath?: string;
  acceptedTypes?: string;
  maxSizeMB?: number;
  className?: string;
}

/**
 * Компонент для загрузки файлов в Supabase Storage
 */
const FileUploader: React.FC<FileUploaderProps> = ({
  onFileUploaded,
  bucketName = "project-images",
  folderPath = "",
  acceptedTypes = "image/*",
  maxSizeMB = 5,
  className = "",
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка размера файла
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`Файл слишком большой. Максимальный размер: ${maxSizeMB} МБ`);
      return;
    }

    // Создаем превью изображения
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Загружаем файл в хранилище
    setIsUploading(true);
    try {
      const { url, error } = await storageUtils.uploadFile(
        file,
        bucketName,
        folderPath
      );

      if (error) throw error;
      if (url) {
        onFileUploaded(url);
        toast.success("Файл успешно загружен");
      }
    } catch (error) {
      console.error("Ошибка загрузки:", error);
      toast.error("Не удалось загрузить файл");
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearPreview = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedTypes}
        className="hidden"
        disabled={isUploading}
      />

      {previewUrl ? (
        <div className="relative w-full max-w-md">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-auto rounded-md shadow-md"
          />
          {!isUploading && (
            <button
              type="button"
              onClick={handleClearPreview}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center hover:border-primary transition-colors cursor-pointer w-full max-w-md"
          onClick={handleButtonClick}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">
            Нажмите для выбора файла или перетащите файл сюда
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Поддерживаемые форматы: {acceptedTypes.replace("image/*", "JPG, PNG, GIF и другие")}
          </p>
          <p className="text-xs text-gray-400">
            Максимальный размер: {maxSizeMB} МБ
          </p>
        </div>
      )}

      <Button
        type="button"
        onClick={handleButtonClick}
        disabled={isUploading}
        variant={previewUrl ? "outline" : "default"}
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Загрузка...
          </>
        ) : previewUrl ? (
          "Выбрать другой файл"
        ) : (
          "Выбрать файл"
        )}
      </Button>
    </div>
  );
};

export default FileUploader;
