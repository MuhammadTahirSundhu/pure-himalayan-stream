// lib/analytics.ts — Google Analytics 4 + Meta Pixel, both OFF unless their IDs
// are set at build time (VITE_GA_ID=G-XXXX, VITE_META_PIXEL_ID=1234…).
type Params = Record<string, unknown>;
declare global {
  interface Window { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void; fbq?: ((...a: unknown[]) => void) & { queue?: unknown[]; loaded?: boolean; version?: string; push?: unknown; callMethod?: (...a: unknown[]) => void } }
}

const GA_ID = import.meta.env.VITE_GA_ID as string | undefined;
const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID as string | undefined;
let started = false;

const loadScript = (src: string) => {
  const s = document.createElement('script');
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
};

export function initAnalytics() {
  if (started || typeof window === 'undefined' || navigator.webdriver) return;
  started = true;
  if (GA_ID) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer!.push(arguments); }; // eslint-disable-line prefer-rest-params
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { send_page_view: false });
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`);
  }
  if (PIXEL_ID) {
    const fbq = function (...args: unknown[]) { if (fbq.callMethod) fbq.callMethod(...args); else fbq.queue!.push(args); } as NonNullable<Window["fbq"]>;
    fbq.queue = []; fbq.loaded = true; fbq.version = '2.0'; fbq.push = fbq;
    window.fbq = fbq;
    loadScript('https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', PIXEL_ID);
  }
  // Every WhatsApp / phone tap anywhere on the site is a lead signal.
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement | null)?.closest?.('a');
    if (!a) return;
    if (/wa\.me|whatsapp/.test(a.href)) trackEvent('contact', { method: 'whatsapp', location: location.pathname });
    else if (a.href.startsWith('tel:')) trackEvent('contact', { method: 'phone', location: location.pathname });
  }, { capture: true });
}

export function trackPageView(path: string) {
  window.gtag?.('event', 'page_view', { page_path: path, page_location: location.href, page_title: document.title });
  window.fbq?.('track', 'PageView');
}

const PIXEL_EVENTS: Record<string, string> = {
  add_to_cart: 'AddToCart', begin_checkout: 'InitiateCheckout', purchase: 'Purchase', generate_lead: 'Lead', contact: 'Contact',
};

export function trackEvent(name: string, params: Params = {}) {
  window.gtag?.('event', name, params);
  const pixel = PIXEL_EVENTS[name];
  if (pixel) window.fbq?.('track', pixel, params);
}
