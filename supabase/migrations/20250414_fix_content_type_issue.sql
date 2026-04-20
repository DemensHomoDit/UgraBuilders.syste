
-- Создаем функцию для добавления изображения проекта
CREATE OR REPLACE FUNCTION add_project_image(
  project_id uuid,
  image_url text,
  description text DEFAULT '',
  display_order int DEFAULT 0
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted_id uuid;
BEGIN
  INSERT INTO project_images (
    project_id,
    image_url,
    description,
    display_order
  ) VALUES (
    project_id,
    image_url,
    description,
    display_order
  )
  RETURNING id INTO inserted_id;
  
  RETURN inserted_id;
END;
$$;

-- Создаем функцию для обновления проекта с правильной обработкой пустых массивов
CREATE OR REPLACE FUNCTION update_project(
  p_id uuid,
  p_data jsonb
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE projects 
  SET 
    title = COALESCE(p_data->>'title', title),
    description = COALESCE(p_data->>'description', description),
    content = COALESCE(p_data->>'content', content),
    cover_image = COALESCE(p_data->>'cover_image', cover_image),
    -- Если тэги NULL, оставляем текущее значение, иначе конвертируем из JSON
    tags = CASE 
             WHEN p_data->>'tags' IS NULL THEN tags
             WHEN p_data->>'tags' = '[]' THEN '{}'::text[]
             ELSE (p_data->>'tags')::text[]
           END,
    is_published = COALESCE((p_data->>'is_published')::boolean, is_published),
    category_id = COALESCE((p_data->>'category_id')::uuid, category_id),
    areavalue = COALESCE((p_data->>'areavalue')::numeric, areavalue),
    pricevalue = COALESCE((p_data->>'pricevalue')::numeric, pricevalue),
    bedrooms = COALESCE((p_data->>'bedrooms')::integer, bedrooms),
    bathrooms = COALESCE((p_data->>'bathrooms')::integer, bathrooms),
    dimensions = COALESCE(p_data->>'dimensions', dimensions),
    material = COALESCE(p_data->>'material', material),
    stories = COALESCE((p_data->>'stories')::integer, stories),
    hasgarage = COALESCE((p_data->>'hasgarage')::boolean, hasgarage),
    hasterrace = COALESCE((p_data->>'hasterrace')::boolean, hasterrace),
    type = COALESCE(p_data->>'type', type),
    style = COALESCE(p_data->>'style', style),
    updated_at = COALESCE((p_data->>'updated_at')::timestamptz, now())
  WHERE id = p_id;
  
  RETURN FOUND;
END;
$$;
