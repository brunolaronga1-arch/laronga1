CREATE TABLE public.diary_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('sono','refeicao','fralda','remedio','banho','humor','nota')),
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX diary_entries_at_idx ON public.diary_entries (at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.diary_entries TO authenticated;
GRANT ALL ON public.diary_entries TO service_role;
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "diary read" ON public.diary_entries FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR (public.has_role(auth.uid(),'baba') AND public.is_member(auth.uid())));
CREATE POLICY "diary insert" ON public.diary_entries FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND (public.has_role(auth.uid(),'admin') OR (public.has_role(auth.uid(),'baba') AND public.is_member(auth.uid()))));
CREATE POLICY "diary update" ON public.diary_entries FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR (public.has_role(auth.uid(),'baba') AND public.is_member(auth.uid())))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR (public.has_role(auth.uid(),'baba') AND public.is_member(auth.uid())));
CREATE POLICY "diary delete" ON public.diary_entries FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR (user_id = auth.uid() AND public.has_role(auth.uid(),'baba') AND created_at > now() - interval '15 minutes'));

CREATE OR REPLACE FUNCTION public.guard_diary_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN
    -- staff may only close an open sleep entry
    IF OLD.kind <> 'sono' OR OLD.ended_at IS NOT NULL THEN RAISE EXCEPTION 'Sem permissão'; END IF;
    NEW.kind := OLD.kind; NEW.data := OLD.data; NEW.at := OLD.at; NEW.user_id := OLD.user_id; NEW.created_at := OLD.created_at;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_guard_diary BEFORE UPDATE ON public.diary_entries FOR EACH ROW EXECUTE FUNCTION public.guard_diary_update();

CREATE POLICY "staff request items" ON public.shopping_items FOR INSERT TO authenticated
  WITH CHECK (public.is_member(auth.uid()) AND product_id IS NULL AND added_by = auth.uid() AND status = 'aberto');

ALTER TABLE public.settings ADD COLUMN note_chips jsonb NOT NULL DEFAULT '{"alimentacao":["Comeu tudo","Comeu metade","Comeu pouco","Recusou"],"geral":["Tudo certo","Faltou produto"]}'::jsonb;
ALTER TABLE public.settings ADD COLUMN diary_options jsonb NOT NULL DEFAULT '{"fralda":["Xixi","Cocô","Ambos"],"refeicao_tipo":["Café","Almoço","Lanche","Jantar","Mamadeira"],"refeicao_qtd":["Tudo","Metade","Pouco","Recusou"],"humor":["😊","😐","😢"],"remedio":["Antitérmico","Vitamina","Outro"],"banho":["Banho completo","Só higiene"]}'::jsonb;
