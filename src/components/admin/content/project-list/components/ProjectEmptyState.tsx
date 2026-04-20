
import React from "react";
import { Button } from "@/components/ui/button";

interface ProjectEmptyStateProps {
  onRetry: () => void;
}

const ProjectEmptyState: React.FC<ProjectEmptyStateProps> = ({ onRetry }) => {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
      <p className="text-amber-700 mb-4">Проекты не найдены или не загружены</p>
      <Button onClick={onRetry} variant="default" size="sm">
        Повторить загрузку
      </Button>
    </div>
  );
};

export default ProjectEmptyState;
