
-- Функция для проверки и создания бакета в storage, если он не существует
-- Возвращает true, если бакет существует или был успешно создан
CREATE OR REPLACE FUNCTION public.ensure_bucket_exists(bucket_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  bucket_exists boolean;
BEGIN
  -- Проверяем существование бакета
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = bucket_id
  ) INTO bucket_exists;
  
  -- Если бакет не существует, создаем его
  IF NOT bucket_exists THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES (bucket_id, bucket_id, true)
    ON CONFLICT (id) DO NOTHING;
    
    -- Создаем необходимые политики доступа для операций с файлами
    
    -- Политика для SELECT
    EXECUTE format('
      CREATE POLICY "%s_select_policy" 
      ON storage.objects 
      FOR SELECT 
      TO public 
      USING (bucket_id = %L)',
      bucket_id, bucket_id
    );
    
    -- Политика для INSERT
    EXECUTE format('
      CREATE POLICY "%s_insert_policy" 
      ON storage.objects 
      FOR INSERT 
      TO public
      WITH CHECK (bucket_id = %L)',
      bucket_id, bucket_id
    );
    
    -- Политика для UPDATE
    EXECUTE format('
      CREATE POLICY "%s_update_policy" 
      ON storage.objects 
      FOR UPDATE 
      TO public
      USING (bucket_id = %L)',
      bucket_id, bucket_id
    );
    
    -- Политика для DELETE
    EXECUTE format('
      CREATE POLICY "%s_delete_policy" 
      ON storage.objects 
      FOR DELETE 
      TO public
      USING (bucket_id = %L)',
      bucket_id, bucket_id
    );
  END IF;
  
  RETURN true;
END;
$$;

-- Комментарий к функции
COMMENT ON FUNCTION public.ensure_bucket_exists(text) IS 
  'Проверяет существование указанного бакета и создает его, если он не существует. Также создает необходимые политики доступа.';
