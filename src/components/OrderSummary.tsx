import { img, inr } from '@/lib/utils';
import type { Priced } from '@/lib/usePricedCart';

export default function OrderSummary({ priced }: { priced: Priced }) {
  return (
    <div className="card">
      <h2 className="text-2xl">Order summary</h2>
      <ul className="mt-3 divide-y divide-rose/50">
        {priced.lines.map((l) => (
          <li key={l.productId + l.size} className="flex gap-3 py-3 text-sm">
            {l.image && <img src={img(l.image, 120)} alt="" className="h-16 w-12 rounded object-cover" />}
            <div className="flex-1"><p className="font-medium">{l.code} · {l.name}</p><p className="text-[#2b2024]/70">Size {l.size} × {l.qty}</p></div>
            <p>{inr(l.lineTotal)}</p>
          </li>
        ))}
      </ul>
      <dl className="mt-3 space-y-1 text-sm">
        <div className="flex justify-between"><dt>Subtotal</dt><dd>{inr(priced.subtotal)}</dd></div>
        <div className="flex justify-between"><dt>Shipping</dt><dd>{priced.shipping ? inr(priced.shipping) : 'Free'}</dd></div>
        <div className="flex justify-between border-t border-rose/60 pt-2 text-base font-medium text-burgundy"><dt>Total payable</dt><dd>{inr(priced.total)}</dd></div>
      </dl>
    </div>
  );
}
