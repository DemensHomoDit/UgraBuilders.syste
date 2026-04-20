-- ============================================
-- MIGRATION: Add missing columns and tables
-- Run this on existing database
-- ============================================

-- Add phone and avatar to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS avatar TEXT;

-- Add new columns to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS cameras JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS notes JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS house_info JSONB;

-- Add project_id to user_profiles if not exists
DO $$ 
BEGIN
  BEGIN
    ALTER TABLE user_profiles ADD COLUMN project_id UUID;
  EXCEPTION
    WHEN duplicate_column THEN
      NULL;
  END;
END $$;

-- ============================================
-- CREATE NEW TABLES (GoodWood-style)
-- ============================================

-- Client Feed (Лента активности)
CREATE TABLE IF NOT EXISTS client_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('message', 'photo', 'document', 'stage_update', 'payment', 'approval')),
  content TEXT,
  author JSONB NOT NULL,
  attachments JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_read BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_client_feed_client ON client_feed(client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_client_feed_type ON client_feed(type);
CREATE INDEX IF NOT EXISTS idx_client_feed_read ON client_feed(client_id, is_read);

-- Guest Access Links
CREATE TABLE IF NOT EXISTS guest_access_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  access_level VARCHAR(50) NOT NULL CHECK (access_level IN ('full', 'photos_only', 'progress_only')),
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  visits_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_visit_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_guest_links_client ON guest_access_links(client_id);
CREATE INDEX IF NOT EXISTS idx_guest_links_token ON guest_access_links(token);

-- Client Documents V2
CREATE TABLE IF NOT EXISTS client_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(500) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('contract', 'payment', 'approval', 'invoice', 'other')),
  url TEXT NOT NULL,
  file_size INTEGER,
  metadata JSONB,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_docs_client ON client_documents(client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_client_docs_type ON client_documents(client_id, type);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers
DROP TRIGGER IF EXISTS update_client_feed_updated_at ON client_feed;
CREATE TRIGGER update_client_feed_updated_at
  BEFORE UPDATE ON client_feed
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_documents_updated_at ON client_documents;
CREATE TRIGGER update_client_documents_updated_at
  BEFORE UPDATE ON client_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- UPDATE EXISTING PROJECTS TABLE
-- ============================================

-- Add missing columns to projects if not exists
DO $$ 
DECLARE
  col_name TEXT;
  col_list TEXT[] := ARRAY[
    'rooms', 'hasbasement', 'hassecondlight', 'haspantry', 
    'hasbalcony', 'hasfireplace', 'foundation_type', 'roof_type',
    'heating', 'insulation', 'window_type', 'ceiling_height',
    'construction_time', 'wall_thickness', 'floor_count'
  ];
BEGIN
  FOREACH col_name IN ARRAY col_list
  LOOP
    BEGIN
      EXECUTE format('ALTER TABLE projects ADD COLUMN IF NOT EXISTS %s TEXT', col_name);
    EXCEPTION
      WHEN duplicate_column THEN
        NULL;
    END;
  END LOOP;
END $$;

-- Add boolean defaults for project flags
ALTER TABLE projects 
ALTER COLUMN hasbasement SET DEFAULT false,
ALTER COLUMN hassecondlight SET DEFAULT false,
ALTER COLUMN haspantry SET DEFAULT false,
ALTER COLUMN hasbalcony SET DEFAULT false,
ALTER COLUMN hasfireplace SET DEFAULT false;

-- Update existing rows with default values
UPDATE projects SET 
  hasbasement = COALESCE(hasbasement, false),
  hassecondlight = COALESCE(hassecondlight, false),
  haspantry = COALESCE(haspantry, false),
  hasbalcony = COALESCE(hasbalcony, false),
  hasfireplace = COALESCE(hasfireplace, false)
WHERE hasbasement IS NULL 
   OR hassecondlight IS NULL 
   OR haspantry IS NULL 
   OR hasbalcony IS NULL 
   OR hasfireplace IS NULL;

-- ============================================
-- ADD INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_form_submissions_processed ON form_submissions(processed);

-- ============================================
-- ENABLE REALTIME FOR NEW TABLES (Supabase)
-- ============================================

-- Note: Enable realtime publication in Supabase dashboard or via:
-- BEGIN;
--   -- Drop existing publication if needed
--   -- CREATE PUBLICATION supabase_realtime;
-- COMMIT;
-- ALTER PUBLICATION supabase_realtime ADD TABLE client_feed;
