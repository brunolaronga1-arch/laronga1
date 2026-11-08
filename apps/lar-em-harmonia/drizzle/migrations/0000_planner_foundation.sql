CREATE TYPE public.app_role AS ENUM ('admin','baba','limpeza');
CREATE TYPE public.member_kind AS ENUM ('pai','mae','baba','limpeza');
CREATE TYPE public.task_frequency AS ENUM ('diaria','semanal','quinzenal','mensal','pontual','conforme_necessidade');
CREATE TYPE public.task_status AS ENUM ('pendente','em_andamento','concluida','impedida','atrasada');
CREATE TYPE public.stock_status AS ENUM ('ok','acabando','quase_acabou','acabou');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  phone text NOT NULL,
  kind public.member_kind NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles r JOIN public.profiles p ON p.id = r.user_id
    WHERE r.user_id = _user_id AND r.role = _role AND p.active)
$$;
CREATE OR REPLACE FUNCTION public.is_member(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND active)
$$;
CREATE OR REPLACE FUNCTION public.my_kind(_user_id uuid)
RETURNS public.member_kind LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT kind FROM public.profiles WHERE id = _user_id AND active
$$;

CREATE POLICY "members read profiles" ON public.profiles FOR SELECT TO authenticated USING (public.is_member(auth.uid()));
CREATE POLICY "read own or admin roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  cleaner_weekdays int[] NOT NULL DEFAULT '{2,4}',
  dietary_notes text NOT NULL DEFAULT '',
  default_reminder_before int NOT NULL DEFAULT 0,
  default_pending_after int,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.settings TO authenticated;
GRANT ALL ON public.settings TO service_role;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read settings" ON public.settings FOR SELECT TO authenticated USING (public.is_member(auth.uid()));
CREATE POLICY "admins update settings" ON public.settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
INSERT INTO public.settings (id) VALUES (1);

CREATE TABLE public.activity_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  name text NOT NULL,
  default_kind public.member_kind NOT NULL,
  as_needed boolean NOT NULL DEFAULT false,
  guidance text,
  active boolean NOT NULL DEFAULT true,
  sort int NOT NULL DEFAULT 0
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_catalog TO authenticated;
GRANT ALL ON public.activity_catalog TO service_role;
ALTER TABLE public.activity_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read catalog" ON public.activity_catalog FOR SELECT TO authenticated USING (public.is_member(auth.uid()));
CREATE POLICY "admins write catalog" ON public.activity_catalog FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  meal text NOT NULL,
  age_range text NOT NULL,
  ingredients jsonb NOT NULL DEFAULT '[]',
  steps text NOT NULL,
  prep_minutes int NOT NULL DEFAULT 20,
  texture text NOT NULL,
  safety text NOT NULL,
  source text NOT NULL,
  video_url text,
  approved boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.play_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  age_range text NOT NULL,
  goal text NOT NULL,
  materials text NOT NULL,
  steps text NOT NULL,
  minutes int NOT NULL DEFAULT 10,
  safety text NOT NULL,
  source text NOT NULL,
  video_url text,
  approved boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recipes, public.play_activities TO authenticated;
GRANT ALL ON public.recipes, public.play_activities TO service_role;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.play_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read approved recipes" ON public.recipes FOR SELECT TO authenticated USING (public.is_member(auth.uid()) AND (approved OR public.has_role(auth.uid(),'admin')));
CREATE POLICY "admins write recipes" ON public.recipes FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "read approved plays" ON public.play_activities FOR SELECT TO authenticated USING (public.is_member(auth.uid()) AND (approved OR public.has_role(auth.uid(),'admin')));
CREATE POLICY "admins write plays" ON public.play_activities FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_id uuid REFERENCES public.activity_catalog(id) ON DELETE SET NULL,
  title text NOT NULL,
  category text NOT NULL,
  assignee_kind public.member_kind NOT NULL,
  alt_assignee_kind public.member_kind,
  frequency public.task_frequency NOT NULL,
  weekdays int[] NOT NULL DEFAULT '{}',
  start_date date NOT NULL DEFAULT ((now() AT TIME ZONE 'America/Sao_Paulo')::date),
  end_date date,
  hour int CHECK (hour BETWEEN 0 AND 23),
  minute int CHECK (minute BETWEEN 0 AND 59),
  notes text,
  reminder_before int NOT NULL DEFAULT 0,
  pending_after int,
  recipe_id uuid REFERENCES public.recipes(id) ON DELETE SET NULL,
  play_id uuid REFERENCES public.play_activities(id) ON DELETE SET NULL,
  active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE OR REPLACE FUNCTION public.can_see_task(_task_id uuid, _uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_uid,'admin') OR EXISTS (
    SELECT 1 FROM public.tasks t WHERE t.id = _task_id
      AND public.my_kind(_uid) IS NOT NULL
      AND (t.assignee_kind = public.my_kind(_uid) OR t.alt_assignee_kind = public.my_kind(_uid)))
