ALTER TABLE public.settings ADD COLUMN notify_admins_pending boolean NOT NULL DEFAULT true;
ALTER TABLE public.tasks ADD COLUMN pre_minutes integer;
ALTER TABLE public.tasks ADD COLUMN post_minutes integer;
COMMENT ON COLUMN public.tasks.pre_minutes IS 'Minutes before for pre reminder. NULL = use settings default, 0 = off';
COMMENT ON COLUMN public.tasks.post_minutes IS 'Minutes after for unregistered reminder. NULL = use settings default, 0 = off';
UPDATE public.tasks SET pre_minutes = CASE WHEN reminder_before > 0 THEN reminder_before ELSE NULL END, post_minutes = pending_after;
COMMENT ON COLUMN public.tasks.reminder_before IS 'DEPRECATED: replaced by pre_minutes';
COMMENT ON COLUMN public.tasks.pending_after IS 'DEPRECATED: replaced by post_minutes';
UPDATE public.settings SET default_reminder_before = 10, default_pending_after = 30 WHERE id = 1;
