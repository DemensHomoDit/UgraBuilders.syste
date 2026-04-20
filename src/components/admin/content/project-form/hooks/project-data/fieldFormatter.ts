
import { Project } from "@/types/project";

/**
 * Converts data from camelCase UI fields to snake_case database fields
 */
export const formatCamelToSnake = (data: Partial<Project> & Record<string, any>): Record<string, any> => {
  const formatted: Record<string, any> = { ...data };
  
  // Convert CamelCase to snake_case if needed
  if ('areaValue' in data) {
    formatted.areavalue = data.areaValue !== undefined && data.areaValue !== null ? 
      Number(data.areaValue) : null;
    delete formatted.areaValue;
  }
  
  if ('priceValue' in data) {
    formatted.pricevalue = data.priceValue !== undefined && data.priceValue !== null ? 
      Number(data.priceValue) : null;
    delete formatted.priceValue;
  }
  
  if ('hasGarage' in data) {
    formatted.hasgarage = Boolean(data.hasGarage);
    delete formatted.hasGarage;
  }
  
  if ('hasTerrace' in data) {
    formatted.hasterrace = Boolean(data.hasTerrace);
    delete formatted.hasTerrace;
  }
  
  return formatted;
};

/**
 * Converts data from snake_case database fields to camelCase UI fields
 */
export const formatSnakeToCamel = (data: Record<string, any>): Record<string, any> => {
  const formatted: Record<string, any> = { ...data };
  
  // Convert snake_case to CamelCase if needed
  if ('areavalue' in data) {
    formatted.areaValue = data.areavalue !== undefined && data.areavalue !== null ? 
      Number(data.areavalue) : null;
  }
  
  if ('pricevalue' in data) {
    formatted.priceValue = data.pricevalue !== undefined && data.pricevalue !== null
      ? Number(data.pricevalue) / 1000000
      : null;
  }
  
  if ('hasgarage' in data) {
    formatted.hasGarage = Boolean(data.hasgarage);
  }
  
  if ('hasterrace' in data) {
    formatted.hasTerrace = Boolean(data.hasterrace);
  }
  
  return formatted;
};