$$;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "see assigned tasks" ON public.tasks FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR assignee_kind = public.my_kind(auth.uid()) OR alt_assignee_kind = public.my_kind(auth.uid()));
CREATE POLICY "admins write tasks" ON public.tasks FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.task_occurrences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  occ_date date NOT NULL,
  status public.task_status NOT NULL DEFAULT 'pendente',
  hour int CHECK (hour BETWEEN 0 AND 23),
  minute int CHECK (minute BETWEEN 0 AND 59),
  notes text,
  cancelled boolean NOT NULL DEFAULT false,
  staff_note text,
  completed_by uuid,
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (task_id, occ_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_occurrences TO authenticated;
GRANT ALL ON public.task_occurrences TO service_role;
ALTER TABLE public.task_occurrences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "see occurrences" ON public.task_occurrences FOR SELECT TO authenticated USING (public.can_see_task(task_id, auth.uid()));
CREATE POLICY "insert occurrences" ON public.task_occurrences FOR INSERT TO authenticated WITH CHECK (public.can_see_task(task_id, auth.uid()));
CREATE POLICY "update occurrences" ON public.task_occurrences FOR UPDATE TO authenticated USING (public.can_see_task(task_id, auth.uid())) WITH CHECK (public.can_see_task(task_id, auth.uid()));
CREATE POLICY "admins delete occurrences" ON public.task_occurrences FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- staff may only change status/notes, not schedule overrides
CREATE OR REPLACE FUNCTION public.guard_occurrence_staff()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(),'admin') THEN
    IF TG_OP = 'UPDATE' THEN
      NEW.hour := OLD.hour; NEW.minute := OLD.minute; NEW.notes := OLD.notes; NEW.cancelled := OLD.cancelled;
    ELSE
      NEW.hour := NULL; NEW.minute := NULL; NEW.notes := NULL; NEW.cancelled := false;
    END IF;
  END IF;
  IF NEW.status = 'concluida' AND (TG_OP = 'INSERT' OR OLD.status <> 'concluida') THEN
    NEW.completed_by := auth.uid(); NEW.completed_at := now();
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER trg_guard_occurrence BEFORE INSERT OR UPDATE ON public.task_occurrences FOR EACH ROW EXECUTE FUNCTION public.guard_occurrence_staff();

CREATE TABLE public.task_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  occ_date date,
  status public.task_status,
  action text NOT NULL,
  note text,
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.task_history TO authenticated;
GRANT ALL ON public.task_history TO service_role;
ALTER TABLE public.task_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "see history" ON public.task_history FOR SELECT TO authenticated USING (public.can_see_task(task_id, auth.uid()));

CREATE OR REPLACE FUNCTION public.log_occurrence()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status OR OLD.staff_note IS DISTINCT FROM NEW.staff_note
     OR OLD.hour IS DISTINCT FROM NEW.hour OR OLD.minute IS DISTINCT FROM NEW.minute OR OLD.cancelled IS DISTINCT FROM NEW.cancelled THEN
    INSERT INTO public.task_history (task_id, occ_date, status, action, note, user_id)
    VALUES (NEW.task_id, NEW.occ_date, NEW.status,
      CASE WHEN NEW.cancelled THEN 'ocorrencia_cancelada' WHEN TG_OP='INSERT' THEN 'registro' ELSE 'atualizacao' END,
      NEW.staff_note, auth.uid());
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_log_occurrence AFTER INSERT OR UPDATE ON public.task_occurrences FOR EACH ROW EXECUTE FUNCTION public.log_occurrence();

CREATE OR REPLACE FUNCTION public.log_task()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.task_history (task_id, action, user_id)
  VALUES (NEW.id, CASE WHEN TG_OP='INSERT' THEN 'criada' WHEN NOT NEW.active THEN 'desativada' ELSE 'serie_editada' END, auth.uid());
  RETURN NEW;
