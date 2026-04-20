
-- Создаем расширение для генерации UUID, если его еще нет
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- SQL запрос для создания таблицы project_images, если она не существует
CREATE TABLE IF NOT EXISTS project_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Добавляем индекс для быстрого поиска по project_id
CREATE INDEX IF NOT EXISTS idx_project_images_project_id ON project_images(project_id);

-- Добавляем индекс для сортировки по display_order
CREATE INDEX IF NOT EXISTS idx_project_images_display_order ON project_images(display_order);

-- Создаём бакет для хранения изображений проектов
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO NOTHING;

-- Создаём политику для чтения (SELECT)
CREATE POLICY IF NOT EXISTS "project_images_read_policy"
ON storage.objects
FOR SELECT
USING (bucket_id = 'project-images');

-- Создаём политику для записи (INSERT)
CREATE POLICY IF NOT EXISTS "project_images_insert_policy"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'project-images');

-- Создаём политику для обновления (UPDATE)
CREATE POLICY IF NOT EXISTS "project_images_update_policy"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'project-images');

-- Создаём политику для удаления (DELETE)
CREATE POLICY IF NOT EXISTS "project_images_delete_policy"
ON storage.objects
FOR DELETE
USING (bucket_id = 'project-images');
