import { db } from "@/integrations/db/client";
import { Project } from "./types";
import { toast } from "sonner";
import { withRetry } from "@/utils/retry";

class ProjectQueryService {
  public async getProjects(onlyPublished = true): Promise<Project[]> {
    return withRetry(async () => {
      let query = db
        .from('projects')
        .select('*, categories(id, name, type)');
      
      if (onlyPublished) {
        query = query.eq('is_published', true);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching projects:", error.message);
        return [];
      }
      
      if (!data || data.length === 0) {
        return [];
      }
      
      // Add UI friendly properties to each project
      const enhancedProjects = data.map(project => {
        // Преобразование числовых полей в числа, гарантируя их числовой тип
        const numericAreaValue = typeof project.areavalue === 'number' 
          ? project.areavalue 
          : project.areavalue !== null && project.areavalue !== undefined 
            ? Number(project.areavalue) 
            : 0;
        
        const numericPriceValue = typeof project.pricevalue === 'number' 
          ? project.pricevalue 
          : project.pricevalue !== null && project.pricevalue !== undefined 
            ? Number(project.pricevalue) 
            : 0;
            
        return {
          ...project,
          areavalue: numericAreaValue,
          pricevalue: numericPriceValue,
          areaValue: numericAreaValue, // Добавляем для UI
          priceValue: numericPriceValue, // Добавляем для UI
          hasGarage: project.hasgarage || false,
          hasTerrace: project.hasterrace || false,
          is_published: Boolean(project.is_published),
          status: project.status || (project.is_published ? 'published' : 'draft')
        };
      });
      return enhancedProjects as Project[];
    }, {
      onError: (error) => {
        toast.error("Ошибка при загрузке проектов", {
          description: error?.message || "Произошла неизвестная ошибка"
        });
      }
    });
  }
  
  public async getProjectsByCategory(categoryId: string, onlyPublished = true): Promise<Project[]> {
    return withRetry(async () => {
      let query = db
        .from('projects')
        .select('*, categories(id, name, type)')
        .eq('category_id', categoryId);
      
      if (onlyPublished) {
        query = query.eq('is_published', true);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching projects by category:", error.message);
        return [];
      }
      
      // Add UI friendly properties to each project
      const enhancedProjects = data ? data.map(project => {
        const numericAreaValue = typeof project.areavalue === 'number' 
          ? project.areavalue 
          : project.areavalue !== null && project.areavalue !== undefined 
            ? Number(project.areavalue) 
            : 0;
        
        const numericPriceValue = typeof project.pricevalue === 'number' 
          ? project.pricevalue 
          : project.pricevalue !== null && project.pricevalue !== undefined 
            ? Number(project.pricevalue) 
            : 0;
            
        return {
          ...project,
          areavalue: numericAreaValue,
          pricevalue: numericPriceValue,
          areaValue: numericAreaValue,
          priceValue: numericPriceValue,
          hasGarage: project.hasgarage || false,
          hasTerrace: project.hasterrace || false,
          status: project.status || (project.is_published ? 'published' : 'draft')
        };
      }) : [];
      return enhancedProjects as Project[];
    }, {
      onError: (error) => {
        toast.error("Ошибка при загрузке проектов категории", {
          description: error?.message || "Произошла неизвестная ошибка"
        });
      }
    });
  }
  
  public async getProjectsByType(projectType: string, onlyPublished = true): Promise<Project[]> {
    return withRetry(async () => {
      let query = db
        .from('projects')
        .select('*, categories(id, name, type)')
        .eq('type', projectType);
      
      if (onlyPublished) {
        query = query.eq('is_published', true);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching projects by type:", error.message);
        return [];
      }
      
      // Add UI friendly properties to each project
      const enhancedProjects = data ? data.map(project => {
        const numericAreaValue = typeof project.areavalue === 'number' 
          ? project.areavalue 
          : project.areavalue !== null && project.areavalue !== undefined 
            ? Number(project.areavalue) 
            : 0;
        
        const numericPriceValue = typeof project.pricevalue === 'number' 
          ? project.pricevalue 
          : project.pricevalue !== null && project.pricevalue !== undefined 
            ? Number(project.pricevalue) 
            : 0;
            
        return {
          ...project,
          areavalue: numericAreaValue,
          pricevalue: numericPriceValue,
          areaValue: numericAreaValue,
          priceValue: numericPriceValue,
          hasGarage: project.hasgarage || false,
          hasTerrace: project.hasterrace || false,
          status: project.status || (project.is_published ? 'published' : 'draft')
        };
      }) : [];
      return enhancedProjects as Project[];
    }, {
      onError: (error) => {
        toast.error("Ошибка при загрузке проектов типа", {
          description: error?.message || "Произошла неизвестная ошибка"
        });
      }
    });
  }
  
  public async getProjectById(id: string): Promise<Project | null> {
    return withRetry(async () => {
      const { data, error } = await db
        .from('projects')
        .select('*, categories(id, name, type)')
        .eq('id', id)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching project:", error.message);
        return null;
      }
      
      if (!data) {
        return null;
      }
      
      // Преобразование числовых значений
      const numericAreaValue = typeof data.areavalue === 'number' 
        ? data.areavalue 
        : data.areavalue !== null && data.areavalue !== undefined 
          ? Number(data.areavalue) 
          : 0;
      
      const numericPriceValue = typeof data.pricevalue === 'number' 
        ? data.pricevalue 
        : data.pricevalue !== null && data.pricevalue !== undefined 
          ? Number(data.pricevalue) 
          : 0;
      
      // Детальное логирование для отладки
      // Add UI friendly properties
      const enhancedProject = {
        ...data,
        areavalue: numericAreaValue,
        pricevalue: numericPriceValue,
        areaValue: numericAreaValue,
        priceValue: numericPriceValue,
        hasGarage: data.hasgarage || false,
        hasTerrace: data.hasterrace || false,
        is_published: Boolean(data.is_published),
        status: data.status || (data.is_published ? 'published' : 'draft')
      };
      return enhancedProject as Project;
    }, {
      onError: (error) => {
        toast.error("Ошибка при загрузке проекта по ID", {
          description: error?.message || "Произошла неизвестная ошибка"
        });
      }
    });
  }
}

export default new ProjectQueryService();
