import { useEffect, useState } from 'react';
import { Search, RefreshCw, Phone, MessageCircle, Users, Droplets, Wallet, Undo2, History, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { adminApi } from '@/lib/api';
import { useAdminData, run, pkr, fmtDate, toIntlPk, Field, ErrorNote, PageTitle, TableMessage } from './ui';
import { SCHEDULE_LABEL } from './orderFormat';

export interface Customer {
  phone: string; name: string; city: string | null; area: string | null; street: string | null;
  bottles_held: number; deposit_held: number | string; referral_code: string | null; referral_credit: number | string;
  referred_by: string | null; orders_count: number; delivery_schedule: string | null;
  last_order_at: string | null; last_delivered_at: string | null; last_reminded_at: string | null; notes: string | null;
}
interface BottleEvent { id: string; order_id: string | null; bottles_change: number; deposit_change: number | string; note: string | null; created_at: string }
interface CustomersResponse { customers: Customer[]; totals: { bottles: number; deposit: number; customers: number } }

const enc = (phone: string) => encodeURIComponent(phone);

/** tel: + WhatsApp links for a Pakistani number. */
export function PhoneLinks({ phone }: { phone: string }) {
  const intl = toIntlPk(phone);
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <a href={`tel:+${intl}`} className="text-primary hover:underline inline-flex items-center gap-1"><Phone className="w-3 h-3" />{phone}</a>
      <a href={`https://wa.me/${intl}`} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:underline" aria-label="WhatsApp"><MessageCircle className="w-3.5 h-3.5" /></a>
    </span>
  );
}

