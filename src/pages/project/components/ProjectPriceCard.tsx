
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PhoneCall, Bookmark } from "lucide-react";

interface ProjectPriceCardProps {
  projectPrice: string;
  areavalue?: number | null;
  projectType?: string;
  style?: string;
}

const ProjectPriceCard: React.FC<ProjectPriceCardProps> = ({
  projectPrice,
  areavalue,
  projectType,
  style,
}) => {
  return (
    <Card className="bg-white border shadow-md">
      <CardHeader className="bg-primary/5 border-b pb-4">
        <CardTitle className="font-bold text-2xl text-primary">{projectPrice}</CardTitle>
        <CardDescription className="text-gray-600">Стоимость проекта</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3 mb-4">
          {areavalue !== null && areavalue !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Площадь:</span>
              <span className="font-medium">{areavalue} м²</span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Тип проекта:</span>
            <span className="font-medium">{projectType || "Не указан"}</span>
          </div>
          {style && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Стиль:</span>
              <span className="font-medium">{style}</span>
            </div>
          )}
        </div>
        <div className="space-y-3">
          <Button className="w-full flex items-center justify-center" size="lg" onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}>
            <PhoneCall className="mr-2 h-4 w-4" />
            Заказать проект
          </Button>
          <Button variant="ghost" className="w-full flex items-center justify-center text-gray-600">
            <Bookmark className="mr-2 h-4 w-4" />
            Сохранить в избранное
          </Button>
        </div>
        <div className="mt-4 pt-4 border-t text-center">
          <p className="text-xs text-gray-500">
            Цена является ориентировочной. Для получения точного расчета стоимости свяжитесь с нашими специалистами.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectPriceCard;
