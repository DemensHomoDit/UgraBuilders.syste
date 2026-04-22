
import { db } from "@/integrations/db/client";
import { Task } from "@/types/analytics";
import { toast } from "sonner";

/**
 * Сервис для работы с задачами
 */
export const tasksService = {
  /**
   * Добавить новую задачу
   */
  async addTask(data: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> {
    try {
      const { data: result, error } = await db
        .from('tasks')
        .insert(data)
        .select('id')
        .single();
      
      if (error) throw error;
      return result.id;
    } catch (error: any) {
      console.error('Ошибка при добавлении задачи:', error);
      toast.error('Не удалось добавить задачу');
      return null;
    }
  },
  
  /**
   * Обновить задачу
   */
  async updateTask(id: string, updates: Partial<Task>): Promise<boolean> {
    try {
      // Добавляем дату обновления
      const updatedData = {
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      // Если задача завершена, добавляем дату завершения
      if (updates.status === 'completed' && !updates.completed_date) {
        updatedData.completed_date = new Date().toISOString();
      } else if (updates.status && updates.status !== 'completed') {
        // Если статус изменился и теперь не "завершено", очищаем дату завершения
        updatedData.completed_date = null;
      }
      
      const { error } = await db
        .from('tasks')
        .update(updatedData)
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error('Ошибка при обновлении задачи:', error);
      toast.error('Не удалось обновить задачу');
      return false;
    }
  },
  
  /**
   * Обновить статус задачи
   */
  async updateTaskStatus(id: string, status: Task['status']): Promise<boolean> {
    try {
      const updates: Partial<Task> = {
        status,
        updated_at: new Date().toISOString()
      };
      
      // Если задача завершена, добавляем дату завершения
      if (status === 'completed') {
        updates.completed_date = new Date().toISOString();
      } else {
        updates.completed_date = null;
      }
      
      const { error } = await db
        .from('tasks')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error('Ошибка при обновлении статуса задачи:', error);
      toast.error('Не удалось обновить статус задачи');
      return false;
    }
  },
  
  /**
   * Получить список задач
   */
  async getTasks(limit: number = 10): Promise<Task[]> {
    try {
      const { data, error } = await db
        .from('tasks')
        .select('*, assigned_user:users!assigned_to(id, username, avatar), created_user:users!created_by(id, username)')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return (data as Task[]) || [];
    } catch (error: any) {
      console.error('Ошибка при получении задач:', error);
      // Fallback без JOIN если не поддерживается
      try {
        const { data } = await db.from('tasks').select('*').order('created_at', { ascending: false }).limit(limit);
        return (data as Task[]) || [];
      } catch { return []; }
    }
  },
  
  /**
   * Получить все задачи без ограничения количества
   */
  async getAllTasks(): Promise<Task[]> {
    try {
      const { data, error } = await db
        .from('tasks')
        .select('*, assigned_user:users!assigned_to(id, username, avatar), created_user:users!created_by(id, username)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data as Task[]) || [];
    } catch (error: any) {
      console.error('Ошибка при получении задач:', error);
      try {
        const { data } = await db.from('tasks').select('*').order('created_at', { ascending: false });
        return (data as Task[]) || [];
      } catch { return []; }
    }
  },
  
  /**
   * Получить задачи для конкретного пользователя
   */
  async getUserTasks(userId: string): Promise<Task[]> {
    try {
      const { data, error } = await db
        .from('tasks')
        .select('*, assigned_user:users!assigned_to(id, username, avatar), created_user:users!created_by(id, username)')
        .eq('assigned_to', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data as Task[]) || [];
    } catch (error: any) {
      console.error('Ошибка при получении задач пользователя:', error);
      try {
        const { data } = await db.from('tasks').select('*').eq('assigned_to', userId).order('created_at', { ascending: false });
        return (data as Task[]) || [];
      } catch { return []; }
    }
  },
  
  /**
   * Удалить задачу
   */
  async deleteTask(id: string): Promise<boolean> {
    try {
      const { error } = await db
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error('Ошибка при удалении задачи:', error);
      toast.error('Не удалось удалить задачу');
      return false;
    }
  },
  
  /**
   * Получить сводку по задачам
   */
  async getTasksSummary(): Promise<{total: number, completed: number, byPriority: Record<string, number>}> {
    try {
      // Получаем общее количество задач
      const { count: totalCount, error: totalError } = await db
        .from('tasks')
        .select('*', { count: 'exact', head: true });
      
      // Получаем количество завершенных задач
      const { count: completedCount, error: completedError } = await db
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');
      
      // Получаем распределение по приоритетам
      const { data: priorityData, error: priorityError } = await db
        .from('tasks')
        .select('priority, status');
      
      if (totalError || completedError || priorityError) 
        throw (totalError || completedError || priorityError);
      
      // Подсчитываем задачи по приоритетам
      const byPriority: Record<string, number> = {
        low: 0,
        medium: 0,
        high: 0,
        urgent: 0
      };
      
      if (priorityData) {
        priorityData.forEach(task => {
          if (task.status !== 'completed' && task.priority) {
            byPriority[task.priority]++;
          }
        });
      }
      
      return {
        total: totalCount || 0,
        completed: completedCount || 0,
        byPriority
      };
    } catch (error: any) {
      console.error('Ошибка при получении сводки по задачам:', error);
      toast.error('Не удалось загрузить сводку по задачам');
      return { 
        total: 0, 
        completed: 0, 
        byPriority: { low: 0, medium: 0, high: 0, urgent: 0 } 
      };
    }
  }
};

export default tasksService;
