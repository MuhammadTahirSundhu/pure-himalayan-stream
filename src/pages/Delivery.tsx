import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Truck, RefreshCw, Wallet, ShieldCheck, Minus, Plus, Users, Calculator, ShoppingCart } from 'lucide-react';
import { useCart, type DeliverySchedule } from '@/contexts/CartContext';
import { useDispenserProduct } from '@/hooks/useProducts';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { pkr } from '@/lib/pricing';
import PageHero from '@/components/site/PageHero';
import SectionHeading from '@/components/site/SectionHeading';
import OrderBuilder from '@/components/site/OrderBuilder';
import Reveal from '@/components/Reveal';
import Seo from '@/components/site/Seo';
import ClosedNotice from '@/components/site/ClosedNotice';
import { MapPin } from 'lucide-react';
import { whatsappLink } from '@/hooks/useSiteSettings';
import { CardGrid, FeatureCard } from '@/components/site/Cards';
import { useLang } from '@/contexts/LanguageContext';
import bottle19l from '@/assets/brand/bottle-19l.webp';

// Well-known localities — the whole city is served, this list just helps people find theirs.
const GUJRANWALA_AREAS = [
  'Satellite Town', 'Model Town', 'DC Colony', 'Peoples Colony', 'Garden Town', 'Civil Lines', 'Wapda Town',
  'Citi Housing', 'Gujranwala Cantt', 'Rahwali', 'Green Valley', 'Sialkot Bypass', 'GT Road', 'Nowshera Road',
];

const SCHEDULE_IDS: DeliverySchedule[] = ['once', 'weekly', 'biweekly', 'monthly'];

function Stepper({ value, onChange, min = 0, max = 50, label }: { value: number; onChange: (n: number) => void; min?: number; max?: number; label: string }) {
  const { t } = useLang();
  return (
    <div className="flex items-center gap-3" role="group" aria-label={label}>
      <button type="button" className="ow-btn-ghost !p-2.5" onClick={() => onChange(Math.max(min, value - 1))} aria-label={t(`Decrease ${label}`, `${label} کم کریں`)}><Minus className="w-4 h-4" /></button>
      <span className="w-8 text-center text-xl font-bold text-white tabular-nums">{value}</span>
      <button type="button" className="ow-btn-ghost !p-2.5" onClick={() => onChange(Math.min(max, value + 1))} aria-label={t(`Increase ${label}`, `${label} بڑھائیں`)}><Plus className="w-4 h-4" /></button>
    </div>
  );
}

