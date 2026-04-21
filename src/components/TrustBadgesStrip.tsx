import { Link } from 'react-router-dom';
import { ShieldCheck, Award, Leaf, BadgeCheck, FlaskConical } from 'lucide-react';
import Reveal from '@/components/Reveal';

const badges = [
  {
    icon: ShieldCheck,
    label: 'PFA Licensed',
    sub: 'Punjab Food Authority',
    color: 'from-emerald-500/20 to-emerald-600/10',
    iconColor: 'text-emerald-500',
  },
  {
    icon: Award,
    label: 'ISO 9001:2015',
    sub: 'Quality Management',
    color: 'from-sky-500/20 to-sky-600/10',
    iconColor: 'text-sky-500',
  },
  {
    icon: Leaf,
    label: 'Halal Certified',
    sub: 'HMCA Authority',
    color: 'from-green-500/20 to-green-600/10',
    iconColor: 'text-green-500',
  },
  {
    icon: BadgeCheck,
    label: 'FDA-Grade Bottles',
    sub: 'US 21 CFR Compliant',
    color: 'from-blue-500/20 to-blue-600/10',
    iconColor: 'text-blue-500',
  },
  {
    icon: FlaskConical,
    label: 'PCRWR Lab Tested',
    sub: 'Govt. Water Quality Lab',
    color: 'from-cyan-500/20 to-cyan-600/10',
    iconColor: 'text-cyan-500',
  },
];

export default function TrustBadgesStrip() {
  return (
    <section
      aria-labelledby="trust-badges-heading"
      className="py-12 bg-gradient-to-b from-background via-water-ice/10 to-background border-y border-border/60"
    >
      <div className="container mx-auto px-4">
        <Reveal className="text-center mb-8">
          <h2
            id="trust-badges-heading"
            className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground"
          >
            Trusted & Certified By
          </h2>
          <p className="font-heading font-bold text-xl md:text-2xl text-foreground mt-2">
            Every bottle backed by <span className="text-primary">official authorities</span>
          </p>
        </Reveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 max-w-5xl mx-auto">
          {badges.map((b, i) => (
            <Reveal key={b.label} delay={i * 80} direction="scale">
              <Link
                to="/quality#certifications"
                className="group relative flex flex-col items-center gap-2 p-4 rounded-2xl glass-card hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 ripple-surface"
                aria-label={`${b.label} — view certificate`}
              >
                <div
                  className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${b.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <b.icon className={`w-7 h-7 ${b.iconColor}`} strokeWidth={2.2} />
                  <span className="absolute inset-0 rounded-2xl border border-primary/0 group-hover:border-primary/40 group-hover:animate-pulse-ring" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm text-foreground leading-tight">{b.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{b.sub}</p>
                </div>
                <span className="absolute top-2 right-2 text-[9px] font-semibold uppercase text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  View →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal className="text-center mt-8">
          <Link
            to="/quality#certifications"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline underline-offset-4"
          >
            See all 6 official certifications →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
