
import React from "react";
import { Link } from "react-router-dom";
import { Project } from "@/services/project/types";
import ImageDisplay from "@/components/shared/ImageDisplay";
import { formatArea, formatPrice } from "@/services/utils/formUtils";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

interface ProjectListViewProps {
  projects: Project[];
  showActions?: boolean;
}

const ProjectListView: React.FC<ProjectListViewProps> = ({ 
  projects,
  showActions = false
}) => {
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
    <div className="space-y-4">
      {projects.map((project, index) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Card className="overflow-hidden">
            <Link 
              to={`/projects/${project.id}`}
              className="flex flex-col md:flex-row h-full"
            >
              <div className="w-full md:w-1/3 lg:w-1/4 aspect-video md:aspect-auto">
                <ImageDisplay
                  imageUrl={project.cover_image || ""}
                  alt={project.title}
                  className="w-full h-full object-cover"
                  aspectRatio="16/9"
                />
              </div>
              <div className="p-4 flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-900 hover:text-primary transition-colors">{project.title}</h3>
                    {project.is_published === false && showActions && (
                      <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                        Черновик
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{project.description || "Описание отсутствует"}</p>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex flex-wrap gap-4">
                    {project.areavalue > 0 && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 3v18h18" />
                          <path d="M3 15L15 3" />
                        </svg>
                        <span className="text-sm">{formatArea(project.areavalue)}</span>
                      </div>
                    )}
                    
                    {project.bedrooms > 0 && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M2 9V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5" />
                          <path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0Z" />
                        </svg>
                        <span className="text-sm">{project.bedrooms} спал.</span>
                      </div>
                    )}
                    
                    {project.bathrooms > 0 && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
                          <line x1="10" x2="8" y1="5" y2="7" />
                          <line x1="2" x2="22" y1="12" y2="12" />
                          <line x1="7" x2="7" y1="19" y2="21" />
                          <line x1="17" x2="17" y1="19" y2="21" />
                        </svg>
                        <span className="text-sm">{project.bathrooms} с/у</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-primary">{formatPrice(project.pricevalue)}</span>
                    {project.type && (
                      <Badge variant="outline" className="bg-slate-100">
                        {project.type === "standard" ? "Типовой" : project.type === "custom" ? "Индивидуальный" : project.type}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default ProjectListView;
