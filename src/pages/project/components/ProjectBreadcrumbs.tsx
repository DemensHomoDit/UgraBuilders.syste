
import React from "react";

interface ProjectBreadcrumbsProps {
  projectTitle: string;
}

const ProjectBreadcrumbs: React.FC<ProjectBreadcrumbsProps> = ({ projectTitle }) => (
  <div className="flex items-center text-sm text-gray-500 mb-2">
    <a href="/" className="hover:text-primary">Главная</a>
    <span className="mx-2">/</span>
    <a href="/projects" className="hover:text-primary">Проекты</a>
    <span className="mx-2">/</span>
    <span className="text-gray-700">{projectTitle}</span>
  </div>
);

export default ProjectBreadcrumbs;