export default function CustomersTab() {
  const [query, setQuery] = useState('');
  const [q, setQ] = useState('');
  useEffect(() => { const t = setTimeout(() => setQ(query.trim()), 350); return () => clearTimeout(t); }, [query]);
  const { data, setData, loading, error, reload } = useAdminData<CustomersResponse>(
    `/customers${q ? `?q=${encodeURIComponent(q)}` : ''}`, { customers: [], totals: { bottles: 0, deposit: 0, customers: 0 } },
  );
  const [dialog, setDialog] = useState<{ kind: 'return' | 'ledger' | 'edit'; c: Customer } | null>(null);
  const [deposit, setDeposit] = useState<number | null>(null);
  useEffect(() => {
    adminApi<{ delivery_info: { bottle_deposit: number } }>('/settings').then(s => setDeposit(Number(s.delivery_info.bottle_deposit))).catch(() => setDeposit(null));
  }, []);

  const patchLocal = (c: Customer) => setData(d => ({ ...d, customers: d.customers.map(x => (x.phone === c.phone ? c : x)) }));
  const t = data.totals;
  const totals = [
    { label: 'Customers', value: String(t.customers), icon: Users },
    { label: '19L bottles out with customers', value: String(t.bottles), icon: Droplets },
    { label: 'Deposits held (refundable)', value: pkr(t.deposit), icon: Wallet },
  ];

  return (
    <div className="space-y-6">
      <PageTitle actions={<Button variant="outline" size="sm" className="h-10" onClick={reload}><RefreshCw className="w-4 h-4 mr-2" /> Refresh</Button>}>Customers</PageTitle>
      <div className="grid sm:grid-cols-3 gap-4">
        {totals.map(x => (
          <div key={x.label} className="glass-card rounded-xl p-5">
            <x.icon className="w-6 h-6 text-primary mb-2" />
            <p className="font-heading font-bold text-2xl text-foreground">{x.value}</p>
            <p className="text-sm text-muted-foreground">{x.label}</p>
          </div>
        ))}
      </div>
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search name, phone or area" value={query} onChange={e => setQuery(e.target.value)} />
      </div>
      <ErrorNote>{error}</ErrorNote>
      <div className="glass-card rounded-xl overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>Area</TableHead><TableHead>Orders</TableHead>
              <TableHead>Bottles</TableHead><TableHead>Deposit</TableHead><TableHead>Credit</TableHead><TableHead>Schedule</TableHead>
              <TableHead>Last delivered</TableHead><TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && <TableMessage cols={10}>Loading customers…</TableMessage>}
            {!loading && data.customers.length === 0 && <TableMessage cols={10}>{q ? 'No customers match your search.' : 'No customers yet — they appear here after their first order.'}</TableMessage>}
            {!loading && data.customers.map(c => (
              <TableRow key={c.phone}>
                <TableCell>
                  <div className="font-medium">{c.name}</div>
                  {c.notes && <div className="text-xs text-muted-foreground max-w-[14rem] truncate" title={c.notes}>{c.notes}</div>}
                </TableCell>
                <TableCell><PhoneLinks phone={c.phone} /></TableCell>
                <TableCell className="text-sm">{c.area || '—'}</TableCell>
                <TableCell>{c.orders_count}</TableCell>
                <TableCell className="font-semibold">{c.bottles_held}</TableCell>
                <TableCell className="whitespace-nowrap">{pkr(c.deposit_held)}</TableCell>
                <TableCell className="whitespace-nowrap">{Number(c.referral_credit) > 0 ? pkr(c.referral_credit) : '—'}</TableCell>
                <TableCell className="text-sm">{c.delivery_schedule ? SCHEDULE_LABEL[c.delivery_schedule] || c.delivery_schedule : '—'}</TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{fmtDate(c.last_delivered_at, false)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" disabled={c.bottles_held <= 0} onClick={() => setDialog({ kind: 'return', c })}><Undo2 className="w-4 h-4 mr-1" /> Bottles returned</Button>
                    <Button variant="ghost" size="sm" aria-label="Bottle ledger" title="Bottle ledger" onClick={() => setDialog({ kind: 'ledger', c })}><History className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" aria-label="Edit customer" title="Edit notes, schedule, credit" onClick={() => setDialog({ kind: 'edit', c })}><Pencil className="w-4 h-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!dialog} onOpenChange={open => !open && setDialog(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {dialog?.kind === 'return' && <ReturnBottles c={dialog.c} deposit={deposit} onDone={() => { setDialog(null); reload(); }} />}
          {dialog?.kind === 'ledger' && <Ledger c={dialog.c} />}
          {dialog?.kind === 'edit' && <EditCustomer c={dialog.c} onSaved={c => { patchLocal(c); setDialog(null); }} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReturnBottles({ c, deposit, onDone }: { c: Customer; deposit: number | null; onDone: () => void }) {
  const [count, setCount] = useState('1');
  const [refund, setRefund] = useState(false);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const n = Math.floor(Number(count));
  const valid = n >= 1 && n <= c.bottles_held;
  const refundAmount = deposit == null ? null : Math.min(Number(c.deposit_held), n * deposit);

  const submit = async () => {
    setBusy(true);
    const res = await run(() => adminApi<{ returned: number; refunded: number }>(`/customers/${enc(c.phone)}/bottles`, {
      method: 'POST', json: { returned: n, refund, ...(note.trim() ? { note: note.trim() } : {}) },
    }));
    setBusy(false);
    if (res) {
      onDone();
      toast.success(`${res.returned} bottle${res.returned === 1 ? '' : 's'} returned${res.refunded ? ` · ${pkr(res.refunded)} deposit refunded` : ''}.`);
    }
  };

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Bottles returned — {c.name}</DialogTitle>
        <DialogDescription>{c.name} currently holds <strong>{c.bottles_held}</strong> bottle{c.bottles_held === 1 ? '' : 's'} and {pkr(c.deposit_held)} in deposits.</DialogDescription>
      </DialogHeader>
      <Field label="Bottles handed back"><Input type="number" min={1} max={c.bottles_held} value={count} onChange={e => setCount(e.target.value)} /></Field>
      <label className="flex items-start gap-2 text-sm cursor-pointer">
        <Checkbox className="mt-0.5" checked={refund} onCheckedChange={v => setRefund(v === true)} />
        <span>
          Refund the deposit
          <span className="block text-xs text-muted-foreground">
            Tick this when the customer is giving bottles back for good and you pay them back {deposit != null ? pkr(deposit) : 'the deposit'} per bottle
            {refund && valid && refundAmount != null && <> — <strong className="text-foreground">pay {pkr(refundAmount)}</strong></>}.
            Leave it unticked for a simple record (e.g. extra empties collected) — no money changes hands.
          </span>
        </span>
      </label>
      <Field label="Note (optional)"><Input maxLength={200} value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Moving out of Gujranwala" /></Field>
      {!valid && <ErrorNote>Enter a number between 1 and {c.bottles_held}.</ErrorNote>}
      <Button className="water-gradient text-primary-foreground w-full" disabled={busy || !valid} onClick={submit}>
        {busy ? 'Saving…' : refund ? 'Record return & refund' : 'Record return'}
      </Button>
    </div>
  );
}

function Ledger({ c }: { c: Customer }) {
  const { data: events, loading, error } = useAdminData<BottleEvent[]>(`/customers/${enc(c.phone)}/bottles`, []);
  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Bottle ledger — {c.name}</DialogTitle>
        <DialogDescription>Now holding {c.bottles_held} bottle{c.bottles_held === 1 ? '' : 's'} · {pkr(c.deposit_held)} deposit.</DialogDescription>
      </DialogHeader>
      <ErrorNote>{error}</ErrorNote>
      {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : events.length === 0 ? <p className="text-sm text-muted-foreground">No bottle movements yet.</p> : (
        <div className="divide-y divide-border rounded-lg border border-border">
          {events.map(e => (
            <div key={e.id} className="p-3 text-sm flex justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">{fmtDate(e.created_at)}</p>
                <p>{e.note || (e.order_id ? 'Order delivered' : 'Adjustment')}</p>
              </div>
              <div className="text-right whitespace-nowrap">
                <p className={e.bottles_change > 0 ? 'text-yellow-500' : 'text-green-500'}>{e.bottles_change > 0 ? '+' : ''}{e.bottles_change} bottle{Math.abs(e.bottles_change) === 1 ? '' : 's'}</p>
                {Number(e.deposit_change) !== 0 && <p className="text-xs text-muted-foreground">{Number(e.deposit_change) > 0 ? '+' : '−'} {pkr(Math.abs(Number(e.deposit_change)))}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EditCustomer({ c, onSaved }: { c: Customer; onSaved: (c: Customer) => void }) {
  const initialSchedule = c.delivery_schedule && c.delivery_schedule !== 'once' ? c.delivery_schedule : 'none';
  const [notes, setNotes] = useState(c.notes || '');
  const [schedule, setSchedule] = useState(initialSchedule);
  const [credit, setCredit] = useState(String(Number(c.referral_credit)));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const save = async () => {
    setErr('');
    const json: Record<string, unknown> = {};
    if (notes !== (c.notes || '')) json.notes = notes.trim() || null;
    if (schedule !== initialSchedule) json.delivery_schedule = schedule === 'none' ? null : schedule;
    const cr = Number(credit);
    if (credit.trim() === '' || !Number.isFinite(cr) || cr < 0) return setErr('Credit must be 0 or more.');
    if (cr !== Number(c.referral_credit)) json.referral_credit = cr;
    if (!Object.keys(json).length) return setErr('Nothing changed.');
    setBusy(true);
    const res = await run(() => adminApi<Customer>(`/customers/${enc(c.phone)}`, { method: 'PATCH', json }), 'Customer updated.');
    setBusy(false);
    if (res) onSaved(res);
  };

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Edit — {c.name}</DialogTitle>
        <DialogDescription>{c.phone}{c.referral_code && <> · referral code <span className="font-mono">{c.referral_code}</span></>}</DialogDescription>
      </DialogHeader>
      <Field label="Refill schedule" hint="Used for the Refills reminder list.">
        <Select value={schedule} onValueChange={setSchedule}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No regular schedule</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="biweekly">Every 2 weeks</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Referral credit (PKR)" hint="Taken off this customer's next order automatically.">
        <Input type="number" min="0" value={credit} onChange={e => setCredit(e.target.value)} />
      </Field>
      <Field label="Notes (internal)"><Textarea rows={3} maxLength={1000} value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Gate code 42, call before coming" /></Field>
      <ErrorNote>{err}</ErrorNote>
      <Button className="water-gradient text-primary-foreground w-full" disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save'}</Button>
    </div>
  );
}
