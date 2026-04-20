
-- Функция для создания бакета, если он не существует
CREATE OR REPLACE FUNCTION create_bucket_if_not_exists(bucket_id TEXT, bucket_public BOOLEAN)
RETURNS VOID AS $$
DECLARE
  bucket_exists BOOLEAN;
BEGIN
  -- Проверяем, существует ли бакет
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = bucket_id
  ) INTO bucket_exists;
  
  -- Если бакет не существует, создаем его
  IF NOT bucket_exists THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES (bucket_id, bucket_id, bucket_public);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для создания политики доступа к хранилищу
CREATE OR REPLACE FUNCTION create_storage_policy(bucket_id TEXT, policy_name TEXT, policy_definition TEXT, policy_operation TEXT)
RETURNS VOID AS $$
DECLARE
  policy_exists BOOLEAN;
BEGIN
  -- Проверяем, существует ли политика
  SELECT EXISTS (
    SELECT 1 FROM storage.policies WHERE name = policy_name
  ) INTO policy_exists;
  
  -- Если политика не существует, создаем её
  IF NOT policy_exists THEN
    CREATE POLICY policy_name
    ON storage.objects
    FOR policy_operation
    TO public
    USING (bucket_id = bucket_id AND (policy_definition::boolean));
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
