
import React from "react";
import { Project } from "@/services/project/types";
import ProjectCard from "./ProjectCard";
import { motion } from "framer-motion";

interface ProjectListProps {
  projects: Project[];
  showActions?: boolean;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, showActions = false }) => {
  // Логирование для отладки
  // Проверка на пустой список проектов
  if (projects.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Проекты не найдены</h3>
        <p className="text-gray-500">
          Попробуйте изменить параметры фильтрации или поиска
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project, index) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <ProjectCard 
            project={project} 
            showActions={showActions}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default ProjectList;
