-- ============================================
-- BASE TABLES
-- ============================================

-- Users (основная таблица пользователей)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(255),
  phone VARCHAR(50),
  avatar TEXT,
  client_stage VARCHAR(100),
  role VARCHAR(50) NOT NULL DEFAULT 'client' CHECK (role IN ('admin','editor','manager','client')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Profiles (расширенные данные)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  username VARCHAR(255),
  role VARCHAR(50) DEFAULT 'client',
  client_stage VARCHAR(100),
  project_stats JSONB,
  schedule JSONB,
  work_tasks JSONB,
  cameras JSONB DEFAULT '[]'::jsonb,
  notes JSONB DEFAULT '[]'::jsonb,
  house_info JSONB,
  project_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  type VARCHAR(50) DEFAULT 'project',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT,
  cover_image TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  areavalue NUMERIC,
  bathrooms INTEGER,
  bedrooms INTEGER,
  rooms INTEGER,
  dimensions VARCHAR(255),
  hasgarage BOOLEAN,
  hasterrace BOOLEAN,
  hasbasement BOOLEAN DEFAULT false,
  hassecondlight BOOLEAN DEFAULT false,
  haspantry BOOLEAN DEFAULT false,
  hasbalcony BOOLEAN DEFAULT false,
  hasfireplace BOOLEAN DEFAULT false,
  material VARCHAR(255),
  pricevalue NUMERIC,
  stories INTEGER,
  style VARCHAR(255),
  tags TEXT[],
  type VARCHAR(255),
  designer_first_name VARCHAR(255),
  designer_last_name VARCHAR(255),
  foundation_type VARCHAR(255),
  roof_type VARCHAR(255),
  heating VARCHAR(255),
  insulation VARCHAR(255),
  window_type VARCHAR(255),
  ceiling_height NUMERIC,
  construction_time VARCHAR(255),
  wall_thickness VARCHAR(255),
  floor_count INTEGER,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Images
CREATE TABLE IF NOT EXISTS project_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  description TEXT,
  image_type VARCHAR(50) DEFAULT 'general',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog Posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  cover_image TEXT,
  author_id UUID REFERENCES users(id),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  tags TEXT[],
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- News
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  content TEXT,
  summary TEXT,
  cover_image TEXT,
  tags TEXT[],
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  author_name VARCHAR(255),
  author_email VARCHAR(255),
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Form Submissions
CREATE TABLE IF NOT EXISTS form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_type VARCHAR(50) NOT NULL,
  topic VARCHAR(255),
  custom_topic VARCHAR(255),
  source VARCHAR(100),
  data JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'processed', 'closed')),
  is_pinned BOOLEAN DEFAULT false,
  pinned_at TIMESTAMPTZ,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site Visits (Analytics)
CREATE TABLE IF NOT EXISTS site_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,
  page_path TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  visit_date DATE DEFAULT CURRENT_DATE,
  visit_time TIMESTAMPTZ DEFAULT NOW()
);

-- Project Form Links
CREATE TABLE IF NOT EXISTS project_form_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  project_id UUID,
  form_submission_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client Photos
CREATE TABLE IF NOT EXISTS client_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  url TEXT NOT NULL,
  caption VARCHAR(500),
  category VARCHAR(100) DEFAULT 'Прочее',
  date TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID,
  uploaded_by_name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client Files
CREATE TABLE IF NOT EXISTS client_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  name VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100),
  url TEXT NOT NULL,
  folder_type VARCHAR(50) NOT NULL CHECK (folder_type IN ('documents', 'contracts', 'photos')),
  uploaded_by UUID,
  uploaded_by_name VARCHAR(255),
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Telegram Integration
CREATE TABLE IF NOT EXISTS telegram_link_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS user_telegram_accounts (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  telegram_user_id TEXT NOT NULL,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, telegram_user_id)
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMPTZ,
  assigned_to UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  client_id UUID REFERENCES users(id),
  completed_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- GoodWood-STYLE CLIENT DASHBOARD TABLES
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

-- Guest Access Links (Гостевой доступ)
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

