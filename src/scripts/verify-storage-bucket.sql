
-- Script to verify and fix Supabase storage bucket configuration

-- 1. Проверяем существование бакета "project-images"
DO $$
DECLARE
  bucket_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'project-images'
  ) INTO bucket_exists;

  -- Если бакет не существует, создаем его
  IF NOT bucket_exists THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('project-images', 'project-images', true);
    RAISE NOTICE 'Бакет "project-images" успешно создан!';
  ELSE
    -- Проверяем, что бакет публичный
    UPDATE storage.buckets 
    SET public = true
    WHERE id = 'project-images' AND public = false;
    
    RAISE NOTICE 'Бакет "project-images" уже существует!';
  END IF;
END $$;

-- 2. Проверяем политики доступа для бакета "project-images"
DO $$
DECLARE
  select_policy_exists BOOLEAN;
  insert_policy_exists BOOLEAN;
  update_policy_exists BOOLEAN;
  delete_policy_exists BOOLEAN;
BEGIN
  -- Проверяем существование политик
  SELECT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'project_images_select_policy'
  ) INTO select_policy_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'project_images_insert_policy'
  ) INTO insert_policy_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'project_images_update_policy'
  ) INTO update_policy_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'project_images_delete_policy'
  ) INTO delete_policy_exists;

  -- Создаем отсутствующие политики
  IF NOT select_policy_exists THEN
    EXECUTE 'CREATE POLICY "project_images_select_policy" ON storage.objects FOR SELECT USING (bucket_id = ''project-images'')';
    RAISE NOTICE 'Создана политика SELECT для бакета "project-images"';
  END IF;
  
  IF NOT insert_policy_exists THEN
    EXECUTE 'CREATE POLICY "project_images_insert_policy" ON storage.objects FOR INSERT WITH CHECK (bucket_id = ''project-images'')';
    RAISE NOTICE 'Создана политика INSERT для бакета "project-images"';
  END IF;
  
  IF NOT update_policy_exists THEN
    EXECUTE 'CREATE POLICY "project_images_update_policy" ON storage.objects FOR UPDATE USING (bucket_id = ''project-images'')';
    RAISE NOTICE 'Создана политика UPDATE для бакета "project-images"';
  END IF;
  
  IF NOT delete_policy_exists THEN
    EXECUTE 'CREATE POLICY "project_images_delete_policy" ON storage.objects FOR DELETE USING (bucket_id = ''project-images'')';
    RAISE NOTICE 'Создана политика DELETE для бакета "project-images"';
  END IF;
END $$;

-- 3. Проверяем включен ли RLS для таблицы objects
DO $$
DECLARE
  rls_enabled BOOLEAN;
BEGIN
  SELECT relrowsecurity FROM pg_class
  JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
  WHERE pg_namespace.nspname = 'storage' AND pg_class.relname = 'objects'
  INTO rls_enabled;
  
  RAISE NOTICE 'RLS для storage.objects: %', CASE WHEN rls_enabled THEN 'Включен' ELSE 'Выключен' END;
  
  IF NOT rls_enabled THEN
    RAISE NOTICE 'Включение RLS не требуется, так как Supabase автоматически управляет этим.';
  END IF;
END $$;

-- 4. Проверка прав доступа для анонимных пользователей
DO $$
BEGIN
  EXECUTE 'GRANT USAGE ON SCHEMA storage TO anon';
  EXECUTE 'GRANT SELECT ON storage.objects TO anon';
  EXECUTE 'GRANT INSERT ON storage.objects TO anon';
  EXECUTE 'GRANT UPDATE ON storage.objects TO anon';
  EXECUTE 'GRANT DELETE ON storage.objects TO anon';
  
  RAISE NOTICE 'Права доступа для анонимных пользователей установлены.';
END $$;

-- 5. Отчет о проверке
DO $$
BEGIN
  RAISE NOTICE '=========== Проверка бакета "project-images" завершена ===========';
  RAISE NOTICE 'Для использования результатов проверки, запустите этот SQL скрипт в SQL-редакторе Supabase.';
  RAISE NOTICE 'После запуска скрипта, обновите страницу вашего приложения и попробуйте загрузить изображение снова.';
END $$;
