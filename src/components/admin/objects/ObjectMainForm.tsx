import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { db } from "@/integrations/db/client";
import { OurObject } from "@/types/ourObjects";
import { generateSlug } from "@/utils/slug";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

interface ObjectMainFormProps {
  objectId?: string;
  onSaved: (id: string) => void;
}

type FormData = {
  title: string;
  subtitle: string;
  excerpt: string;
  description: string;
  city: string;
  construction_year: string;
  area: string;
  material: string;
  stories: string;
  cover_image: string;
  slug: string;
  display_order: string;
  is_published: boolean;
};

const EMPTY_FORM: FormData = {
  title: "",
  subtitle: "",
  excerpt: "",
  description: "",
  city: "",
  construction_year: "",
  area: "",
  material: "",
  stories: "",
  cover_image: "",
  slug: "",
  display_order: "0",
  is_published: false,
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

interface FormErrors {
  title?: string;
  slug?: string;
}

const ObjectMainForm = ({ objectId, onSaved }: ObjectMainFormProps) => {
  const isEditMode = Boolean(objectId);

  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Track whether slug was manually edited (in create mode)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Load existing data in edit mode
  useEffect(() => {
    if (!isEditMode || !objectId) return;

    const load = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await db
          .from("our_objects")
          .select("*")
          .eq("id", objectId)
          .single();

        if (error) {
          toast.error("Не удалось загрузить данные объекта: " + error.message);
          return;
        }

        if (data) {
          const obj = data as OurObject;
          setForm({
            title: obj.title ?? "",
            subtitle: obj.subtitle ?? "",
            excerpt: obj.excerpt ?? "",
            description: obj.description ?? "",
            city: obj.city ?? "",
            construction_year: obj.construction_year != null ? String(obj.construction_year) : "",
            area: obj.area != null ? String(obj.area) : "",
            material: obj.material ?? "",
            stories: obj.stories != null ? String(obj.stories) : "",
            cover_image: obj.cover_image ?? "",
            slug: obj.slug ?? "",
            display_order: obj.display_order != null ? String(obj.display_order) : "0",
            is_published: obj.is_published ?? false,
          });
        }
      } catch (err: any) {
        toast.error("Ошибка загрузки объекта");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [objectId, isEditMode]);

  const handleTitleChange = useCallback(
    (value: string) => {
      setForm((prev) => {
        const next = { ...prev, title: value };
        // Auto-generate slug from title in create mode if not manually edited
        if (!isEditMode && !slugManuallyEdited) {
          next.slug = generateSlug(value);
        }
        return next;
      });
      if (errors.title) {
        setErrors((prev) => ({ ...prev, title: undefined }));
      }
    },
    [isEditMode, slugManuallyEdited, errors.title],
  );

  const handleSlugChange = useCallback(
    (value: string) => {
      setSlugManuallyEdited(true);
      setForm((prev) => ({ ...prev, slug: value }));
      if (errors.slug) {
        setErrors((prev) => ({ ...prev, slug: undefined }));
      }
    },
    [errors.slug],
  );

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.title.trim()) {
      newErrors.title = "Заголовок обязателен";
    }

    if (form.slug && !SLUG_PATTERN.test(form.slug)) {
      newErrors.slug =
        "Slug должен содержать только строчные латинские буквы, цифры и дефисы, и не начинаться/заканчиваться дефисом";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      const payload: Partial<OurObject> = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || undefined,
        excerpt: form.excerpt.trim() || undefined,
        description: form.description.trim() || undefined,
        city: form.city.trim() || undefined,
        construction_year: form.construction_year ? Number(form.construction_year) : undefined,
        area: form.area ? Number(form.area) : undefined,
        material: form.material.trim() || undefined,
        stories: form.stories ? Number(form.stories) : undefined,
        cover_image: form.cover_image.trim() || undefined,
        slug: form.slug.trim() || undefined,
        display_order: form.display_order ? Number(form.display_order) : 0,
        is_published: form.is_published,
      };

      if (isEditMode && objectId) {
        payload.id = objectId;
      }

      const { data, error } = await db
        .from("our_objects")
        .upsert(payload)
        .select("id")
        .single();

      if (error) {
        if (error.message?.toLowerCase().includes("slug")) {
          setErrors((prev) => ({ ...prev, slug: "Этот slug уже занят" }));
        }
        toast.error("Не удалось сохранить объект: " + error.message);
        return;
      }

      const savedId = (data as any)?.id ?? objectId;
      toast.success(isEditMode ? "Объект обновлён" : "Объект создан");
      if (savedId) {
        onSaved(savedId);
      }
    } catch (err: any) {
      toast.error("Ошибка при сохранении объекта");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title">
          Заголовок <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          value={form.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Название объекта"
          className={errors.title ? "border-red-500" : ""}
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title}</p>
        )}
      </div>

      {/* Subtitle */}
      <div className="space-y-1.5">
        <Label htmlFor="subtitle">Подзаголовок</Label>
        <Input
          id="subtitle"
          value={form.subtitle}
          onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))}
          placeholder="Краткий подзаголовок"
        />
      </div>

      {/* Excerpt */}
      <div className="space-y-1.5">
        <Label htmlFor="excerpt">Краткое описание</Label>
        <Textarea
          id="excerpt"
          value={form.excerpt}
          onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))}
          placeholder="Краткое описание для карточки и SEO"
          rows={3}
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Полное описание</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Подробное описание объекта"
          rows={6}
        />
      </div>

      {/* City + Construction year */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="city">Город</Label>
          <Input
            id="city"
            value={form.city}
            onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
            placeholder="Например: Сургут"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="construction_year">Год постройки</Label>
          <Input
            id="construction_year"
            type="number"
            value={form.construction_year}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, construction_year: e.target.value }))
            }
            placeholder="2024"
            min={1900}
            max={2100}
          />
        </div>
      </div>

      {/* Area + Stories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="area">Площадь (м²)</Label>
          <Input
            id="area"
            type="number"
            value={form.area}
            onChange={(e) => setForm((prev) => ({ ...prev, area: e.target.value }))}
            placeholder="150"
            min={0}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="stories">Количество этажей</Label>
          <Input
            id="stories"
            type="number"
            value={form.stories}
            onChange={(e) => setForm((prev) => ({ ...prev, stories: e.target.value }))}
            placeholder="2"
            min={1}
          />
        </div>
      </div>

      {/* Material */}
      <div className="space-y-1.5">
        <Label htmlFor="material">Материал стен</Label>
        <Input
          id="material"
          value={form.material}
          onChange={(e) => setForm((prev) => ({ ...prev, material: e.target.value }))}
          placeholder="Например: кирпич, газобетон"
        />
      </div>

      {/* Cover image */}
      <div className="space-y-1.5">
        <Label htmlFor="cover_image">Обложка (URL изображения)</Label>
        <Input
          id="cover_image"
          value={form.cover_image}
          onChange={(e) => setForm((prev) => ({ ...prev, cover_image: e.target.value }))}
          placeholder="https://..."
        />
      </div>

      {/* Slug */}
      <div className="space-y-1.5">
        <Label htmlFor="slug">Slug (URL-идентификатор)</Label>
        <Input
          id="slug"
          value={form.slug}
          onChange={(e) => handleSlugChange(e.target.value)}
          placeholder="dom-v-surgute-2024"
          className={errors.slug ? "border-red-500" : ""}
        />
        {errors.slug ? (
          <p className="text-sm text-red-500">{errors.slug}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Только строчные латинские буквы, цифры и дефисы. Генерируется автоматически из заголовка.
          </p>
        )}
      </div>

      {/* Display order */}
      <div className="space-y-1.5">
        <Label htmlFor="display_order">Порядок отображения</Label>
        <Input
          id="display_order"
          type="number"
          value={form.display_order}
          onChange={(e) => setForm((prev) => ({ ...prev, display_order: e.target.value }))}
          placeholder="0"
          min={0}
        />
      </div>

      {/* Is published */}
      <div className="flex items-center gap-3">
        <Switch
          id="is_published"
          checked={form.is_published}
          onCheckedChange={(checked) =>
            setForm((prev) => ({ ...prev, is_published: checked }))
          }
        />
        <Label htmlFor="is_published" className="cursor-pointer">
          Опубликован
        </Label>
      </div>

      {/* Save button */}
      <div className="pt-2">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Сохранение..." : isEditMode ? "Сохранить изменения" : "Создать объект"}
        </Button>
      </div>
    </div>
  );
};

export default ObjectMainForm;
