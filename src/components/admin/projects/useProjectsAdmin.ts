
import { useState, useEffect, useCallback } from "react";
import { db } from "@/integrations/db/client";
import { toast } from "sonner";

export function useProjectsAdmin() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [projectStats, setProjectStats] = useState({
    totalProjects: 0,
    publishedProjects: 0,
    conversionRate: 0,
    monthlyChange: {
      total: 0,
      published: 0,
      conversion: 0
    }
  });
  
  const fetchProjectStats = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { count: totalCount, error: totalError } = await db
        .from('projects')
        .select('*', { count: 'exact', head: true });
      
      if (totalError) throw totalError;
      
      const { count: publishedCount, error: publishedError } = await db
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);
      
      if (publishedError) throw publishedError;
      
      // Получить данные о проектах за предыдущий месяц для сравнения
      const prevMonthDate = new Date();
      prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
      const prevMonthTimestamp = prevMonthDate.toISOString();
      
      const { count: lastMonthTotalCount, error: lastMonthTotalError } = await db
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .lt('created_at', prevMonthTimestamp);
      
      if (lastMonthTotalError) throw lastMonthTotalError;
      
      const { count: lastMonthPublishedCount, error: lastMonthPublishedError } = await db
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true)
        .lt('created_at', prevMonthTimestamp);
      
      if (lastMonthPublishedError) throw lastMonthPublishedError;
      
      // Вычисляем изменения месяц к месяцу
      const totalChange = lastMonthTotalCount ? ((totalCount - lastMonthTotalCount) / lastMonthTotalCount) * 100 : 0;
      const publishedChange = lastMonthPublishedCount ? ((publishedCount - lastMonthPublishedCount) / lastMonthPublishedCount) * 100 : 0;
      
      // Вычисляем коэффициент конверсии
      const conversionRate = totalCount ? Math.round((publishedCount / totalCount) * 100) : 0;
      const lastMonthConversionRate = lastMonthTotalCount ? Math.round((lastMonthPublishedCount / lastMonthTotalCount) * 100) : 0;
      const conversionChange = lastMonthConversionRate ? conversionRate - lastMonthConversionRate : 0;
      
      setProjectStats({
        totalProjects: totalCount || 0,
        publishedProjects: publishedCount || 0,
        conversionRate,
        monthlyChange: {
          total: Number(totalChange.toFixed(1)),
          published: Number(publishedChange.toFixed(1)),
          conversion: Number(conversionChange.toFixed(1))
        }
      });
    } catch (error: any) {
      console.error("Ошибка загрузки статистики:", error);
      toast.error("Не удалось загрузить статистику проектов");
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Обработчик события проекта
  useEffect(() => {
    const handleProjectEvent = () => {
      // При любом событии с проектами обновляем статистику
      fetchProjectStats();
    };
    
    window.addEventListener('project-deleted', handleProjectEvent);
    window.addEventListener('project-updated', handleProjectEvent);
    
    return () => {
      window.removeEventListener('project-deleted', handleProjectEvent);
      window.removeEventListener('project-updated', handleProjectEvent);
    };
  }, [fetchProjectStats]);
  
  useEffect(() => {
    fetchProjectStats();
  }, [fetchProjectStats]);
  
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
  }, [searchQuery]);
  
  return {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    isLoading,
    setIsLoading,
    handleSearch,
    projectStats,
    refreshProjectStats: fetchProjectStats
  };
}
