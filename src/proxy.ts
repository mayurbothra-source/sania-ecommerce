import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Silently refreshes the admin session (access token cookie expires hourly; refresh token lasts 30 days).
export async function proxy(req: NextRequest) {
  const at = req.cookies.get('sania_at')?.value;
  const rt = req.cookies.get('sania_rt')?.value;
  if (at || !rt) return NextResponse.next();
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data } = await sb.auth.refreshSession({ refresh_token: rt });
  if (!data.session) return NextResponse.next();
  req.cookies.set('sania_at', data.session.access_token);
  const res = NextResponse.next({ request: { headers: req.headers } });
  const opts = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/' };
  res.cookies.set('sania_at', data.session.access_token, { ...opts, maxAge: data.session.expires_in });
  res.cookies.set('sania_rt', data.session.refresh_token, { ...opts, maxAge: 60 * 60 * 24 * 30 });
  return res;
}
export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] };
