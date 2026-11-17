import 'server-only';
import crypto from 'crypto';

const auth = () => 'Basic ' + Buffer.from(`${process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');

export async function createRazorpayOrder(amountPaise: number, receipt: string) {
  const r = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST', headers: { Authorization: auth(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: amountPaise, currency: 'INR', receipt, payment_capture: 1 }),
  });
  if (!r.ok) throw new Error('Razorpay order failed: ' + (await r.text()));
  return (await r.json()) as { id: string };
}
export async function fetchPayment(id: string) {
  const r = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(id)}`, { headers: { Authorization: auth() } });
  return r.ok ? ((await r.json()) as { status: string; amount: number; order_id: string; method?: string }) : null;
}
const safeEq = (a: string, b: string) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && crypto.timingSafeEqual(x, y); };
export function verifyCheckoutSignature(orderId: string, paymentId: string, sig: string) {
  const exp = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '').update(`${orderId}|${paymentId}`).digest('hex');
  return safeEq(exp, sig);
}
export function verifyWebhookSignature(rawBody: string, sig: string) {
  const exp = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '').update(rawBody).digest('hex');
  return !!process.env.RAZORPAY_WEBHOOK_SECRET && safeEq(exp, sig);
}
export const newOrderNo = () => {
  const d = new Date(), p = (n: number) => String(n).padStart(2, '0');
  const rnd = [...crypto.randomBytes(4)].map((b) => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 32]).join('');
  return `SAN${String(d.getFullYear()).slice(2)}${p(d.getMonth() + 1)}${p(d.getDate())}-${rnd}`;
};
