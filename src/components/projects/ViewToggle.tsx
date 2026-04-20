
import React from "react";
import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type ViewMode = "grid" | "list";

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

/**
 * Компонент для переключения режима отображения проектов
 */
const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, onViewModeChange }) => {
  return (
    <ToggleGroup 
      type="single" 
      value={viewMode}
      onValueChange={(value) => {
        if (value) onViewModeChange(value as ViewMode);
      }}
      className="border rounded-md"
    >
      <ToggleGroupItem value="grid" aria-label="Отображать сеткой">
        <LayoutGrid className="h-4 w-4 mr-1" />
        <span className="sr-only md:not-sr-only md:inline-block text-xs">Сетка</span>
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label="Отображать списком">
        <List className="h-4 w-4 mr-1" />
        <span className="sr-only md:not-sr-only md:inline-block text-xs">Список</span>
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export default ViewToggle;
