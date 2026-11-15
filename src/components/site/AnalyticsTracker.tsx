import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initAnalytics, trackPageView } from '@/lib/analytics';

/** Sends a page view on every route change (SPA). No-op without IDs. */
export default function AnalyticsTracker() {
  const { pathname } = useLocation();
  useEffect(() => { initAnalytics(); }, []);
  useEffect(() => {
    if (pathname.startsWith('/admin')) return;
    const id = setTimeout(() => trackPageView(pathname), 50); // after <Seo> updates the title
    return () => clearTimeout(id);
  }, [pathname]);
  return null;
}
