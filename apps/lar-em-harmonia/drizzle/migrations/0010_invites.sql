CREATE TABLE public.invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text NOT NULL UNIQUE,
  kind public.member_kind NOT NULL,
  expected_name text,
  expected_phone_e164 text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  used_by uuid,
  revoked_at timestamptz
);
GRANT ALL ON public.invites TO service_role;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
-- No policies: invites are only read/written by server functions (service role).
COMMENT ON TABLE public.invites IS 'One-time sign-up invites; only the SHA-256 of the token is stored.';

ALTER TABLE public.auth_attempts DROP CONSTRAINT auth_attempts_kind_check;
ALTER TABLE public.auth_attempts ADD CONSTRAINT auth_attempts_kind_check CHECK (kind = ANY (ARRAY['login','recovery','invite','invite_ip']));
