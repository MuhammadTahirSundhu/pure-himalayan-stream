// lib/hours.ts — business-hours logic in Pakistan time (UTC+5, no DST),
// independent of the visitor's device timezone.
import type { SiteSettings } from './types';

type Hours = SiteSettings['business_hours'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const pktNow = (now = new Date()) => new Date(now.getTime() + (5 * 60 + now.getTimezoneOffset()) * 60_000);
const toMinutes = (hhmm: string) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };

export const formatTime = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return `${((h + 11) % 12) + 1}${m ? `:${String(m).padStart(2, '0')}` : ''} ${h < 12 ? 'AM' : 'PM'}`;
};

export interface OpenState { open: boolean; reason?: 'closed_day' | 'before' | 'after'; nextOpenDay?: string; nextOpenTime?: string; isTomorrow?: boolean }

export function openState(hours: Hours, now = new Date()): OpenState {
  const t = pktNow(now);
  const day = t.getDay();
  const mins = t.getHours() * 60 + t.getMinutes();
  const closedToday = hours.closed_days.includes(day);
  if (!closedToday && mins >= toMinutes(hours.open) && mins < toMinutes(hours.close)) return { open: true };

  // Find the next opening day.
  let offset = !closedToday && mins < toMinutes(hours.open) ? 0 : 1;
  while (offset < 8 && hours.closed_days.includes((day + offset) % 7)) offset++;
  return {
    open: false,
    reason: closedToday ? 'closed_day' : mins < toMinutes(hours.open) ? 'before' : 'after',
    nextOpenDay: offset === 0 ? 'today' : offset === 1 ? 'tomorrow' : DAY_NAMES[(day + offset) % 7],
    nextOpenTime: formatTime(hours.open),
    isTomorrow: offset === 1,
  };
}

export const closedMessage = (s: OpenState) =>
  s.open ? '' : `${s.reason === 'closed_day' ? "We're closed today" : "We're closed right now"} — orders placed now are confirmed ${s.nextOpenDay} from ${s.nextOpenTime}.`;
