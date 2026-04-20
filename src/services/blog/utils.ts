
import { ProjectImage } from "../project/imageService/types";
import { BlogImage } from "./types";

// Helper function to map blog_images to ProjectImage interface
export const mapBlogImageToProjectImage = (blogImage: BlogImage): ProjectImage => {
  return {
    id: blogImage.id,
    project_id: blogImage.blog_id, // Map blog_id to project_id for compatibility
    image_url: blogImage.image_url,
    description: blogImage.description,
    display_order: blogImage.display_order || 0,
    created_at: blogImage.created_at,
    image_type: "general" // Добавляем значение по умолчанию
  };
};

// Helper function to map ProjectImage to BlogImage interface
export const mapProjectImageToBlogImage = (projectImage: ProjectImage): BlogImage => {
  return {
    id: projectImage.id,
    blog_id: projectImage.project_id, // Map project_id to blog_id
    image_url: projectImage.image_url,
    description: projectImage.description,
    display_order: projectImage.display_order,
    created_at: projectImage.created_at
  };
};
