
import { ReactNode } from "react";
import { ProjectImage } from "@/services/project/types";

export interface ImageUploaderProps {
  onImageUploaded?: (url: string) => void;
  imageUrl?: string;
  setIsUploading?: (isUploading: boolean) => void;
  folderPath?: string;
  className?: string;
  aspectRatio?: "square" | "video" | "16:9" | "4:3" | "portrait" | "landscape";
  onError?: (error: string) => void;
}

export interface AddImageDialogProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onImageAdd: (image: ProjectImage) => Promise<void>;
  folderPath?: string;
  isUploading?: boolean;
}

export interface DescriptionDialogProps {
  selectedImage: ProjectImage | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (imageId: string, description: string) => Promise<void>;
}

export interface ImageItemProps {
  image: ProjectImage;
  index: number;
  onEditDescription: (image: ProjectImage) => void;
  onDeleteImage: (imageId: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  isFirst: boolean;
  isLast: boolean;
}

export interface GalleryHeaderProps {
  onAddClick: () => void;
}

export interface EmptyGalleryProps {
  onAddClick: () => void;
}

export interface ImageGridProps {
  images: ProjectImage[];
  onEditDescription: (image: ProjectImage) => void;
  onDeleteImage: (imageId: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}
