import { ShieldCheck, FlaskConical, BadgeCheck, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

// Only certifications we hold and display on /quality#certifications.
const ITEMS = [
  { icon: ShieldCheck, label: 'Punjab Food Authority licensed' },
  { icon: FlaskConical, label: 'PCRWR lab-tested' },
  { icon: BadgeCheck, label: 'Halal certified (HMCA)' },
  { icon: Award, label: 'ISO 9001 certified' },
];

export default function TrustRow({ className = '', compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link to="/quality#certifications" className={`flex flex-wrap items-center gap-x-5 gap-y-2 ${className}`} aria-label="See our certificates">
      {ITEMS.map(({ icon: Icon, label }) => (
        <span key={label} className={`inline-flex items-center gap-1.5 ${compact ? 'text-xs' : 'text-sm'} ow-muted hover:text-white transition-colors`}>
          <Icon className="w-4 h-4 text-emerald-400 shrink-0" /> {label}
        </span>
      ))}
    </Link>
  );
}
