import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/services/types/authTypes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Images,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  Loader2,
  RefreshCw,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

interface PhotoItem {
  id: string;
  client_id: string;
  url: string;
  caption?: string;
  date?: string;
  category?: string;
  uploaded_by_name?: string;
  created_at?: string;
}

interface ClientPhotoGalleryProps {
  user: User;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatDateShort(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "short",
    });
  } catch {
    return dateStr;
  }
}

function getToken(): string {
  try {
    return localStorage.getItem("mongo_auth_token") ?? "";
  } catch {
    return "";
  }
}

const ClientPhotoGallery: React.FC<ClientPhotoGalleryProps> = ({ user }) => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("Все");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/client-photos/${user.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error.message);
      setPhotos(json.data ?? []);
    } catch (err: any) {
      setError(err.message ?? "Не удалось загрузить фотографии");
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  // Unique categories present in photos
  const presentCategories = [
    "Все",
    ...Array.from(
      new Set(photos.map((p) => p.category).filter(Boolean) as string[]),
    ),
  ];

  const filtered =
    activeCategory === "Все"
      ? photos
      : photos.filter((p) => p.category === activeCategory);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const prev = () =>
    setLightboxIndex((i) => (i - 1 + filtered.length) % filtered.length);
  const next = () => setLightboxIndex((i) => (i + 1) % filtered.length);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
    if (e.key === "Escape") setLightboxOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Images className="h-5 w-5 text-primary" />
                Фотогалерея проекта
              </CardTitle>
              <CardDescription className="mt-1">
                Фотоотчёт добавляется вашим менеджером по ходу выполнения работ
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchPhotos}
              disabled={loading}
              title="Обновить"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </CardHeader>

        {photos.length > 0 && !loading && (
          <CardContent>
            <div className="flex gap-3">
              <div className="rounded-lg border bg-muted/30 px-4 py-3 text-center min-w-[80px]">
                <p className="text-2xl font-bold text-primary">
                  {photos.length}
                </p>
                <p className="text-xs text-muted-foreground">Фото</p>
              </div>
              {presentCategories.length > 1 && (
                <div className="rounded-lg border bg-muted/30 px-4 py-3 text-center min-w-[80px]">
                  <p className="text-2xl font-bold text-primary">
                    {presentCategories.length - 1}
                  </p>
                  <p className="text-xs text-muted-foreground">Категорий</p>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Loading */}
      {loading && (
        <Card>
          <CardContent className="py-16 text-center">
            <Loader2 className="h-8 w-8 text-primary/50 mx-auto mb-3 animate-spin" />
            <p className="text-sm text-muted-foreground">
              Загрузка фотографий...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {!loading && error && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-destructive mb-3">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchPhotos}>
              Попробовать снова
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Gallery */}
      {!loading && !error && photos.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            {/* Category filter */}
            {presentCategories.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {presentCategories.map((cat) => (
                  <Button
                    key={cat}
                    size="sm"
                    variant={activeCategory === cat ? "default" : "outline"}
                    className="rounded-full text-xs h-7"
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground text-sm">
                Нет фото в категории «{activeCategory}»
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {filtered.map((photo, index) => (
                  <div
                    key={photo.id}
                    className="group relative aspect-square rounded-lg overflow-hidden border bg-muted cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                    onClick={() => openLightbox(index)}
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption || `Фото ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    {/* Category badge */}
                    {photo.category && (
                      <div className="absolute top-2 left-2">
                        <Badge
                          variant="secondary"
                          className="text-xs py-0 px-2 bg-black/50 text-white border-0"
                        >
                          {photo.category}
                        </Badge>
                      </div>
                    )}
                    {/* Date */}
                    {(photo.date || photo.created_at) && (
                      <div className="absolute bottom-2 right-2">
                        <span className="text-xs text-white bg-black/50 rounded px-1.5 py-0.5 flex items-center gap-1">
                          <Calendar className="h-2.5 w-2.5" />
                          {formatDateShort(photo.date || photo.created_at)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!loading && !error && photos.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <Images className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-medium text-muted-foreground mb-1">
              Фотографий пока нет
            </h3>
            <p className="text-sm text-muted-foreground">
              Ваш менеджер добавит фото по мере выполнения работ
            </p>
          </CardContent>
        </Card>
      )}

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          className="max-w-4xl w-full p-0 bg-black/95 border-0 outline-none"
          onKeyDown={handleKey}
        >
          <DialogTitle className="sr-only">Просмотр фото</DialogTitle>
          <div className="relative flex flex-col items-center justify-center min-h-[60vh] p-4">
            {/* Close */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 z-10 text-white hover:bg-white/20"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Prev */}
            {filtered.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                onClick={prev}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            )}

            {/* Image */}
            {filtered[lightboxIndex] && (
              <div className="flex flex-col items-center gap-3 w-full">
                <img
                  src={filtered[lightboxIndex].url}
                  alt={filtered[lightboxIndex].caption || ""}
                  className="max-h-[70vh] max-w-full object-contain rounded"
                />
                <div className="text-center space-y-1">
                  {filtered[lightboxIndex].caption && (
                    <p className="text-white text-sm font-medium">
                      {filtered[lightboxIndex].caption}
                    </p>
                  )}
                  <div className="flex items-center justify-center gap-3 text-xs text-white/60">
                    {filtered[lightboxIndex].category && (
                      <Badge
                        variant="outline"
                        className="text-white/80 border-white/30 text-xs"
                      >
                        {filtered[lightboxIndex].category}
                      </Badge>
                    )}
                    {(filtered[lightboxIndex].date ||
                      filtered[lightboxIndex].created_at) && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(
                          filtered[lightboxIndex].date ||
                            filtered[lightboxIndex].created_at,
                        )}
                      </span>
                    )}
                    {filtered[lightboxIndex].uploaded_by_name && (
                      <span>
                        Добавил: {filtered[lightboxIndex].uploaded_by_name}
                      </span>
                    )}
                    <span>
                      {lightboxIndex + 1} / {filtered.length}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Next */}
            {filtered.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                onClick={next}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientPhotoGallery;
