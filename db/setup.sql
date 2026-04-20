-- 1. Добавить колонки в users
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;

-- 2. Добавить колонки в user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS cameras JSONB DEFAULT '[]'::jsonb;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS notes JSONB DEFAULT '[]'::jsonb;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS house_info JSONB;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS project_id UUID;

-- 3. Добавить колонки в projects
DO $$
BEGIN
  ALTER TABLE projects ADD COLUMN IF NOT EXISTS rooms INTEGER DEFAULT 0;
  ALTER TABLE projects ADD COLUMN IF NOT EXISTS hasbasement BOOLEAN DEFAULT false;
  ALTER TABLE projects ADD COLUMN IF NOT EXISTS hassecondlight BOOLEAN DEFAULT false;
  ALTER TABLE projects ADD COLUMN IF NOT EXISTS haspantry BOOLEAN DEFAULT false;
  ALTER TABLE projects ADD COLUMN IF NOT EXISTS hasbalcony BOOLEAN DEFAULT false;
  ALTER TABLE projects ADD COLUMN IF NOT EXISTS hasfireplace BOOLEAN DEFAULT false;
  ALTER TABLE projects ADD COLUMN IF NOT EXISTS foundation_type VARCHAR(255);
  ALTER TABLE projects ADD COLUMN IF NOT EXISTS roof_type VARCHAR(255);
  ALTER TABLE projects ADD COLUMN IF NOT EXISTS heating VARCHAR(255);
  ALTER TABLE projects ADD COLUMN IF NOT EXISTS insulation VARCHAR(255);
  ALTER TABLE projects ADD COLUMN IF NOT EXISTS window_type VARCHAR(255);
  ALTER TABLE projects ADD COLUMN IF NOT EXISTS ceiling_height NUMERIC;
  ALTER TABLE projects ADD COLUMN IF NOT EXISTS construction_time VARCHAR(255);
  ALTER TABLE projects ADD COLUMN IF NOT EXISTS wall_thickness VARCHAR(255);
  ALTER TABLE projects ADD COLUMN IF NOT EXISTS floor_count INTEGER;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- 4. Создать таблицу client_feed
CREATE TABLE IF NOT EXISTS client_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  content TEXT,
  author JSONB NOT NULL DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_read BOOLEAN DEFAULT false
);

-- 5. Создать таблицу guest_access_links
CREATE TABLE IF NOT EXISTS guest_access_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  access_level VARCHAR(50) NOT NULL DEFAULT 'photos_only',
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  visits_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_visit_at TIMESTAMPTZ
);

-- 6. Создать таблицу client_documents
CREATE TABLE IF NOT EXISTS client_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(500) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'other',
  url TEXT NOT NULL,
  file_size INTEGER,
  metadata JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Индексы
CREATE INDEX IF NOT EXISTS idx_client_feed_client ON client_feed(client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guest_links_client ON guest_access_links(client_id);
CREATE INDEX IF NOT EXISTS idx_guest_links_token ON guest_access_links(token);
CREATE INDEX IF NOT EXISTS idx_client_docs_client ON client_documents(client_id, created_at DESC);
