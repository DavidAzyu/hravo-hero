-- ============================================================================
-- HRAVO HERO - Row Level Security (RLS) setup
-- ============================================================================
-- HOW TO RUN:
--   1. Open https://supabase.com/dashboard  and sign in
--   2. Open your project
--   3. Go to "SQL Editor" (left sidebar) -> "New query"
--   4. Paste THIS ENTIRE FILE into the editor
--   5. Click "Run" (or press Ctrl+Enter)
--
-- WHAT THIS DOES:
--   * Turns ON "Row Level Security" for every table this app uses.
--   * Creates permissive read/write policies for the "anon" role, because the
--     app currently talks to Supabase ONLY with the public "anon" key (it has
--     its own password logins inside the pages). Without these policies the
--     app would show empty lists / fail to save, so DO NOT delete them yet.
--
--   ⚠️  IMPORTANT
--   RLS "on" + these permissive anon policies = same access as today.
--   It does NOT make your data private by itself. For real protection the app
--   must move to Supabase Auth, and then you replace these anon policies with
--   authenticated-only policies (see the commented LOCKDOWN section at the
--   bottom of this file). Ask me for the auth refactor when you're ready.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1) ENABLE ROW LEVEL SECURITY on every table (only if the table exists)
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'inventory',
    'vehicle_inventory',
    'staff_profiles',
    'customer_profiles',
    'transactions',
    'service_bookings',
    'insurance',
    'cash_ledger',
    'finance_journal',
    'capital_accounts',
    'loans',
    'loan_payments',
    'vendor_payables',
    'expenses',
    'assets',
    'bills',
    'parts_inventory'
  ] LOOP
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
      RAISE NOTICE 'RLS enabled on %', t;
    ELSE
      RAISE NOTICE 'Table % not found - skipped', t;
    END IF;
  END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- 2) PERMISSIVE ANON POLICIES  (keeps the current app working unchanged)
--    Re-runnable: drops + recreates the same-named policies every time.
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'inventory',
    'vehicle_inventory',
    'staff_profiles',
    'customer_profiles',
    'transactions',
    'service_bookings',
    'insurance',
    'cash_ledger',
    'finance_journal',
    'capital_accounts',
    'loans',
    'loan_payments',
    'vendor_payables',
    'expenses',
    'assets',
    'bills',
    'parts_inventory'
  ] LOOP
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t) THEN
      EXECUTE format('DROP POLICY IF EXISTS hravo_anon_select ON public.%I', t);
      EXECUTE format('CREATE POLICY hravo_anon_select ON public.%I FOR SELECT TO anon USING (true)', t);

      EXECUTE format('DROP POLICY IF EXISTS hravo_anon_insert ON public.%I', t);
      EXECUTE format('CREATE POLICY hravo_anon_insert ON public.%I FOR INSERT TO anon WITH CHECK (true)', t);

      EXECUTE format('DROP POLICY IF EXISTS hravo_anon_update ON public.%I', t);
      EXECUTE format('CREATE POLICY hravo_anon_update ON public.%I FOR UPDATE TO anon USING (true) WITH CHECK (true)', t);

      EXECUTE format('DROP POLICY IF EXISTS hravo_anon_delete ON public.%I', t);
      EXECUTE format('CREATE POLICY hravo_anon_delete ON public.%I FOR DELETE TO anon USING (true)', t);

      RAISE NOTICE 'Permissive anon policies created on %', t;
    END IF;
  END LOOP;
END $$;

COMMIT;

-- ============================================================================
-- 🔒 LOCKDOWN (DO NOT RUN YET)
-- ============================================================================
-- Use these ONLY after the app has been moved to Supabase Auth.
-- They replace "anyone can read/write" with "only logged-in users". Ask for
-- the app auth refactor first, then we run this together, table by table.
--
-- Example for the 'transactions' table:
--
--   DROP POLICY IF EXISTS hravo_anon_select ON public.transactions;
--   DROP POLICY IF EXISTS hravo_anon_insert ON public.transactions;
--   DROP POLICY IF EXISTS hravo_anon_update ON public.transactions;
--   DROP POLICY IF EXISTS hravo_anon_delete ON public.transactions;
--
--   CREATE POLICY "transactions_read_all" ON public.transactions
--     FOR SELECT TO authenticated USING (true);
--   CREATE POLICY "transactions_insert_all" ON public.transactions
--     FOR INSERT TO authenticated WITH CHECK (true);
--   CREATE POLICY "transactions_update_all" ON public.transactions
--     FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
--   CREATE POLICY "transactions_delete_admin" ON public.transactions
--     FOR DELETE TO authenticated
--     USING (
--       EXISTS (
--         SELECT 1 FROM public.staff_profiles sp
--         WHERE sp.phone = auth.jwt() ->> 'phone'
--           AND sp.role = 'Admin'
--       )
--     );
-- ============================================================================