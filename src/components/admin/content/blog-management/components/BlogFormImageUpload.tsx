import React, { useState } from "react";
import ImageUploader from "@/components/shared/ImageUploader";

interface BlogFormImageUploadProps {
  coverImage?: string;
  onImageUpload: (url: string) => void;
}

const BlogFormImageUpload: React.FC<BlogFormImageUploadProps> = ({
  coverImage,
  onImageUpload,
}) => {
  return (
    <div className="space-y-2">
      <ImageUploader
        onImageUploaded={onImageUpload}
        imageUrl={coverImage}
        bucketName="blog-images"
        folderPath="covers"
        aspectRatio="16/9"
      />
    </div>
  );
};

export default BlogFormImageUpload;