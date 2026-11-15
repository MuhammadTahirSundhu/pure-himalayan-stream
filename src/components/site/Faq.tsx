import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { pkr } from '@/lib/pricing';
import JsonLd from './JsonLd';

interface QA { q: string; a: string; link?: { to: string; label: string } }

export function useFaqs(): QA[] {
  const { settings } = useSiteSettings();
  const deposit = settings.delivery_info.bottle_deposit;
  const cities = settings.service_areas.cities.join(', ');
  const wallets = settings.payment_accounts.map((a) => a.label);
  const payText = wallets.length
    ? `Cash on delivery, or ${wallets.join(' / ')} transfer — upload the payment screenshot at checkout.`
    : 'Cash on delivery. Pay the rider when your water arrives.';
  return useMemo(() => [
    { q: 'Where do you deliver?', a: `We currently deliver across all of ${cities}. We're expanding to more cities in Pakistan — tell us your city and we'll let you know when we arrive.`, link: { to: '/contact#waitlist', label: 'Join the city waitlist' } },
    { q: 'How does the 19L bottle deposit work?', a: `A new 19L bottle has a one-time refundable deposit of ${pkr(deposit)}. If you hand back an empty One Water bottle, you only pay for the water — no deposit. Return the bottle any time to get your deposit back.` },
    { q: 'How do I pay?', a: payText },
    { q: 'Is One Water Himalayan or spring water?', a: 'No — and we think honesty matters. One Water is produced at our own plant in Gujranwala. Every litre goes through a 10-stage process including reverse osmosis, UV and ozone treatment, with essential minerals added back for taste and balance.', link: { to: '/quality', label: 'See the 10-stage process' } },
    { q: 'Is the water lab-tested?', a: 'Yes. Our water is tested by PCRWR (Pakistan Council of Research in Water Resources). You can view the lab report and our certificates on the Quality page.', link: { to: '/quality#certifications', label: 'View certificates' } },
    { q: 'Can I get a regular weekly delivery?', a: 'Yes. Choose weekly, every 2 weeks or monthly when you order 19L bottles and we’ll confirm your delivery day on WhatsApp. There are no automatic charges — you pay per delivery.' },
    { q: 'Do you supply offices, shops and events?', a: 'Yes — offices, schools, shops, weddings and events. Send us your quantity and date and we’ll share a bulk quote.', link: { to: '/events', label: 'Get a bulk quote' } },
  ], [deposit, cities, payText]);
}

export default function Faq({ withSchema = true }: { withSchema?: boolean }) {
  const faqs = useFaqs();
  const [open, setOpen] = useState<number | null>(0);
  const schema = useMemo(() => [{
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }], [faqs]);

  return (
    <div className="max-w-3xl mx-auto space-y-3">
      {withSchema && <JsonLd data={schema} />}
      {faqs.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.q} className="ow-card overflow-hidden">
            <button
              className="w-full flex items-center justify-between gap-4 p-5 text-left"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
            >
              <h3 className="font-semibold text-white">{f.q}</h3>
              <ChevronDown className={`w-5 h-5 shrink-0 ow-cyan transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className="grid transition-all duration-300 ease-out" style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}>
              <div className="overflow-hidden">
                <p className="px-5 pb-5 ow-muted leading-relaxed">
                  {f.a}{' '}
                  {f.link && <Link to={f.link.to} className="ow-cyan font-medium hover:underline whitespace-nowrap">{f.link.label} →</Link>}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

