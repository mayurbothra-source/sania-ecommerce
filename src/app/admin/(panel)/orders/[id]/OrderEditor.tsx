'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ORDER_STATUSES } from '@/lib/types';

export default function OrderEditor(p: { id: string; status: string; courier: string; tracking: string; note: string }) {
  const router = useRouter();
  const [status, setS] = useState(p.status), [courier, setC] = useState(p.courier), [tracking, setT] = useState(p.tracking), [note, setN] = useState(p.note), [msg, setMsg] = useState('');
  async function save(over?: string) {
    if (over === 'Cancelled' && !confirm('Cancel this order? Stock will be returned. Refund must be issued in Razorpay.')) return;
    const r = await fetch(`/api/admin/orders/${p.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: over || status, courier, tracking_no: tracking, admin_note: note }) });
    const d = await r.json(); setMsg(r.ok ? 'Saved' : 'Error: ' + d.error); if (r.ok) { if (over) setS(over); router.refresh(); }
  }
  return (
    <div className="card mt-4 grid gap-4 md:grid-cols-2">
      <div><label className="label">Order status</label><select className="input" value={status} onChange={(e) => setS(e.target.value)}>{ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
      <div><label className="label">Courier</label><input className="input" value={courier} onChange={(e) => setC(e.target.value)} /></div>
      <div><label className="label">Tracking number</label><input className="input" value={tracking} onChange={(e) => setT(e.target.value)} /></div>
      <div><label className="label">Internal note</label><input className="input" value={note} onChange={(e) => setN(e.target.value)} /></div>
      <div className="flex flex-wrap items-center gap-3 md:col-span-2"><button className="btn-primary" onClick={() => save()}>Save</button>
        {status !== 'Cancelled' && <button className="btn-outline" onClick={() => save('Cancelled')}>Cancel order</button>}{msg && <span className="text-sm">{msg}</span>}</div>
    </div>
  );
}
