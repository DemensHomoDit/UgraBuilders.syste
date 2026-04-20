import { useState, useEffect, useCallback } from "react";
import { DashboardStats, Task } from "@/types/analytics";
import { visitsService, tasksService } from "@/services/analytics";
import { db } from "@/integrations/db/client";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export function useDashboardData() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    visits: {
      total: 0,
      today: 0,
      yesterday: 0,
      changePercent: 0,
    },
    projects: {
      total: 0,
      published: 0,
      byCategory: [],
    },
    tasks: {
      total: 0,
      completed: 0,
      pendingByPriority: {},
      completionRate: 0,
    },
  });

  const [visitsData, setVisitsData] = useState<
    { name: string; Посещения: number }[]
  >([]);
  const [tasksData, setTasksData] = useState<Task[]>([]);
  const [attentionData, setAttentionData] = useState<{
    forms: any[];
    overdueTasks: any[];
  }>({ forms: [], overdueTasks: [] });

  const loadVisitStats = useCallback(async () => {
    try {
      const visitSummary = await visitsService.getVisitsSummary();
      const visitsChartData = await visitsService.getVisitStats(7);

      const changePercent =
        visitSummary.yesterday > 0
          ? ((visitSummary.today - visitSummary.yesterday) /
              visitSummary.yesterday) *
            100
          : 0;

      const chartData = visitsChartData.dates.map((date, index) => ({
        name: date,
        Посещения: visitsChartData.counts[index],
      }));

      setVisitsData(chartData);
      setStats((prev) => ({
        ...prev,
        visits: {
          total: visitSummary.total,
          today: visitSummary.today,
          yesterday: visitSummary.yesterday,
          changePercent: parseFloat(changePercent.toFixed(1)),
        },
      }));
    } catch (error) {
      // silently ignore
    }
  }, []);

  const loadTasksStats = useCallback(async () => {
    try {
      const tasksSummary = await tasksService.getTasksSummary();
      const tasks = await tasksService.getTasks(5);

      const completionRate =
        tasksSummary.total > 0
          ? (tasksSummary.completed / tasksSummary.total) * 100
          : 0;

      setTasksData(tasks);
      setStats((prev) => ({
        ...prev,
        tasks: {
          total: tasksSummary.total,
          completed: tasksSummary.completed,
          pendingByPriority: tasksSummary.byPriority,
          completionRate: parseFloat(completionRate.toFixed(1)),
        },
      }));
    } catch (error) {
      // silently ignore
    }
  }, []);

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await db.auth.getUser();

      await visitsService.recordVisit("/account", user?.id);

      const { data: sessionData } = await db.auth.getSession();
      const token = sessionData?.session?.access_token;

      const summaryPromise = fetch(`${API_BASE}/api/admin/dashboard/summary`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).then(async (r) => {
        const body = await r.json();
        if (!r.ok || !body?.success) {
          throw new Error(body?.error || "Не удалось загрузить сводку");
        }
        return body.data;
      });

      const chartPromises = Promise.all([loadVisitStats(), loadTasksStats()]);

      const [summary] = await Promise.all([summaryPromise, chartPromises]);

      const visitsChangePercent =
        summary.visits.yesterday > 0
          ? ((summary.visits.today - summary.visits.yesterday) /
              summary.visits.yesterday) *
            100
          : 0;

      const completionRate =
        summary.tasks.total > 0
          ? (summary.tasks.completed / summary.tasks.total) * 100
          : 0;

      setStats((prev) => ({
        ...prev,
        visits: {
          total: summary.visits.total || 0,
          today: summary.visits.today || 0,
          yesterday: summary.visits.yesterday || 0,
          last7d: summary.visits.last7d || 0,
          changePercent: parseFloat(visitsChangePercent.toFixed(1)),
        },
        projects: {
          total: summary.projects.total || 0,
          published: summary.projects.published || 0,
          drafts: summary.projects.drafts || 0,
          pendingModeration: summary.projects.pendingModeration || 0,
          byCategory: summary.projects.byCategory || [],
        },
        tasks: {
          total: summary.tasks.total || 0,
          completed: summary.tasks.completed || 0,
          overdue: summary.tasks.overdue || 0,
          pendingByPriority: prev.tasks.pendingByPriority,
          completionRate: parseFloat(completionRate.toFixed(1)),
        },
        forms: {
          total: summary.forms?.total || 0,
          new: summary.forms?.new || 0,
          inProgress: summary.forms?.inProgress || 0,
          today: summary.forms?.today || 0,
        },
        users: {
          total: summary.users?.total || 0,
          new30d: summary.users?.new30d || 0,
        },
      }));

      setAttentionData({
        forms: summary.attention?.forms || [],
        overdueTasks: summary.attention?.overdueTasks || [],
      });
    } catch (error) {
      toast.error("Ошибка при загрузке данных");
    } finally {
      setIsLoading(false);
    }
  }, [loadVisitStats, loadTasksStats]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  return {
    isLoading,
    stats,
    visitsData,
    tasksData,
    attentionData,
    refreshData: loadAllData,
  };
}

export default useDashboardData;
