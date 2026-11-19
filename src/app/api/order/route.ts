import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sheetMode } from '@/lib/sheet';

// Reduces one size's quantity by 1 in the Google Sheet (via the Apps Script web app).
// The Apps Script URL and secret stay on the server.
export async function POST(req: Request) {
  if (!sheetMode()) return NextResponse.json({ ok: false, error: 'Not enabled' }, { status: 404 });
  const p = z.object({ sku: z.string().trim().min(1).max(40), size: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL']) }).safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  try {
    const r = await fetch(process.env.SHEET_URL!, {
      method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, cache: 'no-store', signal: AbortSignal.timeout(15000),
      body: JSON.stringify({ ...p.data, secret: process.env.SHEET_SECRET || undefined }),
    });
    const j = await r.json();
    return NextResponse.json(j, { status: j.ok ? 200 : 409 });
  } catch {
    return NextResponse.json({ ok: false, error: 'Could not reach the stock sheet. Please try again.' }, { status: 502 });
  }
}