END $$;
CREATE TRIGGER trg_log_task AFTER INSERT OR UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.log_task();

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  area text NOT NULL CHECK (area IN ('isabela','casa','nala')),
  category text NOT NULL,
  name text NOT NULL,
  status public.stock_status NOT NULL DEFAULT 'ok',
  active boolean NOT NULL DEFAULT true,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE OR REPLACE FUNCTION public.can_update_area(_area text, _uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_uid,'admin')
    OR (public.has_role(_uid,'baba') AND _area = 'isabela')
    OR (public.has_role(_uid,'limpeza') AND _area IN ('casa','nala'))
$$;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read products" ON public.products FOR SELECT TO authenticated USING (public.is_member(auth.uid()));
CREATE POLICY "area update products" ON public.products FOR UPDATE TO authenticated USING (public.can_update_area(area, auth.uid())) WITH CHECK (public.can_update_area(area, auth.uid()));
CREATE POLICY "admins insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete products" ON public.products FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.guard_product_staff()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(),'admin') THEN
    NEW.name := OLD.name; NEW.area := OLD.area; NEW.category := OLD.category; NEW.active := OLD.active;
  END IF;
  NEW.updated_by := auth.uid(); NEW.updated_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER trg_guard_product BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.guard_product_staff();

CREATE TABLE public.shopping_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid UNIQUE REFERENCES public.products(id) ON DELETE CASCADE,
  name text NOT NULL,
  priority int NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto','reposto')),
  added_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shopping_items TO authenticated;
GRANT ALL ON public.shopping_items TO service_role;
ALTER TABLE public.shopping_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read shopping" ON public.shopping_items FOR SELECT TO authenticated USING (public.is_member(auth.uid()));
CREATE POLICY "admins write shopping" ON public.shopping_items FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  link text,
  channel text NOT NULL DEFAULT 'push' CHECK (channel IN ('push','whatsapp')),
  dedup_key text UNIQUE,
  read boolean NOT NULL DEFAULT false,
  pushed_at timestamptz,
  push_error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "mark own read" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.product_status_changed()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE pr int; a record;
BEGIN
  IF NEW.status IS NOT DISTINCT FROM OLD.status THEN RETURN NEW; END IF;
  IF NEW.status = 'ok' THEN
    UPDATE public.shopping_items SET status='reposto', updated_at=now() WHERE product_id = NEW.id;
    RETURN NEW;
  END IF;
  pr := CASE NEW.status WHEN 'acabando' THEN 1 WHEN 'quase_acabou' THEN 2 ELSE 3 END;
  INSERT INTO public.shopping_items (product_id, name, priority, status, added_by)
  VALUES (NEW.id, NEW.name, pr, 'aberto', auth.uid())
  ON CONFLICT (product_id) DO UPDATE SET priority = EXCLUDED.priority, status='aberto', name=EXCLUDED.name, updated_at=now();
  FOR a IN SELECT r.user_id FROM public.user_roles r WHERE r.role='admin' LOOP
    INSERT INTO public.notifications (user_id, title, body, link, dedup_key)
    VALUES (a.user_id, 'Reposição: ' || NEW.name,
      CASE NEW.status WHEN 'acabando' THEN 'Está acabando' WHEN 'quase_acabou' THEN 'Quase acabou' ELSE 'Acabou' END,
      '/compras', 'stock:' || NEW.id || ':' || NEW.status || ':' || a.user_id || ':' || to_char(now(),'YYYYMMDDHH24MI'))
    ON CONFLICT (dedup_key) DO NOTHING;
  END LOOP;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_product_status AFTER UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.product_status_changed();

CREATE TABLE public.favorites (
  user_id uuid NOT NULL,
  kind text NOT NULL CHECK (kind IN ('recipe','play')),
  item_id uuid NOT NULL,
  PRIMARY KEY (user_id, kind, item_id)
);
GRANT SELECT, INSERT, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own favorites" ON public.favorites FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid() AND public.is_member(auth.uid()));

CREATE TABLE public.weekly_menu (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start date NOT NULL,
  weekday int NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  meal text NOT NULL,
  recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  task_id uuid REFERENCES public.tasks(id) ON DELETE SET NULL,
  UNIQUE (week_start, weekday, meal)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.weekly_menu TO authenticated;
GRANT ALL ON public.weekly_menu TO service_role;
ALTER TABLE public.weekly_menu ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read menu" ON public.weekly_menu FOR SELECT TO authenticated USING (public.is_member(auth.uid()));
CREATE POLICY "admins write menu" ON public.weekly_menu FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.push_tokens (
  token text PRIMARY KEY,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_tokens TO authenticated;
GRANT ALL ON public.push_tokens TO service_role;
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tokens" ON public.push_tokens FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid() AND public.is_member(auth.uid()));
