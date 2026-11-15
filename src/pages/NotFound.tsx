import { Link } from 'react-router-dom';
import { Droplets } from 'lucide-react';
import Seo from '@/components/site/Seo';

export default function NotFound() {
  return (
    <div className="ow-page flex items-center justify-center py-28 px-4">
      <Seo title="Page not found | One Water" description="This page does not exist." path="/404" noindex />
      <div className="text-center animate-fade-up">
        <Droplets className="w-14 h-14 ow-cyan mx-auto mb-4 animate-bottle-bob" />
        <p className="font-heading font-black text-6xl ow-gradient-text mb-2">404</p>
        <h1 className="font-heading font-bold text-2xl text-white mb-3">This page has evaporated</h1>
        <p className="ow-muted mb-8">The page you're looking for doesn't exist or has moved.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/" className="ow-btn">Back to home</Link>
          <Link to="/products" className="ow-btn-ghost">See products</Link>
        </div>
      </div>
    </div>
  );
}
