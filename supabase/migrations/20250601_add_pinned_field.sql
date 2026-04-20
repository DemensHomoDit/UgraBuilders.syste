-- Добавляем поле is_pinned для возможности закрепления форм
ALTER TABLE public.form_submissions 
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;

-- Добавляем поле pinned_by для хранения ID пользователя, закрепившего форму
ALTER TABLE public.form_submissions 
ADD COLUMN IF NOT EXISTS pinned_by UUID REFERENCES auth.users(id);

-- Добавляем поле pinned_at для хранения времени закрепления
ALTER TABLE public.form_submissions 
ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMP WITH TIME ZONE;

-- Создаем индекс для быстрого поиска закрепленных форм
CREATE INDEX IF NOT EXISTS idx_form_submissions_is_pinned ON public.form_submissions(is_pinned);

-- Создаем функцию для закрепления/открепления формы
CREATE OR REPLACE FUNCTION toggle_form_pin(
  form_id UUID,
  pin_status BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  IF pin_status THEN
    -- Закрепляем форму
    UPDATE public.form_submissions
    SET is_pinned = TRUE,
        pinned_by = auth.uid(),
        pinned_at = now()
    WHERE id = form_id
    RETURNING jsonb_build_object(
      'success', TRUE,
      'message', 'Форма успешно закреплена',
      'id', id,
      'is_pinned', is_pinned,
      'pinned_at', pinned_at
    ) INTO result;
  ELSE
    -- Открепляем форму
    UPDATE public.form_submissions
    SET is_pinned = FALSE,
        pinned_by = NULL,
        pinned_at = NULL
    WHERE id = form_id
    RETURNING jsonb_build_object(
      'success', TRUE,
      'message', 'Форма успешно откреплена',
      'id', id,
      'is_pinned', is_pinned
    ) INTO result;
  END IF;
  
  -- Если форма не найдена
  IF result IS NULL THEN
    result := jsonb_build_object(
      'success', FALSE,
      'message', 'Форма не найдена'
    );
  END IF;
  
  RETURN result;
END;
$$; 