-- Функция для безопасного удаления пользователя администратором
-- Эта функция должна быть выполнена в SQL Editor в Supabase
CREATE OR REPLACE FUNCTION public.admin_delete_user(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
-- Установка безопасного пути поиска для предотвращения инъекций
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
  'Функция для безопасного удаления пользователя администратором. 
   Удаляет профиль и учетную запись пользователя при условии, что он не администратор.';

-- Добавляем разрешения на выполнение функции
GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID) TO anon; 