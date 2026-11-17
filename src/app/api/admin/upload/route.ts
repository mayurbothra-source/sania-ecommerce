import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { guardApi } from '@/lib/adminAuth';

// Signed server-side upload to Cloudinary. The API secret never reaches the browser.
// The browser also shrinks images (max 1600px WebP) first; Cloudinary then serves f_auto,q_auto variants.
export async function POST(req: Request) {
  const g = await guardApi(); if (g) return g;
  const { CLOUDINARY_CLOUD_NAME: cloud, CLOUDINARY_API_KEY: key, CLOUDINARY_API_SECRET: secret } = process.env;
  if (!cloud || !key || !secret) return NextResponse.json({ error: 'Cloudinary is not configured' }, { status: 500 });
  const file = (await req.formData()).get('file');
  if (!(file instanceof File) || !file.type.startsWith('image/') || file.size > 8 * 1024 * 1024)
    return NextResponse.json({ error: 'Please upload an image under 8 MB' }, { status: 400 });
  const timestamp = String(Math.floor(Date.now() / 1000)), folder = 'sania/products';
  const signature = crypto.createHash('sha1').update(`folder=${folder}&timestamp=${timestamp}${secret}`).digest('hex');
  const fd = new FormData();
  fd.append('file', file); fd.append('api_key', key); fd.append('timestamp', timestamp); fd.append('folder', folder); fd.append('signature', signature);
  const r = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: 'POST', body: fd });
  const j = await r.json();
  if (!r.ok) return NextResponse.json({ error: j.error?.message || 'Upload failed' }, { status: 502 });
  return NextResponse.json({ url: j.secure_url });
}
