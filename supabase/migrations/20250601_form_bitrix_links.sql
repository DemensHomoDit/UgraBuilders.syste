-- Таблица для связи между заявками с форм и лидами из Bitrix24
CREATE TABLE IF NOT EXISTS public.form_bitrix_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID NOT NULL,
    bitrix_id VARCHAR(255) NOT NULL,
    linked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    CONSTRAINT fk_form_submission
        FOREIGN KEY (form_id)
        REFERENCES public.form_submissions (id)
        ON DELETE CASCADE
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_form_bitrix_links_form_id ON public.form_bitrix_links (form_id);
CREATE INDEX IF NOT EXISTS idx_form_bitrix_links_bitrix_id ON public.form_bitrix_links (bitrix_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_form_bitrix_links_unique ON public.form_bitrix_links (form_id, bitrix_id);

-- Безопасность
ALTER TABLE public.form_bitrix_links ENABLE ROW LEVEL SECURITY;

-- Политики доступа
CREATE POLICY "Администраторы и менеджеры могут просматривать связи" ON public.form_bitrix_links
    FOR SELECT
    USING (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE 
                user_profiles.id = auth.uid() AND 
                (user_profiles.role = 'admin' OR user_profiles.role = 'manager')
        )
    );

CREATE POLICY "Администраторы и менеджеры могут создавать связи" ON public.form_bitrix_links
    FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE 
                user_profiles.id = auth.uid() AND 
                (user_profiles.role = 'admin' OR user_profiles.role = 'manager')
        )
    );

CREATE POLICY "Администраторы и менеджеры могут удалять связи" ON public.form_bitrix_links
    FOR DELETE
    USING (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE 
                user_profiles.id = auth.uid() AND 
                (user_profiles.role = 'admin' OR user_profiles.role = 'manager')
        )
    );

-- Функция для получения лидов Bitrix24, связанных с заявкой
CREATE OR REPLACE FUNCTION public.get_bitrix_leads_for_form(form_id uuid)
RETURNS SETOF public.bitrix_leads
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT bl.*
    FROM public.bitrix_leads bl
    JOIN public.form_bitrix_links fbl ON bl.lead_id = fbl.bitrix_id
    WHERE fbl.form_id = form_id;
$$;

-- Функция для получения заявок, связанных с лидом Bitrix24
CREATE OR REPLACE FUNCTION public.get_forms_for_bitrix_lead(bitrix_id text)
RETURNS SETOF public.form_submissions
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT fs.*
    FROM public.form_submissions fs
    JOIN public.form_bitrix_links fbl ON fs.id = fbl.form_id
    WHERE fbl.bitrix_id = bitrix_id;
$$; 