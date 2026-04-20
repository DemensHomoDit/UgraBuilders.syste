-- Migration для создания таблиц для хранения данных форм и синхронизации с Bitrix24
-- Таблица для хранения всех форм с сайта
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

-- Таблица для хранения данных о лидах из Bitrix24
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

-- Таблица для связи форм с проектами
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

-- Функция для обновления updated_at при изменении записей
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для таблицы bitrix_leads
CREATE TRIGGER update_bitrix_leads_modtime
BEFORE UPDATE ON public.bitrix_leads
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- RLS политики для доступа к таблицам

-- Политики для form_submissions
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to admins" ON public.form_submissions 
FOR ALL USING (
  auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
  )
);

CREATE POLICY "Allow read access to managers" ON public.form_submissions 
FOR SELECT USING (
  auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid() AND raw_user_meta_data->>'role' IN ('manager', 'sales')
  )
);

CREATE POLICY "Allow users to view their own submissions" ON public.form_submissions 
FOR SELECT USING (
  auth.role() = 'authenticated' AND user_id = auth.uid()
);

-- Политики для bitrix_leads
ALTER TABLE public.bitrix_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to admins for leads" ON public.bitrix_leads 
FOR ALL USING (
  auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
  )
);

CREATE POLICY "Allow read access to managers for leads" ON public.bitrix_leads 
FOR SELECT USING (
  auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid() AND raw_user_meta_data->>'role' IN ('manager', 'sales')
  )
);

-- Политики для project_form_links
ALTER TABLE public.project_form_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to admins for links" ON public.project_form_links 
FOR ALL USING (
  auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
  )
);

CREATE POLICY "Allow read access to managers for links" ON public.project_form_links 
FOR SELECT USING (
  auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid() AND raw_user_meta_data->>'role' IN ('manager', 'sales')
  )
); 