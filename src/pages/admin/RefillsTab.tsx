import { useState } from 'react';
import { RefreshCw, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { adminApi } from '@/lib/api';
import { useAdminData, errMsg, fmtDate, toIntlPk, ErrorNote, PageTitle, TableMessage } from './ui';
import { SCHEDULE_LABEL } from './orderFormat';
import { PhoneLinks, type Customer } from './CustomersTab';

type DueCustomer = Customer & { next_due: string };

const SCHEDULE_WORD: Record<string, string> = { weekly: 'weekly', biweekly: 'bi-weekly', monthly: 'monthly' };

const reminderText = (c: DueCustomer) => {
  const plan = ['One Water', SCHEDULE_WORD[c.delivery_schedule || ''], '19L refill'].filter(Boolean).join(' ');
  return `Assalam o Alaikum ${c.name}! Your ${plan} is due. Reply YES and we'll deliver today/tomorrow — swap your empties, no deposit.`;
};

export default function RefillsTab({ onChanged }: { onChanged?: () => void }) {
  const { data: rows, setData, loading, error, reload } = useAdminData<DueCustomer[]>('/customers/refills-due', []);
  const [busy, setBusy] = useState<string | null>(null);

  const remind = async (c: DueCustomer) => {
    // Open WhatsApp synchronously (inside the click) so popup blockers allow it.
    window.open(`https://wa.me/${toIntlPk(c.phone)}?text=${encodeURIComponent(reminderText(c))}`, '_blank', 'noopener,noreferrer');
    setBusy(c.phone);
    try {
      await adminApi(`/customers/${encodeURIComponent(c.phone)}/reminded`, { method: 'POST' });
      setData(list => list.filter(x => x.phone !== c.phone));
      onChanged?.();
      toast.success(`Marked ${c.name} as reminded.`);
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(null);
    }
  };

  const now = Date.now();

  return (
    <div className="space-y-4">
      <PageTitle actions={<Button variant="outline" size="sm" className="h-10" onClick={reload}><RefreshCw className="w-4 h-4 mr-2" /> Refresh</Button>}>Refills due</PageTitle>
      <p className="text-sm text-muted-foreground max-w-3xl">
        Regular 19L customers whose next refill is due by tomorrow and who haven't ordered or been reminded since their last delivery.
        &ldquo;Send WhatsApp reminder&rdquo; opens WhatsApp with a ready message — press send there — and removes them from this list.
      </p>
      <ErrorNote>{error}</ErrorNote>
      <div className="glass-card rounded-xl overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>Schedule</TableHead>
              <TableHead>Due</TableHead><TableHead>Bottles held</TableHead><TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && <TableMessage cols={6}>Loading…</TableMessage>}
            {!loading && rows.length === 0 && <TableMessage cols={6}>No refills due right now.</TableMessage>}
            {!loading && rows.map(c => {
              const overdue = new Date(c.next_due).getTime() < now;
              return (
                <TableRow key={c.phone}>
                  <TableCell>
                    <div className="font-medium">{c.name}</div>
                    {c.area && <div className="text-xs text-muted-foreground">{c.area}</div>}
                  </TableCell>
                  <TableCell><PhoneLinks phone={c.phone} /></TableCell>
                  <TableCell className="text-sm">{SCHEDULE_LABEL[c.delivery_schedule || ''] || c.delivery_schedule}</TableCell>
                  <TableCell className={`text-sm whitespace-nowrap ${overdue ? 'text-yellow-500' : ''}`}>
                    {fmtDate(c.next_due, false)}{overdue && ' (overdue)'}
                  </TableCell>
                  <TableCell>{c.bottles_held}</TableCell>
                  <TableCell>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" disabled={busy === c.phone} onClick={() => remind(c)}>
                      <MessageCircle className="w-4 h-4 mr-1" /> Send WhatsApp reminder
                    </Button>
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
