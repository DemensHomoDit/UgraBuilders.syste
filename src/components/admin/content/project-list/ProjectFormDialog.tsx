
import React, { useEffect } from 'react';
import ProjectFormDialog from '../ProjectFormDialog';
import { Project } from "@/services/project/types";

interface ProjectListFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProject: Project | null;
  onClose: () => void;
}

// Компонент-обертка для поддержания совместимости с существующими импортами в проекте
const ProjectListFormDialog: React.FC<ProjectListFormDialogProps> = (props) => {
  // Проверяем наличие всех необходимых свойств и задаем безопасные значения по умолчанию
  const safeProps = {
    isOpen: props.isOpen || false,
    onOpenChange: props.onOpenChange || (() => {}),
    selectedProject: props.selectedProject || null,
    onClose: props.onClose || (() => {})
  };
  
  // Используем useEffect для логирования и отладки
  useEffect(() => {
    return () => {
    };
  }, [safeProps.isOpen, safeProps.selectedProject]);
  
  // Проверяем, что должны рендерить диалог только когда он открыт
  if (!safeProps.isOpen) {
    return null;
  }
  
  // Добавляем стабильный ключ, чтобы React мог однозначно идентифицировать этот компонент
  return <ProjectFormDialog key="project-form-dialog" {...safeProps} />;
};

export default ProjectListFormDialog;
