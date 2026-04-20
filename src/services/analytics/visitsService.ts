
import { db } from "@/integrations/db/client";
import { SiteVisit } from "@/types/analytics";
import { toast } from "sonner";

/**
 * Сервис для работы с данными посещений сайта
 */
export const visitsService = {
  /**
   * Записать новое посещение страницы
   */
  async recordVisit(pagePath: string, userId?: string): Promise<boolean> {
    try {
      // Получаем IP адрес посетителя
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      const ipAddress = ipData.ip;
      
      // Проверяем, было ли посещение с этого IP адреса за последний час
      const hourAgo = new Date();
      hourAgo.setHours(hourAgo.getHours() - 1);
      
      const { data: existingVisits } = await db
        .from('site_visits')
        .select('*')
        .eq('ip_address', ipAddress)
        .eq('page_path', pagePath)
        .gte('visit_date', hourAgo.toISOString());
      
      // Если было посещение с этого IP за последний час на эту же страницу, не записываем
      if (existingVisits && existingVisits.length > 0) {
        return false;
      }
      
      // Записываем посещение
      const { error } = await db
        .from('site_visits')
        .insert({
          ip_address: ipAddress,
          page_path: pagePath,
          user_agent: navigator.userAgent,
          user_id: userId
        });
      
      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error('Ошибка при записи посещения:', error);
      return false;
    }
  },
  
  /**
   * Получить статистику посещений
   */
  async getVisitStats(days: number = 7): Promise<{dates: string[], counts: number[]}> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days + 1);
      startDate.setHours(0, 0, 0, 0);
      
      const { data, error } = await db
        .from('site_visits')
        .select('visit_date')
        .gte('visit_date', startDate.toISOString());
      
      if (error) throw error;
      
      // Группируем посещения по дням
      const visitsByDay: Record<string, number> = {};
      const dateLabels: string[] = [];
      
      // Создаем пустую структуру для всех дней в диапазоне
      for (let i = 0; i < days; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateString = currentDate.toISOString().split('T')[0];
        visitsByDay[dateString] = 0;
        dateLabels.push(new Date(dateString).toLocaleDateString('ru-RU', { weekday: 'short' }));
      }
      
      // Заполняем данными
      if (data) {
        data.forEach(visit => {
          const visitDate = new Date(visit.visit_date).toISOString().split('T')[0];
          if (visitsByDay[visitDate] !== undefined) {
            visitsByDay[visitDate]++;
          }
        });
      }
      
      const visitCounts = Object.values(visitsByDay);
      
      return {
        dates: dateLabels,
        counts: visitCounts
      };
    } catch (error: any) {
      console.error('Ошибка при получении статистики посещений:', error);
      toast.error('Не удалось загрузить статистику посещений');
      return {dates: [], counts: []};
    }
  },

  /**
   * Получить сводку посещений (общее кол-во, сегодня, вчера)
   */
  async getVisitsSummary(): Promise<{total: number, today: number, yesterday: number}> {
    try {
      // Подготавливаем даты для фильтрации
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Получаем общее количество посещений
      const { count: totalCount, error: totalError } = await db
        .from('site_visits')
        .select('*', { count: 'exact', head: true });
      
      // Получаем количество посещений за сегодня
      const { count: todayCount, error: todayError } = await db
        .from('site_visits')
        .select('*', { count: 'exact', head: true })
        .gte('visit_date', today.toISOString())
        .lt('visit_date', tomorrow.toISOString());
      
      // Получаем количество посещений за вчера
      const { count: yesterdayCount, error: yesterdayError } = await db
        .from('site_visits')
        .select('*', { count: 'exact', head: true })
        .gte('visit_date', yesterday.toISOString())
        .lt('visit_date', today.toISOString());
      
      if (totalError || todayError || yesterdayError) throw (totalError || todayError || yesterdayError);
      
      return {
        total: totalCount || 0,
        today: todayCount || 0,
        yesterday: yesterdayCount || 0
      };
    } catch (error: any) {
      console.error('Ошибка при получении сводки посещений:', error);
      toast.error('Не удалось загрузить сводку посещений');
      return {total: 0, today: 0, yesterday: 0};
    }
  }
};

export default visitsService;
