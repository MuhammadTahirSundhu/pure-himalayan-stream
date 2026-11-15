import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';

export type Lang = 'en' | 'ur';
const STORAGE_KEY = 'ow_lang';
const URDU_FONT_HREF = 'https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;600;700&display=swap';

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** Pick the string for the current language: t('Order now', 'ابھی آرڈر کریں') */
  t: (en: string, ur: string) => string;
  isUrdu: boolean;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const initialLang = (): Lang => {
  try { return localStorage.getItem(STORAGE_KEY) === 'ur' ? 'ur' : 'en'; } catch { return 'en'; }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang === 'ur' ? 'ur' : 'en';
    root.dir = lang === 'ur' ? 'rtl' : 'ltr';
    if (lang === 'ur' && !document.getElementById('urdu-font')) {
      const link = document.createElement('link');
      link.id = 'urdu-font';
      link.rel = 'stylesheet';
      link.href = URDU_FONT_HREF;
      document.head.appendChild(link);
    }
    try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* ignore */ }
  }, [lang]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const t = useCallback((en: string, ur: string) => (lang === 'ur' ? ur : en), [lang]);

  return <LanguageContext.Provider value={{ lang, setLang, t, isUrdu: lang === 'ur' }}>{children}</LanguageContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
}
