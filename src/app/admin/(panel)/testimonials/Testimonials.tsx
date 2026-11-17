'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type T = { id?: string; name: string; city: string | null; quote: string; is_active: boolean };
const H = { 'Content-Type': 'application/json' };

export default function Testimonials({ initial }: { initial: (T & { id: string })[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<T>({ name: '', city: '', quote: '', is_active: true });
  const save = async (t: T) => { const r = await fetch('/api/admin/testimonials', { method: 'POST', headers: H, body: JSON.stringify(t) }); if (r.ok) { setDraft({ name: '', city: '', quote: '', is_active: true }); router.refresh(); } };
  const del = async (id: string) => { if (confirm('Delete?')) { await fetch(`/api/admin/testimonials?id=${id}`, { method: 'DELETE' }); router.refresh(); } };
  return (
    <div className="max-w-2xl space-y-4">
      <div className="card space-y-3">
        <input className="input" placeholder="Customer name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        <input className="input" placeholder="City (optional)" value={draft.city || ''} onChange={(e) => setDraft({ ...draft, city: e.target.value })} />
        <textarea className="input" rows={3} placeholder="Review" value={draft.quote} onChange={(e) => setDraft({ ...draft, quote: e.target.value })} />
        <button className="btn-primary" onClick={() => save(draft)} disabled={!draft.name || draft.quote.length < 3}>Add testimonial</button>
      </div>
      {initial.map((t) => (
        <div key={t.id} className="card text-sm"><p>“{t.quote}”</p><p className="mt-1 text-burgundy">— {t.name}{t.city ? `, ${t.city}` : ''}{!t.is_active && ' (hidden)'}</p>
          <div className="mt-2 flex gap-4 underline"><button onClick={() => save({ ...t, is_active: !t.is_active })}>{t.is_active ? 'Hide' : 'Show'}</button><button className="text-rosedeep" onClick={() => del(t.id)}>Delete</button></div></div>
      ))}
    </div>
  );
}
