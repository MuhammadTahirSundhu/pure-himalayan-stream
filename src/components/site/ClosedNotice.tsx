import { useEffect, useState } from 'react';
import { Moon } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { openState, closedMessage } from '@/lib/hours';

/** Sets expectations when the team is offline (e.g. Fridays, after 7 PM). */
export default function ClosedNotice({ variant = 'bar' }: { variant?: 'bar' | 'card' }) {
  const { settings } = useSiteSettings();
  const [, tick] = useState(0);
  useEffect(() => { const id = setInterval(() => tick((n) => n + 1), 60_000); return () => clearInterval(id); }, []);
  const state = openState(settings.business_hours);
  if (state.open) return null;
  if (variant === 'card') {
    return (
      <p className="flex gap-2 items-start text-sm rounded-xl p-3 text-amber-200" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)' }}>
        <Moon className="w-4 h-4 mt-0.5 shrink-0" /> {closedMessage(state)}
      </p>
    );
  }
  return (
    <div className="text-center text-xs sm:text-sm px-4 py-2 text-amber-100" style={{ background: 'rgba(120,53,15,0.55)', borderBottom: '1px solid rgba(245,158,11,0.3)' }}>
      <Moon className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />{closedMessage(state)}
    </div>
  );
}
