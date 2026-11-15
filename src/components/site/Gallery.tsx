import { useState } from 'react';
import { Camera, X } from 'lucide-react';
import { useGallery } from '@/hooks/useContent';
import SectionHeading from './SectionHeading';
import Reveal from '@/components/Reveal';
import { useLang } from '@/contexts/LanguageContext';

/** Real plant / team photos uploaded by the owner. Hidden until there are some. */
export default function Gallery({ title }: { title?: string }) {
  const { t } = useLang();
  const { data = [] } = useGallery();
  const [open, setOpen] = useState<number | null>(null);
  if (!data.length) return null;
  const current = open !== null ? data[open] : null;
  return (
    <section className="py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <SectionHeading eyebrow={<><Camera className="w-4 h-4" /> {t('Real photos', 'اصل تصاویر')}</>} title={title ?? t('Inside our plant', 'ہمارے پلانٹ کے اندر')} subtitle={t('No stock photos — this is where and how your water is made and delivered.', 'کوئی اسٹاک فوٹو نہیں — یہی وہ جگہ ہے جہاں اور جیسے آپ کا پانی تیار اور ڈیلیور ہوتا ہے۔')} />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {data.map((g, i) => (
            <Reveal key={g.id} delay={(i % 4) * 60} direction="scale">
              <button onClick={() => setOpen(i)} className="group relative block w-full aspect-square overflow-hidden rounded-2xl ow-card" aria-label={g.caption || t('Open photo', 'تصویر کھولیں')}>
                <img src={g.image_url} alt={g.caption || t('One Water plant photo', 'ون واٹر پلانٹ کی تصویر')} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                {g.caption && <span className="absolute inset-x-0 bottom-0 p-2 text-xs text-white text-start bg-gradient-to-t from-black/80 to-transparent">{g.caption}</span>}
              </button>
            </Reveal>
          ))}
        </div>
      </div>
      {current && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4" role="dialog" aria-modal="true" onClick={() => setOpen(null)}>
          <button className="absolute top-4 end-4 text-white p-2" aria-label={t('Close', 'بند کریں')}><X className="w-6 h-6" /></button>
          <figure className="max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <img src={current.image_url} alt={current.caption || ''} className="max-h-[80vh] w-auto mx-auto rounded-xl" />
            {current.caption && <figcaption className="text-center text-white/80 mt-3">{current.caption}</figcaption>}
          </figure>
        </div>
      )}
    </section>
  );
}
