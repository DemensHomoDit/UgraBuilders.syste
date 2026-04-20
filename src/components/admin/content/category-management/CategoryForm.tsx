
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryFormData } from "./types";

interface CategoryFormProps {
  formData: CategoryFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onTypeChange: (value: string) => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ formData, onChange, onTypeChange }) => {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">Название</label>
        <Input 
          id="name" 
          name="name" 
          value={formData.name} 
          onChange={onChange} 
          placeholder="Введите название категории"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">Описание</label>
        <Textarea 
          id="description" 
          name="description" 
          value={formData.description || ""} 
          onChange={onChange} 
          placeholder="Введите описание категории"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="type" className="text-sm font-medium">Тип</label>
        <Select value={formData.type} onValueChange={onTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите тип" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Типы</SelectLabel>
              <SelectItem value="project">Проекты</SelectItem>
              <SelectItem value="blog">Блог</SelectItem>
              <SelectItem value="news">Новости</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default CategoryForm;
