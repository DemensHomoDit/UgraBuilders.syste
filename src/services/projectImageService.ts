
import { db } from "@/integrations/db/client";
import { toast } from "sonner";

export interface ProjectImage {
  id: string;
  project_id: string;
  image_url: string;
  description?: string | null;
  display_order: number;
  created_at: string;
}

export interface ImageOrder {
  id: string;
  display_order: number;
}

class ProjectImageService {
  /**
   * Get all images for a project
   */
  async getProjectImages(projectId: string): Promise<ProjectImage[]> {
    try {
      const { data, error } = await db
        .from('project_images')
        .select('*')
        .eq('project_id', projectId)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      
      // Ensure all returned objects have the required fields
      const typedData = data?.map(item => ({
        id: item.id,
        project_id: item.project_id,
        image_url: item.image_url,
        description: item.description,
        display_order: item.display_order || 0,
        created_at: item.created_at || new Date().toISOString()
      })) || [];
      
      return typedData;
    } catch (error: any) {
      console.error("Error fetching project images:", error);
      toast.error("Не удалось загрузить изображения");
      return [];
    }
  }
  
  /**
   * Add a new image to a project
   */
  async addProjectImage(image: Omit<ProjectImage, 'id' | 'created_at'>): Promise<ProjectImage | null> {
    try {
      // Определяем следующий порядок отображения, если он не указан
      if (image.display_order === undefined) {
        const { data: orderData } = await db
          .from('project_images')
          .select('display_order')
          .eq('project_id', image.project_id)
          .order('display_order', { ascending: false })
          .limit(1);
          
        image.display_order = orderData && orderData.length > 0 
          ? (orderData[0].display_order + 1) 
          : 0;
      }
      
      // Используем стандартный insert для добавления изображения
      const { data, error } = await db
        .from('project_images')
        .insert([image])
        .select()
        .single();
      
      if (error) throw error;
      
      // Ensure the returned object has all required fields
      const typedData: ProjectImage = {
        id: data.id,
        project_id: data.project_id,
        image_url: data.image_url,
        description: data.description,
        display_order: data.display_order || 0,
        created_at: data.created_at || new Date().toISOString()
      };
      
      toast.success("Изображение добавлено");
      return typedData;
    } catch (error: any) {
      console.error("Error adding project image:", error);
      toast.error("Не удалось добавить изображение");
      return null;
    }
  }
  
  /**
   * Update an existing project image
   */
  async updateProjectImage(id: string, updates: Partial<ProjectImage>): Promise<ProjectImage | null> {
    try {
      const { data, error } = await db
        .from('project_images')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Ensure the returned object has all required fields
      const typedData: ProjectImage = {
        id: data.id,
        project_id: data.project_id,
        image_url: data.image_url,
        description: data.description,
        display_order: data.display_order || 0,
        created_at: data.created_at || new Date().toISOString()
      };
      
      toast.success("Изображение обновлено");
      return typedData;
    } catch (error: any) {
      console.error("Error updating project image:", error);
      toast.error("Не удалось обновить изображение");
      return null;
    }
  }
  
  /**
   * Delete a project image
   */
  async deleteProjectImage(id: string): Promise<boolean> {
    try {
      // Then delete the database record
      const { error } = await db
        .from('project_images')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success("Изображение удалено");
      return true;
    } catch (error: any) {
      console.error("Error deleting project image:", error);
      toast.error("Не удалось удалить изображение");
      return false;
    }
  }
  
  /**
   * Update the display order of images
   */
  async updateImagesOrder(images: ImageOrder[]): Promise<boolean> {
    try {
      // Loop through each image and update its order
      for (const img of images) {
        const { error } = await db
          .from('project_images')
          .update({ display_order: img.display_order })
          .eq('id', img.id);
        
        if (error) throw error;
      }
      
      toast.success("Порядок изображений обновлен");
      return true;
    } catch (error: any) {
      console.error("Error updating image order:", error);
      toast.error("Не удалось обновить порядок изображений");
      return false;
    }
  }
}

export default new ProjectImageService();
