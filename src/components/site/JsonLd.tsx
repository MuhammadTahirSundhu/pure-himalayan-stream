import { useEffect } from 'react';

/** Injects JSON-LD blocks into <head> while mounted. */
export default function JsonLd({ data }: { data: object[] }) {
  const json = JSON.stringify(data);
  useEffect(() => {
    const els = (JSON.parse(json) as object[]).map((d) => {
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.textContent = JSON.stringify({ '@context': 'https://schema.org', ...d });
      document.head.appendChild(s);
      return s;
    });
    return () => els.forEach((e) => e.remove());
  }, [json]);
  return null;
}
