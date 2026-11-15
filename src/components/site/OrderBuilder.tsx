import { useMemo, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { useProducts } from '@/hooks/useProducts';
import { useSiteSettings, whatsappLink } from '@/hooks/useSiteSettings';
import { pkr } from '@/lib/pricing';
import { useLang } from '@/contexts/LanguageContext';

type ScheduleKey = 'once' | 'weekly' | 'biweekly' | 'monthly';
const getSchedules = (t: (en: string, ur: string) => string): Record<ScheduleKey, string> => ({
  once: t('One-time', 'ایک بار'),
  weekly: t('Every week', 'ہر ہفتے'),
  biweekly: t('Every 2 weeks', 'ہر دو ہفتے'),
  monthly: t('Every month', 'ہر مہینے'),
});

/** Build an order and send it as a pre-filled WhatsApp message. */
export default function OrderBuilder() {
  const { data: products = [] } = useProducts();
  const { settings } = useSiteSettings();
  const { t } = useLang();
  const SCHEDULES = getSchedules(t);
  const available = products.filter((p) => p.inStock);
  const [productId, setProductId] = useState<string>('');
  const [qty, setQty] = useState(2);
  const [area, setArea] = useState('');
  const [schedule, setSchedule] = useState<ScheduleKey>('once');

  const product = available.find((p) => p.id === productId) ?? available.find((p) => p.category === 'dispenser') ?? available[0];
  const isDispenser = product?.category === 'dispenser';
  const estimate = product ? product.price * qty : 0;

  const scheduleLabel = SCHEDULES[schedule];
  const message = useMemo(() => {
    if (!product) return t('Assalam o Alaikum One Water! I would like to order water.', 'السلام علیکم ون واٹر! مجھے پانی آرڈر کرنا ہے۔');
    return [
      t('Assalam o Alaikum One Water! I would like to order:', 'السلام علیکم ون واٹر! مجھے یہ آرڈر کرنا ہے:'),
      `• ${qty} × ${product.name}`,
      isDispenser ? `• ${t('Delivery', 'ڈیلیوری')}: ${scheduleLabel}` : null,
      `• ${t('Area', 'علاقہ')}: ${area || t('(my area in Gujranwala)', '(گوجرانوالہ میں میرا علاقہ)')}`,
      `${t('Estimated', 'اندازاً')}: ${pkr(estimate)}${isDispenser ? t(' + refundable deposit for any new bottles', ' + نئی بوتلوں کی قابلِ واپسی سیکیورٹی') : ''}`,
    ].filter(Boolean).join('\n');
  }, [product, qty, scheduleLabel, area, estimate, isDispenser, t]);

  return (
    <div className="ow-card p-6 md:p-8 space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="ow-label" htmlFor="ob-product">{t('Product', 'پروڈکٹ')}</label>
          <select id="ob-product" className="ow-input" value={product?.id ?? ''} onChange={(e) => setProductId(e.target.value)}>
            {available.map((p) => <option key={p.id} value={p.id}>{p.name} — {pkr(p.price)}</option>)}
            {!available.length && <option value="">{t("Water (we'll confirm price)", 'پانی (قیمت ہم کنفرم کریں گے)')}</option>}
          </select>
        </div>
        <div>
          <span className="ow-label">{t('Quantity', 'تعداد')}</span>
          <div className="flex items-center gap-3">
            <button type="button" className="ow-btn-ghost !p-3" aria-label={t('Decrease', 'کم کریں')} onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus className="w-4 h-4" /></button>
            <span className="w-10 text-center text-xl font-bold text-white tabular-nums">{qty}</span>
            <button type="button" className="ow-btn-ghost !p-3" aria-label={t('Increase', 'زیادہ کریں')} onClick={() => setQty((q) => Math.min(500, q + 1))}><Plus className="w-4 h-4" /></button>
          </div>
        </div>
        <div>
          <label className="ow-label" htmlFor="ob-area">{t('Your area in Gujranwala', 'گوجرانوالہ میں آپ کا علاقہ')}</label>
          <input id="ob-area" className="ow-input" placeholder={t('e.g. Satellite Town, Model Town', 'مثلاً سیٹلائٹ ٹاؤن، ماڈل ٹاؤن')} value={area} onChange={(e) => setArea(e.target.value)} />
        </div>
        {isDispenser && (
          <div>
            <label className="ow-label" htmlFor="ob-schedule">{t('How often?', 'کتنی بار؟')}</label>
            <select id="ob-schedule" className="ow-input" value={schedule} onChange={(e) => setSchedule(e.target.value as ScheduleKey)}>
              {Object.entries(SCHEDULES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        )}
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <p className="text-xs ow-subtle uppercase tracking-wider">{t('Estimated total', 'اندازاً کل رقم')}</p>
          <p className="font-heading font-black text-3xl text-white">{pkr(estimate)}</p>
          {isDispenser && <p className="text-xs ow-muted">+ {pkr(settings.delivery_info.bottle_deposit)} {t('refundable deposit per new bottle', 'فی نئی بوتل قابلِ واپسی سیکیورٹی')}</p>}
        </div>
        <a href={whatsappLink(settings.contact_info.whatsapp, message)} target="_blank" rel="noopener noreferrer" className="ow-btn-whatsapp">
          <WhatsAppIcon /> {t('Send order on WhatsApp', 'واٹس ایپ پر آرڈر بھیجیں')}
        </a>
      </div>
    </div>
  );
}
