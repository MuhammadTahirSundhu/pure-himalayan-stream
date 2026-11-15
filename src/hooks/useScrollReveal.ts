import { useEffect, useRef, useState } from 'react';

/** Crawlers, prerenderers, Lighthouse and reduced-motion users get content without waiting for a scroll. */
export const revealImmediately = () =>
  typeof window === 'undefined' ||
  navigator.webdriver ||
  /bot|crawl|spider|slurp|lighthouse|headless|prerender/i.test(navigator.userAgent) ||
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
  !('IntersectionObserver' in window);

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: IntersectionObserverInit = { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(revealImmediately);

  useEffect(() => {
    const node = ref.current;
    if (!node || visible) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, options);
    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, visible };
}
