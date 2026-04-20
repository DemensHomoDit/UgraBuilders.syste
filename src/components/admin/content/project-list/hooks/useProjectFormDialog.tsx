
import { Project, ProjectImage } from "@/services/project/types";
import { Project as ProjectType } from "@/types/project";
import { 
  useDialogState, 
  useProjectImages, 
  useDialogEffects, 
  useFormHandlers 
} from "./project-form-dialog";

/**
 * Хук для управления диалогом формы проекта и его состоянием
 * Отделяет логику управления состоянием от представления
 */
export const useProjectFormDialog = (props: {
  isOpen: boolean;
  selectedProject: Project | null;
  onClose: () => void;
}) => {
  const { isOpen, selectedProject, onClose } = props;
  
  // Используем отдельные хуки для разделения логики
  const {
    isMountedRef,
    activeTab,
    setActiveTab,
    savedProject,
    setSavedProject,
    isImageDialogOpen,
    setIsImageDialogOpen,
    preventClose,
    setPreventClose,
    currentProject
  } = useDialogState({ isOpen, selectedProject });
  
  const {
    projectImages,
    setProjectImages,
    isLoading,
    setIsLoading
  } = useProjectImages();
  
  const { safeSetState } = useDialogEffects({
    isOpen,
    selectedProject,
    savedProject,
    isMountedRef,
    setActiveTab,
    setProjectImages,
    setIsLoading,
    setPreventClose,
    setSavedProject
  });
  
  // Безопасное приведение типов для обработки null значений
  const safeSelectedProject = selectedProject as unknown as ProjectType;
  const safeSavedProject = savedProject as unknown as ProjectType;

  const {
    handleProjectSave,
    handleImageAdd,
    handleImageUpdate,
    handleImageDelete,
    handleImagesReorder,
    handleImageDialogChange,
    handleOpenChange,
    handleFinalClose
  } = useFormHandlers({
    selectedProject: safeSelectedProject,
    savedProject: safeSavedProject,
    setSavedProject: setSavedProject as React.Dispatch<React.SetStateAction<ProjectType | null>>,
    setActiveTab,
    setProjectImages,
    setPreventClose,
    setIsImageDialogOpen,
    preventClose,
    isImageDialogOpen,
    onClose,
    safeSetState
  });

  // Логирование для отладки
  console.debug("useProjectFormDialog", {
    selectedProject: selectedProject ? `${selectedProject.id} - ${selectedProject.title}` : 'null',
    savedProject: savedProject ? `${savedProject.id} - ${savedProject.title}` : 'null',
    preventClose,
    isImageDialogOpen,
    isOpen
  });

  return {
    // Текущие состояния
    activeTab,
    setActiveTab,
    projectImages,
    isLoading,
    preventClose,
    isImageDialogOpen,
    currentProject,
    
    // Обработчики
    handleProjectSave,
    handleImageAdd,
    handleImageUpdate,
    handleImageDelete,
    handleImagesReorder,
    handleOpenChange,
    handleFinalClose,
    handleImageDialogChange
  };
};
