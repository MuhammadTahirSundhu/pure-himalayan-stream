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
    <div className="clients-card group flex flex-col items-center justify-center gap-3 px-8 py-5 mx-3 min-w-[160px] rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm shadow-md hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 hover:border-primary/40 transition-all duration-400 cursor-pointer select-none">
      {/* Logo or avatar */}
      <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
        {client.logo_url ? (
          <img
            src={client.logo_url}
            alt={client.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
              (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="w-full h-full flex items-center justify-center text-white font-heading font-bold text-lg"
          style={{
            background: stringToGradient(client.name),
            display: client.logo_url ? 'none' : 'flex',
          }}
        >
          {initials || <Building2 className="w-6 h-6" />}
        </div>
      </div>
      {/* Client name */}
      <span className="text-sm font-semibold text-foreground text-center leading-tight whitespace-nowrap max-w-[130px] overflow-hidden text-ellipsis group-hover:text-primary transition-colors">
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
    <div className="flex flex-col items-center justify-center gap-3 px-8 py-5 mx-3 min-w-[160px] rounded-2xl border border-border/40 bg-card/60 animate-pulse">
      <div className="w-14 h-14 rounded-xl bg-muted" />
      <div className="h-3 bg-muted rounded w-20" />
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

  // Smooth JS-driven marquee (pauses on hover)
  useEffect(() => {
    if (isLoading || clients.length === 0) return;
    const track = trackRef.current;
    if (!track) return;

    const speed = 0.6; // px per frame — lower = slower

    const animate = () => {
      if (!isPausedRef.current) {
        posRef.current -= speed;
        const halfWidth = track.scrollWidth / 2;
        if (Math.abs(posRef.current) >= halfWidth) {
          posRef.current = 0;
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

  // Duplicate clients so the marquee loops seamlessly
  const displayClients = [...clients, ...clients];

  return (
    <section className="py-16 relative overflow-hidden bg-gradient-to-b from-muted/30 to-background">
      {/* Section heading */}
      <div className="container mx-auto px-4 text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <Building2 className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Trusted Partners</span>
        </div>
        <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-3">
          Our Featured <span className="text-primary">Clients</span>
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Proudly serving businesses, restaurants, offices, and institutions across Pakistan.
        </p>
      </div>

      {/* Gradient fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-background to-transparent" />

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
