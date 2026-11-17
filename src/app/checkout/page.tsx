'use client';
import Script from 'next/script';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart';
import { usePricedCart } from '@/lib/usePricedCart';
import OrderSummary from '@/components/OrderSummary';

declare global { interface Window { Razorpay: new (o: Record<string, unknown>) => { open(): void; on(e: string, cb: (r: { error?: { description?: string } }) => void): void } } }

const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh','Chandigarh','Puducherry','Andaman & Nicobar','Dadra & Nagar Haveli and Daman & Diu','Lakshadweep'];

export default function Checkout() {
  const { items, clear } = useCart();
  const { priced, loading } = usePricedCart();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [f, setF] = useState({ name: '', mobile: '', email: '', address: '', city: '', state: '', pincode: '' });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  async function pay(e: React.FormEvent) {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      const r = await fetch('/api/checkout/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items, customer: f }) });
      const d = await r.json();
      if (!r.ok) { setErr(d.error + (d.lines ? ': ' + d.lines.filter((l: { error?: string }) => l.error).map((l: { code: string; error: string }) => `${l.code} – ${l.error}`).join('; ') : '')); setBusy(false); return; }
      const rz = new window.Razorpay({
        key: d.key, amount: d.amount, currency: 'INR', name: 'SANIA', description: `Order ${d.orderNo}`, order_id: d.razorpayOrderId,
        prefill: { name: f.name, email: f.email, contact: f.mobile }, theme: { color: '#6b2a3f' },
        handler: async (resp: Record<string, string>) => {
          // Browser callback is NOT proof of payment: the server verifies the signature.
          const v = await fetch('/api/checkout/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(resp) });
          const vd = await v.json();
          if (v.ok) { clear(); router.push(`/order/${vd.orderNo}?rid=${resp.razorpay_order_id}`); }
          else { setErr('We could not verify your payment. If money was deducted, it will be confirmed automatically or refunded; contact us with order ' + d.orderNo + '.'); setBusy(false); }
        },
        modal: { ondismiss: () => { fetch('/api/checkout/fail', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ razorpay_order_id: d.razorpayOrderId, status: 'cancelled' }) }); setBusy(false); setErr('Payment cancelled. Your cart is saved: you can try again.'); } },
      });
      rz.on('payment.failed', (x) => { fetch('/api/checkout/fail', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ razorpay_order_id: d.razorpayOrderId, status: 'failed' }) }); setErr('Payment failed: ' + (x.error?.description || 'please try again')); });
      rz.open();
    } catch { setErr('Something went wrong. Please try again.'); setBusy(false); }
  }

  if (!priced) return <p className="p-10 text-center">Loading…</p>;
  if (!priced.lines.length) return <div className="px-4 py-20 text-center"><h1 className="text-4xl">Your cart is empty</h1><Link href="/shop" className="btn-primary mt-6">Shop now</Link></div>;
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <h1 className="text-4xl">Checkout</h1>
      <div className="mt-6 grid gap-8 md:grid-cols-[1fr_380px]">
        <form onSubmit={pay} className="card space-y-4">
          <div><label className="label">Full name</label><input required minLength={2} className="input" value={f.name} onChange={set('name')} autoComplete="name" /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label">Mobile number</label><input required pattern="[6-9][0-9]{9}" inputMode="numeric" maxLength={10} className="input" value={f.mobile} onChange={set('mobile')} autoComplete="tel-national" title="10-digit Indian mobile number" /></div>
            <div><label className="label">Email</label><input required type="email" className="input" value={f.email} onChange={set('email')} autoComplete="email" /></div>
          </div>
          <div><label className="label">Complete delivery address</label><textarea required minLength={8} rows={3} className="input" value={f.address} onChange={set('address')} autoComplete="street-address" /></div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div><label className="label">City</label><input required className="input" value={f.city} onChange={set('city')} autoComplete="address-level2" /></div>
            <div><label className="label">State</label><select required className="input" value={f.state} onChange={set('state')}><option value="">Select</option>{STATES.map((s) => <option key={s}>{s}</option>)}</select></div>
            <div><label className="label">PIN code</label><input required pattern="[0-9]{6}" inputMode="numeric" maxLength={6} className="input" value={f.pincode} onChange={set('pincode')} autoComplete="postal-code" /></div>
          </div>
          {err && <p role="alert" className="rounded bg-rose/40 p-3 text-sm text-burgundy">{err}</p>}
          <button className="btn-primary w-full" disabled={busy || loading || !priced.ok}>{busy ? 'Please wait…' : `Pay securely ₹${priced.total.toLocaleString('en-IN')}`}</button>
          <p className="text-center text-xs text-[#2b2024]/60">Payments are processed by Razorpay. We never see or store your card details.</p>
          {!priced.ok && <p className="text-sm text-rosedeep">Some items are unavailable. <Link href="/cart" className="underline">Review cart</Link></p>}
        </form>
        <OrderSummary priced={priced} />
      </div>
    </div>
  );
}
