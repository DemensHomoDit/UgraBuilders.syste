-- Создаем функции, которые можно вызвать через RPC для создания таблиц

-- Функция для создания таблицы form_submissions
CREATE OR REPLACE FUNCTION create_form_submissions_table()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Создаем таблицу если она не существует
  CREATE TABLE IF NOT EXISTS public.form_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_type TEXT NOT NULL CHECK (form_type IN ('contact', 'consultation', 'comment', 'callback')),
    topic TEXT NOT NULL,
    custom_topic TEXT,
    source TEXT,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP WITH TIME ZONE,
    user_id UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'new'
  );

  -- Создаем индексы для быстрого поиска
  CREATE INDEX IF NOT EXISTS idx_form_submissions_form_type ON public.form_submissions(form_type);
  CREATE INDEX IF NOT EXISTS idx_form_submissions_created_at ON public.form_submissions(created_at);
  CREATE INDEX IF NOT EXISTS idx_form_submissions_status ON public.form_submissions(status);

  -- Настраиваем RLS политики
  ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

  -- Политика для админов
  DROP POLICY IF EXISTS "Allow full access to admins" ON public.form_submissions;
  CREATE POLICY "Allow full access to admins" ON public.form_submissions 
  FOR ALL USING (
    auth.role() = 'authenticated' AND EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
    )
  );

  -- Политика для менеджеров
  DROP POLICY IF EXISTS "Allow read access to managers" ON public.form_submissions;
  CREATE POLICY "Allow read access to managers" ON public.form_submissions 
  FOR SELECT USING (
    auth.role() = 'authenticated' AND EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND raw_user_meta_data->>'role' IN ('manager', 'sales')
    )
  );

  -- Политика для пользователей
  DROP POLICY IF EXISTS "Allow users to view their own submissions" ON public.form_submissions;
  CREATE POLICY "Allow users to view their own submissions" ON public.form_submissions 
  FOR SELECT USING (
    auth.role() = 'authenticated' AND user_id = auth.uid()
  );

  RETURN TRUE;
END;
$$;

-- Функция для создания таблицы bitrix_leads
CREATE OR REPLACE FUNCTION create_bitrix_leads_table()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Создаем таблицу если она не существует
  CREATE TABLE IF NOT EXISTS public.bitrix_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id TEXT NOT NULL UNIQUE,
    title TEXT,
    name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    status_id TEXT,
    source_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    raw_data JSONB,
    last_sync TIMESTAMP WITH TIME ZONE DEFAULT now()
  );

  -- Создаем индексы для быстрого поиска
  CREATE INDEX IF NOT EXISTS idx_bitrix_leads_lead_id ON public.bitrix_leads(lead_id);
  CREATE INDEX IF NOT EXISTS idx_bitrix_leads_email ON public.bitrix_leads(email);
  CREATE INDEX IF NOT EXISTS idx_bitrix_leads_phone ON public.bitrix_leads(phone);

  -- Настраиваем RLS политики
  ALTER TABLE public.bitrix_leads ENABLE ROW LEVEL SECURITY;

  -- Политика для админов
  DROP POLICY IF EXISTS "Allow full access to admins for leads" ON public.bitrix_leads;
  CREATE POLICY "Allow full access to admins for leads" ON public.bitrix_leads 
  FOR ALL USING (
    auth.role() = 'authenticated' AND EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
    )
  );

  -- Политика для менеджеров
  DROP POLICY IF EXISTS "Allow read access to managers for leads" ON public.bitrix_leads;
  CREATE POLICY "Allow read access to managers for leads" ON public.bitrix_leads 
  FOR SELECT USING (
    auth.role() = 'authenticated' AND EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND raw_user_meta_data->>'role' IN ('manager', 'sales')
    )
  );

  -- Создаем функцию для обновления updated_at
  CREATE OR REPLACE FUNCTION update_modified_column()
  RETURNS TRIGGER AS $$
  BEGIN
      NEW.updated_at = now();
      RETURN NEW;
  END;
  $$ language 'plpgsql';

  -- Создаем триггер для обновления updated_at
  DROP TRIGGER IF EXISTS update_bitrix_leads_modtime ON public.bitrix_leads;
  CREATE TRIGGER update_bitrix_leads_modtime
  BEFORE UPDATE ON public.bitrix_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

  RETURN TRUE;
END;
$$;

-- Функция для создания таблицы project_form_links
CREATE OR REPLACE FUNCTION create_project_form_links_table()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Проверяем существование таблицы form_submissions
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'form_submissions') THEN
    PERFORM create_form_submissions_table();
  END IF;

  -- Создаем таблицу если она не существует
  CREATE TABLE IF NOT EXISTS public.project_form_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id TEXT NOT NULL,
    form_id UUID NOT NULL REFERENCES public.form_submissions(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(project_id, form_id)
  );

  -- Создаем индексы для быстрого поиска
  CREATE INDEX IF NOT EXISTS idx_project_form_links_project_id ON public.project_form_links(project_id);
  CREATE INDEX IF NOT EXISTS idx_project_form_links_form_id ON public.project_form_links(form_id);

  -- Настраиваем RLS политики
  ALTER TABLE public.project_form_links ENABLE ROW LEVEL SECURITY;

  -- Политика для админов
  DROP POLICY IF EXISTS "Allow full access to admins for links" ON public.project_form_links;
  CREATE POLICY "Allow full access to admins for links" ON public.project_form_links 
  FOR ALL USING (
    auth.role() = 'authenticated' AND EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
    )
  );

  -- Политика для менеджеров
  DROP POLICY IF EXISTS "Allow read access to managers for links" ON public.project_form_links;
  CREATE POLICY "Allow read access to managers for links" ON public.project_form_links 
  FOR SELECT USING (
    auth.role() = 'authenticated' AND EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND raw_user_meta_data->>'role' IN ('manager', 'sales')
    )
  );

  RETURN TRUE;
END;
$$; 