import { supabaseAdmin } from '@/lib/supabase';
import Testimonials from './Testimonials';
export default async function Page() {
  const { data } = await supabaseAdmin().from('testimonials').select('*').order('sort_order');
  return <><h1 className="text-3xl">Testimonials</h1><p className="mb-4 text-sm">Shown on the home page. Only add real customer reviews.</p><Testimonials initial={data || []} /></>;
}
