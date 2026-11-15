import { ShieldCheck, FlaskConical, BadgeCheck, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';

export default function TrustRow({ className = '', compact = false }: { className?: string; compact?: boolean }) {
  const { t } = useLang();
  // Only certifications we hold and display on /quality#certifications.
  const ITEMS = [
    { icon: ShieldCheck, label: t('Punjab Food Authority licensed', 'پنجاب فوڈ اتھارٹی سے لائسنس یافتہ') },
    { icon: FlaskConical, label: t('PCRWR lab-tested', 'PCRWR لیب سے ٹیسٹ شدہ') },
    { icon: BadgeCheck, label: t('Halal certified (HMCA)', 'حلال سرٹیفائیڈ (HMCA)') },
    { icon: Award, label: t('ISO 9001 certified', 'ISO 9001 سرٹیفائیڈ') },
  ];
  return (
    <Link to="/quality#certifications" className={`flex flex-wrap items-center gap-x-5 gap-y-2 ${className}`} aria-label={t('See our certificates', 'ہمارے سرٹیفکیٹس دیکھیں')}>
      {ITEMS.map(({ icon: Icon, label }) => (
        <span key={label} className={`inline-flex items-center gap-1.5 ${compact ? 'text-xs' : 'text-sm'} ow-muted hover:text-white transition-colors`}>
          <Icon className="w-4 h-4 text-emerald-400 shrink-0" /> {label}
        </span>
      ))}
    </Link>
  );
}
