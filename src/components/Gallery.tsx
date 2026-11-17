'use client';
import { useState } from 'react';
import { img } from '@/lib/utils';

export default function Gallery({ images, alt }: { images: { id: string; url: string; kind: string }[]; alt: string }) {
  const [i, setI] = useState(0);
  if (!images.length) return <div className="aspect-[3/4] rounded bg-rose/30" />;
  return (
    <div>
      <div className="aspect-[3/4] overflow-hidden rounded bg-rose/30"><img src={img(images[i].url, 1000)} alt={`${alt} - ${images[i].kind}`} className="h-full w-full object-cover" /></div>
      {images.length > 1 && <div className="mt-3 flex gap-2 overflow-x-auto">
        {images.map((m, n) => <button key={m.id} onClick={() => setI(n)} aria-label={`View ${m.kind}`} className={`h-20 w-16 shrink-0 overflow-hidden rounded border-2 ${n === i ? 'border-burgundy' : 'border-transparent'}`}><img src={img(m.url, 160)} alt="" className="h-full w-full object-cover" /></button>)}
      </div>}
    </div>
  );
}
