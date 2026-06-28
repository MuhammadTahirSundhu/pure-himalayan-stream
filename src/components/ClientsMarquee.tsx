import { useEffect, useRef, useState } from 'react';
import { Building2 } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
}

// Generates a consistent gradient avatar color from the client name
function stringToGradient(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 40) % 360;
  return `linear-gradient(135deg, hsl(${hue1}, 70%, 55%), hsl(${hue2}, 80%, 45%))`;
}

function ClientCard({ client }: { client: Client }) {
  const initials = client.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const content = (
    <div
      className="group flex flex-col items-center justify-center gap-4 md:gap-6 px-10 py-8 md:px-12 md:py-10 mx-4 min-w-[280px] md:min-w-[320px] lg:min-w-[380px] rounded-3xl cursor-pointer select-none transition-all duration-400"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(0,212,255,0.12)',
        backdropFilter: 'blur(12px)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.border = '1px solid rgba(0,212,255,0.4)';
        (e.currentTarget as HTMLElement).style.background = 'rgba(0,212,255,0.08)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(0,212,255,0.2)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.border = '1px solid rgba(0,212,255,0.12)';
        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      {/* Logo or avatar */}
      <div className="w-32 h-32 md:w-48 md:h-48 lg:w-56 lg:h-56 rounded-2xl md:rounded-3xl overflow-hidden flex items-center justify-center shrink-0"
        style={{ border: '1px solid rgba(0,212,255,0.2)', background: 'rgba(255,255,255,0.02)' }}>
        {client.logo_url ? (
          <img
            src={client.logo_url}
            alt={client.name}
            className="w-full h-full object-contain p-3 md:p-6"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
              (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="w-full h-full flex items-center justify-center text-white font-heading font-bold text-4xl md:text-6xl"
          style={{
            background: stringToGradient(client.name),
            display: client.logo_url ? 'none' : 'flex',
          }}
        >
          {initials || <Building2 className="w-16 h-16 md:w-24 md:h-24" />}
        </div>
      </div>
      {/* Client name */}
      <span className="text-lg md:text-2xl font-semibold text-center leading-tight transition-colors w-full px-2"
        style={{ color: 'rgba(200,230,255,0.9)' }}>
        {client.name}
      </span>
    </div>
  );


  if (client.website_url) {
    return (
      <a href={client.website_url} target="_blank" rel="noopener noreferrer" tabIndex={-1}>
        {content}
      </a>
    );
  }
  return content;
}

// Placeholder cards shown while loading
function ClientCardSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 md:gap-6 px-10 py-8 md:px-12 md:py-10 mx-4 min-w-[280px] md:min-w-[320px] lg:min-w-[380px] rounded-3xl border border-border/40 bg-card/60 animate-pulse">
      <div className="w-32 h-32 md:w-48 md:h-48 lg:w-56 lg:h-56 rounded-2xl md:rounded-3xl bg-muted" />
      <div className="h-6 md:h-8 bg-muted rounded w-48 md:w-64" />
    </div>
  );
}

export default function ClientsMarquee() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const trackRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);
  const posRef = useRef(0);
  const isPausedRef = useRef(false);

  useEffect(() => {
    fetch('/api/clients')
      .then((r) => r.json())
      .then((data) => {
        setClients(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  // Smooth JS-driven marquee — scrolls LEFT → RIGHT, pauses on hover
  useEffect(() => {
    if (isLoading || clients.length === 0) return;
    const track = trackRef.current;
    if (!track) return;

    const speed = 0.6; // px per frame — lower = slower

    // Start at -halfWidth so the second duplicated copy fills the viewport
    // and we scroll positively toward 0, then jump back to -halfWidth
    const halfWidth = () => track.scrollWidth / 2;
    posRef.current = -halfWidth();

    const animate = () => {
      if (!isPausedRef.current) {
        posRef.current += speed; // move RIGHT
        if (posRef.current >= 0) {
          posRef.current = -halfWidth(); // seamless reset
        }
        track.style.transform = `translateX(${posRef.current}px)`;
      }
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isLoading, clients]);

  // Duplicate clients multiple times so the marquee loops seamlessly even on ultrawide monitors
  // We use 50 copies (25 for the first half, 25 for the second half)
  const displayClients = Array(50).fill(clients).flat();

  return (
    <section className="py-16 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #030D1A 0%, #041422 50%, #030D1A 100%)' }}>
      {/* Section heading */}
      <div className="container mx-auto px-4 text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
          style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)' }}>
          <Building2 className="w-4 h-4" style={{ color: '#00d4ff' }} />
          <span className="text-sm font-medium" style={{ color: '#00d4ff' }}>Trusted Partners</span>
        </div>
        <h2 className="font-heading font-bold text-3xl md:text-4xl text-white mb-3">
          Our Featured{' '}
          <span style={{
            background: 'linear-gradient(135deg, #00d4ff, #3b82f6)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            Clients
          </span>
        </h2>
        <p className="max-w-lg mx-auto" style={{ color: 'rgba(150,200,255,0.7)' }}>
          Proudly serving businesses, restaurants, offices, and institutions across Pakistan.
        </p>
      </div>

      {/* Gradient fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10"
        style={{ background: 'linear-gradient(to right, #030D1A, transparent)' }} />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10"
        style={{ background: 'linear-gradient(to left, #030D1A, transparent)' }} />


      {/* Scrolling track */}
      <div
        className="overflow-hidden"
        onMouseEnter={() => { isPausedRef.current = true; }}
        onMouseLeave={() => { isPausedRef.current = false; }}
      >
        <div ref={trackRef} className="flex will-change-transform">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <ClientCardSkeleton key={i} />)
            : displayClients.map((client, i) => (
                <ClientCard key={`${client.id}-${i}`} client={client} />
              ))}
        </div>
      </div>

      {/* Empty state */}
      {!isLoading && clients.length === 0 && (
        <div className="text-center py-8">
          <Building2 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No featured clients yet. Add them from the admin panel.</p>
        </div>
      )}
    </section>
  );
}
