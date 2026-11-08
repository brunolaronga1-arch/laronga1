ALTER TABLE public.play_activities ADD COLUMN IF NOT EXISTS mess_level text CHECK (mess_level IS NULL OR mess_level IN ('nenhuma','pouca','muita'));
