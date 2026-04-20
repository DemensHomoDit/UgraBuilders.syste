import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import projectService from "@/services/project/index";
import { Project, ProjectImage } from "@/services/project/types";
import { toast } from "sonner";

export const useProjectDetails = (projectId?: string) => {
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      navigate("/projects");
      return;
    }

    const fetchProjectDetails = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Получаем детали проекта
        const projectData = await projectService.getProjectById(projectId);
        
        if (!projectData) {
          setError("Проект не найден");
          toast.error("Проект не найден");
          navigate("/projects");
          return;
        }

        // Нормализуем данные проекта
        const normalizedProject: Project = {
          ...projectData,
          areavalue: projectData.areavalue || 0,
          pricevalue: projectData.pricevalue || 0,
          hasgarage: projectData.hasgarage || false,
          hasterrace: projectData.hasterrace || false
        };

        // Логируем информацию о проекте, включая cover_image
        setProject(normalizedProject);
        
        // Получаем и сортируем изображения
        const projectImages = await projectService.getProjectImages(projectId);
        const sortedImages = projectImages.sort((a, b) => {
          const typeOrder = { main: 0, general: 1, floor_plan: 2 };
          const aTypeValue = a.image_type ? typeOrder[a.image_type] : 1;
          const bTypeValue = b.image_type ? typeOrder[b.image_type] : 1;
          
          if (aTypeValue !== bTypeValue) return aTypeValue - bTypeValue;
          return (a.display_order || 0) - (b.display_order || 0);
        });
        
        setImages(sortedImages);
        
      } catch (err: any) {
        console.error("Ошибка при загрузке данных проекта:", err);
        setError(err.message || "Ошибка при загрузке данных проекта");
        toast.error("Ошибка при загрузке данных проекта");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId, navigate]);

  // Получаем читаемый тип проекта из данных проекта
  const projectType = useMemo(() => {
    if (!project) return "";
    
    // Кастомное значение типа или одно из предопределенных значений
    switch (project.type) {
      case "standard":
        return "Типовой проект";
      case "custom":
        return "Индивидуальный проект";
      case "commercial":
        return "Коммерческий проект";
      default:
        return project.type || "Проект дома";
    }
  }, [project]);
  
  // Форматируем цену проекта для отображения
  const projectPrice = useMemo(() => {
    if (!project) return "";
    
    const price = project.pricevalue || 0;
    
    if (price === 0) {
      return "Цена по запросу";
    }
    
    // Форматируем в миллионах рублей
    return `от ${price} млн ₽`;
  }, [project]);

  // Получаем имя проектировщика
  const designerName = useMemo(() => {
    if (!project) return "";
    
    const firstName = project.designer_first_name || "";
    const lastName = project.designer_last_name || "";
    
    if (!firstName && !lastName) return "";
    
    return `${firstName} ${lastName}`.trim();
  }, [project]);

  // Мемоизированные селекторы изображений по типу
  const mainImages = useMemo(() => 
    images.filter(img => img.image_type === "main"), [images]
  );
  
  const generalImages = useMemo(() => 
    images.filter(img => img.image_type === "general"), [images]
  );
  
  const floorPlanImages = useMemo(() => 
    images.filter(img => img.image_type === "floor_plan"), [images]
  );

  return {
    project,
    images,
    mainImages,
    generalImages,
    floorPlanImages,
    isLoading,
    error,
    projectType,
    projectPrice,
    designerName
  };
};
