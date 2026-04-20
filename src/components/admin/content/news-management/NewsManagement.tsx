import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import newsService from "@/services/news";
import { NewsItem } from "@/services/news/types";
import NewsFormDialog from "./NewsFormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Newspaper,
  Loader2,
} from "lucide-react";
import { db } from "@/integrations/db/client";
import { useAuth } from "@/hooks/useAuth";

const NewsManagement: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [newsData, catData] = await Promise.all([
        newsService.getNews(),
        db
          .from("categories")
          .select("id, name")
          .eq("type", "news")
          .order("name"),
      ]);
      setNews(newsData);
      setCategories((catData as any) || []);
    } catch (error: any) {
      toast({
        title: "Ошибка загрузки",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewClick = () => {
    setSelectedNews(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (item: NewsItem) => {
    setSelectedNews(item);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = async (item: NewsItem) => {
    if (!confirm(`Удалить новость "${item.title}"?`)) return;
    try {
      await newsService.deleteNews(item.id);
      toast({ title: "Новость удалена" });
      loadData();
    } catch (error: any) {
      toast({
        title: "Ошибка удаления",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleTogglePublish = async (item: NewsItem) => {
    try {
      await newsService.updateNews(item.id, {
        is_published: !item.is_published,
      });
      toast({
        title: item.is_published ? "Снято с публикации" : "Опубликовано",
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDialogClose = () => {
    setSelectedNews(null);
    setIsDialogOpen(false);
    loadData();
  };

  const filteredNews = news.filter(
    (n) =>
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.summary?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getCategoryName = (categoryId?: string) =>
    categories.find((c) => c.id === categoryId)?.name ?? "";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Новости</h2>
          <p className="text-muted-foreground">
            Управление новостями и анонсами
          </p>
        </div>
        <Button onClick={handleNewClick}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить новость
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск новостей..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredNews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Newspaper className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">
              {searchTerm ? "Ничего не найдено" : "Новостей пока нет"}
            </p>
            <Button variant="outline" className="mt-4" onClick={handleNewClick}>
              <Plus className="h-4 w-4 mr-2" />
              Создать первую новость
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNews.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="flex items-center gap-4 p-4">
                {item.cover_image ? (
                  <img
                    src={item.cover_image}
                    alt={item.title}
                    className="w-20 h-14 object-cover rounded-md flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-14 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                    <Newspaper className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-sm truncate">
                      {item.title}
                    </h3>
                    <Badge
                      variant={
                        item.is_published ? "default" : "secondary"
                      }
                      className="text-xs flex-shrink-0"
                    >
                      {item.is_published ? "Опубликовано" : "Черновик"}
                    </Badge>
                    {item.category_id && (
                      <Badge variant="outline" className="text-xs flex-shrink-0">
                        {getCategoryName(item.category_id)}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.summary || "Без описания"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString("ru-RU")
                      : ""}
                  </p>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="flex-shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditClick(item)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Редактировать
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleTogglePublish(item)}
                    >
                      {item.is_published ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Снять с публикации
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Опубликовать
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteClick(item)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Удалить
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>
      )}

      <NewsFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedNews={selectedNews}
        onClose={handleDialogClose}
        categories={categories}
        userId={user?.id || ""}
      />
    </div>
  );
};

export default NewsManagement;
