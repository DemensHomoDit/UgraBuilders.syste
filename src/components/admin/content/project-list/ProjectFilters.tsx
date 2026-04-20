import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Category } from "@/services/categoryService";

interface ProjectFiltersProps {
  filters: {
    categoryId: string;
    search: string;
    showUnpublished: boolean;
    projectType?: string;
    status?: string;
  };
  categories: Category[];
  onFilterChange: (name: string, value: string | boolean) => void;
}

const statusOptions = [
  { value: "all", label: "Все статусы" },
  { value: "draft", label: "Черновик" },
  { value: "pending", label: "На подтверждении" },
  { value: "published", label: "Опубликовано" },
  { value: "rejected", label: "Отклонено" },
];

const ProjectFilters: React.FC<ProjectFiltersProps> = ({
  filters,
  categories,
  onFilterChange,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Категория */}
        <div>
          <Label htmlFor="category" className="text-sm mb-1 block">Категория</Label>
          <Select 
            value={filters.categoryId} 
            onValueChange={(value) => onFilterChange("categoryId", value)}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Все категории" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все категории</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id || ''}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Тип проекта */}
        <div>
          <Label htmlFor="projectType" className="text-sm mb-1 block">Тип проекта</Label>
          <Select 
            value={filters.projectType || 'all'} 
            onValueChange={(value) => onFilterChange("projectType", value)}
          >
            <SelectTrigger id="projectType">
              <SelectValue placeholder="Все типы" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все типы</SelectItem>
              <SelectItem value="standard">Серийные</SelectItem>
              <SelectItem value="custom">Индивидуальные</SelectItem>
              <SelectItem value="commercial">Коммерческие</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Статус проекта */}
        <div>
          <Label htmlFor="status" className="text-sm mb-1 block">Статус</Label>
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => onFilterChange("status", value)}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Все статусы" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Поиск */}
        <div>
          <Label htmlFor="search" className="text-sm mb-1 block">Поиск</Label>
          <Input
            id="search"
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
            placeholder="Поиск по названию..."
            className="w-full"
          />
        </div>

        {/* Неопубликованные */}
        <div className="flex items-center h-full pt-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="unpublished"
              checked={filters.showUnpublished}
              onCheckedChange={(checked) => onFilterChange("showUnpublished", checked)}
            />
            <Label htmlFor="unpublished">Показывать неопубликованные</Label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectFilters;
