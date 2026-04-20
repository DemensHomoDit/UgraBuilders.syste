
import React from "react";
import { Button } from "@/components/ui/button";

interface ProjectErrorStateProps {
  error: string;
  onRetry: () => void;
}

const ProjectErrorState: React.FC<ProjectErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
      <p className="text-red-700 mb-2">Ошибка загрузки проектов</p>
      <p className="text-red-600 mb-4">{error}</p>
      <Button onClick={onRetry} variant="outline" size="sm">
        Повторить загрузку
      </Button>
    </div>
  );
};

export default ProjectErrorState;
