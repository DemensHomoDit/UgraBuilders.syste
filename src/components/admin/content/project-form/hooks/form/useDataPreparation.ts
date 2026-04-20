
import { Project } from "@/services/project/types";
import { processProjectNumericFields } from "../project-data/numericDataProcessor";

export function useDataPreparation() {
  const prepareNumericData = (data: Partial<Project>): Partial<Project> => {
    // Используем ту же логику обработки числовых полей, что и при создании
    const processed = processProjectNumericFields(data);
    return processed;
  };
  
  return {
    prepareNumericData
  };
}
