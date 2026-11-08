CREATE OR REPLACE FUNCTION public.revoke_other_sessions(_user_id uuid, _keep uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
  DELETE FROM auth.sessions WHERE user_id = _user_id AND id IS DISTINCT FROM _keep;
$$;
REVOKE ALL ON FUNCTION public.revoke_other_sessions(uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_other_sessions(uuid, uuid) TO service_role;
