'use client';
export default function LogoutButton() {
  return <button className="text-burgundy/70" onClick={async () => { await fetch('/api/admin/logout', { method: 'POST' }); location.href = '/admin/login'; }}>Sign out</button>;
}
