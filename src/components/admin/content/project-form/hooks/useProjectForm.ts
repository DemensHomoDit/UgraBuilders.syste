
import { useCallback } from "react";
import { Project } from "@/types/project";
import { useProjectFormData } from "./useProjectFormData";
import { useProjectTags } from "./useProjectTags";
import { useProjectCategories } from "./useProjectCategories";
import { useProjectSave } from "./useProjectSave";
import { useProjectValidation } from "./useProjectValidation";
import { useFormState } from "./form/useFormState";
import { useSaveHandler } from "./form/useSaveHandler";

export const useProjectForm = (
  initialProject?: Project,
  onSave?: (project: Project) => void,
  onCancel?: () => void
) => {
  const { isMountedRef } = useFormState(initialProject);
  
  const { 
    formData, 
    handleChange,
    handleNumberChange,
    handleSelectChange,
    handleCheckboxChange,
    handleCoverImageUploaded,
    handleReset
  } = useProjectFormData(initialProject);

  const { categories } = useProjectCategories();
  const { tags, handleAddTag, handleRemoveTag } = useProjectTags(initialProject?.tags);
  const { isLoading, saveProject } = useProjectSave(initialProject, onSave);
  const { validateProject } = useProjectValidation();
  const { handleSave: saveHandler } = useSaveHandler(formData, isMountedRef, saveProject);

  const handleAddTagToForm = useCallback((tag: string) => {
    if (!tag.trim()) return;
    handleAddTag(tag);
    if (formData.tags) {
      const updatedTags = [...formData.tags];
      if (!updatedTags.includes(tag)) {
        updatedTags.push(tag);
        formData.tags = updatedTags;
      }
    } else {
      formData.tags = [tag];
    }
  }, [formData, handleAddTag]);

  const handleRemoveTagFromForm = useCallback((tagToRemove: string) => {
    handleRemoveTag(tagToRemove);
    if (formData.tags) {
      formData.tags = formData.tags.filter(tag => tag !== tagToRemove);
    }
  }, [formData, handleRemoveTag]);

  const validateForm = useCallback(() => {
    return validateProject(formData);
  }, [formData, validateProject]);

  const handleSave = useCallback(async () => {
    return saveHandler();
  }, [saveHandler]);

  return {
    formData,
    isLoading,
    categories,
    tags,
    handleChange,
    handleNumberChange,
    handleSelectChange,
    handleCheckboxChange,
    handleCoverImageUploaded,
    handleAddTag: handleAddTagToForm,
    handleRemoveTag: handleRemoveTagFromForm,
    validateForm,
    handleSave,
    handleReset,
    handleCancel: onCancel,
    isEditMode: !!initialProject?.id,
  };
};
