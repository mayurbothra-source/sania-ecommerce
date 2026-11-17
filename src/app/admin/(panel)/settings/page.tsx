import { supabaseAdmin } from '@/lib/supabase';
import Settings from './Settings';
export default async function Page() {
  const { data } = await supabaseAdmin().from('settings').select('*');
  const m = Object.fromEntries((data || []).map((r) => [r.key, Number(r.value)]));
  return <><h1 className="text-3xl">Shipping charges</h1><Settings charge={m.shipping_charge || 0} free={m.free_shipping_above || 0} /></>;
}
