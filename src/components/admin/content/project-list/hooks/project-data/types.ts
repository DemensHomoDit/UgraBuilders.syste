
import { Project } from "@/services/project/types";
import { Category } from "@/services/categoryService";

// Типы фильтров для проектов
export interface ProjectFilters {
  categoryId: string;
  search: string;
  showUnpublished: boolean;
  projectType: string;
}

// Возвращаемый тип хука useProjectData
export interface ProjectDataReturn {
  projects: Project[];
  categories: Category[];
  isLoading: boolean;
  loadingProgress: number;
  error: string | null;
  filters: ProjectFilters;
  isOfflineMode: boolean;
  handleTogglePublished: (id: string) => Promise<void>;
  handleDeleteProject: (id: string) => Promise<boolean>;
  handleFilterChange: (name: string, value: any) => void;
  loadData: () => Promise<void>;
}
