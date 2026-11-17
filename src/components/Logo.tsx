export default function Logo({ light = false, className = '' }: { light?: boolean; className?: string }) {
  const c = light ? '#f7f0e8' : '#6b2a3f';
  return (
    <span className={`inline-flex items-center gap-2 ${className}`} aria-label="SANIA Cotton Kurtis">
      <svg width="22" height="30" viewBox="0 0 22 30" aria-hidden><path d="M11 1C11 1 2 11 2 19a9 9 0 0018 0C20 11 11 1 11 1z" fill={c} /><circle cx="11" cy="20" r="3" fill={light ? '#6b2a3f' : '#c9962b'} /></svg>
      <span className="font-serif text-2xl tracking-[0.3em]" style={{ color: c }}>SANIA</span>
    </span>
  );
}
