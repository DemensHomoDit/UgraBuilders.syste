import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import newsService from "@/services/news";
import { NewsItem } from "@/services/news/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, X } from "lucide-react";
import ImageUpload from "@/components/admin/content/image-upload/ImageUpload";
import RichTextEditor from "@/components/ui/rich-text-editor";
import TagsManager from "@/components/admin/content/project-form/TagsManager";

interface NewsFormProps {
  newsItem?: NewsItem | null;
  onSave: () => void;
  onCancel: () => void;
  categories: { id: string; name: string }[];
  userId: string;
}

const NewsForm: React.FC<NewsFormProps> = ({
  newsItem,
  onSave,
  onCancel,
  categories,
  userId,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [tags, setTags] = useState<string[]>(newsItem?.tags || []);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: newsItem?.title || "",
    summary: newsItem?.summary || "",
    content: newsItem?.content || "",
    cover_image: newsItem?.cover_image || "",
    slug: newsItem?.slug || "",
    category_id: newsItem?.category_id || "",
    is_published: newsItem?.is_published || false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTag = (tag: string) => {
    if (!tag.trim() || tags.includes(tag)) return;
    const newTags = [...tags, tag];
    setTags(newTags);
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const validate = (): boolean => {
    if (!formData.title.trim()) {
      toast({ title: "Укажите заголовок", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const slug =
        formData.slug || newsService.generateSlug(formData.title);

      const data = {
        title: formData.title,
        summary: formData.summary,
        content: formData.content,
        cover_image: formData.cover_image,
        slug,
        tags,
        category_id: formData.category_id || null,
        is_published: formData.is_published,
        created_by: userId,
      };

      if (newsItem?.id) {
        await newsService.updateNews(newsItem.id, data);
        toast({ title: "Новость обновлена" });
      } else {
        await newsService.createNews(data as any);
        toast({ title: "Новость создана" });
      }
      onSave();
    } catch (error: any) {
      toast({
        title: "Ошибка сохранения",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">
              Заголовок <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Заголовок новости"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="slug">URL-слаг (автогенерация)</Label>
            <Input
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="автогенерация-из-заголовка"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="category_id">Категория</Label>
            <Select
              value={formData.category_id || ""}
              onValueChange={(v) => handleSelectChange("category_id", v)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="summary">Краткое описание</Label>
            <Input
              id="summary"
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              placeholder="Краткое описание для анонса"
              className="mt-1"
            />
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Теги</h4>
            <TagsManager
              tags={tags}
              onAddTag={handleAddTag}
              onRemoveTag={handleRemoveTag}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_published"
              checked={formData.is_published}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, is_published: checked }))
              }
            />
            <Label htmlFor="is_published" className="cursor-pointer">
              Опубликовать
            </Label>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="cover_image">Обложка</Label>
            <Card className="mt-1">
              <CardContent className="p-4">
                <ImageUpload
                  currentImage={formData.cover_image}
                  onImageUploaded={(url) =>
                    setFormData((prev) => ({ ...prev, cover_image: url }))
                  }
                  bucketName="news-images"
                  objectPath={`covers/${Date.now()}`}
                  className="w-full aspect-[16/9]"
                  note="Рекомендуемый размер: 1200x675"
                />
              </CardContent>
            </Card>
          </div>

          <div>
            <Label htmlFor="content">Содержание</Label>
            <div className="mt-1">
              <RichTextEditor
                content={formData.content}
                onChange={(html) =>
                  setFormData((prev) => ({ ...prev, content: html }))
                }
                placeholder="Текст новости..."
                minHeight="300px"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Отмена
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Сохранение...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {newsItem ? "Обновить" : "Создать"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default NewsForm;
