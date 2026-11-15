// lib/hours.ts — business-hours logic in Pakistan time (UTC+5, no DST),
// independent of the visitor's device timezone.
import type { SiteSettings } from './types';

type Hours = SiteSettings['business_hours'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_NAMES_UR = ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ'];

const pktNow = (now = new Date()) => new Date(now.getTime() + (5 * 60 + now.getTimezoneOffset()) * 60_000);
const toMinutes = (hhmm: string) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };

export const formatTime = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return `${((h + 11) % 12) + 1}${m ? `:${String(m).padStart(2, '0')}` : ''} ${h < 12 ? 'AM' : 'PM'}`;
};

/** Urdu time of day, e.g. "صبح 9 بجے", "شام 7 بجے". */
export const formatTimeUr = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  const part = h < 4 ? 'رات' : h < 12 ? 'صبح' : h < 16 ? 'دوپہر' : h < 20 ? 'شام' : 'رات';
  return `${part} ${((h + 11) % 12) + 1}${m ? `:${String(m).padStart(2, '0')}` : ''} بجے`;
};

export interface OpenState {
  open: boolean; reason?: 'closed_day' | 'before' | 'after';
  /** English: 'today' | 'tomorrow' | weekday name */
  nextOpenDay?: string; nextOpenTime?: string; isTomorrow?: boolean;
  /** Urdu equivalents of nextOpenDay / nextOpenTime */
  nextOpenDayUr?: string; nextOpenTimeUr?: string;
}

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
    nextOpenDayUr: offset === 0 ? 'آج' : offset === 1 ? 'کل' : DAY_NAMES_UR[(day + offset) % 7],
    nextOpenTimeUr: formatTimeUr(hours.open),
  };
}

export const closedMessage = (s: OpenState, lang: 'en' | 'ur' = 'en') => {
  if (s.open) return '';
  if (lang === 'ur') {
    return `${s.reason === 'closed_day' ? 'آج ہماری چھٹی ہے' : 'اس وقت ہم بند ہیں'} — ابھی دیے گئے آرڈرز کی تصدیق ${s.nextOpenDayUr} ${s.nextOpenTimeUr} سے کی جائے گی۔`;
  }
  return `${s.reason === 'closed_day' ? "We're closed today" : "We're closed right now"} — orders placed now are confirmed ${s.nextOpenDay} from ${s.nextOpenTime}.`;
};

/** Urdu sentence for the structured business hours, e.g. "روزانہ صبح 9 بجے سے شام 7 بجے تک (جمعہ چھٹی)". */
export function hoursTextUr(hours: Hours) {
  const closed = hours.closed_days.map((d) => DAY_NAMES_UR[d]).join('، ');
  return `روزانہ ${formatTimeUr(hours.open)} سے ${formatTimeUr(hours.close)} تک${closed ? ` (${closed} چھٹی)` : ''}`;
}
