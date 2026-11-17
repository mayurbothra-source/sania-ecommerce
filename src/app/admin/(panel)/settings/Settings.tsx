'use client';
import { useState } from 'react';
export default function Settings({ charge, free }: { charge: number; free: number }) {
  const [c, setC] = useState(String(charge)), [f, setF] = useState(String(free)), [msg, setMsg] = useState('');
  async function save(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shipping_charge: Number(c), free_shipping_above: Number(f) }) });
    setMsg(r.ok ? 'Saved' : 'Failed');
  }
  return (
    <form onSubmit={save} className="card mt-4 max-w-md space-y-4">
      <div><label className="label">Shipping charge per order (₹)</label><input type="number" min="0" className="input" value={c} onChange={(e) => setC(e.target.value)} /></div>
      <div><label className="label">Free shipping above order value (₹, 0 = never free)</label><input type="number" min="0" className="input" value={f} onChange={(e) => setF(e.target.value)} /></div>
      <button className="btn-primary">Save</button> {msg}
    </form>
  );
}
