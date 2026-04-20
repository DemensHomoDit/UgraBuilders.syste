
import React from "react";
import { Button } from "@/components/ui/button";
import { Project } from "@/services/project/types";

interface FormActionsProps {
  onSave: () => void;
  onCancel?: () => void;
  onReset?: () => void;
  isLoading: boolean;
  isEditMode: boolean;
  hasChanges: boolean;
  initialData?: Project;
  currentData?: Partial<Project>;
}

const FormActions: React.FC<FormActionsProps> = ({
  onSave,
  onCancel,
  onReset,
  isLoading,
  isEditMode,
  hasChanges,
  initialData,
  currentData
}) => {
  // Для отладки
  // Всегда делаем кнопку активной для лучшего UX
  // Пользователи иногда могут не видеть изменения, 
  // но всё равно хотеть сохранить форму
  const saveButtonEnabled = true;

  return (
    <div className="flex justify-end space-x-4 mt-6">
      {onCancel && (
        <Button 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
        >
          {isEditMode ? "Отмена" : "Отменить"}
        </Button>
      )}
      
      {onReset && (
        <Button 
          variant="outline" 
          onClick={onReset}
          disabled={isLoading}
        >
          Сбросить
        </Button>
      )}
      
      <Button 
        onClick={onSave}
        disabled={isLoading || !saveButtonEnabled}
        className={isLoading ? "opacity-70" : ""}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <span className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></span>
            <span>Сохранение...</span>
          </div>
        ) : (
          isEditMode ? "Сохранить изменения" : "Создать проект"
        )}
      </Button>
    </div>
  );
};

export default FormActions;
