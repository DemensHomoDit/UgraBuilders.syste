
import { Project } from "@/types/project";

export interface ProjectFormProps {
  project?: Project;
  onSave?: (project: Project) => void;
  onCancel?: () => void;
}

export interface ProjectDetailsProps {
  formData: Project;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleCoverImageUploaded: (url: string) => void;
  categories: any[];
  handleSelectChange: (field: string, value: any) => void;
  isEditMode?: boolean;
}

export interface ProjectSpecificationsProps {
  formData: Project;
  handleNumberChange: (field: string, value: number | null) => void;
  handleSelectChange: (field: string, value: any) => void;
  handleCheckboxChange: (field: string, checked: boolean) => void;
}

export interface TagsManagerProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}
