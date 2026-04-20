import React from "react";
import { User } from "@/services/types/authTypes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Calendar,
  Info,
} from "lucide-react";

interface ProjectPhase {
  id: string;
  title: string;
  status: "completed" | "in_progress" | "planned" | "delayed";
  completedAt?: string;
  plannedDate?: string;
  notes?: string;
}

interface ProjectProgressData {
  percent: number;
  currentPhase: string;
  startDate?: string;
  estimatedEndDate?: string;
  notes?: string;
  phases?: ProjectPhase[];
  updatedAt?: string;
}

interface ClientProgressProps {
  user: User;
}

const PHASE_STATUS_CONFIG = {
  completed: {
    label: "Завершён",
    icon: CheckCircle2,
    color: "text-green-600",
    badgeVariant: "default" as const,
    badgeClass: "bg-green-100 text-green-700 border-green-200",
  },
  in_progress: {
    label: "В работе",
    icon: TrendingUp,
    color: "text-blue-600",
    badgeVariant: "default" as const,
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
  },
  planned: {
    label: "Запланирован",
    icon: Clock,
    color: "text-gray-500",
    badgeVariant: "outline" as const,
    badgeClass: "bg-gray-50 text-gray-600 border-gray-200",
  },
  delayed: {
    label: "Задержка",
    icon: AlertCircle,
    color: "text-red-500",
    badgeVariant: "destructive" as const,
    badgeClass: "bg-red-100 text-red-700 border-red-200",
  },
};

function formatDate(dateStr?: string): string {
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

function getProgressFromStats(user: User): ProjectProgressData {
  const stats = user.projectStats;
  if (!stats) {
    return {
      percent: 0,
      currentPhase: "Не начато",
      notes: "Информация о проекте ещё не добавлена менеджером.",
    };
  }

  const total = stats.total ?? 0;
  const completed = stats.completed ?? 0;
  const percent =
    total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    percent,
    currentPhase:
      percent === 0
        ? "Не начато"
        : percent === 100
        ? "Завершён"
        : "В процессе",
    startDate: stats.startDate,
    estimatedEndDate: stats.estimatedEndDate,
  };
}

const ClientProgress: React.FC<ClientProgressProps> = ({ user }) => {
  const progressData = getProgressFromStats(user);

  const phases: ProjectPhase[] = progressData.phases ?? [];

  const percent = Math.min(100, Math.max(0, progressData.percent));

  return (
    <div className="space-y-6">
      {/* Общий прогресс */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Прогресс проекта
          </CardTitle>
          <CardDescription>
            Актуальная информация обновляется вашим менеджером
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Процент выполнения */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">
                Общая готовность
              </span>
              <span className="text-2xl font-bold text-primary">
                {percent}%
              </span>
            </div>
            <Progress value={percent} className="h-3" />
          </div>

          <Separator />

          {/* Ключевые показатели */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg border bg-muted/30 p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Текущий этап</p>
              <p className="font-semibold text-sm leading-tight">
                {progressData.currentPhase || "—"}
              </p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Дата начала</p>
              <p className="font-semibold text-sm">
                {formatDate(progressData.startDate)}
              </p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">
                Плановое окончание
              </p>
              <p className="font-semibold text-sm">
                {formatDate(progressData.estimatedEndDate)}
              </p>
            </div>
          </div>

          {/* Заметки менеджера */}
          {progressData.notes && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 flex gap-3">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800 mb-0.5">
                  Комментарий менеджера
                </p>
                <p className="text-sm text-blue-700">{progressData.notes}</p>
              </div>
            </div>
          )}

          {/* Время обновления */}
          {progressData.updatedAt && (
            <p className="text-xs text-muted-foreground text-right flex items-center justify-end gap-1">
              <Calendar className="h-3 w-3" />
              Обновлено: {formatDate(progressData.updatedAt)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Этапы проекта */}
      {phases.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Этапы выполнения</CardTitle>
            <CardDescription>
              Детальный статус каждого этапа вашего проекта
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {phases.map((phase, index) => {
                const config = PHASE_STATUS_CONFIG[phase.status];
                const Icon = config.icon;
                return (
                  <div
                    key={phase.id}
                    className="flex items-start gap-4 p-3 rounded-lg border bg-card"
                  >
                    <div
                      className={`mt-0.5 flex-shrink-0 ${config.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {index + 1}. {phase.title}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${config.badgeClass}`}
                        >
                          {config.label}
                        </Badge>
                      </div>
                      {(phase.completedAt || phase.plannedDate) && (
                        <p className="text-xs text-muted-foreground">
                          {phase.status === "completed"
                            ? `Завершён: ${formatDate(phase.completedAt)}`
                            : `Планируется: ${formatDate(phase.plannedDate)}`}
                        </p>
                      )}
                      {phase.notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          {phase.notes}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-medium text-muted-foreground mb-1">
              Этапы ещё не добавлены
            </h3>
            <p className="text-sm text-muted-foreground">
              Ваш менеджер добавит этапы проекта в ближайшее время
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientProgress;
