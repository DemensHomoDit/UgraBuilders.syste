
import React from "react";
import { Progress } from "@/components/ui/progress";

interface ProjectLoadingIndicatorProps {
  isLoading: boolean;
  progress: number;
}

const ProjectLoadingIndicator: React.FC<ProjectLoadingIndicatorProps> = ({ isLoading, progress }) => {
  if (!isLoading || progress <= 0 || progress >= 100) {
    return null;
  }

  return (
    <div className="w-full mt-2">
      <Progress value={progress} className="h-1" indicatorClassName="bg-blue-500" />
    </div>
  );
};

export default ProjectLoadingIndicator;
