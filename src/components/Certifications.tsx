import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Award, ZoomIn } from 'lucide-react';
import Reveal from '@/components/Reveal';
import { useLang } from '@/contexts/LanguageContext';
import cert1 from '@/assets/certificates/1.webp';
import cert2 from '@/assets/certificates/2.webp';
import cert3 from '@/assets/certificates/3.webp';
import cert4 from '@/assets/certificates/4.webp';
import cert5 from '@/assets/certificates/5.webp';
import cert6 from '@/assets/certificates/6.webp';

const getCertificates = (t: (en: string, ur: string) => string) => [
  { src: cert1, title: t('Punjab Food Authority License', 'پنجاب فوڈ اتھارٹی لائسنس'), issuer: t('PFA — Govt. of Punjab', 'PFA — حکومتِ پنجاب') },
  { src: cert2, title: t('ISO 9001:2015 Quality Management', 'ISO 9001:2015 کوالٹی مینجمنٹ'), issuer: 'MR Group Certification' },
  { src: cert3, title: t('SABIC Food-Grade Material Certificate', 'SABIC فوڈ گریڈ میٹیریل سرٹیفکیٹ'), issuer: 'Saudi Basic Industries' },
  { src: cert4, title: t('SES Traders FDA-Compliant Bottles', 'SES Traders کی FDA کے مطابق بوتلیں'), issuer: 'US FDA 21 CFR Compliant' },
  { src: cert5, title: t('HMCA Halal Certification', 'HMCA حلال سرٹیفکیشن'), issuer: 'Halal Montreal Authority' },
  { src: cert6, title: t('PCRWR Water Quality Lab Report', 'PCRWR واٹر کوالٹی لیب رپورٹ'), issuer: t('Govt. of Pakistan — Ministry of Water Resources', 'حکومتِ پاکستان — وزارتِ آبی وسائل') },
];

export default function Certifications() {
  const [open, setOpen] = useState<number | null>(null);
  const { t } = useLang();
  const certificates = getCertificates(t);

  return (
    <section id="certifications" className="py-16 bg-gradient-to-b from-background via-water-ice/20 to-background scroll-mt-20">
      <div className="container mx-auto px-4">
        <Reveal className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-4">
            <Award className="w-4 h-4 text-accent" />
            <span className="text-sm font-semibold text-accent">{t('Legalization & Compliance', 'لائسنس اور سرٹیفکیشن')}</span>
          </div>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-3">
            {t('Certified by', 'متعلقہ')} <span className="text-primary">{t('Authorities', 'اداروں سے سرٹیفائیڈ')}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t(
              'Every certification represents our unwavering commitment to purity, safety, and trust. Tap any certificate to view the full document.',
              'ہر سرٹیفکیٹ صفائی، حفاظت اور اعتماد کے ساتھ ہماری پکی وابستگی کا ثبوت ہے۔ پورا ڈاکومنٹ دیکھنے کے لیے کسی بھی سرٹیفکیٹ پر ٹیپ کریں۔',
            )}
          </p>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          {certificates.map((cert, i) => (
            <Reveal key={i} delay={i * 80} direction="scale">
              <button
                onClick={() => setOpen(i)}
                className="group relative w-full aspect-[3/4] rounded-2xl overflow-hidden glass-card hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-2"
              >
                <img
                  src={cert.src}
                  alt={cert.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-start">
                  <div className="flex items-center gap-1.5 text-primary-foreground/80 text-xs mb-1">
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>{t('Click to view', 'دیکھنے کے لیے کلک کریں')}</span>
                  </div>
                  <p className="text-sm font-bold text-primary-foreground leading-tight">{cert.title}</p>
                  <p className="text-[11px] text-primary-foreground/70 mt-0.5">{cert.issuer}</p>
                </div>
                {/* Always-visible caption strip */}
                <div className="absolute bottom-0 left-0 right-0 bg-background/85 backdrop-blur-sm px-3 py-2 border-t border-border/50 group-hover:opacity-0 transition-opacity">
                  <p className="text-xs font-semibold text-foreground truncate">{cert.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{cert.issuer}</p>
                </div>
                {/* Corner ribbon */}
                <div className="absolute top-3 end-3 w-9 h-9 rounded-full water-gradient flex items-center justify-center shadow-lg">
                  <Award className="w-4 h-4 text-primary-foreground" />
                </div>
              </button>
            </Reveal>
          ))}
        </div>

        <Dialog open={open !== null} onOpenChange={() => setOpen(null)}>
          <DialogContent className="max-w-3xl p-3 bg-background/95 backdrop-blur-xl max-h-[90vh] overflow-y-auto">
            <DialogTitle className="px-2 pt-1 pb-2 text-base">
              {open !== null ? certificates[open].title : t('Certificate', 'سرٹیفکیٹ')}
              {open !== null && (
                <span className="block text-xs font-normal text-muted-foreground mt-0.5">
                  {certificates[open].issuer}
                </span>
              )}
            </DialogTitle>
            {open !== null && (
              <>
                <img
                  src={certificates[open].src}
                  alt={certificates[open].title}
                  className="w-full h-auto rounded-lg border border-border"
                />
                <div className="flex justify-end pt-2">
                  <a
                    href={certificates[open].src}
                    download
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                  >
                    {t('Download original', 'اصل فائل ڈاؤن لوڈ کریں')}
                  </a>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
