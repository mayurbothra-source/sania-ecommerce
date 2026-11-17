import { WHATSAPP, waLink } from '@/lib/utils';
export default function WhatsAppButton() {
  if (!WHATSAPP) return null;
  return <a href={waLink('Hi SANIA, I have a question')} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp"
    className="fixed bottom-4 right-4 z-40 rounded-full bg-[#25D366] px-4 py-3 text-sm font-medium text-white shadow-lg">WhatsApp</a>;
}
