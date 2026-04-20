
// Компонент для аккуратного вывода проектировщика под описанием проекта
import React from "react";

interface DesignerInfoProps {
  designerName: string;
}

const DesignerInfo: React.FC<DesignerInfoProps> = ({ designerName }) => {
  if (!designerName.trim()) return null;

  return (
    <div className="flex items-center justify-between border-t pt-4 mt-6 max-w-md mx-auto">
      <span className="text-muted-foreground text-sm">Проектировщик</span>
      {/* Имя проектировщика справа, жирным и крупнее */}
      <span className="font-semibold text-base text-right text-primary truncate">{designerName}</span>
    </div>
  );
};

export default DesignerInfo;
