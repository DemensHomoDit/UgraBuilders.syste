
import React from "react";
import { Button } from "@/components/ui/button";

interface BlogFormActionsProps {
  isLoading: boolean;
  onCancel: () => void;
}

const BlogFormActions: React.FC<BlogFormActionsProps> = ({
  isLoading,
  onCancel,
}) => {
  return (
    <div className="flex justify-end gap-2">
      <Button type="button" variant="outline" onClick={onCancel}>
        Отмена
      </Button>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Сохранение..." : "Сохранить"}
      </Button>
    </div>
  );
};

export default BlogFormActions;
