/** Animated two-layer wave used between sections. `flip` puts it at a section's top. */
export default function WaveDivider({ flip = false, color = '#030d1a', className = '' }: { flip?: boolean; color?: string; className?: string }) {
  const path = 'M0,40 C150,80 350,0 600,40 C850,80 1050,0 1200,40 L1200,120 L0,120 Z';
  return (
    <div aria-hidden className={`pointer-events-none relative h-16 md:h-20 w-full overflow-hidden ${flip ? 'rotate-180' : ''} ${className}`}>
      <div className="absolute inset-0 flex w-[200%] animate-wave-drift-slow opacity-40">
        {[0, 1].map((i) => (
          <svg key={i} viewBox="0 0 1200 120" preserveAspectRatio="none" className="h-full w-1/2">
            <path d={path} fill="#00d4ff" fillOpacity="0.18" />
          </svg>
        ))}
      </div>
      <div className="absolute inset-0 flex w-[200%] animate-wave-drift">
        {[0, 1].map((i) => (
          <svg key={i} viewBox="0 0 1200 120" preserveAspectRatio="none" className="h-full w-1/2">
            <path d={path} fill={color} />
          </svg>
        ))}
      </div>
    </div>
  );
}
