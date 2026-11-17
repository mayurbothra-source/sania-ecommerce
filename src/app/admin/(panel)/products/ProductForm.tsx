'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Img, Product } from '@/lib/types';
import { SIZE_PRESETS } from '@/lib/types';
import { img } from '@/lib/utils';

type SizeRow = { size: string; stock: number; enabled: boolean };
const j = { 'Content-Type': 'application/json' };

/** Resize to max 1600px and re-encode as WebP before upload (smaller, faster, still sharp). */
async function shrink(file: File): Promise<File> {
  const bmp = await createImageBitmap(file);
  const s = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas'); c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
  const blob: Blob | null = await new Promise((r) => c.toBlob(r, 'image/webp', 0.85));
  return blob ? new File([blob], file.name.replace(/\.\w+$/, '') + '.webp', { type: 'image/webp' }) : file;
}

export default function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const [f, setF] = useState({
    code: product?.code || '', name: product?.name || '', collection: product?.collection || 'Long Cotton Kurtis', tagline: product?.tagline || '', description: product?.description || '',
    fabric: product?.fabric || 'Soft cotton', fit: product?.fit || 'Straight', sleeve: product?.sleeve || '3/4 sleeve', length: product?.length || 'Long kurti, side slits', colour: product?.colour || '',
    mrp: product?.mrp?.toString() || '', price: product?.price?.toString() || '',
    is_active: product?.is_active ?? true, is_featured: product?.is_featured ?? false, is_new: product?.is_new ?? false, out_of_stock: product?.out_of_stock ?? false,
  });
  const [sizes, setSizes] = useState<SizeRow[]>([...(product?.product_sizes || [])].sort((a, b) => a.sort_order - b.sort_order).map(({ size, stock, enabled }) => ({ size, stock, enabled })));
  const [images, setImages] = useState<Img[]>([...(product?.product_images || [])].sort((a, b) => Number(b.is_main) - Number(a.is_main) || a.sort_order - b.sort_order));
  const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<{ file: File; url: string; kind: Img['kind']; replaceId?: string } | null>(null);
  const t = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const chk = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.checked });

  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg('');
    const body = { ...f, mrp: f.mrp === '' ? null : Number(f.mrp), price: f.price === '' ? null : Number(f.price), sizes };
    const r = await fetch(product ? `/api/admin/products/${product.id}` : '/api/admin/products', { method: product ? 'PUT' : 'POST', headers: j, body: JSON.stringify(body) });
    const d = await r.json(); setBusy(false);
    if (!r.ok) { setMsg('Error: ' + d.error); return; }
    if (!product) router.push(`/admin/products/${d.id}`); else { setMsg('Saved'); router.refresh(); }
  }
  async function remove(hard: boolean) {
    if (!product || !confirm(hard ? 'Permanently delete this product and its images? Past orders keep their details.' : 'Hide this product from the shop?')) return;
    await fetch(`/api/admin/products/${product.id}${hard ? '?hard=1' : ''}`, { method: 'DELETE' });
    router.push('/admin/products'); router.refresh();
  }
  const setSize = (i: number, p: Partial<SizeRow>) => setSizes(sizes.map((s, n) => (n === i ? { ...s, ...p } : s)));
  const addSize = (size: string) => size && !sizes.some((s) => s.size === size) && setSizes([...sizes, { size, stock: 0, enabled: true }]);

  async function confirmUpload() {
    if (!preview || !product) return; setBusy(true); setMsg('Uploading…');
    try {
      const fd = new FormData(); fd.append('file', await shrink(preview.file));
      const up = await fetch('/api/admin/upload', { method: 'POST', body: fd }); const u = await up.json();
      if (!up.ok) throw new Error(u.error);
      if (preview.replaceId) {
        await fetch(`/api/admin/products/${product.id}/images`, { method: 'PATCH', headers: j, body: JSON.stringify({ imageId: preview.replaceId, url: u.url, kind: preview.kind }) });
        setImages(images.map((m) => (m.id === preview.replaceId ? { ...m, url: u.url, kind: preview.kind } : m)));
      } else {
        const r = await fetch(`/api/admin/products/${product.id}/images`, { method: 'POST', headers: j, body: JSON.stringify({ url: u.url, kind: preview.kind }) });
        setImages([...images, await r.json()]);
      }
      setMsg('Image saved'); setPreview(null);
    } catch (e) { setMsg('Error: ' + (e as Error).message); }
    setBusy(false);
  }
  async function imgAction(id: string, a: 'main' | 'delete') {
    if (!product) return;
    if (a === 'delete') { if (!confirm('Delete this image?')) return; await fetch(`/api/admin/products/${product.id}/images?imageId=${id}`, { method: 'DELETE' }); setImages(images.filter((m) => m.id !== id)); router.refresh(); }
    else { await fetch(`/api/admin/products/${product.id}/images`, { method: 'PATCH', headers: j, body: JSON.stringify({ imageId: id, main: true }) }); setImages(images.map((m) => ({ ...m, is_main: m.id === id })).sort((a, b) => Number(b.is_main) - Number(a.is_main))); }
  }
  const pick = (kind: Img['kind'], replaceId?: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (file) setPreview({ file, url: URL.createObjectURL(file), kind, replaceId }); e.target.value = '';
  };

  return (
    <div className="space-y-8">
      <form onSubmit={save} className="space-y-6">
        <div className="card grid gap-4 md:grid-cols-2">
          <div><label className="label">Product code</label><input required className="input" value={f.code} onChange={t('code')} /></div>
          <div><label className="label">Product name</label><input required className="input" value={f.name} onChange={t('name')} /></div>
          <div><label className="label">Tagline</label><input className="input" value={f.tagline} onChange={t('tagline')} /></div>
          <div><label className="label">Colour</label><input className="input" value={f.colour} onChange={t('colour')} /></div>
          <div className="md:col-span-2"><label className="label">Description</label><textarea rows={3} className="input" value={f.description} onChange={t('description')} /></div>
          <div><label className="label">Fabric</label><input className="input" value={f.fabric} onChange={t('fabric')} /></div>
          <div><label className="label">Fit</label><input className="input" value={f.fit} onChange={t('fit')} /></div>
          <div><label className="label">Sleeve</label><input className="input" value={f.sleeve} onChange={t('sleeve')} /></div>
          <div><label className="label">Length</label><input className="input" value={f.length} onChange={t('length')} /></div>
        </div>
        <div className="card grid gap-4 md:grid-cols-3">
          <div><label className="label">MRP (₹)</label><input type="number" min="0" step="1" className="input" value={f.mrp} onChange={t('mrp')} /></div>
          <div><label className="label">Selling price (₹)</label><input type="number" min="0" step="1" className="input" value={f.price} onChange={t('price')} /></div>
          <div className="self-end text-sm">{f.mrp && f.price && Number(f.mrp) > Number(f.price) ? `Discount: ${Math.round((1 - Number(f.price) / Number(f.mrp)) * 100)}% off` : 'No discount'}</div>
          <p className="text-xs md:col-span-3">Discount is calculated automatically from MRP and selling price. Customers pay the selling price. A product can’t be bought until a price and an in-stock size are set.</p>
        </div>
        <div className="card">
          <h2 className="text-2xl">Sizes &amp; stock</h2>
          <div className="mt-3 space-y-2">
            {sizes.map((s, i) => (
              <div key={s.size} className="flex flex-wrap items-center gap-3 text-sm">
                <b className="w-12">{s.size}</b>
                <input type="number" min="0" className="input w-24" value={s.stock} onChange={(e) => setSize(i, { stock: Math.max(0, Math.floor(Number(e.target.value))) })} aria-label={`Stock for ${s.size}`} />
                <span>pieces</span>
                <label className="flex items-center gap-1"><input type="checkbox" checked={s.enabled} onChange={(e) => setSize(i, { enabled: e.target.checked })} /> Available</label>
                <button type="button" className="text-rosedeep underline" onClick={() => setSizes(sizes.filter((_, n) => n !== i))}>Remove</button>
              </div>
            ))}
            {!sizes.length && <p className="text-sm">No sizes yet. Add some below.</p>}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">{SIZE_PRESETS.filter((p) => !sizes.some((s) => s.size === p)).map((p) => <button key={p} type="button" className="rounded border border-burgundy px-3 py-1 text-sm" onClick={() => addSize(p)}>+ {p}</button>)}</div>
        </div>
        <div className="card flex flex-wrap gap-6 text-sm">
          <label><input type="checkbox" checked={f.is_active} onChange={chk('is_active')} /> Visible in shop</label>
          <label><input type="checkbox" checked={f.is_featured} onChange={chk('is_featured')} /> Featured on home page</label>
          <label><input type="checkbox" checked={f.is_new} onChange={chk('is_new')} /> New arrival</label>
          <label><input type="checkbox" checked={f.out_of_stock} onChange={chk('out_of_stock')} /> Mark out of stock</label>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="btn-primary" disabled={busy}>{product ? 'Save changes' : 'Create product'}</button>
          {product && <><button type="button" className="btn-outline" onClick={() => remove(false)}>Hide product</button><button type="button" className="text-sm text-rosedeep underline" onClick={() => remove(true)}>Delete permanently</button></>}
          {msg && <span role="status" className="text-sm">{msg}</span>}
        </div>
      </form>

      {product && (
        <div className="card">
          <h2 className="text-2xl">Photographs</h2>
          <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-4">
            {images.map((m) => (
              <div key={m.id} className="text-xs">
                <img src={img(m.url, 300)} alt="" className="aspect-[3/4] w-full rounded object-cover" />
                <p className="mt-1">{m.kind}{m.is_main && ' · MAIN'}</p>
                <div className="flex flex-wrap gap-x-3 underline">
                  {!m.is_main && <button type="button" onClick={() => imgAction(m.id, 'main')}>Make main</button>}
                  <label className="cursor-pointer">Replace<input type="file" accept="image/*" className="hidden" onChange={pick(m.kind, m.id)} /></label>
                  <button type="button" className="text-rosedeep" onClick={() => imgAction(m.id, 'delete')}>Delete</button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            {(['front', 'back', 'gallery'] as const).map((k) => <label key={k} className="btn-outline cursor-pointer">+ Add {k} photo<input type="file" accept="image/*" className="hidden" onChange={pick(k)} /></label>)}
          </div>
          {preview && (
            <div className="mt-4 flex items-start gap-4 rounded border border-burgundy p-3">
              <img src={preview.url} alt="Preview" className="h-40 rounded" />
              <div className="text-sm"><p>Preview: {preview.replaceId ? 'replacing' : 'adding'} <b>{preview.kind}</b> photo. It will be resized and optimised automatically.</p>
                <div className="mt-3 flex gap-3"><button className="btn-primary" disabled={busy} onClick={confirmUpload}>Save image</button><button className="btn-outline" onClick={() => setPreview(null)}>Cancel</button></div></div>
            </div>
          )}
          <p className="mt-3 text-xs">New uploads are stored on Cloudinary. The original catalogue photos are bundled with the site.</p>
        </div>
      )}
    </div>
  );
}