export default function Delivery() {
  const { t, isUrdu } = useLang();
  const { setItem, setSchedule, schedule, setIsOpen } = useCart();
  const { product, isLoading } = useDispenserProduct();
  const { settings } = useSiteSettings();
  const deposit = settings.delivery_info.bottle_deposit;
  const freeDelivery = !settings.delivery_info.charge_delivery;
  const cities = settings.service_areas.cities.join(', ');
  const citiesUr = settings.service_areas.cities.map((c) => (c === 'Gujranwala' ? 'گوجرانوالہ' : c)).join('، ');
  const scheduleLabels: Record<DeliverySchedule, string> = {
    once: t('One-time', 'ایک بار'),
    weekly: t('Weekly', 'ہر ہفتے'),
    biweekly: t('Every 2 weeks', 'ہر دو ہفتے'),
    monthly: t('Monthly', 'ہر مہینے'),
  };

  const [qty, setQty] = useState(2);
  const [empties, setEmpties] = useState(0);
  const [people, setPeople] = useState(4);
  const newBottles = Math.max(0, qty - empties);
  const price = product?.price ?? 0;

  // ~2.5 L/person/day for drinking + cooking ≈ 0.92 bottles/person/week
  const bottlesPerWeek = Math.max(1, Math.ceil((people * 2.5 * 7) / 19));

  const addToCart = () => {
    if (!product) return;
    setItem({ id: product.id, name: product.name, size: product.size, price: product.price, image: product.image, category: 'dispenser', quantity: qty, newBottles });
    setIsOpen(true);
  };

  return (
    <div className="ow-page">
      <Seo
        path="/delivery"
      />
      <PageHero
        eyebrow={<><Truck className="w-4 h-4" /> {t('19L Home & Office Delivery', '19 لیٹر — گھر اور دفتر ڈیلیوری')}</>}
        title={isUrdu ? <>19 لیٹر بوتلیں، <span className="ow-gradient-text">آپ کی دہلیز تک</span></> : <>19L bottles, <span className="ow-gradient-text">delivered to your door</span></>}
        subtitle={t(`Fresh 19-litre dispenser bottles anywhere in ${cities}. Exchange your empties and pay only for the water.`, `${citiesUr} میں کہیں بھی تازہ 19 لیٹر ڈسپنسر بوتلیں۔ اپنی خالی بوتلیں واپس کریں اور صرف پانی کی قیمت ادا کریں۔`)}
      />

      <section className="py-12">
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center max-w-5xl">
          <Reveal direction="left" className="flex justify-center relative">
            <div aria-hidden className="absolute inset-0 m-auto w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.2) 0%, transparent 70%)', filter: 'blur(24px)' }} />
            <img src={product?.image ?? bottle19l} alt={t('One Water 19 litre dispenser bottle', 'ون واٹر 19 لیٹر ڈسپنسر بوتل')} width={384} height={384} className="max-h-96 object-contain relative z-10 animate-bottle-bob drop-shadow-2xl" />
          </Reveal>

          <Reveal direction="right">
            {isLoading ? (
              <div className="ow-card p-8 animate-pulse h-96" />
            ) : product ? (
              <div className="ow-card p-6 md:p-8 space-y-6">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm ow-muted">{t('Price per 19L bottle', 'فی 19 لیٹر بوتل قیمت')}</p>
                    <p dir="ltr" className="font-heading font-black text-4xl text-white">{pkr(price)}</p>
                  </div>
                  {freeDelivery && <span className="text-xs font-bold px-3 py-1.5 rounded-full text-emerald-300" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)' }}>{t('Free delivery', 'فری ڈیلیوری')}</span>}
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <span className="ow-label">{t('Bottles per delivery', 'ہر ڈیلیوری میں بوتلیں')}</span>
                    <Stepper label={t('bottles', 'بوتلیں')} value={qty} min={1} onChange={(n) => { setQty(n); setEmpties((e) => Math.min(e, n)); }} />
                  </div>
                  <div>
                    <span className="ow-label">{t("Empty One Water bottles you'll return", 'ون واٹر کی خالی بوتلیں جو آپ واپس کریں گے')}</span>
                    <Stepper label={t('empty bottles', 'خالی بوتلیں')} value={empties} max={qty} onChange={setEmpties} />
                  </div>
                </div>

                <div>
                  <span className="ow-label">{t('How often?', 'کتنی بار؟')}</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SCHEDULE_IDS.map((id) => (
                      <button key={id} type="button" onClick={() => setSchedule(id)}
                        className="rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
                        style={{ background: schedule === id ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.03)', border: `1px solid ${schedule === id ? '#00d4ff' : 'rgba(255,255,255,0.1)'}`, color: schedule === id ? '#fff' : 'rgba(150,200,255,0.75)' }}
                        aria-pressed={schedule === id}>
                        {scheduleLabels[id]}
                      </button>
                    ))}
                  </div>
                  {schedule !== 'once' && <p className="text-xs ow-muted mt-2">{t("We'll confirm your regular delivery day on WhatsApp. No automatic charges — pay per delivery.", 'ہم واٹس ایپ پر آپ کی باقاعدہ ڈیلیوری کا دن کنفرم کریں گے۔ کوئی خودکار چارجز نہیں — ہر ڈیلیوری پر ادائیگی۔')}</p>}
                </div>

                <dl className="rounded-xl p-4 space-y-2 text-sm" style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.18)' }}>
                  <div className="flex justify-between"><dt className="ow-muted">{t('Water', 'پانی')} (<bdi>{qty} × {pkr(price)}</bdi>)</dt><dd dir="ltr" className="text-white">{pkr(qty * price)}</dd></div>
                  <div className="flex justify-between"><dt className="ow-muted">{t(`Refundable deposit (${newBottles} new bottle${newBottles === 1 ? '' : 's'})`, `قابلِ واپسی سیکیورٹی (${newBottles} نئی ${newBottles === 1 ? 'بوتل' : 'بوتلیں'})`)}</dt><dd dir="ltr" className="text-white">{pkr(newBottles * deposit)}</dd></div>
                  <div className="flex justify-between font-heading font-bold text-lg pt-2" style={{ borderTop: '1px solid rgba(0,212,255,0.18)' }}><dt className="text-white">{t('First delivery', 'پہلی ڈیلیوری')}</dt><dd dir="ltr" className="ow-cyan">{pkr(qty * price + newBottles * deposit)}</dd></div>
                  {schedule !== 'once' && <p className="text-xs ow-muted">{isUrdu ? <>اگلی ڈیلیوریز: خالی بوتلیں واپس کرنے پر ہر بار <bdi>{pkr(qty * price)}</bdi>۔</> : <>Next deliveries: {pkr(qty * price)} each when you swap your empties.</>}</p>}
                </dl>

                <button onClick={addToCart} className="ow-btn w-full !py-4"><ShoppingCart className="w-5 h-5" /> {t('Add to cart', 'کارٹ میں شامل کریں')}</button>
                <ClosedNotice variant="card" />
              </div>
            ) : (
              <div className="ow-card p-6 md:p-8 space-y-4">
                <h2 className="font-heading font-bold text-2xl text-white">{t('Order 19L bottles on WhatsApp', 'واٹس ایپ پر 19 لیٹر بوتلیں آرڈر کریں')}</h2>
                <p className="ow-muted">{t("Message us with how many bottles you need and your area — we'll confirm the price and delivery time.", 'ہمیں بتائیں کتنی بوتلیں چاہئیں اور آپ کا علاقہ کون سا ہے — ہم قیمت اور ڈیلیوری کا وقت کنفرم کریں گے۔')}</p>
                <OrderBuilder />
              </div>
            )}
          </Reveal>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <CardGrid cols={4}>{[
            { key: 'delivery', icon: Truck, title: freeDelivery ? t('Free delivery', 'فری ڈیلیوری') : t('Doorstep delivery', 'دہلیز تک ڈیلیوری'), text: t(`Anywhere in ${cities}.`, `${citiesUr} میں کہیں بھی۔`) },
            { key: 'swap', icon: RefreshCw, title: t('Swap your empties', 'خالی بوتلیں واپس کریں'), text: t('Return an empty, pay only for the water.', 'خالی بوتل واپس کریں، صرف پانی کی قیمت ادا کریں۔') },
            { key: 'deposit', icon: ShieldCheck, title: t('Refundable deposit', 'قابلِ واپسی سیکیورٹی'), text: isUrdu ? <>فی نئی بوتل <bdi>{pkr(deposit)}</bdi> — بوتل واپس کرنے پر واپس مل جاتی ہے۔</> : `${pkr(deposit)} per new bottle — returned when you give the bottle back.` },
            { key: 'cod', icon: Wallet, title: t('Cash on delivery', 'کیش آن ڈیلیوری'), text: t('Pay the rider. No advance, no automatic charges.', 'رائیڈر کو ادائیگی کریں۔ کوئی ایڈوانس نہیں، کوئی خودکار چارجز نہیں۔') },
          ].map(({ key, icon, title, text }) => <FeatureCard key={key} icon={icon} title={title}>{text}</FeatureCard>)}</CardGrid>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <SectionHeading eyebrow={<><MapPin className="w-4 h-4" /> {t('Delivery areas', 'ڈیلیوری کے علاقے')}</>} title={isUrdu ? <>ہم <span className="ow-gradient-text">پورے {citiesUr}</span> میں ڈیلیور کرتے ہیں</> : <>We deliver across <span className="ow-gradient-text">all of {cities}</span></>}
            subtitle={t('Homes, offices, shops and schools anywhere in the city, including:', 'شہر میں کہیں بھی گھر، دفاتر، دکانیں اور اسکول، بشمول:')} />
          <Reveal className="flex flex-wrap justify-center gap-2">
            {GUJRANWALA_AREAS.map((a) => (
              <span key={a} dir="ltr" className="px-3 py-1.5 rounded-full text-sm text-white/85" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,212,255,0.18)' }}>{a}</span>
            ))}
          </Reveal>
          <p className="text-center text-sm ow-muted mt-6">
            {t("Don't see your area? We most likely still deliver —", 'آپ کا علاقہ نظر نہیں آ رہا؟ زیادہ امکان ہے کہ ہم وہاں بھی ڈیلیور کرتے ہیں —')}{' '}
            <a className="ow-cyan hover:underline" target="_blank" rel="noopener noreferrer" href={whatsappLink(settings.contact_info.whatsapp, t('Assalam o Alaikum! Do you deliver 19L water to my area: ', 'السلام علیکم! کیا آپ میرے علاقے میں 19 لیٹر پانی ڈیلیور کرتے ہیں: '))}>{t('ask us on WhatsApp', 'واٹس ایپ پر پوچھیں')}</a>{t('.', '۔')}
          </p>
        </div>
      </section>

      {product && (
        <section className="py-12 pb-20">
          <div className="container mx-auto px-4 max-w-3xl">
            <SectionHeading eyebrow={<><Calculator className="w-4 h-4" /> {t('Monthly cost calculator', 'ماہانہ خرچ کیلکولیٹر')}</>} title={t('How much water does your family need?', 'آپ کے گھر والوں کو کتنا پانی چاہیے؟')} />
            <Reveal className="ow-card p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 justify-between">
                <div>
                  <span className="ow-label flex items-center gap-2"><Users className="w-4 h-4 ow-cyan" /> {t('People at home / office', 'گھر / دفتر میں افراد')}</span>
                  <Stepper label={t('people', 'افراد')} value={people} min={1} max={60} onChange={setPeople} />
                </div>
                <div className="text-start sm:text-end">
                  <p className="text-sm ow-muted">{t('About', 'تقریباً')} <strong className="text-white">{t(`${bottlesPerWeek} bottle${bottlesPerWeek > 1 ? 's' : ''} a week`, `ہفتے میں ${bottlesPerWeek} ${bottlesPerWeek > 1 ? 'بوتلیں' : 'بوتل'}`)}</strong></p>
                  <p className="font-heading font-black text-3xl text-white"><bdi>{pkr(bottlesPerWeek * price * 4.33)}</bdi><span className="text-base font-medium ow-muted">{t(' / month', ' / مہینہ')}</span></p>
                </div>
              </div>
              <p className="text-xs ow-subtle mt-4">{t('Estimate based on ~2.5 litres per person per day for drinking and cooking. Deposit is paid once, only for new bottles.', 'یہ اندازہ پینے اور کھانا پکانے کے لیے فی فرد روزانہ تقریباً 2.5 لیٹر کی بنیاد پر ہے۔ سیکیورٹی صرف ایک بار، صرف نئی بوتلوں کے لیے ادا کی جاتی ہے۔')}</p>
              <button className="ow-btn-ghost mt-5" onClick={() => { setQty(bottlesPerWeek); setEmpties(0); setSchedule('weekly'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                {t(`Use ${bottlesPerWeek} bottle${bottlesPerWeek > 1 ? 's' : ''} weekly`, `ہر ہفتے ${bottlesPerWeek} ${bottlesPerWeek > 1 ? 'بوتلیں' : 'بوتل'} منتخب کریں`)}
              </button>
            </Reveal>
            <p className="text-center text-sm ow-muted mt-8">{t('Ordering for an office, school or event?', 'دفتر، اسکول یا کسی تقریب کے لیے آرڈر کر رہے ہیں؟')} <Link to="/events" className="ow-cyan hover:underline">{t('Get a bulk quote →', 'بلک ریٹ معلوم کریں ←')}</Link></p>
          </div>
        </section>
      )}
    </div>
  );
}
