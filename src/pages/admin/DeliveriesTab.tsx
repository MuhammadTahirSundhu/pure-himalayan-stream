import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Printer, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { adminApi } from '@/lib/api';
import { errMsg, pkr, ErrorNote, PageTitle, StatusPill } from './ui';
import { PhoneLinks } from './CustomersTab';
import type { Order } from './OrdersTab';
import { SLOT_LABEL, SCHEDULE_LABEL, itemsText } from './orderFormat';

const SLOT_ORDER = ['morning', 'afternoon', 'evening', 'any'];
const slotRank = (s: string | null) => { const i = SLOT_ORDER.indexOf(s || 'any'); return i < 0 ? SLOT_ORDER.length : i; };
const NO_AREA = 'No area';

export default function DeliveriesTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [confirmed, dispatched] = await Promise.all(['confirmed', 'dispatched'].map(s => adminApi<Order[]>(`/orders?status=${s}`)));
      setOrders([...dispatched, ...confirmed]);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const groups = new Map<string, Order[]>();
  for (const o of orders) {
    const area = o.area?.trim() || NO_AREA;
    groups.set(area, [...(groups.get(area) || []), o]);
  }
  const areas = [...groups.keys()].sort((a, b) => (a === NO_AREA ? 1 : b === NO_AREA ? -1 : a.localeCompare(b)));
  const toCollect = orders.reduce((s, o) => s + (o.payment_method === 'cod' ? Number(o.total) : 0), 0);

  return (
    <div className="space-y-4 print:text-black print:bg-white">
      <PageTitle actions={<div className="flex gap-2 print:hidden">
        <Button variant="outline" size="sm" className="h-10" onClick={load}><RefreshCw className="w-4 h-4 mr-2" /> Refresh</Button>
        <Button size="sm" className="h-10 water-gradient text-primary-foreground" disabled={!orders.length} onClick={() => window.print()}><Printer className="w-4 h-4 mr-2" /> Print</Button>
      </div>}>
        <span className="print:text-black">Deliveries — route sheet</span>
      </PageTitle>
      <p className="text-sm text-muted-foreground print:text-black">
        {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} ·
        {' '}{orders.length} stop{orders.length === 1 ? '' : 's'} (confirmed + dispatched) · Cash to collect: <strong className="text-foreground print:text-black">{pkr(toCollect)}</strong>
      </p>
      <ErrorNote>{error}</ErrorNote>
      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!loading && !error && orders.length === 0 && <p className="text-sm text-muted-foreground">No confirmed or dispatched orders — nothing to deliver.</p>}

      {areas.map(area => {
        const list = [...groups.get(area)!].sort((a, b) => slotRank(a.preferred_slot) - slotRank(b.preferred_slot) || a.created_at.localeCompare(b.created_at));
        return (
          <section key={area} className="break-inside-avoid-page">
            <h2 className="font-heading font-semibold text-lg flex items-center gap-2 mb-2 print:text-black print:border-b print:border-black">
              <MapPin className="w-4 h-4 text-primary print:hidden" /> {area} <span className="text-sm font-normal text-muted-foreground print:text-black">({list.length})</span>
            </h2>
            <div className="glass-card rounded-xl divide-y divide-border print:rounded-none print:shadow-none print:bg-white print:border print:border-black print:divide-black print:backdrop-blur-none">
              {list.map(o => {
                const cod = o.payment_method === 'cod';
                const note = [o.customer_note, o.notes].filter(Boolean).join(' · ');
                return (
                  <div key={o.id} className="p-4 grid gap-2 md:grid-cols-[1fr_auto] break-inside-avoid print:p-2 print:text-black">
                    <div className="space-y-1 text-sm min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs">{o.order_ref}</span>
                        <strong>{o.customer_name}</strong>
                        <span className="print:hidden"><PhoneLinks phone={o.phone} /></span>
                        <span className="hidden print:inline">{o.phone}</span>
                        <StatusPill className={`print:bg-transparent print:text-black print:border print:border-black ${o.status === 'dispatched' ? 'bg-purple-500/15 text-purple-400' : 'bg-blue-500/15 text-blue-400'}`}>{o.status}</StatusPill>
                        <span className="text-xs text-muted-foreground print:text-black">⏰ {SLOT_LABEL[o.preferred_slot || 'any'] || o.preferred_slot}</span>
                      </div>
                      <p>{[o.street, o.area, o.city].filter(Boolean).join(', ')}</p>
                      <p className="text-muted-foreground print:text-black">
                        {itemsText(o.items)}
                        {o.items.some(i => i.new_bottles > 0) && ` · ${o.items.reduce((s, i) => s + i.new_bottles, 0)} new bottle(s), rest swap empties`}
                        {o.delivery_schedule && o.delivery_schedule !== 'once' && ` · ${SCHEDULE_LABEL[o.delivery_schedule] || o.delivery_schedule}`}
                      </p>
                      {note && <p className="text-xs italic text-yellow-500/90 print:text-black">Note: {note}</p>}
                    </div>
                    <div className="md:text-right text-sm whitespace-nowrap">
                      {cod ? (
                        <><p className="text-xs text-muted-foreground print:text-black">Collect (COD)</p><p className="font-heading font-bold text-lg">{pkr(o.total)}</p></>
                      ) : (
                        <p className="text-green-500 print:text-black">Paid · <span className="uppercase">{o.payment_method}</span></p>
                      )}
                      <p className="hidden print:block mt-2 text-xs">☐ Delivered</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
