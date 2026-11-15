import { Languages } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';

export default function LanguageToggle({ className = '' }: { className?: string }) {
  const { lang, setLang } = useLang();
  const next = lang === 'en' ? 'ur' : 'en';
  return (
    <button
      onClick={() => setLang(next)}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-semibold text-white/85 hover:text-white hover:bg-white/10 transition-colors ${className}`}
      aria-label={lang === 'en' ? 'اردو میں دیکھیں — View in Urdu' : 'View in English'}
      lang={next}
    >
      <Languages className="w-4 h-4 ow-cyan" />
      <span className={next === 'ur' ? 'font-urdu text-base leading-none' : ''}>{next === 'ur' ? 'اردو' : 'English'}</span>
    </button>
  );
}
