-- ============================================================================
-- HRAVO HERO - SECURITY HARDENING
-- ============================================================================
-- HOW TO RUN:
--   1. Open https://supabase.com/dashboard and sign in
--   2. Open your project
--   3. Go to "SQL Editor" (left sidebar) -> "New query"
--   4. Paste THIS ENTIRE FILE into the editor
--   5. Click "Run" (or press Ctrl+Enter)
--
-- Run supabase/rls-setup.sql FIRST if you never ran it (this file assumes RLS
-- is already enabled on the app tables). This file is idempotent - safe to
-- run multiple times.
--
-- WHAT THIS DOES:
--   1. Creates admin_config (RLS ON, no public policies) storing the admin
--      password as a bcrypt HASH - never plaintext, never in the client bundle.
--   2. Creates server-side verification RPCs so password checks stop happening
--      (and shipping) in the browser:
--        * verify_admin_password(p_password)          -> boolean
--        * verify_staff_login(p_phone, p_password)    -> jsonb {ok, reason, profile}
--        * verify_customer_login(p_phone, p_password) -> jsonb {ok, reason, profile}
--   3. Blocks public SELECT on the staff_profiles.password column (column-level
--      grants), so the public anon key can no longer read staff passwords.
--
-- AFTER RUNNING THIS FILE:
--   * CHANGE the admin password immediately (the seed below uses the old known
--     password so the app keeps working). In SQL Editor run:
--         SELECT public.set_admin_password('YourNewStrongPasswordHere');
--     (this function is NOT callable by the website - admin only)
--   * Then remove NEXT_PUBLIC_ADMIN_PASSWORD from .env.local and from your
--     Vercel/production env vars.
--   * The app code detects these RPCs automatically and uses them for login.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1) pgcrypto (bcrypt)
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- 2) admin_config - stores ONLY a bcrypt hash. RLS ON + no policies + revoked
--    grants => anon/authenticated cannot read or write it.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_config (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  password_hash text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_config ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_config FROM anon, authenticated;

-- Seed with a hash of the current password so login keeps working right away.
-- >>> CHANGE IT IMMEDIATELY after running this file (see header comments). <<<
INSERT INTO public.admin_config (id, password_hash)
SELECT 1, crypt('hravo123', gen_salt('bf', 10))
WHERE NOT EXISTS (SELECT 1 FROM public.admin_config WHERE id = 1);

-- ----------------------------------------------------------------------------
-- 3) Change the admin password (postgres/service_role ONLY - the website
--    cannot call this; EXECUTE is revoked from anon/authenticated).
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_admin_password(p_new_password text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions
AS $$
BEGIN
  IF p_new_password IS NULL OR length(trim(p_new_password)) < 10 THEN
    RAISE EXCEPTION 'Password too short - minimum 10 characters';
  END IF;
  INSERT INTO public.admin_config (id, password_hash)
  VALUES (1, crypt(trim(p_new_password), gen_salt('bf', 10)))
  ON CONFLICT (id) DO UPDATE
    SET password_hash = EXCLUDED.password_hash, updated_at = now();
END;
$$;
REVOKE ALL ON FUNCTION public.set_admin_password(text) FROM PUBLIC, anon, authenticated;

-- ----------------------------------------------------------------------------
-- 4) Admin password verification (used by the website login)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.verify_admin_password(p_password text)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER SET search_path = public, extensions STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_config
    WHERE id = 1 AND password_hash = crypt(p_password, password_hash)
  );
$$;
REVOKE ALL ON FUNCTION public.verify_admin_password(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_admin_password(text) TO anon, authenticated;

-- ----------------------------------------------------------------------------
-- 5) Staff login - verifies server-side, returns the profile WITHOUT password.
--    Legacy behavior preserved: staff with no saved password can log in.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.verify_staff_login(p_phone text, p_password text)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions STABLE
AS $$
DECLARE
  rec RECORD;
  v_saved text;
BEGIN
  SELECT * INTO rec FROM public.staff_profiles
  WHERE phone = p_phone ORDER BY created_at DESC LIMIT 1;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_found');
  END IF;
  v_saved := COALESCE(trim(to_jsonb(rec) ->> 'password'), '');
  IF v_saved <> '' THEN
    IF p_password IS NULL OR trim(p_password) <> v_saved THEN
      RETURN jsonb_build_object('ok', false, 'reason', 'bad_pass');
    END IF;
  END IF;
  RETURN jsonb_build_object('ok', true, 'profile', to_jsonb(rec) - 'password');
END;
$$;
REVOKE ALL ON FUNCTION public.verify_staff_login(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_staff_login(text, text) TO anon, authenticated;

-- ----------------------------------------------------------------------------
-- 6) Customer login - verifies server-side (password = last 4 digits of phone).
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.verify_customer_login(p_phone text, p_password text)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions STABLE
AS $$
DECLARE
  rec RECORD;
BEGIN
  SELECT * INTO rec FROM public.customer_profiles
  WHERE phone = p_phone ORDER BY created_at DESC LIMIT 1;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_found');
  END IF;
  IF p_password IS DISTINCT FROM right(p_phone, 4) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'bad_pass');
  END IF;
  RETURN jsonb_build_object('ok', true, 'profile', to_jsonb(rec) - 'password');
END;
$$;
REVOKE ALL ON FUNCTION public.verify_customer_login(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_customer_login(text, text) TO anon, authenticated;

-- ----------------------------------------------------------------------------
-- 7) staff_profiles column lockdown - the password column becomes unreadable
--    with the public anon key. Non-password columns stay readable so the
--    admin/staff lists keep working.
-- ----------------------------------------------------------------------------
REVOKE SELECT ON public.staff_profiles FROM anon, authenticated;

DO $$
DECLARE
  c text;
  allowed text[] := ARRAY['id', 'staff_name', 'phone', 'role', 'salary', 'address', 'created_at'];
  granted text := '';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'staff_profiles') THEN
    RAISE NOTICE 'staff_profiles not found - skipped';
    RETURN;
  END IF;
  FOREACH c IN ARRAY allowed LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'staff_profiles' AND column_name = c
    ) THEN
      granted := granted || (CASE WHEN granted = '' THEN '' ELSE ', ' END) || c;
    END IF;
  END LOOP;
  IF granted <> '' THEN
    EXECUTE format('GRANT SELECT (%s) ON public.staff_profiles TO anon, authenticated', granted);
    RAISE NOTICE 'staff_profiles readable columns granted: %', granted;
  END IF;
END $$;

COMMIT;

-- ============================================================================
-- DONE. Now:
--   1) SELECT public.set_admin_password('YourNewStrongPasswordHere');
--   2) Remove NEXT_PUBLIC_ADMIN_PASSWORD from .env.local and Vercel env vars.
-- ============================================================================