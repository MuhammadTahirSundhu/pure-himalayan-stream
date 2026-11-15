import { ReactNode, ComponentType } from 'react';
import { Link } from 'react-router-dom';
import Reveal from '@/components/Reveal';

type Icon = ComponentType<{ className?: string }>;

/**
 * One card language for the whole site:
 *  - same radius, border, padding (p-6), hover lift
 *  - icon in a 48px tinted tile
 *  - equal heights inside a grid (h-full + flex column)
 */
export const TINTS = {
  cyan: { bg: 'rgba(0,212,255,0.12)', fg: '#00d4ff' },
  green: { bg: 'rgba(16,185,129,0.14)', fg: '#34d399' },
  blue: { bg: 'rgba(59,130,246,0.14)', fg: '#60a5fa' },
  violet: { bg: 'rgba(139,92,246,0.14)', fg: '#a78bfa' },
  whatsapp: { bg: 'rgba(37,211,102,0.14)', fg: '#25d366' },
} as const;
export type Tint = keyof typeof TINTS;

export function IconTile({ icon: I, tint = 'cyan', size = 'md' }: { icon: Icon; tint?: Tint; size?: 'md' | 'lg' }) {
  const t = TINTS[tint];
  const box = size === 'lg' ? 'w-14 h-14' : 'w-12 h-12';
  return (
    <span className={`${box} rounded-xl flex items-center justify-center shrink-0`} style={{ background: t.bg, color: t.fg }}>
      <I className={size === 'lg' ? 'w-7 h-7' : 'w-6 h-6'} />
    </span>
  );
}

interface FeatureCardProps {
  icon: Icon;
  title: ReactNode;
  children?: ReactNode;
  tint?: Tint;
  eyebrow?: ReactNode;
  /** internal route (Link) or external/tel/mailto href (a) */
  to?: string;
  href?: string;
  external?: boolean;
  footer?: ReactNode;
  align?: 'left' | 'center';
}

export function FeatureCard({ icon, title, children, tint, eyebrow, to, href, external, footer, align = 'left' }: FeatureCardProps) {
  const center = align === 'center';
  const body = (
    <>
      <div className={center ? 'flex justify-center' : ''}><IconTile icon={icon} tint={tint} /></div>
      {eyebrow && <p className="text-xs uppercase tracking-wider ow-subtle mt-4">{eyebrow}</p>}
      <h3 className={`font-heading font-bold text-lg text-white leading-snug ${eyebrow ? 'mt-1' : 'mt-4'} break-words`}>{title}</h3>
      {children && <div className="text-sm leading-relaxed ow-muted mt-2">{children}</div>}
      {footer && <div className="mt-auto pt-4">{footer}</div>}
    </>
  );
  const cls = `ow-card ow-card-hover p-6 h-full flex flex-col ${center ? 'text-center' : ''}`;
  if (to) return <Link to={to} className={cls}>{body}</Link>;
  if (href) return <a href={href} className={cls} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{body}</a>;
  return <div className={cls}>{body}</div>;
}

export function StatCard({ icon, value, label, note }: { icon?: Icon; value: ReactNode; label: ReactNode; note?: ReactNode }) {
  return (
    <div className="ow-card ow-card-hover p-6 h-full flex flex-col items-center justify-center text-center">
      {icon && <IconTile icon={icon} />}
      <p className={`font-heading font-black text-3xl md:text-4xl ow-gradient-text ${icon ? 'mt-3' : ''}`}>{value}</p>
      <p className="text-sm text-white mt-1">{label}</p>
      {note && <p className="text-xs ow-subtle mt-1">{note}</p>}
    </div>
  );
}

const COLS = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
} as const;

/** Responsive grid: 1 col on phones, 2 on tablets, N on desktop; children are revealed in a stagger. */
export function CardGrid({ cols = 3, children, className = '', compactMobile = false }: { cols?: 2 | 3 | 4; children: ReactNode[]; className?: string; compactMobile?: boolean }) {
  return (
    <div className={`grid gap-5 ${compactMobile ? 'grid-cols-2' : 'grid-cols-1'} ${COLS[cols]} ${className}`}>
      {children.map((child, i) => (
        <Reveal key={i} delay={i * 80} className="h-full">{child}</Reveal>
      ))}
    </div>
  );
}
