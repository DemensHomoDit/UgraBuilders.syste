import { useState, useEffect } from "react";
import { toast } from "sonner";
import { db } from "@/integrations/db/client";
import { OurObjectReview } from "@/types/ourObjects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface ObjectReviewFormProps {
  objectId: string;
}

type ReviewFormData = {
  author_name: string;
  author_title: string;
  author_image: string;
  rating: string;
  title: string;
  content: string;
  is_published: boolean;
};

const EMPTY_FORM: ReviewFormData = {
  author_name: "",
  author_title: "",
  author_image: "",
  rating: "",
  title: "",
  content: "",
  is_published: false,
};

interface FormErrors {
  author_name?: string;
  rating?: string;
}

const ObjectReviewForm = ({ objectId }: ObjectReviewFormProps) => {
  const [form, setForm] = useState<ReviewFormData>(EMPTY_FORM);
  const [existingId, setExistingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await db
          .from("our_object_reviews")
          .select("*")
          .eq("object_id", objectId)
          .maybeSingle();

        if (error) {
          toast.error("Не удалось загрузить отзыв: " + error.message);
          return;
        }

        if (data) {
          const review = data as OurObjectReview;
          setExistingId(review.id);
          setForm({
            author_name: review.author_name ?? "",
            author_title: review.author_title ?? "",
            author_image: review.author_image ?? "",
            rating: review.rating != null ? String(review.rating) : "",
            title: review.title ?? "",
            content: review.content ?? "",
            is_published: review.is_published ?? false,
          });
        }
      } catch {
        toast.error("Ошибка загрузки отзыва");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [objectId]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.author_name.trim()) {
      newErrors.author_name = "Имя автора обязательно";
    }

    if (form.rating) {
      const ratingNum = Number(form.rating);
      if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        newErrors.rating = "Рейтинг должен быть целым числом от 1 до 5";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      const payload: Partial<OurObjectReview> & { object_id: string } = {
        object_id: objectId,
        author_name: form.author_name.trim(),
        author_title: form.author_title.trim() || undefined,
        author_image: form.author_image.trim() || undefined,
        rating: form.rating ? Number(form.rating) : undefined,
        title: form.title.trim() || undefined,
        content: form.content.trim() || undefined,
        is_published: form.is_published,
      };

      if (existingId) {
        payload.id = existingId;
      }

      const { data, error } = await db
        .from("our_object_reviews")
        .upsert(payload)
        .select("id")
        .single();

      if (error) {
        toast.error("Не удалось сохранить отзыв: " + error.message);
        return;
      }

      if (!existingId && data) {
        setExistingId((data as any).id);
      }

      toast.success(existingId ? "Отзыв обновлён" : "Отзыв создан");
    } catch {
      toast.error("Ошибка при сохранении отзыва");
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
      <h3 className="text-lg font-medium">
        {existingId ? "Редактировать отзыв" : "Создать отзыв"}
      </h3>

      <div className="space-y-1.5">
        <Label htmlFor="author_name">
          Имя автора <span className="text-red-500">*</span>
        </Label>
        <Input
          id="author_name"
          value={form.author_name}
          onChange={(e) => {
            setForm((prev) => ({ ...prev, author_name: e.target.value }));
            if (errors.author_name) setErrors((prev) => ({ ...prev, author_name: undefined }));
          }}
          placeholder="Иван Иванов"
          className={errors.author_name ? "border-red-500" : ""}
        />
        {errors.author_name && <p className="text-sm text-red-500">{errors.author_name}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="author_title">Должность / описание автора</Label>
        <Input
          id="author_title"
          value={form.author_title}
          onChange={(e) => setForm((prev) => ({ ...prev, author_title: e.target.value }))}
          placeholder="Директор компании"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="author_image">Фото автора (URL)</Label>
        <Input
          id="author_image"
          value={form.author_image}
          onChange={(e) => setForm((prev) => ({ ...prev, author_image: e.target.value }))}
          placeholder="https://..."
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="rating">Рейтинг (1–5)</Label>
        <select
          id="rating"
          value={form.rating}
          onChange={(e) => {
            setForm((prev) => ({ ...prev, rating: e.target.value }));
            if (errors.rating) setErrors((prev) => ({ ...prev, rating: undefined }));
          }}
          className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${errors.rating ? "border-red-500" : ""}`}
        >
          <option value="">— не указан —</option>
          <option value="1">1 — Плохо</option>
          <option value="2">2 — Удовлетворительно</option>
          <option value="3">3 — Хорошо</option>
          <option value="4">4 — Очень хорошо</option>
          <option value="5">5 — Отлично</option>
        </select>
        {errors.rating && <p className="text-sm text-red-500">{errors.rating}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="review_title">Заголовок отзыва</Label>
        <Input
          id="review_title"
          value={form.title}
          onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          placeholder="Отличная работа!"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="content">Текст отзыва</Label>
        <Textarea
          id="content"
          value={form.content}
          onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
          placeholder="Подробный отзыв клиента..."
          rows={5}
        />
      </div>

      <div className="flex items-center gap-3">
        <Switch
          id="review_is_published"
          checked={form.is_published}
          onCheckedChange={(checked) => setForm((prev) => ({ ...prev, is_published: checked }))}
        />
        <Label htmlFor="review_is_published" className="cursor-pointer">Опубликован</Label>
      </div>

      <div className="pt-2">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Сохранение..." : existingId ? "Сохранить изменения" : "Создать отзыв"}
        </Button>
      </div>
    </div>
  );
};

export default ObjectReviewForm;