-- Gallery Items
CREATE TABLE IF NOT EXISTS gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255),
  image_url TEXT NOT NULL,
  category VARCHAR(100),
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hero Carousel
CREATE TABLE IF NOT EXISTS hero_carousel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255),
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- System Settings
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bitrix Leads
CREATE TABLE IF NOT EXISTS bitrix_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  status_id VARCHAR(100),
  source_id VARCHAR(100),
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Orders
CREATE TABLE IF NOT EXISTS project_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  form_type VARCHAR(50),
  topic VARCHAR(255),
  status VARCHAR(50) DEFAULT 'new',
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog Images
CREATE TABLE IF NOT EXISTS blog_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Review Images
CREATE TABLE IF NOT EXISTS review_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Our Objects (Наши объекты)
CREATE TABLE IF NOT EXISTS our_objects (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             VARCHAR(255) NOT NULL,
  subtitle          VARCHAR(255),
  excerpt           TEXT,
  description       TEXT,
  city              VARCHAR(100),
  construction_year INTEGER,
  area              NUMERIC,
  material          VARCHAR(255),
  stories           INTEGER,
  cover_image       TEXT,
  slug              VARCHAR(255) UNIQUE,
  display_order     INTEGER DEFAULT 0,
  is_published      BOOLEAN DEFAULT false,
  created_by        UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Our Object Images
CREATE TABLE IF NOT EXISTS our_object_images (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  object_id     UUID NOT NULL REFERENCES our_objects(id) ON DELETE CASCADE,
  image_url     TEXT NOT NULL,
  caption       TEXT,
  display_order INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Our Object Reviews
CREATE TABLE IF NOT EXISTS our_object_reviews (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  object_id    UUID NOT NULL REFERENCES our_objects(id) ON DELETE CASCADE,
  author_name  VARCHAR(255) NOT NULL,
  author_title VARCHAR(255),
  author_image TEXT,
  rating       INTEGER CHECK (rating >= 1 AND rating <= 5),
  title        VARCHAR(255),
  content      TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_projects_published ON projects(is_published);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(is_published);
CREATE INDEX IF NOT EXISTS idx_comments_blog ON comments(blog_id);
CREATE INDEX IF NOT EXISTS idx_reviews_published ON reviews(is_published);
CREATE INDEX IF NOT EXISTS idx_site_visits_date ON site_visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_form_submissions_status ON form_submissions(status);
CREATE INDEX IF NOT EXISTS idx_client_photos_client ON client_photos(client_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON user_profiles(id);
CREATE INDEX IF NOT EXISTS idx_client_files_client ON client_files(client_id, folder_type);
CREATE INDEX IF NOT EXISTS idx_telegram_link_tokens_user ON telegram_link_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_accounts_user ON user_telegram_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to, status);

-- GoodWood indexes
CREATE INDEX IF NOT EXISTS idx_client_feed_client ON client_feed(client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_client_feed_type ON client_feed(type);
CREATE INDEX IF NOT EXISTS idx_client_feed_read ON client_feed(client_id, is_read);
CREATE INDEX IF NOT EXISTS idx_guest_links_client ON guest_access_links(client_id);
CREATE INDEX IF NOT EXISTS idx_guest_links_token ON guest_access_links(token);
CREATE INDEX IF NOT EXISTS idx_client_docs_client ON client_documents(client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_client_docs_type ON client_documents(client_id, type);

-- Our Objects indexes
CREATE INDEX IF NOT EXISTS idx_our_objects_published ON our_objects(is_published, display_order);
CREATE INDEX IF NOT EXISTS idx_our_objects_slug ON our_objects(slug);
CREATE INDEX IF NOT EXISTS idx_our_object_images_object ON our_object_images(object_id, display_order);
CREATE INDEX IF NOT EXISTS idx_our_object_reviews_object ON our_object_reviews(object_id);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

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
-- FALLBACK MIGRATIONS (for existing databases)
-- ============================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS client_stage VARCHAR(100);

ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS topic VARCHAR(255);
ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS custom_topic VARCHAR(255);
ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS source VARCHAR(100);
ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;
ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMPTZ;
ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Our Objects fallback migrations
CREATE TABLE IF NOT EXISTS our_objects (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             VARCHAR(255) NOT NULL,
  subtitle          VARCHAR(255),
  excerpt           TEXT,
  description       TEXT,
  city              VARCHAR(100),
  construction_year INTEGER,
  area              NUMERIC,
  material          VARCHAR(255),
  stories           INTEGER,
  cover_image       TEXT,
  slug              VARCHAR(255) UNIQUE,
  display_order     INTEGER DEFAULT 0,
  is_published      BOOLEAN DEFAULT false,
  created_by        UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS our_object_images (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  object_id     UUID NOT NULL REFERENCES our_objects(id) ON DELETE CASCADE,
  image_url     TEXT NOT NULL,
  caption       TEXT,
  display_order INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS our_object_reviews (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  object_id    UUID NOT NULL REFERENCES our_objects(id) ON DELETE CASCADE,
  author_name  VARCHAR(255) NOT NULL,
  author_title VARCHAR(255),
  author_image TEXT,
  rating       INTEGER CHECK (rating >= 1 AND rating <= 5),
  title        VARCHAR(255),
  content      TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_our_objects_published ON our_objects(is_published, display_order);
CREATE INDEX IF NOT EXISTS idx_our_objects_slug ON our_objects(slug);
CREATE INDEX IF NOT EXISTS idx_our_object_images_object ON our_object_images(object_id, display_order);
CREATE INDEX IF NOT EXISTS idx_our_object_reviews_object ON our_object_reviews(object_id);

-- Project Orders fallback migrations
ALTER TABLE project_orders ADD COLUMN IF NOT EXISTS form_type VARCHAR(50);
ALTER TABLE project_orders ADD COLUMN IF NOT EXISTS topic VARCHAR(255);
