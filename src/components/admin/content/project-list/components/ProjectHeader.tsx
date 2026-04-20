
import React from "react";

interface ProjectHeaderProps {
  onAddProject?: () => void;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = () => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Проекты домов</h2>
    </div>
  );
};

export default ProjectHeader;
