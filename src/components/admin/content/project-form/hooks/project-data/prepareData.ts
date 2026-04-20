
import { Project } from "@/types/project";
import { processProjectNumericFields } from "./numericDataProcessor";

// Подготавливает данные проекта для сохранения в БД
export const prepareProjectData = (
  projectData: Partial<Project>,
  userId: string,
  options: { initialProject?: Project } = {}
): Partial<Project> => {
  // Обрабатываем числовые поля
  const processedData = processProjectNumericFields(projectData);
  
  // Добавляем идентификатор пользователя для нового проекта
  if (!options.initialProject) {
    processedData.created_by = userId;
  }
  
  // Убедимся, что у нас есть все необходимые поля
  const preparedData: Partial<Project> = {
    title: processedData.title || '',
    description: processedData.description || '',
    content: processedData.content || '',
    cover_image: processedData.cover_image || '',
    category_id: processedData.category_id,
    tags: Array.isArray(processedData.tags) ? processedData.tags : [],
    areavalue: processedData.areavalue,
    pricevalue: processedData.pricevalue,
    dimensions: processedData.dimensions || '',
    bedrooms: typeof processedData.bedrooms === 'number' ? processedData.bedrooms : 0,
    bathrooms: typeof processedData.bathrooms === 'number' ? processedData.bathrooms : 0,
    stories: typeof processedData.stories === 'number' ? processedData.stories : 1,
    material: processedData.material || 'Каркасный дом',
    type: processedData.type || 'standard',
    style: processedData.style || 'modern',
    hasgarage: processedData.hasgarage || false,
    hasterrace: processedData.hasterrace || false,
    is_published: processedData.is_published || false,
    designer_first_name: processedData.designer_first_name || '',
    designer_last_name: processedData.designer_last_name || '',
  };

  // Если это существующий проект, добавляем дату обновления
  if (options.initialProject?.id) {
    preparedData.updated_at = new Date().toISOString();
  }
  
  return preparedData;
};
