
import { Project } from "@/types/project";
import { processBooleanFields } from "./booleanDataProcessor";
import { formatCamelToSnake } from "./fieldFormatter";
import { setDefaultValues } from "./defaultValuesProcessor";
import { processProjectNumericFields } from "./numericDataProcessor";

type PrepareProjectDataOptions = {
  initialProject?: Project;
};

export function prepareProjectData(
  rawData: Partial<Project> & Record<string, any>,
  userId: string,
  opts: PrepareProjectDataOptions = {}
): Record<string, any> {
  // Create a copy of the data to avoid mutating the original object
  let data = { ...rawData };

  // Log raw data
  // Apply basic transformations
  data = formatCamelToSnake(data);
  data = processBooleanFields(data);
  data = setDefaultValues(data);
  
  // Process all numeric fields consistently using the same function
  data = processProjectNumericFields(data);

  // Log processed data
  // Set creator ID
  data.created_by = userId;
  
  // Remove categories as they're not compatible with Json type
  if ('categories' in data) {
    delete data.categories;
  }
  
  return data;
}
