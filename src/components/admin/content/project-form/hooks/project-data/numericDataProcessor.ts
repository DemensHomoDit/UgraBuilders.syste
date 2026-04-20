
import { Project } from "@/types/project";

/**
 * Обрабатывает числовые поля проекта, гарантируя их корректные типы
 * @param projectData Данные проекта
 */
export const processProjectNumericFields = (projectData: Partial<Project>): Partial<Project> => {
  const processed = { ...projectData };
  
  // Обработка числовых полей
  if ('areavalue' in processed) {
    // Преобразуем к числу или null, если пустая строка или null
    const value = processed.areavalue;
    processed.areavalue = 
      (value === undefined || value === null || (typeof value === 'string' && value === ""))
        ? null
        : typeof value === 'string'
          ? parseFloat(value)
          : Number(value);
  }
  
  if ('pricevalue' in processed) {
    const value = processed.pricevalue;
    if (value === undefined || value === null || (typeof value === 'string' && value === "")) {
      processed.pricevalue = null;
    } else if (typeof value === 'string') {
      const stringValue: string = value;
      const cleanedValue = stringValue.replace(/[^\d.-]/g, '');
      const parsedValue = parseFloat(cleanedValue);
      processed.pricevalue = isNaN(parsedValue) ? null : parsedValue * 1000000;
    } else {
      const numValue = Number(value);
      processed.pricevalue = isNaN(numValue) ? null : numValue * 1000000;
    }
  }
  
  // Обработка целочисленных полей
  if ('bedrooms' in processed) {
    const value = processed.bedrooms;
    processed.bedrooms = 
      (value === undefined || value === null || (typeof value === 'string' && value === ""))
        ? 0
        : typeof value === 'string'
          ? parseInt(value, 10)
          : Number(value);
  }
  
  if ('bathrooms' in processed) {
    const value = processed.bathrooms;
    processed.bathrooms = 
      (value === undefined || value === null || (typeof value === 'string' && value === ""))
        ? 0
        : typeof value === 'string'
          ? parseInt(value, 10)
          : Number(value);
  }
  
  if ('stories' in processed) {
    const value = processed.stories;
    processed.stories = 
      (value === undefined || value === null || (typeof value === 'string' && value === ""))
        ? 1
        : typeof value === 'string'
          ? parseInt(value, 10)
          : Number(value);
  }
  return processed;
};
