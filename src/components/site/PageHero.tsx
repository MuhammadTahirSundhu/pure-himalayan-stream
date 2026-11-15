import { ReactNode } from 'react';
import Bubbles from './Bubbles';

/** Shared inner-page hero: eyebrow, H1, subtitle, soft bubbles and glow. */
export default function PageHero({ eyebrow, title, subtitle, children }: { eyebrow: ReactNode; title: ReactNode; subtitle?: ReactNode; children?: ReactNode }) {
  return (
    <section className="relative pt-14 pb-12 md:pt-20 md:pb-16 overflow-hidden" style={{ background: 'linear-gradient(180deg, #001326 0%, #030d1a 100%)' }}>
      <Bubbles count={10} className="opacity-60" />
      <div aria-hidden className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-64 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(0,212,255,0.12) 0%, transparent 70%)' }} />
      <div className="container mx-auto px-4 text-center relative animate-fade-up">
        <span className="ow-eyebrow mb-5">{eyebrow}</span>
        <h1 className="font-heading font-black text-4xl md:text-5xl text-white mt-5 mb-4">{title}</h1>
        {subtitle && <p className="max-w-2xl mx-auto text-lg ow-muted">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}
