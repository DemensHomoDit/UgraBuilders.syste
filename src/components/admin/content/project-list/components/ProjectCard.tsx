import React from "react";
import { cn } from "@/lib/utils";
import { Project } from "@/services/project/types";
import { Category } from "@/services/categoryService";
import ImageDisplay from "@/components/shared/ImageDisplay";
import { Badge } from "@/components/ui/badge";
import { formatArea, formatPrice } from "@/services/utils/formUtils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Trash2, MoreHorizontal, Download, Archive } from "lucide-react";
import { HOUSE_STYLES } from "@/components/admin/content/project-form/constants";

interface ProjectCardProps {
  project: Project;
  categories?: Category[];
  onEditProject?: (id: string) => void;
  onViewProject?: (id: string) => void;
  onTogglePublished?: (id: string) => void;
  onDeleteProject?: (project: Project) => void;
  className?: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  categories,
  onEditProject,
  onViewProject,
  onTogglePublished,
  onDeleteProject,
  className
}) => {
  // Найти название категории по ID
  const categoryName = categories?.find(cat => cat.id === project.category_id)?.name || "Без категории";
  
  return (
    <Card className={cn("overflow-hidden relative group", className)}>
      <div className="relative w-full aspect-[4/3]">
        <ImageDisplay
          imageUrl={project.cover_image || ""}
          alt={project.title}
          className="w-full h-full object-cover"
        />
        
        {/* Статус публикации как бейдж */}
        <div className="absolute top-2 right-2">
          {project.is_published ? (
            <Badge variant="default" className="bg-green-600">Опубликовано</Badge>
          ) : (
            <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50">Черновик</Badge>
          )}
        </div>
        
        {/* Всплывающие действия при наведении */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
          {onViewProject && (
            <Button size="sm" variant="outline" className="bg-white hover:bg-gray-100" onClick={() => onViewProject(project.id)}>
              <Eye className="h-4 w-4 mr-1" /> Просмотр
            </Button>
          )}
          {onEditProject && (
            <Button size="sm" variant="outline" className="bg-white hover:bg-gray-100" onClick={() => onEditProject(project.id)}>
              <Edit className="h-4 w-4 mr-1" /> Редактировать
            </Button>
          )}
        </div>
      </div>
      
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-md font-medium leading-tight line-clamp-2 mr-8">
            {project.title}
          </CardTitle>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 absolute top-3 right-2">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onViewProject && (
                <DropdownMenuItem onClick={() => onViewProject(project.id)}>
                  <Eye className="h-4 w-4 mr-2" /> Просмотр
                </DropdownMenuItem>
              )}
              {onEditProject && (
                <DropdownMenuItem onClick={() => onEditProject(project.id)}>
                  <Edit className="h-4 w-4 mr-2" /> Редактировать
                </DropdownMenuItem>
              )}
              {onTogglePublished && (
                <DropdownMenuItem onClick={() => onTogglePublished(project.id)}>
                  {project.is_published 
                    ? <span className="flex items-center"><Archive className="h-4 w-4 mr-2" /> Снять с публикации</span>
                    : <span className="flex items-center"><Eye className="h-4 w-4 mr-2" /> Опубликовать</span>
                  }
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" /> Скачать
              </DropdownMenuItem>
              {onDeleteProject && (
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-600"
                  onClick={() => onDeleteProject(project)}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Удалить
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-2">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <span>{categoryName}</span>
            {project.type && (
              <>
                <span className="mx-1">•</span>
                <span>{project.type === 'standard' ? 'Типовой' : 'Индивидуальный'}</span>
              </>
            )}
          </div>
          
          {/* Технические характеристики */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
            {project.areavalue != null && project.areavalue > 0 && (
              <div className="flex items-center text-sm">
                <span className="font-medium">Площадь:</span>
                <span className="ml-1">{formatArea(project.areavalue)}</span>
              </div>
            )}
            
            {project.bedrooms != null && project.bedrooms > 0 && (
              <div className="flex items-center text-sm">
                <span className="font-medium">Спальни:</span>
                <span className="ml-1">{project.bedrooms}</span>
              </div>
            )}
            
            {project.stories != null && project.stories > 0 && (
              <div className="flex items-center text-sm">
                <span className="font-medium">Этажей:</span>
                <span className="ml-1">{project.stories}</span>
              </div>
            )}
            
            {project.bathrooms != null && project.bathrooms > 0 && (
              <div className="flex items-center text-sm">
                <span className="font-medium">Санузлы:</span>
                <span className="ml-1">{project.bathrooms}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      {/* Стиль дома на русском */}
      {project.style && (
        <div className="px-4 pb-2 text-sm text-gray-500">
          Стиль: {HOUSE_STYLES.find(s => s.value === project.style)?.label || project.style}
        </div>
      )}
      
      <CardFooter className="p-4 pt-0 flex justify-between border-t mt-2">
        <div className="text-xs text-gray-500">
          ID: {project.id.substring(0, 8)}
        </div>
        <div className="font-medium text-primary">
          {project.pricevalue != null ? formatPrice(project.pricevalue) : "Цена по запросу"}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
