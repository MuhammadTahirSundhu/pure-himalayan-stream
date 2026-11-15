import { useEffect, useState } from 'react';
import { Eye, RefreshCw, Phone, MessageCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { adminApi } from '@/lib/api';
import { useAdminData, pkr, fmtDate, toIntlPk, errMsg, StatusPill, TableMessage, ErrorNote, PageTitle } from './ui';

export type OrderStatus = 'pending' | 'confirmed' | 'dispatched' | 'delivered' | 'rejected';

interface OrderItem { product_id: string; name: string; quantity: number; price: number; new_bottles: number; deposit: number }
export interface Order {
  id: string; order_ref: string; customer_name: string; phone: string;
  city: string; area: string | null; street: string;
  payment_method: string; status: OrderStatus; screenshot_url: string | null;
  subtotal: number | null; deposit_total: number; discount: number; delivery_fee: number; total: number;
  promo_code: string | null; delivery_schedule: string | null; customer_note: string | null;
  notes: string | null; created_at: string; status_updated_at: string | null; items: OrderItem[];
}

const STATUSES: OrderStatus[] = ['pending', 'confirmed', 'dispatched', 'delivered', 'rejected'];

/** Mirrors backend/lib/pricing.js ORDER_TRANSITIONS. */
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'rejected'],
  confirmed: ['dispatched', 'rejected'],
  dispatched: ['delivered', 'rejected'],
  delivered: [],
  rejected: [],
};

const ACTION_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending', confirmed: 'Confirm', dispatched: 'Mark dispatched', delivered: 'Mark delivered', rejected: 'Reject',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/15 text-yellow-500',
  confirmed: 'bg-blue-500/15 text-blue-400',
  dispatched: 'bg-purple-500/15 text-purple-400',
  delivered: 'bg-green-500/15 text-green-500',
  rejected: 'bg-red-500/15 text-red-400',
};

const SCHEDULE_LABEL: Record<string, string> = { once: 'One-time', weekly: 'Weekly', biweekly: 'Every 2 weeks', monthly: 'Monthly' };

