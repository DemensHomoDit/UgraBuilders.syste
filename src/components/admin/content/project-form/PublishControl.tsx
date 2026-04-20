
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface PublishControlProps {
  isPublished: boolean;
  onChange: (checked: boolean) => void;
}

const PublishControl: React.FC<PublishControlProps> = ({ 
  isPublished, 
  onChange 
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox 
        id="is_published" 
        checked={isPublished}
        onCheckedChange={(checked) => onChange(checked as boolean)}
      />
      <label
        htmlFor="is_published"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Опубликовать проект
      </label>
    </div>
  );
};

export default PublishControl;
