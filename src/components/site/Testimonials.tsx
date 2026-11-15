import { Star, Quote } from 'lucide-react';
import { useTestimonials } from '@/hooks/useContent';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import SectionHeading from './SectionHeading';
import Reveal from '@/components/Reveal';
import { useLang } from '@/contexts/LanguageContext';

/** Real reviews entered by the owner. Renders nothing until there are some. */
export default function Testimonials() {
  const { data = [] } = useTestimonials();
  const { settings } = useSiteSettings();
  const { t: tr } = useLang();
  const SOURCE: Record<string, string> = {
    google: tr('Google review', 'گوگل ریویو'),
    whatsapp: tr('via WhatsApp', 'واٹس ایپ کے ذریعے'),
    facebook: tr('Facebook review', 'فیس بک ریویو'),
    'in-person': tr('Customer', 'کسٹمر'),
  };
  if (!data.length) return null;
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <SectionHeading eyebrow={<><Star className="w-4 h-4" /> {tr('Reviews', 'ریویوز')}</>} title={<>{tr('What Gujranwala', 'گوجرانوالہ')} <span className="ow-gradient-text">{tr('says about us', 'ہمارے بارے میں کیا کہتا ہے')}</span></>} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {data.slice(0, 6).map((t, i) => (
            <Reveal key={t.id} delay={i * 80} className="h-full">
              <figure className="ow-card ow-card-hover p-6 h-full flex flex-col">
                <Quote className="w-7 h-7 ow-cyan opacity-60" />
                {t.rating && (
                  <div className="flex gap-0.5 mt-3" aria-label={tr(`${t.rating} out of 5 stars`, `5 میں سے ${t.rating} اسٹار`)}>
                    {Array.from({ length: 5 }, (_, k) => <Star key={k} className={`w-4 h-4 ${k < t.rating! ? 'text-yellow-300 fill-yellow-300' : 'text-white/20'}`} />)}
                  </div>
                )}
                <blockquote dir="auto" className="text-white/90 leading-relaxed mt-3 flex-1">“{t.text}”</blockquote>
                <figcaption className="mt-4 text-sm">
                  <span className="text-white font-semibold">{t.name}</span>
                  <span className="ow-subtle">{t.area ? ` · ${t.area}` : ''}{t.source && SOURCE[t.source] ? ` · ${SOURCE[t.source]}` : ''}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
        {settings.google_review_url && (
          <p className="text-center mt-8"><a href={settings.google_review_url} target="_blank" rel="noopener noreferrer" className="ow-btn-ghost !rounded-full"><Star className="w-4 h-4 text-yellow-300" /> {tr('Read & write reviews on Google', 'گوگل پر ریویوز پڑھیں اور لکھیں')}</a></p>
        )}
      </div>
    </section>
  );
}
