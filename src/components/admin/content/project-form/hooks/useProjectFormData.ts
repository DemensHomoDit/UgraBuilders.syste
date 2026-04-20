
import { useState, useEffect, useRef, useCallback } from "react";
import { Project } from "@/types/project";

export const useProjectFormData = (initialProject?: Project) => {
  // Создаем референс для отслеживания статуса монтирования компонента
  const mountStatus = useRef<{ isMounted: boolean }>({ isMounted: true });
  
  // Клонируем начальные данные, чтобы избежать мутации исходного объекта
  const [formData, setFormData] = useState<Partial<Project>>(() => {
    // Значения по умолчанию
    const defaultData = {
      title: "",
      description: "",
      content: "",
      cover_image: "",
      material: "Каркасный дом",
      type: "standard",
      style: "modern",
      areavalue: null,
      pricevalue: null,
      dimensions: "",
      bedrooms: 0,
      bathrooms: 0,
      stories: 1,
      hasgarage: false,
      hasterrace: false,
      tags: [],
      is_published: false,
      designer_first_name: "",
      designer_last_name: "",
    };
    
    // Инициализация с базовыми значениями
    let initialData = { ...defaultData };

    // Если передан initialProject, используем его значения
    if (initialProject) {
      // Создаем новый объект, преобразуя все числовые значения к числам
      const processedInitialProject = {
        ...initialProject,
        areavalue: initialProject.areavalue !== undefined && initialProject.areavalue !== null ? 
          Number(initialProject.areavalue) : null,
        pricevalue: initialProject.pricevalue !== undefined && initialProject.pricevalue !== null
          ? Number(initialProject.pricevalue) / 1000000
          : null,
        bedrooms: initialProject.bedrooms !== undefined && initialProject.bedrooms !== null ? 
          Number(initialProject.bedrooms) : 0,
        bathrooms: initialProject.bathrooms !== undefined && initialProject.bathrooms !== null ? 
          Number(initialProject.bathrooms) : 0,
        stories: initialProject.stories !== undefined && initialProject.stories !== null ? 
          Number(initialProject.stories) : 1,
        hasgarage: initialProject.hasgarage !== undefined ? Boolean(initialProject.hasgarage) : false,
        hasterrace: initialProject.hasterrace !== undefined ? Boolean(initialProject.hasterrace) : false
      };
      
      initialData = { ...initialData, ...processedInitialProject };
    }
    
    return initialData;
  });

  // При размонтировании компонента отмечаем, что он больше не смонтирован
  useEffect(() => {
    mountStatus.current.isMounted = true;
    
    return () => {
      mountStatus.current.isMounted = false;
    };
  }, []);

  // Безопасное обновление состояния с проверкой монтирования
  const safeSetFormData = useCallback((updater: (prev: Partial<Project>) => Partial<Project>) => {
    if (mountStatus.current.isMounted) {
      setFormData(prev => {
        try {
          const updated = updater(prev);
          return updated;
        } catch (error) {
          console.error("Error updating form data:", error);
          return prev;
        }
      });
    }
  }, []);

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    safeSetFormData((prev) => ({ ...prev, [name]: value }));
  }, [safeSetFormData]);

  const handleNumberChange = useCallback((
    field: string, 
    value: number | null
  ) => {
    safeSetFormData((prev) => {
      // Создаем копию предыдущего состояния
      const updatedData = { ...prev };
      
      // Устанавливаем значение (позволяем null для пустых полей)
      updatedData[field] = value === null ? null : Number(value);
      
      // Если значение не null, проверяем на NaN
      if (updatedData[field] !== null && isNaN(updatedData[field] as number)) {
        updatedData[field] = 0;
      }
      
      return updatedData;
    });
  }, [safeSetFormData]);

  const handleSelectChange = useCallback((field: string, value: any) => {
    safeSetFormData((prev) => ({ ...prev, [field]: value }));
  }, [safeSetFormData]);

  const handleCheckboxChange = useCallback((field: string, checked: boolean) => {
    safeSetFormData((prev) => ({ ...prev, [field]: checked }));
  }, [safeSetFormData]);

  const handleCoverImageUploaded = useCallback((url: string) => {
    safeSetFormData((prev) => ({ ...prev, cover_image: url }));
  }, [safeSetFormData]);

  const handleReset = useCallback(() => {
    if (!mountStatus.current.isMounted) return;
    
    const defaultData = initialProject || {
      title: "",
      description: "",
      content: "",
      cover_image: "",
      material: "Каркасный дом",
      type: "standard",
      style: "modern",
      areavalue: null,
      pricevalue: null,
      dimensions: "",
      bedrooms: 0,
      bathrooms: 0,
      stories: 1,
      hasgarage: false,
      hasterrace: false,
      tags: [],
      is_published: false,
      designer_first_name: "",
      designer_last_name: "",
    };
    
    setFormData(defaultData);
  }, [initialProject]);

  return {
    formData,
    setFormData: safeSetFormData,
    handleChange,
    handleNumberChange,
    handleSelectChange,
    handleCheckboxChange,
    handleCoverImageUploaded,
    handleReset,
  };
};
