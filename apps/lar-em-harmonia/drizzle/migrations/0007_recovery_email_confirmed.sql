ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS recovery_email_confirmed_at timestamptz;
