ALTER TABLE public.play_activities ADD COLUMN origin text NOT NULL DEFAULT 'pais' CHECK (origin IN ('pais','app'));
UPDATE public.play_activities SET origin = 'app';
ALTER TABLE public.settings ADD COLUMN daily_play_id uuid REFERENCES public.play_activities(id) ON DELETE SET NULL;
ALTER TABLE public.settings ADD COLUMN daily_play_date date;
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_occurrences, public.diary_entries, public.products, public.shopping_items, public.notifications;
