'use client';
import { useState } from 'react';
import { ORDER_STATUSES } from '@/lib/types';
import { inr } from '@/lib/utils';

type R = { order_no: string; status: string; payment_status: string; total: number; courier: string | null; tracking_no: string | null; order_items: { name: string; code: string; size: string; qty: number }[] };

export default function Track() {
  const [orderNo, setO] = useState(''); const [mobile, setM] = useState('');
  const [r, setR] = useState<R | null>(null); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  async function go(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(''); setR(null);
    const res = await fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderNo, mobile }) });
    const d = await res.json(); setBusy(false);
    res.ok ? setR(d) : setErr(d.error);
  }
  const steps = ORDER_STATUSES.filter((s) => s !== 'Cancelled');
  const idx = r ? steps.indexOf(r.status as (typeof steps)[number]) : -1;
  return (
    <div className="mx-auto max-w-xl px-4 py-14">
      <h1 className="text-4xl">Track your order</h1>
      <form onSubmit={go} className="card mt-6 space-y-4">
        <div><label className="label">Order ID</label><input required className="input" placeholder="SAN250101-ABCD" value={orderNo} onChange={(e) => setO(e.target.value)} /></div>
        <div><label className="label">Mobile number</label><input required pattern="[0-9]{10}" maxLength={10} inputMode="numeric" className="input" value={mobile} onChange={(e) => setM(e.target.value)} /></div>
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Checking…' : 'Check status'}</button>
        {err && <p role="alert" className="text-sm text-rosedeep">{err}</p>}
      </form>
      {r && (
        <div className="card mt-6">
          <p className="text-sm">Order <b>{r.order_no}</b> · {inr(r.total)}</p>
          {r.payment_status !== 'paid' && r.payment_status !== 'paid_stock_issue' && r.status !== 'Cancelled' && <p className="mt-2 text-sm text-rosedeep">Payment status: {r.payment_status}</p>}
          {r.status === 'Cancelled' ? <p className="mt-4 rounded bg-rose/40 p-3 text-burgundy">This order was cancelled.</p> :
            <ol className="mt-4 space-y-2">{steps.map((s, i) => <li key={s} className={`flex items-center gap-3 text-sm ${i <= idx ? 'text-burgundy' : 'text-[#2b2024]/40'}`}><span className={`h-3 w-3 rounded-full ${i <= idx ? 'bg-burgundy' : 'bg-rose'}`} />{s}{i === idx && <b> (current)</b>}</li>)}</ol>}
          {(r.courier || r.tracking_no) && <p className="mt-4 text-sm">Courier: {r.courier || '—'} · Tracking: {r.tracking_no || '—'}</p>}
          <ul className="mt-4 list-disc pl-5 text-sm">{r.order_items.map((i, n) => <li key={n}>{i.code} {i.name} · {i.size} × {i.qty}</li>)}</ul>
        </div>
      )}
    </div>
  );
}
