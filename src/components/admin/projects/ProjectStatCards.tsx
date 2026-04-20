
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export interface ProjectStatCardsProps {
  totalProjects: number;
  publishedProjects: number;
  conversionRate: number;
  monthlyChange: {
    total: number;
    published: number;
    conversion: number;
  };
}

const ProjectStatCards: React.FC<ProjectStatCardsProps> = ({
  totalProjects,
  publishedProjects,
  conversionRate,
  monthlyChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Всего проектов</CardTitle>
          <CardDescription>Общее количество проектов</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalProjects}</div>
          <div className="text-xs text-muted-foreground mt-1">
            +{monthlyChange.total} за последний месяц
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Опубликовано</CardTitle>
          <CardDescription>Активные проекты</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{publishedProjects}</div>
          <div className="text-xs text-green-600 mt-1">
            +{monthlyChange.published} за последний месяц
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Конверсия</CardTitle>
          <CardDescription>Средний показатель просмотров</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{conversionRate}%</div>
          <div className="text-xs text-amber-600 mt-1">
            {monthlyChange.conversion}% от прошлого месяца
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectStatCards;
