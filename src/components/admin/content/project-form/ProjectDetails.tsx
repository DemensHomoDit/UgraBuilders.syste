import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PROJECT_TYPES,
  HOUSE_STYLES,
  MATERIAL_TYPES,
} from "./constants";
import { ProjectDetailsProps } from "./types";
import ImageUpload from "../image-upload/ImageUpload";
import RichTextEditor from "@/components/ui/rich-text-editor";

const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  formData,
  handleChange,
  handleCoverImageUploaded,
  categories,
  handleSelectChange,
  isEditMode = false,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Label htmlFor="title">
            Название проекта <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            name="title"
            value={formData.title || ""}
            onChange={handleChange}
            placeholder="Введите название проекта"
            required
            className="mt-1"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="description">Краткое описание</Label>
          <Input
            id="description"
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            placeholder="Краткое описание для карточки проекта"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="category">Категория</Label>
          <Select
            value={formData.category_id || ""}
            onValueChange={(value) => handleSelectChange("category_id", value)}
          >
            <SelectTrigger id="category" className="mt-1">
              <SelectValue placeholder="Выберите категорию" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="type">Тип проекта</Label>
          <Select
            value={formData.type || "standard"}
            onValueChange={(value) => handleSelectChange("type", value)}
          >
            <SelectTrigger id="type" className="mt-1">
              <SelectValue placeholder="Выберите тип проекта" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {PROJECT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="style">Стиль дома</Label>
          <Select
            value={formData.style || "modern"}
            onValueChange={(value) => handleSelectChange("style", value)}
          >
            <SelectTrigger id="style" className="mt-1">
              <SelectValue placeholder="Выберите стиль" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {HOUSE_STYLES.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    {style.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="material">Материал</Label>
          <Select
            value={formData.material || "Каркасный дом"}
            onValueChange={(value) => handleSelectChange("material", value)}
          >
            <SelectTrigger id="material" className="mt-1">
              <SelectValue placeholder="Выберите материал" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {MATERIAL_TYPES.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="designer_first_name">Имя проектировщика</Label>
          <Input
            id="designer_first_name"
            name="designer_first_name"
            value={formData.designer_first_name || ""}
            onChange={handleChange}
            placeholder="Имя"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="designer_last_name">Фамилия проектировщика</Label>
          <Input
            id="designer_last_name"
            name="designer_last_name"
            value={formData.designer_last_name || ""}
            onChange={handleChange}
            placeholder="Фамилия"
            className="mt-1"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="content">Полное описание</Label>
          <div className="mt-1">
            <RichTextEditor
              content={formData.content || ""}
              onChange={(html) =>
                handleSelectChange("content", html)
              }
              placeholder="Подробное описание проекта, преимущества, особенности..."
              minHeight="250px"
            />
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="cover_image">Обложка проекта</Label>
        <Card className="mt-1">
          <CardContent className="p-4">
            <ImageUpload
              currentImage={formData.cover_image}
              onImageUploaded={handleCoverImageUploaded}
              bucketName="project-images"
              objectPath={`covers/${formData.id || "new"}-${Date.now()}`}
              className="w-full aspect-[16/9]"
              note="Рекомендуемый размер: 1200x675"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectDetails;
