import { Star, Quote } from 'lucide-react';
import { useTestimonials } from '@/hooks/useContent';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import SectionHeading from './SectionHeading';
import Reveal from '@/components/Reveal';

const SOURCE = { google: 'Google review', whatsapp: 'via WhatsApp', facebook: 'Facebook review', 'in-person': 'Customer' } as Record<string, string>;

/** Real reviews entered by the owner. Renders nothing until there are some. */
export default function Testimonials() {
  const { data = [] } = useTestimonials();
  const { settings } = useSiteSettings();
  if (!data.length) return null;
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <SectionHeading eyebrow={<><Star className="w-4 h-4" /> Reviews</>} title={<>What Gujranwala <span className="ow-gradient-text">says about us</span></>} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {data.slice(0, 6).map((t, i) => (
            <Reveal key={t.id} delay={i * 80} className="h-full">
              <figure className="ow-card ow-card-hover p-6 h-full flex flex-col">
                <Quote className="w-7 h-7 ow-cyan opacity-60" />
                {t.rating && (
                  <div className="flex gap-0.5 mt-3" aria-label={`${t.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }, (_, k) => <Star key={k} className={`w-4 h-4 ${k < t.rating! ? 'text-yellow-300 fill-yellow-300' : 'text-white/20'}`} />)}
                  </div>
                )}
                <blockquote className="text-white/90 leading-relaxed mt-3 flex-1">“{t.text}”</blockquote>
                <figcaption className="mt-4 text-sm">
                  <span className="text-white font-semibold">{t.name}</span>
                  <span className="ow-subtle">{t.area ? ` · ${t.area}` : ''}{t.source && SOURCE[t.source] ? ` · ${SOURCE[t.source]}` : ''}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
        {settings.google_review_url && (
          <p className="text-center mt-8"><a href={settings.google_review_url} target="_blank" rel="noopener noreferrer" className="ow-btn-ghost !rounded-full"><Star className="w-4 h-4 text-yellow-300" /> Read & write reviews on Google</a></p>
        )}
      </div>
    </section>
  );
}
