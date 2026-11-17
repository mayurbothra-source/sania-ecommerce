'use client';
import { useState } from 'react';
import Logo from '@/components/Logo';

export default function Login() {
  const [email, setE] = useState(''); const [password, setP] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  async function go(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    if (r.ok) location.href = '/admin'; else { setErr((await r.json()).error); setBusy(false); }
  }
  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <div className="mb-6 text-center"><Logo /><p className="mt-2 text-sm">Admin sign in</p></div>
      <form onSubmit={go} className="card space-y-4">
        <div><label className="label">Email</label><input type="email" required className="input" value={email} onChange={(e) => setE(e.target.value)} autoComplete="username" /></div>
        <div><label className="label">Password</label><input type="password" required className="input" value={password} onChange={(e) => setP(e.target.value)} autoComplete="current-password" /></div>
        {err && <p role="alert" className="text-sm text-rosedeep">{err}</p>}
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  );
}
