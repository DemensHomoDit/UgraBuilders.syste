
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/services/project/types";
import { Category } from "@/services/categoryService";

interface ProjectCardDetailsProps {
  project: Project;
  category?: Category;
}

export const ProjectCardDetails: React.FC<ProjectCardDetailsProps> = ({
  project,
  category
}) => {
  const displayPrice = project.pricevalue ? 
    `${(project.pricevalue / 1000000).toFixed(1)} млн ₽` : 
    "—";

  return (
    <div className="p-4 space-y-3">
      <div className="flex flex-wrap gap-2">
        {project.type && getProjectTypeBadge(project.type)}
        {category && (
          <Badge variant="outline">{category.name}</Badge>
        )}
      </div>
      
      <div className="text-sm text-muted-foreground line-clamp-2">
        {project.description || "Нет описания"}
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-muted-foreground">Площадь:</span>{" "}
          {project.areavalue || "—"} м²
        </div>
        <div>
          <span className="text-muted-foreground">Этажей:</span>{" "}
          {project.stories || "—"}
        </div>
        <div>
          <span className="text-muted-foreground">Цена:</span>{" "}
          {displayPrice}
        </div>
        <div>
          <span className="text-muted-foreground">Спальни:</span>{" "}
          {project.bedrooms || "—"}
        </div>
      </div>
    </div>
  );
};

function getProjectTypeBadge(type: string) {
  switch (type) {
    case "custom":
      return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Индивидуальный</Badge>;
    case "commercial":
      return <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">Коммерческий</Badge>;
    default:
      return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Серийный</Badge>;
  }
}
