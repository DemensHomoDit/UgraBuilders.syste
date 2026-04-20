
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

// Характеристика одного параметра проекта
export interface Feature {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}

interface ProjectFeaturesProps {
  features: Feature[];
}

// Минималистичный вывод карточек характеристик
const ProjectFeatures: React.FC<ProjectFeaturesProps> = ({ features }) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
    {features.map((feature, idx) => (
      <Card key={idx} className="bg-white shadow-sm">
        <CardContent className="p-4 flex flex-col items-center justify-center">
          {feature.icon}
          <p className="text-xl font-semibold">{feature.value}</p>
          <p className="text-gray-500 text-xs text-center">{feature.label}</p>
        </CardContent>
      </Card>
    ))}
  </div>
);

export default ProjectFeatures;
