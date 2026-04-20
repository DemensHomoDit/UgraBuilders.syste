
import { db } from "@/integrations/db/client";
import { toast } from "sonner";

/**
 * Служба для выполнения и проверки SQL-скриптов
 */
class DbScriptService {
  /**
   * Обновляет схему базы данных при необходимости
   * @returns boolean - успешность обновления
   */
  async updateSchema(): Promise<boolean> {
    try {
      // Проверяем необходимые функции
      const deleteTransactionExists = await this.checkFunctionExists('delete_project_transaction');
      
      if (!deleteTransactionExists) {
        await this.createDeleteProjectTransaction();
      }
      
      return true;
    } catch (err) {
      console.error('Ошибка при обновлении схемы базы данных:', err);
      return false;
    }
  }

  /**
   * Проверяет существование функции в базе данных
   * @param functionName Имя функции для проверки
   * @returns boolean - существует ли функция
   */
  async checkFunctionExists(functionName: string): Promise<boolean> {
    try {
      // Используем RPC вызов для проверки существования функции с правильной обработкой типов
      const { data, error } = await db.rpc('exec_sql', {
        sql_query: `
          SELECT EXISTS (
            SELECT 1 FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public' AND p.proname = '${functionName}'
          ) as exists;
        `
      });
      
      if (error) {
        console.error('Ошибка при проверке функции:', error.message);
        return false;
      }
      
      // Определяем тип данных более точно и добавляем все необходимые проверки
      if (data !== null && typeof data === 'object') {
        // Проверяем, что data является массивом
        // Используем явную безопасную проверку для TypeScript
        const dataArray = Array.isArray(data) ? data : [];
        if (dataArray.length > 0) {
          const result = dataArray[0] as Record<string, unknown>;
          return result.exists === true;
        }
      }
      
      return false;
    } catch (err) {
      console.error('Непредвиденная ошибка при проверке функции:', err);
      return false;
    }
  }
  
  /**
   * Создает функцию для удаления проекта в транзакции
   */
  async createDeleteProjectTransaction(): Promise<boolean> {
    try {
      const createFunctionSQL = `
        CREATE OR REPLACE FUNCTION public.delete_project_transaction(project_id_param UUID)
        RETURNS boolean
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          -- Удаляем изображения проекта
          DELETE FROM public.project_images 
          WHERE project_id = project_id_param;
          
          -- Удаляем связанные заказы
          DELETE FROM public.project_orders 
          WHERE project_id = project_id_param;
          
          -- Удаляем связанные отзывы
          DELETE FROM public.reviews 
          WHERE project_id = project_id_param;
          
          -- Удаляем сам проект
          DELETE FROM public.projects 
          WHERE id = project_id_param;
          
          RETURN true;
        END;
        $$;
      `;
      
      // Выполняем SQL через запрос напрямую
      const { error } = await db.rpc('exec_sql', { sql_query: createFunctionSQL });
      
      if (error) {
        console.error('Не удалось создать функцию delete_project_transaction:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Непредвиденная ошибка при создании функции:', err);
      return false;
    }
  }
  
  /**
   * Выполняет произвольный SQL-запрос
   * @param sql SQL-запрос для выполнения
   */
  private async executeRawSQL(sql: string): Promise<void> {
    try {
      // Прямой запрос к PostgreSQL через Supabase
      const { error } = await db.rpc('exec_sql', { sql_query: sql });
      
      if (error) {
        console.error('Ошибка при выполнении SQL напрямую:', error.message);
      }
    } catch (err) {
      console.error('Ошибка при выполнении SQL напрямую:', err);
    }
  }
}

export default new DbScriptService();
