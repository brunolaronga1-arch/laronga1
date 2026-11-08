ALTER TABLE public.notifications ADD CONSTRAINT notifications_link_relative CHECK (link IS NULL OR link LIKE '/%');
CREATE OR REPLACE FUNCTION public.cleanup_deleted_profile() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  DELETE FROM public.notifications WHERE user_id = OLD.id;
  DELETE FROM public.push_tokens WHERE user_id = OLD.id;
  DELETE FROM public.favorites WHERE user_id = OLD.id;
  RETURN OLD;
END $$;
REVOKE EXECUTE ON FUNCTION public.cleanup_deleted_profile() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER profiles_cleanup_after_delete AFTER DELETE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.cleanup_deleted_profile();
