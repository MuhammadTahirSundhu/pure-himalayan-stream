// Shared order labels/formatters (kept out of component files for fast refresh).
import type { OrderItem } from './OrdersTab';

export const SCHEDULE_LABEL: Record<string, string> = { once: 'One-time', weekly: 'Weekly', biweekly: 'Every 2 weeks', monthly: 'Monthly' };
export const SLOT_LABEL: Record<string, string> = { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening', any: 'Any time' };

/** "2×19L Bottle; 6×500ml Bottle" */
export const itemsText = (items: OrderItem[]) => items.map(i => `${i.quantity}×${i.name}`).join('; ');
