import { NextResponse } from 'next/server';
import { AT, RT } from '@/lib/adminAuth';
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AT, '', { path: '/', maxAge: 0 }); res.cookies.set(RT, '', { path: '/', maxAge: 0 });
  return res;
}
