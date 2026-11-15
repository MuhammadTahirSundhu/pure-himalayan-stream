import { ReactNode } from 'react';
import Reveal from '@/components/Reveal';

export default function SectionHeading({ eyebrow, title, subtitle, className = '' }: { eyebrow?: ReactNode; title: ReactNode; subtitle?: ReactNode; className?: string }) {
  return (
    <Reveal className={`text-center max-w-2xl mx-auto mb-12 ${className}`}>
      {eyebrow && <span className="ow-eyebrow mb-4">{eyebrow}</span>}
      <h2 className="font-heading font-black text-3xl md:text-4xl text-white mt-4 mb-3">{title}</h2>
      {subtitle && <p className="ow-muted text-base md:text-lg">{subtitle}</p>}
    </Reveal>
  );
}
