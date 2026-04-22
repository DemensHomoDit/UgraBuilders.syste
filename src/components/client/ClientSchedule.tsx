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
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  CircleDot,
  CalendarDays,
} from "lucide-react";

interface ScheduleItem {
  id: string;
  title: string;
  description?: string;
  date: string;
  endDate?: string;
  status: "completed" | "in_progress" | "planned" | "delayed";
}

interface ClientScheduleProps {
  user: User;
}

const STATUS_CONFIG = {
  completed: {
    label: "Выполнено",
    icon: CheckCircle2,
    iconClass: "text-green-500",
    badgeClass: "bg-green-100 text-green-700 border-green-200",
    lineClass: "bg-green-400",
  },
  in_progress: {
    label: "В работе",
    icon: CircleDot,
    iconClass: "text-blue-500",
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
    lineClass: "bg-blue-400",
  },
  planned: {
    label: "Запланировано",
    icon: Clock,
    iconClass: "text-gray-400",
    badgeClass: "bg-gray-100 text-gray-600 border-gray-200",
    lineClass: "bg-gray-300",
  },
  delayed: {
    label: "Задержка",
    icon: AlertCircle,
    iconClass: "text-red-500",
    badgeClass: "bg-red-100 text-red-700 border-red-200",
    lineClass: "bg-red-400",
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

function formatDateShort(dateStr?: string): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "short",
    });
  } catch {
    return dateStr;
  }
}

/* Достаём schedule из projectStats или возвращаем пустой массив */
function getSchedule(user: User): ScheduleItem[] {
  const raw = user.schedule;
  if (Array.isArray(raw) && raw.length > 0) return raw as ScheduleItem[];
  return [];
}

const ClientSchedule: React.FC<ClientScheduleProps> = ({ user }) => {
  const items = getSchedule(user);

  const counts = {
    completed: items.filter((i) => i.status === "completed").length,
    in_progress: items.filter((i) => i.status === "in_progress").length,
    planned: items.filter((i) => i.status === "planned").length,
    delayed: items.filter((i) => i.status === "delayed").length,
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarDays className="h-5 w-5 text-primary" />
            График выполнения работ
          </CardTitle>
          <CardDescription>
            Расписание составляется и обновляется вашим менеджером
          </CardDescription>
        </CardHeader>

        {items.length > 0 && (
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(
                [
                  "completed",
                  "in_progress",
                  "planned",
                  "delayed",
                ] as const
              ).map((key) => {
                const cfg = STATUS_CONFIG[key];
                const Icon = cfg.icon;
                return (
                  <div
                    key={key}
                    className="rounded-lg border bg-muted/30 p-3 text-center"
                  >
                    <Icon
                      className={`h-5 w-5 mx-auto mb-1 ${cfg.iconClass}`}
                    />
                    <p className="text-xl font-bold">{counts[key]}</p>
                    <p className="text-xs text-muted-foreground">
                      {cfg.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Timeline */}
      {items.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Хронология</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* вертикальная линия */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

              <div className="space-y-6">
                {items.map((item) => {
                  const cfg = STATUS_CONFIG[item.status];
                  const Icon = cfg.icon;

                  return (
                    <div key={item.id} className="flex gap-4 relative">
                      {/* иконка-маркер */}
                      <div
                        className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full border-2 border-background flex items-center justify-center bg-white shadow-sm ${cfg.iconClass}`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>

                      {/* контент */}
                      <div className="flex-1 pb-2">
                        <div className="rounded-lg border bg-card p-4 shadow-sm">
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                            <h4 className="font-medium text-sm leading-tight">
                              {item.title}
                            </h4>
                            <Badge
                              variant="outline"
                              className={`text-xs flex-shrink-0 ${cfg.badgeClass}`}
                            >
                              {cfg.label}
                            </Badge>
                          </div>

                          {item.description && (
                            <p className="text-sm text-muted-foreground mb-3">
                              {item.description}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {item.endDate
                                ? `${formatDateShort(item.date)} — ${formatDate(item.endDate)}`
                                : formatDate(item.date)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-medium text-muted-foreground mb-1">
              График ещё не составлен
            </h3>
            <p className="text-sm text-muted-foreground">
              Ваш менеджер добавит расписание работ в ближайшее время
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientSchedule;
