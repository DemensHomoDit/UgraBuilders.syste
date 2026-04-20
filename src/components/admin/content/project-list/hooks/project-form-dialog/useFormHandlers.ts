
import { Project } from "@/types/project";
import { ProjectImage } from "@/services/project/types";
import {
  useHandleProjectSave,
  useHandleImageAdd,
  useHandleImageUpdate,
  useHandleImageDelete,
  useHandleImagesReorder,
  useHandleImageDialogChange,
  useHandleOpenChange,
  useHandleFinalClose
} from "./useFormHandlers/index";

export const useFormHandlers = (props: {
  selectedProject: Project | null;
  savedProject: Project | null;
  setSavedProject: React.Dispatch<React.SetStateAction<Project | null>>;
  setActiveTab: (tab: string) => void;
  setProjectImages: React.Dispatch<React.SetStateAction<ProjectImage[]>>;
  setPreventClose: React.Dispatch<React.SetStateAction<boolean>>;
  setIsImageDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  preventClose: boolean;
  isImageDialogOpen: boolean;
  onClose: () => void;
  safeSetState: <T extends any>(
    setter: React.Dispatch<React.SetStateAction<T>>,
    value: React.SetStateAction<T>
  ) => void;
}) => {
  const {
    selectedProject,
    savedProject,
    setSavedProject,
    setActiveTab,
    setProjectImages,
    setPreventClose,
    setIsImageDialogOpen,
    preventClose,
    isImageDialogOpen,
    onClose,
    safeSetState
  } = props;

  // Use the object parameter format that matches what useHandleProjectSave expects
  const handleProjectSave = useHandleProjectSave({ 
    selectedProject, 
    safeSetState, 
    setSavedProject, 
    setActiveTab 
  });

  const handleImageAdd = useHandleImageAdd(selectedProject, savedProject, safeSetState, setPreventClose, setProjectImages);
  const handleImageUpdate = useHandleImageUpdate(safeSetState, setPreventClose, setProjectImages);
  const handleImageDelete = useHandleImageDelete(safeSetState, setPreventClose, setProjectImages);
  const handleImagesReorder = useHandleImagesReorder(safeSetState, setPreventClose, setProjectImages);
  const handleImageDialogChange = useHandleImageDialogChange(safeSetState, setIsImageDialogOpen);
  const handleOpenChange = useHandleOpenChange(preventClose, isImageDialogOpen);
  const handleFinalClose = useHandleFinalClose(onClose, preventClose, isImageDialogOpen);

  return {
    handleProjectSave,
    handleImageAdd,
    handleImageUpdate,
    handleImageDelete,
    handleImagesReorder,
    handleImageDialogChange,
    handleOpenChange,
    handleFinalClose
  };
};
