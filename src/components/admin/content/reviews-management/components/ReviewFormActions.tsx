
import React from "react";
import { Button } from "@/components/ui/button";

interface ReviewFormActionsProps {
  isLoading: boolean;
  onCancel: () => void;
  isEditing?: boolean;
}

const ReviewFormActions: React.FC<ReviewFormActionsProps> = ({
  isLoading,
  onCancel,
  isEditing = false,
}) => {
  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    onCancel();
  };

  return (
    <div className="flex justify-end gap-2">
      <Button 
        type="button" 
        variant="outline" 
        onClick={handleCancel}
        disabled={isLoading}
      >
        Отмена
      </Button>
      <Button 
        type="submit" 
        disabled={isLoading}
      >
        {isLoading ? "Сохранение..." : isEditing ? "Обновить" : "Сохранить"}
      </Button>
    </div>
  );
};

export default ReviewFormActions;
