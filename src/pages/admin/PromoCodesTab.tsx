import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { adminApi } from '@/lib/api';
import { useAdminData, run, pkr, fmtDate, Card, Field, ErrorNote, PageTitle, TableMessage, StatusPill } from './ui';

interface PromoCode {
  id: string; code: string; discount_percentage: number; is_active: boolean;
  expires_at: string | null; max_uses: number | null; times_used: number;
  min_order_amount: number; once_per_customer: boolean;
}

const EMPTY = { code: '', discount: '', expires: '', maxUses: '', minOrder: '', once: false };

export default function PromoCodesTab() {
  const { data: promos, setData, loading, error } = useAdminData<PromoCode[]>('/promo-codes', []);
  const [form, setForm] = useState(EMPTY);
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const create = async () => {
    setFormError('');
    if (!/^[A-Z0-9_-]{3,30}$/.test(form.code)) return setFormError('Code: 3–30 letters, numbers, - or _.');
    const pct = Number(form.discount);
    if (!(pct > 0 && pct <= 100)) return setFormError('Discount must be between 1 and 100.');
    setBusy(true);
    try {
      const { promo } = await adminApi<{ promo: PromoCode }>('/promo-codes', {
        method: 'POST',
        json: {
          code: form.code,
          discount_percentage: pct,
          // Valid until the end of the chosen day (local time)
          expires_at: form.expires ? new Date(`${form.expires}T23:59:59`).toISOString() : null,
          max_uses: form.maxUses ? Number(form.maxUses) : null,
          min_order_amount: form.minOrder ? Number(form.minOrder) : 0,
          once_per_customer: form.once,
        },
      });
      setData(list => [promo, ...list]);
      setForm(EMPTY);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not create promo code.');
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (p: PromoCode) => {
    const res = await run(() => adminApi<{ promo: PromoCode }>(`/promo-codes/${p.id}/toggle`, { method: 'PATCH' }));
    if (res) setData(list => list.map(x => (x.id === p.id ? res.promo : x)));
  };

  const remove = async (p: PromoCode) => {
    if (!window.confirm(`Delete promo code ${p.code}?`)) return;
    if (await run(() => adminApi(`/promo-codes/${p.id}`, { method: 'DELETE' }), 'Promo code deleted.')) {
      setData(list => list.filter(x => x.id !== p.id));
    }
  };

  const now = Date.now();

  return (
    <div className="space-y-6">
      <PageTitle>Promo Codes</PageTitle>
      <Card title="Create New Promo Code" icon={<Plus className="w-4 h-4 text-primary" />} className="max-w-3xl">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          <Field label="Code *"><Input placeholder="e.g. SUMMER15" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase().trim() }))} /></Field>
          <Field label="Discount % *"><Input type="number" min="1" max="100" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} /></Field>
          <Field label="Expires on" hint="Optional — valid through this day"><Input type="date" value={form.expires} onChange={e => setForm(f => ({ ...f, expires: e.target.value }))} /></Field>
          <Field label="Max uses" hint="Optional — blank = unlimited"><Input type="number" min="1" value={form.maxUses} onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))} /></Field>
          <Field label="Minimum order (PKR)" hint="Water subtotal, before deposit"><Input type="number" min="0" value={form.minOrder} onChange={e => setForm(f => ({ ...f, minOrder: e.target.value }))} /></Field>
          <label className="flex items-center gap-2 text-sm self-center pt-4 cursor-pointer">
            <Checkbox checked={form.once} onCheckedChange={v => setForm(f => ({ ...f, once: v === true }))} />
            Once per customer (by phone)
          </label>
        </div>
        <ErrorNote>{formError}</ErrorNote>
        <Button className="water-gradient text-primary-foreground" onClick={create} disabled={busy}>{busy ? 'Creating…' : 'Create code'}</Button>
      </Card>

      <ErrorNote>{error}</ErrorNote>
      <div className="glass-card rounded-xl overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead><TableHead>Discount</TableHead><TableHead>Used</TableHead>
              <TableHead>Expires</TableHead><TableHead>Min order</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && <TableMessage cols={7}>Loading promo codes…</TableMessage>}
            {!loading && promos.length === 0 && <TableMessage cols={7}>No promo codes yet.</TableMessage>}
            {promos.map(p => {
              const expired = !!p.expires_at && new Date(p.expires_at).getTime() < now;
              const usedUp = p.max_uses != null && p.times_used >= p.max_uses;
              return (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="font-mono font-bold">{p.code}</div>
                    {p.once_per_customer && <div className="text-xs text-muted-foreground">Once per customer</div>}
                  </TableCell>
                  <TableCell>{Number(p.discount_percentage)}%</TableCell>
                  <TableCell className={usedUp ? 'text-destructive' : ''}>{p.times_used ?? 0} / {p.max_uses ?? '∞'}</TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {p.expires_at ? <span className={expired ? 'text-destructive' : ''}>{fmtDate(p.expires_at, false)}{expired && ' (expired)'}</span> : 'Never'}
                  </TableCell>
                  <TableCell className="text-sm">{Number(p.min_order_amount) > 0 ? pkr(p.min_order_amount) : '—'}</TableCell>
                  <TableCell>
                    <StatusPill className={p.is_active && !expired && !usedUp ? 'bg-green-500/15 text-green-500' : 'bg-muted text-muted-foreground'}>
                      {!p.is_active ? 'Inactive' : expired ? 'Expired' : usedUp ? 'Used up' : 'Active'}
                    </StatusPill>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => toggle(p)}>{p.is_active ? 'Disable' : 'Enable'}</Button>
                      <Button variant="destructive" size="sm" onClick={() => remove(p)} aria-label="Delete promo code"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
