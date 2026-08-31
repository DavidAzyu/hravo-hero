# Supabase dashboard setup (RLS)

I can't sign in to your Supabase dashboard from here (it needs your browser
login), so this folder contains a **copy-paste SQL script** and the exact steps
to run it yourself. It takes under a minute.

## What to do

1. Go to **https://supabase.com/dashboard** and sign in.
2. Open your HRAVO project. (Project ref starts with `xojpmzxnvjojenicmvib`.)
3. Click **SQL Editor** in the left sidebar.
4. Click **New query**.
5. Open the file **`rls-setup.sql`** in this folder, select all, copy.
6. Paste it into the SQL editor.
7. Click **Run** (or press Ctrl+Enter).

You should see notices like `RLS enabled on transactions` and
`Permissive anon policies created on transactions`. If a table "not found -
skipped", that's fine (it just means that table isn't created in your database
yet).

## What that script does

- Turns **Row Level Security ON** for every table the app uses:
  `inventory`, `vehicle_inventory`, `staff_profiles`, `customer_profiles`,
  `transactions`, `service_bookings`, `insurance`, `cash_ledger`,
  `finance_journal`, `capital_accounts`, `loans`, `loan_payments`,
  `vendor_payables`, `expenses`, `assets`, `bills`, `parts_inventory`.
- Creates **permissive anon policies** so the app keeps working exactly as it
  does today.

> ⚠️ Important note: because your app currently talks to Supabase using only
> the public **anon key** (it has its own password logins inside the pages), if
> we lock tables down now without auth, every page would break. That's why the
> script adds permissive policies — it's a safe baseline, not the final
> security layer.

## Verify it worked

- Supabase left sidebar → **Authentication → Policies**
- You should see "RLS enforced" on each table and one policy named
  `hravo_anon_...` per table.

## What's next for real security (recommended)

The current login is only visual — anyone can open the browser console and call
your Supabase API directly. True protection = **Supabase Auth**:

1. Ask me to refactor the app so Admin/Staff/Customer logins create real
   Supabase auth users (`signInWithPassword`) and send the user's JWT instead
   of the anon key.
2. Then we run the **LOCKDOWN** SQL at the bottom of `rls-setup.sql`
   (authenticated-only policies) together.
3. Optionally add per-role policies (e.g. only `Admin` can delete) using the
   staff role column + `auth.uid()`.

I can do step 1 as a follow-up whenever you want — it touches the login flows
in `app/page.tsx`, `app/staff/page.tsx`, `app/customer/page.tsx` and the
Supabase client config, but I'll walk you through it and recompile the build to
verify.