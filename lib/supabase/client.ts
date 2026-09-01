import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createClient() {
  // SECURITY: env-only config - no hardcoded project URL/key in source.
  // Set NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );
}
