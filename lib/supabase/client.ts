import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xojpmzxnvjojenicmvib.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvanBtenhudmpvamVuaWNtdmliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5ODg2NTAsImV4cCI6MjEwMzU2NDY1MH0.CzckS-2IoSVSburZLfhbBOJEOz4LiXIgqbdwyCm_R-0'
  );
}
