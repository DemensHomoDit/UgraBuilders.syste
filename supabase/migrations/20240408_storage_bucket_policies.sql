
-- Function to ensure bucket policies
CREATE OR REPLACE FUNCTION public.ensure_bucket_policies(bucket_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  policies_created BOOLEAN := FALSE;
BEGIN
  -- Убедимся, что бакет существует, если нет - создадим
  PERFORM public.ensure_bucket_exists(bucket_id);
  
  -- Проверяем наличие политики SELECT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = bucket_id || '_select_policy'
  ) THEN
    EXECUTE format('CREATE POLICY "%s_select_policy" ON storage.objects FOR SELECT USING (bucket_id = ''%s'')', 
      bucket_id, bucket_id);
    policies_created := TRUE;
  END IF;
  
  -- Проверяем наличие политики INSERT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = bucket_id || '_insert_policy'
  ) THEN
    EXECUTE format('CREATE POLICY "%s_insert_policy" ON storage.objects FOR INSERT WITH CHECK (bucket_id = ''%s'')', 
      bucket_id, bucket_id);
    policies_created := TRUE;
  END IF;
  
  -- Проверяем наличие политики UPDATE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = bucket_id || '_update_policy'
  ) THEN
    EXECUTE format('CREATE POLICY "%s_update_policy" ON storage.objects FOR UPDATE USING (bucket_id = ''%s'')', 
      bucket_id, bucket_id);
    policies_created := TRUE;
  END IF;
  
  -- Проверяем наличие политики DELETE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = bucket_id || '_delete_policy'
  ) THEN
    EXECUTE format('CREATE POLICY "%s_delete_policy" ON storage.objects FOR DELETE USING (bucket_id = ''%s'')', 
      bucket_id, bucket_id);
    policies_created := TRUE;
  END IF;
  
  -- Проверяем статус RLS для таблицы objects
  IF NOT EXISTS (
    SELECT 1 FROM pg_class
    JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
    WHERE pg_namespace.nspname = 'storage' 
    AND pg_class.relname = 'objects'
    AND pg_class.relrowsecurity = 't'
  ) THEN
    EXECUTE 'ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY';
    policies_created := TRUE;
  END IF;
  
  RETURN policies_created;
END;
$$;
