import React, { useState, useEffect } from "react";
import { User } from "@/services/types/authTypes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  TrendingUp,
  Home,
  MapPin,
  Ruler,
  Clock,
  Info,
  Loader2,
  ImageOff,
} from "lucide-react";
import { db } from "@/integrations/db/client";

interface ProjectData {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  cover_image: string | null;
  address: string | null;
  type: string | null;
  status: string | null;
  areavalue: number | null;
  bathrooms: number | null;
  bedrooms: number | null;
  dimensions: string | null;
  hasgarage: boolean | null;
  hasterrace: boolean | null;
  material: string | null;
  pricevalue: number | null;
  stories: number | null;
  style: string | null;
  tags: string[] | null;
  created_at: string | null;
  updated_at: string | null;
  currentStage: string | null;
  startDate: string | null;
  endDate: string | null;
  progress: number;
}

interface ClientProjectViewProps {
  user: User;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: "Черновик", color: "bg-gray-100 text-gray-700 border-gray-200" },
  pending: { label: "На рассмотрении", color: "bg-amber-100 text-amber-700 border-amber-200" },
  in_progress: { label: "В процессе", color: "bg-blue-100 text-blue-700 border-blue-200" },
  published: { label: "Завершён", color: "bg-green-100 text-green-700 border-green-200" },
  rejected: { label: "Отклонён", color: "bg-red-100 text-red-700 border-red-200" },
};

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
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

const ClientProjectView: React.FC<ClientProjectViewProps> = ({ user }) => {
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProject();
  }, [user]);

  const loadProject = async () => {
    try {
      setLoading(true);

      const profile = (user as any).projectStats || (user as any).folders;
      const userResponse = await db
        .from("user_profiles")
        .select("project_stats, schedule")
        .eq("id", user.id)
        .maybeSingle();

      const stats = userResponse.data?.project_stats;
      const schedule = userResponse.data?.schedule;

      const { data, error } = await db
        .from("projects")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const p = data[0];
        const progress = stats?.inProgress
          ? Math.round(
              ((stats.completed || 0) / (stats.total || 1)) * 100,
            )
          : p.areavalue
            ? Math.min(100, Math.round((p.areavalue || 0) / 150 * 100))
            : 0;

        setProject({
          ...p,
          currentStage: schedule?.[0]?.title || stats?.currentStage || null,
          startDate: stats?.startDate || p.created_at || null,
          endDate: stats?.estimatedEndDate || null,
          progress,
        });
      } else {
        const managerResponse = await db
          .from("user_profiles")
          .select("work_tasks, project_stats")
          .eq("id", user.id)
          .maybeSingle();

        const managerData = managerResponse.data;
        if (managerData) {
          const existingProjects = await db
            .from("project_form_links")
            .select("project_id")
            .limit(1);

          if (existingProjects.data && existingProjects.data.length > 0) {
            const projResp = await db
              .from("projects")
              .select("*")
              .eq("id", existingProjects.data[0].project_id)
              .maybeSingle();

            if (projResp.data) {
              const p = projResp.data;
              setProject({
                ...p,
                currentStage: null,
                startDate: p.created_at || null,
                endDate: null,
                progress: 0,
              });
            }
          }
        }
      }
    } catch (err) {
      console.error("Error loading project:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center py-16 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Загрузка проекта…</p>
      </div>
    );
  }

  if (!project) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Home className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-medium text-muted-foreground mb-1">
            Проект пока не назначен
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Когда менеджер назначит вам проект, здесь появится информация о
            нём: описание, сроки, фото и технические решения.
          </p>
        </CardContent>
      </Card>
    );
  }

  const statusInfo = STATUS_CONFIG[project.status || ""] || {
    label: project.status || "—",
    color: "bg-muted text-muted-foreground border-border",
  };

  return (
    <div className="space-y-6">
      {/* Cover image */}
      {project.cover_image ? (
        <div className="relative w-full h-48 md:h-72 rounded-xl overflow-hidden">
          <img
            src={project.cover_image}
            alt={project.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
              {project.title}
            </h2>
            {project.address && (
              <p className="text-white/80 text-sm mt-1 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {project.address}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full h-48 md:h-72 rounded-xl bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center">
          <Home className="h-16 w-16 text-primary/30" />
        </div>
      )}

      {/* Status + progress card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Home className="h-5 w-5 text-primary" />
              {project.title}
            </CardTitle>
            <Badge variant="outline" className={statusInfo.color}>
              {statusInfo.label}
            </Badge>
          </div>
          {project.type && (
            <CardDescription>{project.type}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Готовность</span>
              <span className="font-semibold">{project.progress}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(100, Math.max(0, project.progress))}%` }}
              />
            </div>
          </div>

          {/* Key dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Начало</p>
              <p className="font-medium text-sm flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                {formatDate(project.startDate)}
              </p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Плановое окончание</p>
              <p className="font-medium text-sm flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-primary" />
                {formatDate(project.endDate)}
              </p>
            </div>
          </div>

          {project.currentStage && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 flex gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-blue-800">Текущий этап</p>
                <p className="text-sm text-blue-700">{project.currentStage}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Technical specs */}
      {(project.areavalue || project.bedrooms || project.bathrooms || project.stories || project.material || project.style || project.hasgarage || project.hasterrace) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Ruler className="h-5 w-5 text-primary" />
              Технические характеристики
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {project.areavalue && (
                <div className="rounded-lg border bg-muted/30 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Площадь</p>
                  <p className="font-semibold">{project.areavalue} м²</p>
                </div>
              )}
              {project.pricevalue != null && (
                <div className="rounded-lg border bg-muted/30 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Стоимость</p>
                  <p className="font-semibold">{project.pricevalue >= 1000000
                    ? `${(project.pricevalue / 1000000).toFixed(1)} млн ₽`
                    : `${project.pricevalue.toLocaleString('ru-RU')} ₽`}</p>
                </div>
              )}
              {project.bedrooms != null && (
                <div className="rounded-lg border bg-muted/30 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Спальни</p>
                  <p className="font-semibold">{project.bedrooms}</p>
                </div>
              )}
              {project.bathrooms != null && (
                <div className="rounded-lg border bg-muted/30 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Санузлы</p>
                  <p className="font-semibold">{project.bathrooms}</p>
                </div>
              )}
              {project.stories != null && (
                <div className="rounded-lg border bg-muted/30 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Этажи</p>
                  <p className="font-semibold">{project.stories}</p>
                </div>
              )}
              {project.material && (
                <div className="rounded-lg border bg-muted/30 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Материал</p>
                  <p className="font-semibold text-sm">{project.material}</p>
                </div>
              )}
              {project.style && (
                <div className="rounded-lg border bg-muted/30 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Стиль</p>
                  <p className="font-semibold text-sm">{project.style}</p>
                </div>
              )}
              {project.hasgarage && (
                <div className="rounded-lg border bg-green-50 text-center p-3">
                  <p className="text-xs text-green-700">Гараж</p>
                  <p className="font-semibold text-green-700">Есть</p>
                </div>
              )}
              {project.hasterrace && (
                <div className="rounded-lg border bg-green-50 text-center p-3">
                  <p className="text-xs text-green-700">Терраса</p>
                  <p className="font-semibold text-green-700">Есть</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Description */}
      {(project.description || project.content) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Info className="h-5 w-5 text-primary" />
              Описание проекта
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm max-w-none text-muted-foreground"
              dangerouslySetInnerHTML={{
                __html: project.content || project.description || "",
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Tags */}
      {project.tags && project.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag, i) => (
            <Badge key={i} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientProjectView;