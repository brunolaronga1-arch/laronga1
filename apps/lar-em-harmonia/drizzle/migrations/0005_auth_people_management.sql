ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone_e164 text,
  ADD COLUMN IF NOT EXISTS blocked boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS revoked_at timestamptz,
  ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_sign_in_at timestamptz;

UPDATE public.profiles SET phone_e164 = CASE
  WHEN length(regexp_replace(phone,'\D','','g')) IN (10,11) THEN '+55' || regexp_replace(phone,'\D','','g')
  WHEN length(regexp_replace(phone,'\D','','g')) IN (12,13) AND regexp_replace(phone,'\D','','g') LIKE '55%' THEN '+' || regexp_replace(phone,'\D','','g')
  ELSE NULL END
WHERE phone_e164 IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_e164_key ON public.profiles (phone_e164) WHERE phone_e164 IS NOT NULL;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles r JOIN public.profiles p ON p.id = r.user_id
    WHERE r.user_id = _user_id AND r.role = _role AND p.active AND NOT p.blocked AND p.revoked_at IS NULL)
$$;
CREATE OR REPLACE FUNCTION public.is_member(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND active AND NOT blocked AND revoked_at IS NULL)
$$;
CREATE OR REPLACE FUNCTION public.my_kind(_user_id uuid)
RETURNS public.member_kind LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT kind FROM public.profiles WHERE id = _user_id AND active AND NOT blocked AND revoked_at IS NULL
$$;

CREATE TABLE public.auth_attempts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  phone text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('login','recovery')),
  success boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX auth_attempts_lookup ON public.auth_attempts (phone, kind, created_at DESC);
GRANT ALL ON public.auth_attempts TO service_role;
ALTER TABLE public.auth_attempts ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.member_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  target_id uuid,
  action text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX member_audit_created ON public.member_audit (created_at DESC);
GRANT SELECT ON public.member_audit TO authenticated;
GRANT ALL ON public.member_audit TO service_role;
ALTER TABLE public.member_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read audit" ON public.member_audit FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.revoke_user_sessions(_user_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
  DELETE FROM auth.sessions WHERE user_id = _user_id;
$$;
REVOKE ALL ON FUNCTION public.revoke_user_sessions(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_user_sessions(uuid) TO service_role;
