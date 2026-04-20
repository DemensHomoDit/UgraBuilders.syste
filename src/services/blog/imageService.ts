
import { db } from "@/integrations/db/client";
import { BlogImage, BlogImageData } from "./types";
import { mapBlogImageToProjectImage, mapProjectImageToBlogImage } from "./utils";
import { ProjectImage } from "../projectService";

class BlogImageService {
  /**
   * Get all images associated with a blog post
   */
  async getBlogImages(blogId: string): Promise<ProjectImage[]> {
    const { data, error } = await db
      .from('blog_images')
      .select('*')
      .eq('blog_id', blogId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error(`Error fetching images for blog ${blogId}:`, error);
      throw error;
    }
    // Convert BlogImage[] to ProjectImage[] for compatibility with ImageGallery component
    return (data || []).map(mapBlogImageToProjectImage);
  }

  /**
   * Add a new image to a blog post
   */
  async addBlogImage(imageData: BlogImageData): Promise<ProjectImage | null> {
    // If display_order is not provided, get the maximum + 1
    if (!imageData.display_order) {
      const { data: maxOrderData } = await db
        .from('blog_images')
        .select('display_order')
        .eq('blog_id', imageData.blog_id)
        .order('display_order', { ascending: false })
        .limit(1);

      const maxOrder = maxOrderData && maxOrderData.length > 0 
        ? maxOrderData[0].display_order 
        : 0;
      
      imageData.display_order = maxOrder + 1;
    }

    const { data, error } = await db
      .from('blog_images')
      .insert(imageData)
      .select()
      .single();

    if (error) {
      console.error(`Error adding image to blog ${imageData.blog_id}:`, error);
      throw error;
    }
    // Convert BlogImage to ProjectImage for compatibility
    return data ? mapBlogImageToProjectImage(data) : null;
  }

  /**
   * Update an existing blog image
   */
  async updateBlogImage(imageId: string, updates: Partial<ProjectImage>): Promise<ProjectImage | null> {
    // Convert ProjectImage updates to BlogImage updates
    const blogImageUpdates: Partial<BlogImage> = {
      ...updates,
      // If project_id is provided, map it to blog_id
      blog_id: updates.project_id,
    };
    
    // Remove project_id as it doesn't exist in the blog_images table
    if ('project_id' in blogImageUpdates) {
      delete blogImageUpdates.project_id;
    }

    const { data, error } = await db
      .from('blog_images')
      .update(blogImageUpdates)
      .eq('id', imageId)
      .select()
      .single();

    if (error) {
      console.error(`Error updating blog image ${imageId}:`, error);
      throw error;
    }

    return data ? mapBlogImageToProjectImage(data) : null;
  }

  /**
   * Delete a blog image
   */
  async deleteBlogImage(imageId: string): Promise<boolean> {
    const { error } = await db
      .from('blog_images')
      .delete()
      .eq('id', imageId);

    if (error) {
      console.error(`Error deleting blog image ${imageId}:`, error);
      throw error;
    }

    return true;
  }

  /**
   * Delete all images associated with a blog post
   */
  async deleteAllBlogImages(blogId: string): Promise<boolean> {
    const { error } = await db
      .from('blog_images')
      .delete()
      .eq('blog_id', blogId);

    if (error) {
      console.error(`Error deleting all images for blog ${blogId}:`, error);
      throw error;
    }

    return true;
  }

  /**
   * Update the display order of multiple images
   */
  async updateImagesOrder(orderUpdates: { id: string; display_order: number }[]): Promise<boolean> {
    // Use a transaction to update the order of all images
    for (const update of orderUpdates) {
      const { error } = await db
        .from('blog_images')
        .update({ display_order: update.display_order })
        .eq('id', update.id);

      if (error) {
        console.error(`Error updating image order for ${update.id}:`, error);
        return false;
      }
    }

    return true;
  }
}

export default new BlogImageService();
