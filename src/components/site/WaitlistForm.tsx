import { useState } from 'react';
import { MapPin, CheckCircle2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { trackEvent } from '@/lib/analytics';
import { useLang } from '@/contexts/LanguageContext';

/** "Bring One Water to my city" — captures expansion demand by city. */
export default function WaitlistForm({ defaultCity = '' }: { defaultCity?: string }) {
  const [form, setForm] = useState({ name: '', phone: '', city: defaultCity });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');
  const { t, isUrdu } = useLang();
  const PLACEHOLDERS = { name: t('Your name', 'آپ کا نام'), phone: t('Phone / WhatsApp', 'فون / واٹس ایپ'), city: t('Your city', 'آپ کا شہر') };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending'); setError(''); setErrors({});
    try {
      await api('/api/waitlist', { method: 'POST', json: form });
      setStatus('done');
      trackEvent('generate_lead', { form: 'waitlist', city: form.city });
    } catch (err) {
      setStatus('idle');
      if (err instanceof ApiError) { setErrors(err.fieldErrors); setError(err.message); }
    }
  };

  if (status === 'done') {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
        <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
        <p className="text-sm text-white">{isUrdu
          ? <>شکریہ! جیسے ہی ون واٹر <strong>{form.city}</strong> پہنچے گا، ہم آپ کو میسج کریں گے۔</>
          : <>Thank you! We'll message you as soon as One Water reaches <strong>{form.city}</strong>.</>}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid sm:grid-cols-[1fr_1fr_1fr_auto] gap-3" noValidate>
      {(['name', 'phone', 'city'] as const).map((k) => (
        <div key={k}>
          <input
            className="ow-input" required aria-invalid={!!errors[k]} aria-label={PLACEHOLDERS[k]}
            placeholder={PLACEHOLDERS[k]}
            dir={k === 'phone' && form.phone ? 'ltr' : undefined}
            inputMode={k === 'phone' ? 'tel' : undefined}
            value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })}
          />
          {errors[k] && <p className="ow-error">{errors[k]}</p>}
        </div>
      ))}
      <button className="ow-btn !py-3" disabled={status === 'sending'}>
        <MapPin className="w-4 h-4" /> {status === 'sending' ? t('Sending…', 'بھیجا جا رہا ہے…') : t('Notify me', 'مجھے اطلاع دیں')}
      </button>
      {error && !Object.keys(errors).length && <p className="ow-error sm:col-span-4">{error}</p>}
    </form>
  );
}
