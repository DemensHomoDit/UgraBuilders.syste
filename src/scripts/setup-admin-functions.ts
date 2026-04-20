import { db } from "@/integrations/db/client";
import { toast } from "sonner";

/**
 * Настраивает административные функции в базе данных
 */
export async function setupAdminFunctions(): Promise<boolean> {
  try {
    // SQL для создания функции admin_delete_user
    const createAdminDeleteUserSQL = `
      CREATE OR REPLACE FUNCTION public.admin_delete_user(user_id UUID)
      RETURNS BOOLEAN
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public, auth
      AS $$
      DECLARE
        user_exists BOOLEAN;
        is_admin BOOLEAN;
      BEGIN
        -- Проверяем существование пользователя
        SELECT EXISTS (
          SELECT 1 FROM auth.users WHERE id = user_id
        ) INTO user_exists;
        
        IF NOT user_exists THEN
          RAISE EXCEPTION 'Пользователь с ID % не найден', user_id;
        END IF;
        
        -- Проверяем, не является ли пользователь администратором
        SELECT EXISTS (
          SELECT 1 FROM public.user_profiles 
          WHERE id = user_id AND role = 'admin'
        ) INTO is_admin;
        
        IF is_admin THEN
          RAISE EXCEPTION 'Нельзя удалить пользователя с ролью администратора';
        END IF;
        
        -- Удаляем связанные данные в профиле пользователя
        DELETE FROM public.user_profiles WHERE id = user_id;
        
        -- Удаляем пользователя из auth.users
        DELETE FROM auth.users WHERE id = user_id;
        
        RETURN TRUE;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE EXCEPTION 'Ошибка при удалении пользователя: %', SQLERRM;
          RETURN FALSE;
      END;
      $$;
      
      -- Добавляем комментарий к функции
      COMMENT ON FUNCTION public.admin_delete_user(UUID) IS 
        'Функция для безопасного удаления пользователя администратором.';
      
      -- Добавляем разрешения на выполнение функции
      GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID) TO authenticated;
      GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID) TO anon;
    `;
    
    // Выполняем SQL через RPC для создания функции
    const { error } = await db.rpc('exec_sql', { 
      sql_query: createAdminDeleteUserSQL 
    });
    
    if (error) {
      console.error("Ошибка при создании функции admin_delete_user:", error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Ошибка при настройке административных функций:", error);
    return false;
  }
}

/**
 * Проверяет наличие необходимых административных функций
 */
export async function checkAdminFunctions(): Promise<boolean> {
  try {
    // Проверяем наличие функции admin_delete_user
    const { data, error } = await db.rpc('exec_sql', { 
      sql_query: `
        SELECT EXISTS (
          SELECT 1 FROM pg_proc p
          JOIN pg_namespace n ON p.pronamespace = n.oid
          WHERE n.nspname = 'public' AND p.proname = 'admin_delete_user'
        ) as exists;
      `
    });
    
    if (error) {
      console.error("Ошибка при проверке функции admin_delete_user:", error.message);
      return false;
    }
    
    if (Array.isArray(data) && data.length > 0) {
      const functionExists = data[0].exists === true;
      
      if (!functionExists) {
        return false;
      }
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Ошибка при проверке административных функций:", error);
    return false;
  }
}

/**
 * Инициализирует административные функции в Supabase
 */
export async function initAdminFunctions(): Promise<void> {
  const exists = await checkAdminFunctions();
  
  if (!exists) {
    const success = await setupAdminFunctions();
    
    if (success) {
      // Более нейтральное сообщение для административного интерфейса
      toast.success("Система администрирования инициализирована");
    } else {
      toast.error("Не удалось настроить административные функции",
        { description: "Проверьте консоль для подробностей" }
      );
    }
  }
}

// Экспортируем функцию для использования в приложении
export default { initAdminFunctions }; 