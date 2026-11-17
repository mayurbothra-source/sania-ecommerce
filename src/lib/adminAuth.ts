import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { supabasePublic } from './supabase';

export const AT = 'sania_at', RT = 'sania_rt';
const allowed = () => (process.env.ADMIN_EMAILS || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);

/** Returns the admin's email if the session cookie belongs to an allow-listed Supabase user. */
export async function getAdmin(): Promise<string | null> {
  const at = (await cookies()).get(AT)?.value;
  if (!at) return null;
  const { data, error } = await supabasePublic().auth.getUser(at);
  const email = data.user?.email?.toLowerCase();
  if (error || !email || !allowed().includes(email)) return null;
  return email;
}
export async function requireAdminPage() { if (!(await getAdmin())) redirect('/admin/login'); }
/** For API routes: returns a 401 response if not admin, else null. */
export async function guardApi() {
  return (await getAdmin()) ? null : NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
