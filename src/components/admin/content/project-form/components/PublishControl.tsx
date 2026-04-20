
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface PublishControlProps {
  isPublished: boolean;
  onToggle: (checked: boolean) => void;
}

const PublishControl: React.FC<PublishControlProps> = ({ isPublished, onToggle }) => {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/10">
      <div>
        <h4 className="font-medium">Статус публикации</h4>
        <p className="text-sm text-muted-foreground">
          {isPublished 
            ? "Проект опубликован и виден посетителям" 
            : "Проект сохранен как черновик"}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Label htmlFor="publish-toggle" className="cursor-pointer">
          {isPublished ? "Опубликован" : "Черновик"}
        </Label>
        <Switch 
          id="publish-toggle"
          checked={isPublished}
          onCheckedChange={onToggle}
        />
      </div>
    </div>
  );
};

export default PublishControl;
