import { Link } from 'react-router-dom';
import { Droplets } from 'lucide-react';
import Seo from '@/components/site/Seo';
import { useLang } from '@/contexts/LanguageContext';

export default function NotFound() {
  const { t } = useLang();
  return (
    <div className="ow-page flex items-center justify-center py-28 px-4">
      <Seo title="Page not found | One Water" description="This page does not exist." path="/404" noindex />
      <div className="text-center animate-fade-up">
        <Droplets className="w-14 h-14 ow-cyan mx-auto mb-4 animate-bottle-bob" />
        <p className="font-heading font-black text-6xl ow-gradient-text mb-2" dir="ltr">404</p>
        <h1 className="font-heading font-bold text-2xl text-white mb-3">{t('This page has evaporated', 'یہ صفحہ بھاپ بن کر اُڑ گیا')}</h1>
        <p className="ow-muted mb-8">{t("The page you're looking for doesn't exist or has moved.", 'جو صفحہ آپ ڈھونڈ رہے ہیں وہ موجود نہیں یا کہیں اور منتقل ہو گیا ہے۔')}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/" className="ow-btn">{t('Back to home', 'واپس ہوم پیج پر')}</Link>
          <Link to="/products" className="ow-btn-ghost">{t('See products', 'پراڈکٹس دیکھیں')}</Link>
        </div>
      </div>
    </div>
  );
}
