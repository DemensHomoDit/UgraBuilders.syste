
import { useState, useRef } from "react";
import { Project } from "@/services/project/types";

/**
 * Хук для управления состоянием диалога проекта
 */
export const useDialogState = (props: {
  isOpen: boolean;
  selectedProject: Project | null;
}) => {
  const { isOpen, selectedProject } = props;
  
  // Создаем реф для отслеживания монтирования компонента
  const isMountedRef = useRef(true);
  
  // Состояние вкладок и проекта
  const [activeTab, setActiveTab] = useState("details");
  const [savedProject, setSavedProject] = useState<Project | null>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [preventClose, setPreventClose] = useState(false);
  
  // Текущий активный проект (выбранный или сохраненный)
  const currentProject = savedProject || selectedProject;

  return {
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
  };
};
