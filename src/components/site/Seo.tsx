import { useEffect } from 'react';
import JsonLd from './JsonLd';

export const SITE_URL = 'https://www.onewaterpakistan.com';

interface SeoProps {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  /** Extra JSON-LD objects for this page (e.g. FAQPage, Product). */
  jsonLd?: object[];
}

const setMeta = (attr: 'name' | 'property', key: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
};

/** Per-route <title>, description, canonical, OG tags and JSON-LD. */
export default function Seo({ title, description, path, noindex, jsonLd }: SeoProps) {
  useEffect(() => {
    const url = `${SITE_URL}${path}`;
    document.title = title;
    setMeta('name', 'description', description);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;
  }, [title, description, path, noindex]);
  return jsonLd?.length ? <JsonLd data={jsonLd} /> : null;
}
