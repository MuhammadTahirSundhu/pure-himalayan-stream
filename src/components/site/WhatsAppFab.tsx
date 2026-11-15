import { useLocation } from 'react-router-dom';
import { Phone, Droplets } from 'lucide-react';
import { Link } from 'react-router-dom';
import WhatsAppIcon from './WhatsAppIcon';
import { useSiteSettings, whatsappLink, telLink } from '@/hooks/useSiteSettings';

/**
 * Desktop: floating WhatsApp button. Mobile: sticky bottom bar with the three
 * actions Pakistani customers actually use — order, WhatsApp, call.
 */
export default function WhatsAppFab() {
  const { settings } = useSiteSettings();
  const { pathname } = useLocation();
  if (pathname.startsWith('/checkout')) return null;
  const wa = whatsappLink(settings.contact_info.whatsapp, 'Assalam o Alaikum One Water! I would like to order water.');

  return (
    <>
      <a
        href={wa} target="_blank" rel="noopener noreferrer" aria-label="Order on WhatsApp"
        className="hidden md:flex fixed bottom-6 right-6 z-40 items-center gap-2 rounded-full pl-4 pr-5 py-3 font-semibold text-white animate-soft-pulse transition-transform hover:scale-105"
        style={{ background: '#25d366' }}
      >
        <WhatsAppIcon className="w-6 h-6" /> Order on WhatsApp
      </a>

      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 grid grid-cols-[1fr_auto_auto] gap-2 p-3"
        style={{ background: 'rgba(3,13,26,0.94)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(0,212,255,0.18)', paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
        <Link to="/delivery" className="ow-btn !py-3 !px-4 text-sm"><Droplets className="w-4 h-4" /> Order 19L</Link>
        <a href={wa} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-12 rounded-xl text-white" style={{ background: '#25d366' }} aria-label="WhatsApp us">
          <WhatsAppIcon className="w-6 h-6" />
        </a>
        <a href={telLink(settings.contact_info.phone)} className="flex items-center justify-center w-12 rounded-xl text-white" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(0,212,255,0.25)' }} aria-label="Call us">
          <Phone className="w-5 h-5" />
        </a>
      </div>
    </>
  );
}
