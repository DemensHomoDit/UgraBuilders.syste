
import React from "react";
import { Button } from "@/components/ui/button";
import { CategoryType } from "./types";

interface CategoryFilterProps {
  activeFilter: CategoryType | 'all';
  onFilterChange: (filter: CategoryType | 'all') => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { label: 'Все', value: 'all' },
    { label: 'Проекты', value: 'project' },
    { label: 'Коммерческие', value: 'commercial' },
    { label: 'Блог', value: 'blog' },
    { label: 'Новости', value: 'news' }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant={activeFilter === filter.value ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange(filter.value as CategoryType | 'all')}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;
