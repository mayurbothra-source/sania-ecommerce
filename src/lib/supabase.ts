import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'anon';

/** Public client: subject to RLS (read-only catalogue). */
export const supabasePublic = () => createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });

/** Service-role client: SERVER ONLY. Bypasses RLS. Never import from client components. */
export const supabaseAdmin = () => {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
};
