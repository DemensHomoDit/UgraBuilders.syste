
import React from "react";
import ImageDisplay from "@/components/shared/ImageDisplay";
import { Home } from "lucide-react";

interface ProjectCardImageProps {
  imageUrl?: string;
  title: string;
}

export const ProjectCardImage: React.FC<ProjectCardImageProps> = ({
  imageUrl,
  title
}) => {
  if (!imageUrl) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted">
        <Home className="h-12 w-12 text-muted-foreground/40" />
      </div>
    );
  }

  return (
    <ImageDisplay 
      imageUrl={imageUrl}
      alt={title}
      className="w-full h-full"
      aspectRatio="16/9"
    />
  );
};

