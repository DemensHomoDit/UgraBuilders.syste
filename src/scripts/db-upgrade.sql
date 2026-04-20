
-- Добавление колонки style в таблицу projects
ALTER TABLE IF EXISTS projects 
ADD COLUMN IF NOT EXISTS style varchar;

-- Обновление существующих записей для установки стиля по умолчанию
UPDATE projects SET style = 'classic' WHERE style IS NULL;
