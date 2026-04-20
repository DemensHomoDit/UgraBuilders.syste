
import React from "react";
import ImageUploader from "@/components/shared/ImageUploader";

export interface ImageUploaderProps {
  onImageUploaded?: (imageUrl: string) => void;
  imageUrl?: string;
  folderPath?: string;
  bucketName?: string;
  setIsUploading?: (isUploading: boolean) => void;
  aspectRatio?: number | string;
  className?: string;
  onError?: (error: string) => void;
}

const AdminImageUploader: React.FC<ImageUploaderProps> = (props) => {
  return (
    <ImageUploader {...props} />
  );
};

export default AdminImageUploader;
