import { useMemo } from 'react';

/** Soft rising bubbles. Pure CSS; disabled automatically by prefers-reduced-motion. */
export default function Bubbles({ count = 14, className = '' }: { count?: number; className?: string }) {
  const bubbles = useMemo(
    () => Array.from({ length: count }, (_, i) => {
      // deterministic pseudo-random so SSR/prerender matches
      const r = (n: number) => ((Math.sin(i * 9301 + n * 49297) + 1) / 2);
      return { left: `${r(1) * 100}%`, size: 4 + r(2) * 14, dur: `${9 + r(3) * 10}s`, delay: `${-r(4) * 18}s`, drift: `${(r(5) - 0.5) * 60}px` };
    }),
    [count]
  );
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {bubbles.map((b, i) => (
        <span
          key={i}
          className="absolute bottom-[-20px] rounded-full animate-bubble"
          style={{
            left: b.left, width: b.size, height: b.size,
            border: '1px solid rgba(0,212,255,0.35)',
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.35), rgba(0,212,255,0.06) 60%)',
            ['--dur' as string]: b.dur, ['--delay' as string]: b.delay, ['--drift' as string]: b.drift,
          }}
        />
      ))}
    </div>
  );
}
