import { NextResponse } from 'next/server';
import { guardApi } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase';

const esc = (v: unknown) => { let s = String(v ?? ''); if (/^[=+\-@]/.test(s)) s = "'" + s; return `"${s.replace(/"/g, '""')}"`; };

export async function GET() {
  const g = await guardApi(); if (g) return g;
  const { data } = await supabaseAdmin().from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
  const head = ['Order ID', 'Date', 'Customer', 'Mobile', 'Email', 'Address', 'City', 'State', 'PIN', 'Items', 'Subtotal', 'Shipping', 'Total', 'Payment', 'Status', 'Razorpay Payment ID', 'Courier', 'Tracking'];
  const rows = (data || []).map((o) => [o.order_no, o.created_at, o.customer_name, o.mobile, o.email, o.address, o.city, o.state, o.pincode,
    (o.order_items || []).map((i: { code: string; size: string; qty: number }) => `${i.code} ${i.size} x${i.qty}`).join('; '),
    o.subtotal, o.shipping, o.total, o.payment_status, o.status, o.razorpay_payment_id, o.courier, o.tracking_no].map(esc).join(','));
  return new NextResponse([head.map(esc).join(','), ...rows].join('\n'), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="sania-orders.csv"' } });
}
