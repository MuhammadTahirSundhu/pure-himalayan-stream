import { CheckCircle2, Download, Droplets, ShieldCheck, Award, FlaskConical, Factory } from 'lucide-react';
import { qualityResults, labReport, qualityParameterUr } from '@/data/products';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import PurificationPipeline from '@/components/PurificationPipeline';
import Certifications from '@/components/Certifications';
import PageHero from '@/components/site/PageHero';
import SectionHeading from '@/components/site/SectionHeading';
import Reveal from '@/components/Reveal';
import Seo from '@/components/site/Seo';
import Gallery from '@/components/site/Gallery';
import { CardGrid, StatCard } from '@/components/site/Cards';
import labReportImage from '@/assets/certificates/6.webp';
import { useLang } from '@/contexts/LanguageContext';

export default function Quality() {
  const { settings } = useSiteSettings();
  const reportUrl = settings.lab_report_url || labReportImage;
  const { t, isUrdu } = useLang();

  const HIGHLIGHTS = [
    { key: 'ph', label: 'pH', value: '7.8', note: t('WHO range 6.5–8.5', 'WHO حد 6.5–8.5') },
    { key: 'tds', label: 'TDS', value: '130', note: t('mg/L · WHO limit 1000', 'mg/L · WHO حد 1000') },
    { key: 'sodium', label: t('Sodium', 'سوڈیم'), value: '20', note: t('mg/L · WHO limit 200', 'mg/L · WHO حد 200') },
    { key: 'ecoli', label: t('E. coli', 'ای کولائی'), value: '0', note: 'CFU/100ml' },
  ];

  return (
    <div className="ow-page">
      <Seo
        path="/quality"
      />
      <PageHero
        eyebrow={<><ShieldCheck className="w-4 h-4" /> {t('Quality & Purity', 'کوالٹی اور خالص پن')}</>}
        title={isUrdu ? <>ٹیسٹ شدہ، سرٹیفائیڈ، <span className="ow-gradient-text">کچھ بھی چھپا نہیں</span></> : <>Tested, certified, <span className="ow-gradient-text">nothing hidden</span></>}
        subtitle={t('One Water is produced at our own plant in Gujranwala. Here is exactly how we purify it — and what the lab found.', 'ون واٹر گوجرانوالہ میں ہمارے اپنے پلانٹ پر تیار ہوتا ہے۔ یہاں بالکل واضح ہے کہ ہم اسے کیسے صاف کرتے ہیں — اور لیب نے کیا پایا۔')}
      />

      <section className="py-10">
        <div className="container mx-auto px-4 max-w-5xl">
          <CardGrid cols={4} compactMobile>
            {HIGHLIGHTS.map((h) => <StatCard key={h.key} value={h.value} label={h.label} note={h.note} />)}
          </CardGrid>
          <p className="text-center text-xs ow-subtle mt-4">{t('Source:', 'ماخذ:')} <bdi>{labReport.lab}</bdi>{t(', ', '، ')}{t('report', 'رپورٹ')} <bdi>{labReport.code}</bdi>{t(', ', '، ')}<bdi>{labReport.reported}</bdi>{t('.', '۔')}</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <SectionHeading
            eyebrow={<><Droplets className="w-4 h-4" /> {t('Purification journey', 'صفائی کا سفر')}</>}
            title={isUrdu ? <>ہمارا <span className="ow-gradient-text">10 مراحل</span> کا عمل</> : <>Our <span className="ow-gradient-text">10-stage</span> process</>}
            subtitle={t('Every litre is filtered, purified by reverse osmosis, mineral-balanced and disinfected before it is sealed.', 'سیل ہونے سے پہلے ہر لیٹر فلٹر کیا جاتا ہے، آر او (RO) سے صاف کیا جاتا ہے، اس میں منرلز متوازن کیے جاتے ہیں اور جراثیم سے پاک کیا جاتا ہے۔')}
          />
          <PurificationPipeline />
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Reveal className="ow-card p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start">
            <Factory className="w-10 h-10 ow-cyan shrink-0" />
            <div>
              <h2 className="font-heading font-bold text-2xl text-white mb-2">{t('Where does One Water come from?', 'ون واٹر کہاں سے آتا ہے؟')}</h2>
              <p className="ow-muted leading-relaxed">
                {t(
                  "We don't bottle mountain springs or glaciers — and we won't pretend to. One Water is purified at our own plant at Green Valley Phase 1, Gujranwala. Reverse osmosis removes impurities, then essential minerals are added back so the water tastes clean and balanced. We publish our independent lab results below so you can judge for yourself.",
                  'ہم پہاڑی چشموں یا گلیشیئرز کا پانی بوتلوں میں نہیں بھرتے — اور نہ ہی ایسا ظاہر کریں گے۔ ون واٹر گرین ویلی فیز 1، گوجرانوالہ میں ہمارے اپنے پلانٹ پر صاف کیا جاتا ہے۔ آر او (RO) سے گندگی نکالی جاتی ہے، پھر ضروری منرلز دوبارہ شامل کیے جاتے ہیں تاکہ پانی کا ذائقہ صاف اور متوازن ہو۔ ہم اپنے آزاد لیب کے نتائج نیچے شائع کرتے ہیں تاکہ آپ خود فیصلہ کر سکیں۔',
                )}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <Gallery />

      <div style={{ background: 'linear-gradient(180deg, #030d1a 0%, #041422 50%, #030d1a 100%)' }}>
        <Certifications />
      </div>

      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <SectionHeading
            eyebrow={<><FlaskConical className="w-4 h-4" /> {t('Independent lab test', 'آزاد لیب ٹیسٹ')}</>}
            title={isUrdu ? <>PCRWR <span className="ow-gradient-text">لیب کے نتائج</span></> : <>PCRWR <span className="ow-gradient-text">lab results</span></>}
            subtitle={isUrdu ? <>”{labReport.remarkUr}“ — <bdi>{labReport.lab}</bdi></> : `“${labReport.remark}” — ${labReport.lab}`}
          />
          <Reveal className="ow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(59,130,246,0.1))' }}>
                    <th scope="col" className="text-start font-bold text-white p-4">{t('Parameter', 'پیمانہ')}</th>
                    <th scope="col" className="text-start font-bold text-white p-4">{t('Highest desirable level', 'زیادہ سے زیادہ مطلوبہ حد')}</th>
                    <th scope="col" className="text-start font-bold text-white p-4">{t('One Water', 'ون واٹر')}</th>
                    <th scope="col" className="hidden sm:table-cell text-end font-bold text-white p-4">{t('Status', 'نتیجہ')}</th>
                  </tr>
                </thead>
                <tbody>
                  {qualityResults.map((row, i) => (
                    <tr key={row.parameter} style={{ background: i % 2 ? 'rgba(255,255,255,0.015)' : 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(0,212,255,0.06)' }}>
                      <th scope="row" className="text-start font-medium text-white p-3 sm:p-4">{isUrdu ? (qualityParameterUr[row.parameter] ?? row.parameter) : row.parameter}</th>
                      <td className="p-4 ow-muted">{row.allowedMax.startsWith('No') ? t(row.allowedMax, 'کوئی حد مقرر نہیں') : <bdi>{row.allowedMax} {row.unit}</bdi>}</td>
                      <td className="p-4 font-semibold ow-cyan"><bdi>{row.actual} {row.unit}</bdi></td>
                      <td className="hidden sm:table-cell p-4 text-end"><span className="inline-flex items-center gap-1 font-medium text-emerald-400"><CheckCircle2 className="w-4 h-4" /> {t('Pass', 'پاس')}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
          <Reveal className="text-center mt-10 flex flex-wrap gap-3 justify-center">
            <a href={reportUrl} target="_blank" rel="noopener noreferrer" className="ow-btn"><Download className="w-5 h-5" /> {t('View the full lab report', 'مکمل لیب رپورٹ دیکھیں')}</a>
            <a href="#certifications" className="ow-btn-ghost"><Award className="w-5 h-5" /> {t('View all certificates', 'تمام سرٹیفکیٹ دیکھیں')}</a>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
