import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { User } from "@/hooks/useAuth";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckSquare,
  ClipboardList,
  Clock,
  Home,
  RefreshCw,
  Users,
} from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { db } from "@/integrations/db/client";

interface AdminDashboardProps {
  user: User;
}

interface ProjectOrder {
  id: string;
  user_email?: string;
  user_phone?: string;
  status?: string;
  created_at?: string;
}

function formatOrderDate(dateStr?: string): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user: _user }) => {
  const { isLoading, stats, visitsData, attentionData, refreshData } =
    useDashboardData();

  const [orders, setOrders] = useState<ProjectOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    setOrdersLoading(true);
    db
      .from("project_orders")
      .select("id,user_email,user_phone,status,created_at")
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => {
        setOrders((data as ProjectOrder[]) ?? []);
        setOrdersLoading(false);
      });
  }, []);

  const publishedCount = stats.projects.published ?? 0;
  const draftsCount =
    typeof stats.projects.drafts === "number"
      ? stats.projects.drafts
      : (stats.projects.total ?? 0) - publishedCount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Дашборд</h2>
          <p className="text-sm text-muted-foreground">
            Оперативная сводка по бизнес-метрикам и задачам
          </p>
        </div>
        <Button onClick={refreshData} disabled={isLoading} type="button">
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Обновить
        </Button>
      </div>

      {isLoading && <Progress value={72} className="h-1" />}

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Новые заявки</p>
                <p className="text-2xl font-bold mt-1">{stats.forms?.new ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Сегодня: {stats.forms?.today ?? 0}
                </p>
              </div>
              <div className="bg-orange-100 p-2 rounded-md">
                <ClipboardList className="h-5 w-5 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Черновики проектов</p>
                <p className="text-2xl font-bold mt-1">{draftsCount}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Опубликовано: {publishedCount}
                </p>
              </div>
              <div className="bg-blue-100 p-2 rounded-md">
                <Home className="h-5 w-5 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Просроченные задачи</p>
                <p className="text-2xl font-bold mt-1">{stats.tasks.overdue ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Выполнено: {stats.tasks.completed}/{stats.tasks.total}
                </p>
              </div>
              <div className="bg-red-100 p-2 rounded-md">
                <AlertTriangle className="h-5 w-5 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Посещения сегодня</p>
                <p className="text-2xl font-bold mt-1">{stats.visits.today}</p>
                <div className="mt-1 flex items-center gap-2">
                  {stats.visits.changePercent >= 0 ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-0">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      {Math.abs(stats.visits.changePercent).toFixed(1)}%
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-0">
                      <ArrowDown className="h-3 w-3 mr-1" />
                      {Math.abs(stats.visits.changePercent).toFixed(1)}%
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">к вчера</span>
                </div>
              </div>
              <div className="bg-violet-100 p-2 rounded-md">
                <Users className="h-5 w-5 text-violet-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Требует внимания</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Новые заявки</p>
                <Link to="/account/forms" className="text-xs text-primary hover:underline">
                  Открыть раздел
                </Link>
              </div>
              {attentionData.forms.length === 0 ? (
                <p className="text-sm text-muted-foreground">Новых заявок нет</p>
              ) : (
                <div className="space-y-2">
                  {attentionData.forms.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-md border p-2"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.topic || item.data?.name || "Без темы"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.created_at).toLocaleString("ru-RU")}
                        </p>
                      </div>
                      <Badge>Новая</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Просроченные задачи</p>
                <span className="text-xs text-muted-foreground">
                  {(stats.tasks.overdue ?? 0) > 0 ? `${stats.tasks.overdue} шт.` : "Нет"}
                </span>
              </div>
              {attentionData.overdueTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">Просроченных задач нет</p>
              ) : (
                <div className="space-y-2">
                  {attentionData.overdueTasks.map((task: any) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between rounded-md border p-2"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Дедлайн: {task.due_date ? new Date(task.due_date).toLocaleDateString("ru-RU") : "-"}
                        </p>
                      </div>
                      <Badge variant="destructive">Просрочено</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Быстрые действия</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/account/projects" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Home className="h-4 w-4 mr-2" /> Добавить проект
              </Button>
            </Link>
            <Link to="/account/forms" className="block">
              <Button variant="outline" className="w-full justify-start">
                <ClipboardList className="h-4 w-4 mr-2" /> Обработать заявки
              </Button>
            </Link>
            <Link to="/account/" className="block">
              <Button variant="outline" className="w-full justify-start">
                <CheckSquare className="h-4 w-4 mr-2" /> Проверить задачи
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Посещения за 7 дней</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={visitsData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="Посещения" stroke="#2563eb" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Последние заявки по проектам</CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-11 rounded-md bg-muted animate-pulse" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-sm text-muted-foreground py-8 text-center">Заявок пока нет</div>
            ) : (
              <div className="space-y-2">
                {orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between border rounded-md p-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">#{order.id.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {order.user_email ?? order.user_phone ?? "-"}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">{formatOrderDate(order.created_at)}</div>
                      <div className="text-xs flex items-center justify-end gap-1 mt-1">
                        <Clock className="h-3 w-3" /> {order.status || "new"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
