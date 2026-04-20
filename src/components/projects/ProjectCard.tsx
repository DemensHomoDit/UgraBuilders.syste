
import React from "react";
import { Link } from "react-router-dom";
import { Project } from "@/services/project/types";
import ImageDisplay from "@/components/shared/ImageDisplay";
import { formatArea, formatPrice } from "@/services/utils/formUtils";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ProjectCardProps {
  project: Project;
  showActions?: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  showActions = false,
}) => {
  // Логирование информации о проекте для отладки
  // Вычисляем путь для деталей проекта
  const projectDetailsPath = `/projects/${project.id}`;
  
  // Получаем числовые значения, убеждаясь что они числа
  const areaValue = project.areavalue !== undefined && project.areavalue !== null ? 
    Number(project.areavalue) : 0;
  const priceValue = project.pricevalue !== undefined && project.pricevalue !== null ? 
    Number(project.pricevalue) : 0;
  const bedroomsValue = project.bedrooms !== undefined && project.bedrooms !== null ? 
    Number(project.bedrooms) : 0;
  const bathroomsValue = project.bathrooms !== undefined && project.bathrooms !== null ?
    Number(project.bathrooms) : 0;
    
  // Форматируем значения для отображения
  const formattedArea = formatArea(areaValue);
  const formattedPrice = formatPrice(priceValue);

  return (
    <Card className="h-full flex flex-col transition-all duration-300 hover:shadow-md bg-white overflow-hidden">
      <Link to={projectDetailsPath} className="group">
        <div className="aspect-[16/9] w-full overflow-hidden">
          <ImageDisplay
            imageUrl={project.cover_image || ""}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            aspectRatio="16/9"
          />
        </div>
        <CardHeader className="p-4">
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-xl line-clamp-2 group-hover:text-primary transition-colors">
              {project.title}
            </CardTitle>
            {project.is_published === false && showActions && (
              <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                Черновик
              </Badge>
            )}
          </div>
          <CardDescription className="line-clamp-2">
            {project.description || "Описание отсутствует"}
          </CardDescription>
        </CardHeader>
      </Link>
      <CardContent className="p-4 pt-0 mt-auto">
        <div className="flex flex-wrap gap-4 mt-2">
          {areaValue > 0 && (
            <div className="flex items-center gap-1">
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
                className="text-gray-500"
              >
                <path d="M3 3v18h18" />
                <path d="M3 15L15 3" />
              </svg>
              <span className="text-sm text-gray-600">{formattedArea}</span>
            </div>
          )}
          
          {bedroomsValue > 0 && (
            <div className="flex items-center gap-1">
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
                className="text-gray-500"
              >
                <path d="M2 9V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5" />
                <path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0Z" />
              </svg>
              <span className="text-sm text-gray-600">{bedroomsValue} спал.</span>
            </div>
          )}
          
          {bathroomsValue > 0 && (
            <div className="flex items-center gap-1">
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
                className="text-gray-500"
              >
                <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
                <line x1="10" x2="8" y1="5" y2="7" />
                <line x1="2" x2="22" y1="12" y2="12" />
                <line x1="7" x2="7" y1="19" y2="21" />
                <line x1="17" x2="17" y1="19" y2="21" />
              </svg>
              <span className="text-sm text-gray-600">{bathroomsValue} с/у</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="font-semibold text-primary">
          {formattedPrice}
        </div>
        {project.type && (
          <Badge variant="outline" className="bg-slate-100">
            {project.type === "standard" ? "Типовой" : project.type === "custom" ? "Индивидуальный" : project.type}
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