export default function OrdersTab({ recent = false, onChanged }: { recent?: boolean; onChanged?: () => void }) {
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');
  const path = filter === 'all' ? '/orders' : `/orders?status=${filter}`;
  const { data: orders, setData: setOrders, loading, error, reload } = useAdminData<Order[]>(path, []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = orders.find(o => o.id === selectedId) || null;
  const shown = recent ? orders.slice(0, 5) : orders;

  const patchLocal = (id: string, patch: Partial<Order>) => setOrders(list => list.map(o => (o.id === id ? { ...o, ...patch } : o)));

  return (
    <div>
      {!recent && (
        <PageTitle actions={<>
          <Select value={filter} onValueChange={v => setFilter(v as typeof filter)}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All orders</SelectItem>
              {STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-10" onClick={reload}><RefreshCw className="w-4 h-4 mr-2" /> Refresh</Button>
        </>}>Order Management</PageTitle>
      )}
      <ErrorNote>{error}</ErrorNote>
      <div className="glass-card rounded-xl overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ref</TableHead><TableHead>Placed</TableHead><TableHead>Customer</TableHead>
              <TableHead>City</TableHead><TableHead>Total</TableHead><TableHead>Payment</TableHead>
              <TableHead>Status</TableHead><TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && <TableMessage cols={8}>Loading orders…</TableMessage>}
            {!loading && shown.length === 0 && <TableMessage cols={8}>No orders found.</TableMessage>}
            {!loading && shown.map(o => (
              <TableRow key={o.id} className="cursor-pointer" onClick={() => setSelectedId(o.id)}>
                <TableCell className="font-mono font-medium text-xs">{o.order_ref}</TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{fmtDate(o.created_at)}</TableCell>
                <TableCell>{o.customer_name}</TableCell>
                <TableCell>{o.city}</TableCell>
                <TableCell className="font-semibold whitespace-nowrap">{pkr(o.total)}</TableCell>
                <TableCell className="uppercase text-xs">{o.payment_method}</TableCell>
                <TableCell><StatusPill className={statusColors[o.status]}>{o.status}</StatusPill></TableCell>
                <TableCell><Button variant="ghost" size="sm" aria-label="View order"><Eye className="w-4 h-4" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selected} onOpenChange={open => !open && setSelectedId(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selected && (
            <OrderDetail
              key={selected.id}
              order={selected}
              onUpdated={patch => {
                patchLocal(selected.id, patch);
                onChanged?.();
                // Leave the filtered list consistent when the status moved out of it
                if (patch.status && filter !== 'all' && patch.status !== filter) reload();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}

function OrderDetail({ order, onUpdated }: { order: Order; onUpdated: (patch: Partial<Order>) => void }) {
  const [notes, setNotes] = useState(order.notes || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState<OrderStatus | null>(null);
  useEffect(() => { setNotes(order.notes || ''); }, [order.notes]);

  const save = async (status: OrderStatus, withNotes: boolean) => {
    setBusy(true);
    setError('');
    try {
      await adminApi(`/orders/${order.id}/status`, { method: 'PUT', json: withNotes ? { status, notes } : { status } });
      const patch: Partial<Order> = withNotes ? { notes: notes.trim() ? notes : null } : {};
      if (status !== order.status) Object.assign(patch, { status, status_updated_at: new Date().toISOString() });
      onUpdated(patch);
      toast.success(status !== order.status ? `Order marked ${status}.` : 'Notes saved.');
      setConfirming(null);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const next = TRANSITIONS[order.status];
  const intl = toIntlPk(order.phone);
  const address = [order.street, order.area, order.city].filter(Boolean).join(', ');
  const subtotal = order.subtotal ?? order.items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3">
          <span className="font-mono">{order.order_ref}</span>
          <StatusPill className={statusColors[order.status]}>{order.status}</StatusPill>
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-1.5">
        <Row label="Customer"><strong>{order.customer_name}</strong></Row>
        <Row label="Phone">
          <span className="inline-flex items-center gap-2">
            <a href={`tel:+${intl}`} className="text-primary hover:underline inline-flex items-center gap-1"><Phone className="w-3 h-3" />{order.phone}</a>
            <a href={`https://wa.me/${intl}`} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:underline inline-flex items-center gap-1"><MessageCircle className="w-3 h-3" />WhatsApp</a>
          </span>
        </Row>
        <Row label="Address">{address}</Row>
        <Row label="Payment"><span className="uppercase">{order.payment_method}</span></Row>
        {order.screenshot_url && (
          <Row label="Screenshot">
            <a href={order.screenshot_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">View <ExternalLink className="w-3 h-3" /></a>
          </Row>
        )}
        {order.delivery_schedule && <Row label="Delivery schedule">{SCHEDULE_LABEL[order.delivery_schedule] || order.delivery_schedule}</Row>}
        <Row label="Placed">{fmtDate(order.created_at)}</Row>
        {order.status_updated_at && <Row label="Status updated">{fmtDate(order.status_updated_at)}</Row>}
      </div>

      {order.customer_note && (
        <div className="rounded-lg bg-muted/40 p-3 text-sm">
          <p className="text-xs text-muted-foreground mb-1">Customer note</p>
          <p className="whitespace-pre-wrap">{order.customer_note}</p>
        </div>
      )}

      <div className="rounded-lg border border-border p-3 space-y-1.5">
        {order.items.map((it, i) => (
          <div key={i} className="text-sm">
            <div className="flex justify-between gap-4">
              <span>{it.name} × {it.quantity}</span>
              <span>{pkr(Number(it.price) * it.quantity)}</span>
            </div>
            {Number(it.deposit) > 0 || it.new_bottles > 0 ? (
              <div className="flex justify-between gap-4 text-xs text-muted-foreground pl-3">
                <span>{it.new_bottles} new bottle{it.new_bottles === 1 ? '' : 's'} (deposit) · {it.quantity - it.new_bottles} exchanged</span>
                <span>{pkr(it.deposit)}</span>
              </div>
            ) : null}
          </div>
        ))}
        <div className="border-t border-border pt-2 mt-2 space-y-1">
          <Row label="Subtotal (water)">{pkr(subtotal)}</Row>
          {Number(order.discount) > 0 && <Row label={`Discount${order.promo_code ? ` (${order.promo_code})` : ''}`}>− {pkr(order.discount)}</Row>}
          {!Number(order.discount) && order.promo_code && <Row label="Promo code">{order.promo_code}</Row>}
          {Number(order.deposit_total) > 0 && <Row label="Bottle deposit (refundable)">{pkr(order.deposit_total)}</Row>}
          <Row label="Delivery fee">{Number(order.delivery_fee) > 0 ? pkr(order.delivery_fee) : 'Free'}</Row>
          <div className="flex justify-between font-heading font-bold text-lg pt-1">
            <span>Total</span><span>{pkr(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Admin notes (internal)</p>
        <Textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} maxLength={1000} placeholder="e.g. Called customer, delivering at 5pm" />
        <Button size="sm" variant="outline" disabled={busy || notes === (order.notes || '')} onClick={() => save(order.status, true)}>
          {notes.trim() || !order.notes ? 'Save notes' : 'Clear notes'}
        </Button>
      </div>

      <ErrorNote>{error}</ErrorNote>

      {next.length === 0 ? (
        <p className="text-xs text-muted-foreground">This order is {order.status} — no further status changes are possible.</p>
      ) : confirming ? (
        <div className="rounded-lg border border-border p-3 space-y-2">
          <p className="text-sm">Mark this order <strong>{confirming}</strong>? This is final and can't be undone.</p>
          <div className="flex gap-2">
            <Button size="sm" variant={confirming === 'rejected' ? 'destructive' : 'default'} disabled={busy} onClick={() => save(confirming, false)}>Yes, mark {confirming}</Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirming(null)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          {next.map(s => (
            <Button
              key={s}
              disabled={busy}
              variant={s === 'rejected' ? 'destructive' : 'default'}
              className={`flex-1 ${s === 'rejected' ? '' : 'water-gradient text-primary-foreground'}`}
              onClick={() => (s === 'rejected' || s === 'delivered' ? setConfirming(s) : save(s, false))}
            >
              {ACTION_LABEL[s]}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
