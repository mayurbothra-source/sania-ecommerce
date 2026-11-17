import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabasePublic } from '@/lib/supabase';
import { AT, RT } from '@/lib/adminAuth';

export async function POST(req: Request) {
  const p = z.object({ email: z.string().email(), password: z.string().min(1) }).safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: 'Enter email and password' }, { status: 400 });
  const allowed = (process.env.ADMIN_EMAILS || '').split(',').map((s) => s.trim().toLowerCase());
  const email = p.data.email.toLowerCase();
  const { data, error } = await supabasePublic().auth.signInWithPassword({ email, password: p.data.password });
  // same message for wrong password and non-admin: don't reveal which
  if (error || !data.session || !allowed.includes(email)) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  const o = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/' };
  res.cookies.set(AT, data.session.access_token, { ...o, maxAge: data.session.expires_in });
  res.cookies.set(RT, data.session.refresh_token, { ...o, maxAge: 60 * 60 * 24 * 30 });
  return res;
}
