import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * On route change with a hash (e.g. /quality#certifications) — smooth-scroll to the element.
 * On route change without a hash — scroll to top.
 */
export default function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Wait one tick so the target route renders
      const id = hash.replace('#', '');
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, [pathname, hash]);

  return null;
}
