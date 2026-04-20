import React, { useState, useEffect, useRef } from "react";
import { Project } from "@/types/project";
import { db } from "@/integrations/db/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Loader2, Save, X } from "lucide-react";
import ProjectDetails from "./ProjectDetails";
import ProjectSpecifications from "./ProjectSpecifications";
import TagsManager from "./TagsManager";
import ProjectImageGallery from "@/components/admin/content/project-form/components/ProjectImageGallery";
import RichTextEditor from "@/components/ui/rich-text-editor";
import ImageUpload from "@/components/admin/content/image-upload/ImageUpload";
import { User } from "@/services/types/authTypes";

interface ProjectFormProps {
  project?: Project;
  onSave?: (project: Project) => void;
  onCancel?: () => void;
  user?: User;
}

interface ValidationError {
  field: string;
  message: string;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  project,
  onSave,
  onCancel,
  user,
}) => {
  const isMountedRef = useRef(true);
  const [activeTab, setActiveTab] = useState("details");
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<string[]>(project?.tags || []);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const getInitialPrice = (pricevalue?: number): number | null => {
    if (pricevalue === null || pricevalue === undefined) return null;
    if (pricevalue > 10000) return Number((pricevalue / 1000000).toFixed(2));
    return pricevalue;
  };

  const [formData, setFormData] = useState<Partial<Project>>(() => {
    const defaultData: Partial<Project> = {
      title: "",
      description: "",
      cover_image: "",
      content: "",
      category_id: "",
      tags: [],
      areavalue: null,
      pricevalue: null,
      dimensions: "",
      bedrooms: 0,
      bathrooms: 0,
      stories: 1,
      rooms: 0,
      material: "Каркасный дом",
      type: "standard",
      style: "modern",
      hasgarage: false,
      hasterrace: false,
      hasbasement: false,
      hassecondlight: false,
      haspantry: false,
      hasbalcony: false,
      hasfireplace: false,
      designer_first_name: "",
      designer_last_name: "",
      foundation_type: "",
      roof_type: "",
      heating: "",
      insulation: "",
      window_type: "",
      ceiling_height: null,
      construction_time: "",
      wall_thickness: "",
      is_published: false,
    };

    if (project) {
      return {
        ...defaultData,
        ...project,
        pricevalue: getInitialPrice(project.pricevalue),
      };
    }
    return defaultData;
  });

  const [pendingImages, setPendingImages] = useState<
    { url: string; type: string; description: string }[]
  >([]);

  useEffect(() => {
    isMountedRef.current = true;
    loadCategories();
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await db
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      if (isMountedRef.current) setCategories(data || []);
    } catch (error: any) {
      console.error("Ошибка при загрузке категорий:", error.message);
      toast.error("Не удалось загрузить категории", {
        description: error.message,
      });
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearFieldError(name);
  };

  const handleNumberChange = (field: string, value: number | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value === null ? null : isNaN(Number(value)) ? 0 : Number(value),
    }));
    clearFieldError(field);
  };

  const handleSelectChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    clearFieldError(field);
  };

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: checked }));
  };

  const handleMainImageChange = (url: string) => {
    setFormData((prev) => ({ ...prev, cover_image: url }));
  };

  const handleCoverImageUploaded = (url: string) => {
    setFormData((prev) => ({ ...prev, cover_image: url }));
    clearFieldError("cover_image");
  };

  const handleAddTag = (tag: string) => {
    if (!tag || !tag.trim()) return;
    if (!tags.includes(tag)) {
      const newTags = [...tags, tag];
      setTags(newTags);
      setFormData((prev) => ({ ...prev, tags: newTags }));
    }
  };

  const handleRemoveTag = (tag: string) => {
    const newTags = tags.filter((t) => t !== tag);
    setTags(newTags);
    setFormData((prev) => ({ ...prev, tags: newTags }));
  };

  const addPendingImage = () => {
    setPendingImages((prev) => [
      ...prev,
      { url: "", type: "general", description: "" },
    ]);
  };

  const updatePendingImage = (
    index: number,
    field: string,
    value: string,
  ) => {
    setPendingImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, [field]: value } : img)),
    );
  };

  const removePendingImage = (index: number) => {
    setPendingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const clearFieldError = (field: string) => {
    setErrors((prev) => prev.filter((e) => e.field !== field));
  };

  const validateForm = (): boolean => {
    const validationErrors: ValidationError[] = [];

    if (!formData.title?.trim()) {
      validationErrors.push({
        field: "title",
        message: "Название проекта обязательно",
      });
    }
    if (!formData.areavalue || formData.areavalue <= 0) {
      validationErrors.push({
        field: "areavalue",
        message: "Укажите площадь проекта",
      });
    }
    if (!formData.pricevalue || formData.pricevalue <= 0) {
      validationErrors.push({
        field: "pricevalue",
        message: "Укажите стоимость проекта",
      });
    }
    if (formData.is_published && !formData.cover_image) {
      validationErrors.push({
        field: "cover_image",
        message: "Для публикации нужна обложка",
      });
    }
    if (formData.pricevalue !== null && formData.pricevalue < 0) {
      validationErrors.push({
        field: "pricevalue",
        message: "Цена должна быть положительной",
      });
    }
    if (formData.areavalue !== null && formData.areavalue < 0) {
      validationErrors.push({
        field: "areavalue",
        message: "Площадь должна быть положительной",
      });
    }

    setErrors(validationErrors);

    if (validationErrors.length > 0) {
      toast.error("Исправьте ошибки в форме", {
        description: validationErrors.map((e) => e.message).join(", "),
      });

      if (validationErrors.some((e) => ["title", "areavalue", "pricevalue", "cover_image"].includes(e.field))) {
        setActiveTab("details");
      }
      return false;
    }
    return true;
  };

  const buildProjectData = () => {
    const safeFormData = {
      ...formData,
      category_id:
        formData.category_id && formData.category_id !== ""
          ? formData.category_id
          : null,
    };

    return {
      title: safeFormData.title,
      description: safeFormData.description,
      content: safeFormData.content,
      cover_image: safeFormData.cover_image,
      category_id: safeFormData.category_id,
      tags: tags,
      areavalue:
        safeFormData.areavalue !== undefined
          ? Number(safeFormData.areavalue)
          : null,
      pricevalue:
        safeFormData.pricevalue !== undefined &&
        safeFormData.pricevalue !== null
          ? Number(safeFormData.pricevalue) * 1000000
          : null,
      dimensions: safeFormData.dimensions || "",
      bedrooms:
        safeFormData.bedrooms !== undefined
          ? Number(safeFormData.bedrooms)
          : 0,
      bathrooms:
        safeFormData.bathrooms !== undefined
          ? Number(safeFormData.bathrooms)
          : 0,
      stories:
        safeFormData.stories !== undefined ? Number(safeFormData.stories) : 1,
      rooms: (safeFormData as any).rooms !== undefined ? Number((safeFormData as any).rooms) : 0,
      hasgarage: safeFormData.hasgarage || false,
      hasterrace: safeFormData.hasterrace || false,
      hasbasement: (safeFormData as any).hasbasement || false,
      hassecondlight: (safeFormData as any).hassecondlight || false,
      haspantry: (safeFormData as any).haspantry || false,
      hasbalcony: (safeFormData as any).hasbalcony || false,
      hasfireplace: (safeFormData as any).hasfireplace || false,
      material: safeFormData.material || "Каркасный дом",
      type: safeFormData.type || "standard",
      style: safeFormData.style || "modern",
      designer_first_name: safeFormData.designer_first_name || "",
      designer_last_name: safeFormData.designer_last_name || "",
      foundation_type: (safeFormData as any).foundation_type || "",
      roof_type: (safeFormData as any).roof_type || "",
      heating: (safeFormData as any).heating || "",
      insulation: (safeFormData as any).insulation || "",
      window_type: (safeFormData as any).window_type || "",
      ceiling_height: (safeFormData as any).ceiling_height ?? null,
      construction_time: (safeFormData as any).construction_time || "",
      wall_thickness: (safeFormData as any).wall_thickness || "",
      is_published: safeFormData.is_published || false,
    };
  };

  const savePendingImages = async (projectId: string) => {
    for (const img of pendingImages) {
      if (!img.url) continue;
      try {
        await db.from("project_images").insert({
          project_id: projectId,
          image_url: img.url,
          description: img.description || "",
          image_type: img.type || "general",
          display_order: 0,
        });
      } catch (err) {
        console.error("Ошибка сохранения изображения:", err);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const projectData = buildProjectData();
      let savedProject: Project | null = null;

      if (project?.id) {
        const { data, error } = await db
          .from("projects")
          .update({
            ...projectData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", project.id)
          .select();

        if (error) throw error;

        if (data && data[0]) {
          savedProject = data[0] as Project;
          toast.success("Проект успешно обновлен");
        } else {
          throw new Error("Не удалось получить данные обновленного проекта");
        }
      } else {
        const { data, error } = await db
          .from("projects")
          .insert(projectData)
          .select();

        if (error) throw error;

        if (data && data[0]) {
          savedProject = data[0] as Project;
          await savePendingImages(savedProject.id);
          toast.success("Новый проект успешно создан");
        } else {
          throw new Error("Не удалось получить данные созданного проекта");
        }
      }

      if (onSave && savedProject && isMountedRef.current) {
        onSave(savedProject);
      }
    } catch (error: any) {
      console.error("Ошибка при сохранении проекта:", error);
      toast.error("Не удалось сохранить проект", {
        description: error.message,
      });
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  if (!formData) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 mb-4">Не удалось загрузить форму проекта</p>
        {onCancel && <Button onClick={onCancel}>Закрыть</Button>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {errors.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
          <div className="flex items-center gap-2 text-destructive text-sm font-medium mb-1">
            <AlertCircle className="h-4 w-4" />
            Исправьте ошибки:
          </div>
          <ul className="text-sm text-destructive/80 list-disc list-inside">
            {errors.map((e, i) => (
              <li key={i}>{e.message}</li>
            ))}
          </ul>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full mb-4">
          <TabsTrigger value="details">Основная информация</TabsTrigger>
          <TabsTrigger value="specifications">Характеристики</TabsTrigger>
          <TabsTrigger value="images">
            Изображения
            {pendingImages.length > 0 && !project?.id && (
              <span className="ml-1 bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-xs">
                {pendingImages.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="seo">Теги и публикация</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardContent className="pt-6">
              <ProjectDetails
                formData={formData as Project}
                handleChange={handleChange}
                handleCoverImageUploaded={handleCoverImageUploaded}
                categories={categories}
                handleSelectChange={handleSelectChange}
                isEditMode={!!project?.id}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specifications">
          <ProjectSpecifications
            formData={formData as Project}
            handleNumberChange={handleNumberChange}
            handleSelectChange={handleSelectChange}
            handleCheckboxChange={handleCheckboxChange}
          />
        </TabsContent>

        <TabsContent value="images">
          <Card>
            <CardContent className="pt-6">
              {project?.id ? (
                <ProjectImageGallery
                  project={project}
                  onMainImageChange={handleMainImageChange}
                />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-md font-medium">
                      Изображения проекта
                    </h3>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={addPendingImage}
                    >
                      Добавить изображение
                    </Button>
                  </div>

                  {pendingImages.length === 0 && (
                    <div className="text-center py-8 border border-dashed rounded-md">
                      <p className="text-muted-foreground">
                        Добавьте изображения — они сохранятся вместе с проектом
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-2"
                        onClick={addPendingImage}
                      >
                        Добавить первое
                      </Button>
                    </div>
                  )}

                  {pendingImages.map((img, index) => (
                    <div
                      key={index}
                      className="rounded-lg border p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Изображение {index + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => removePendingImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {img.url ? (
                        <div className="relative aspect-video rounded-md overflow-hidden bg-muted">
                          <img
                            src={img.url}
                            alt={`Изображение ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <ImageUpload
                          onImageUploaded={(url) =>
                            updatePendingImage(index, "url", url)
                          }
                          bucketName="project-images"
                          objectPath={`pending/${Date.now()}-${index}`}
                          className="w-full aspect-video"
                        />
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground">
                            Тип
                          </label>
                          <select
                            value={img.type}
                            onChange={(e) =>
                              updatePendingImage(
                                index,
                                "type",
                                e.target.value,
                              )
                            }
                            className="w-full mt-1 rounded-md border px-3 py-1.5 text-sm"
                          >
                            <option value="main">Основное</option>
                            <option value="general">Общее</option>
                            <option value="floor_plan">План этажа</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">
                            Описание
                          </label>
                          <input
                            type="text"
                            value={img.description}
                            onChange={(e) =>
                              updatePendingImage(
                                index,
                                "description",
                                e.target.value,
                              )
                            }
                            placeholder="Описание изображения"
                            className="w-full mt-1 rounded-md border px-3 py-1.5 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Теги проекта</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Добавьте теги для удобной фильтрации и поиска
                </p>
                <TagsManager
                  tags={tags}
                  onAddTag={handleAddTag}
                  onRemoveTag={handleRemoveTag}
                />
              </div>

              <div className="flex items-center space-x-2 pt-4 border-t">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={!!formData.is_published}
                  onChange={(e) =>
                    handleCheckboxChange("is_published", e.target.checked)
                  }
                  className="w-4 h-4 rounded border-gray-300 focus:ring-primary"
                />
                <label htmlFor="is_published" className="text-sm font-medium">
                  Опубликовать проект
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            Отмена
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Сохранение...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {project?.id ? "Обновить проект" : "Создать проект"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;
