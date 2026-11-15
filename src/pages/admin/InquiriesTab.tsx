import { RefreshCw, Trash2, MapPin, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adminApi } from '@/lib/api';
import { useAdminData, run, fmtDate, toIntlPk, ErrorNote, PageTitle, TableMessage, Card } from './ui';

type InquiryStatus = 'new' | 'contacted' | 'won' | 'lost';
interface EventInquiry {
  id: string; name: string; phone: string; email: string | null; event_type: string | null;
  event_date: string | null; event_location: string | null; bottle_size: string | null;
  quantity: string | null; notes: string | null; status: InquiryStatus; created_at: string;
}
interface WaitlistEntry { id: string; name: string; phone: string; city: string; created_at: string }
interface Waitlist { entries: WaitlistEntry[]; by_city: { city: string; count: number }[] }

const INQ_STATUSES: InquiryStatus[] = ['new', 'contacted', 'won', 'lost'];
const inqColors: Record<InquiryStatus, string> = {
  new: 'text-primary', contacted: 'text-yellow-500', won: 'text-green-500', lost: 'text-muted-foreground',
};

const PhoneLinks = ({ phone }: { phone: string }) => (
  <div className="text-xs space-x-2">
    <a href={`tel:+${toIntlPk(phone)}`} className="hover:underline">{phone}</a>
    <a href={`https://wa.me/${toIntlPk(phone)}`} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:underline">WhatsApp</a>
  </div>
);

export default function InquiriesTab({ onChanged }: { onChanged?: () => void }) {
  const events = useAdminData<EventInquiry[]>('/inquiries/events', []);
  const waitlist = useAdminData<Waitlist>('/inquiries/waitlist', { entries: [], by_city: [] });
  const maxCount = Math.max(1, ...waitlist.data.by_city.map(c => c.count));

  const setStatus = async (inq: EventInquiry, status: InquiryStatus) => {
    if (await run(() => adminApi(`/inquiries/events/${inq.id}`, { method: 'PATCH', json: { status } }))) {
      events.setData(list => list.map(x => (x.id === inq.id ? { ...x, status } : x)));
      onChanged?.();
    }
  };

  const removeInquiry = async (inq: EventInquiry) => {
    if (!window.confirm(`Delete the inquiry from ${inq.name}?`)) return;
    if (await run(() => adminApi(`/inquiries/events/${inq.id}`, { method: 'DELETE' }), 'Inquiry deleted.')) {
      events.setData(list => list.filter(x => x.id !== inq.id));
      onChanged?.();
    }
  };

  const removeEntry = async (e: WaitlistEntry) => {
    if (!window.confirm(`Remove ${e.name} (${e.city}) from the waitlist?`)) return;
    if (await run(() => adminApi(`/inquiries/waitlist/${e.id}`, { method: 'DELETE' }), 'Entry removed.')) {
      waitlist.reload();
      onChanged?.();
    }
  };

  return (
    <div className="space-y-8">
      <PageTitle actions={<Button variant="outline" size="sm" onClick={() => { events.reload(); waitlist.reload(); }}><RefreshCw className="w-4 h-4 mr-2" /> Refresh</Button>}>
        Inquiries
      </PageTitle>

      <section className="space-y-3">
        <h2 className="font-heading font-semibold text-lg flex items-center gap-2"><PartyPopper className="w-5 h-5 text-primary" /> Event & bulk inquiries</h2>
        <ErrorNote>{events.error}</ErrorNote>
        <div className="glass-card rounded-xl overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Received</TableHead><TableHead>Contact</TableHead><TableHead>Event</TableHead>
                <TableHead>Requirement</TableHead><TableHead>Status</TableHead><TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.loading && <TableMessage cols={6}>Loading inquiries…</TableMessage>}
              {!events.loading && events.data.length === 0 && <TableMessage cols={6}>No event inquiries yet.</TableMessage>}
              {events.data.map(inq => (
                <TableRow key={inq.id} className={inq.status === 'new' ? 'bg-primary/5' : ''}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{fmtDate(inq.created_at)}</TableCell>
                  <TableCell>
                    <div className={inq.status === 'new' ? 'font-bold' : 'font-medium'}>{inq.name}</div>
                    <PhoneLinks phone={inq.phone} />
                    {inq.email && <a href={`mailto:${inq.email}`} className="text-xs text-muted-foreground hover:underline">{inq.email}</a>}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>{inq.event_type || '—'}</div>
                    <div className="text-xs text-muted-foreground">{[inq.event_date, inq.event_location].filter(Boolean).join(' · ')}</div>
                  </TableCell>
                  <TableCell className="text-sm max-w-[260px]">
                    <div>{[inq.quantity, inq.bottle_size].filter(Boolean).join(' × ') || '—'}</div>
                    {inq.notes && <div className="text-xs text-muted-foreground whitespace-pre-wrap">{inq.notes}</div>}
                  </TableCell>
                  <TableCell>
                    <Select value={inq.status} onValueChange={v => setStatus(inq, v as InquiryStatus)}>
                      <SelectTrigger className={`w-32 h-8 capitalize ${inqColors[inq.status]}`}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {INQ_STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => removeInquiry(inq)} aria-label="Delete inquiry"><Trash2 className="w-4 h-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading font-semibold text-lg flex items-center gap-2"><MapPin className="w-5 h-5 text-primary" /> City waitlist</h2>
        <p className="text-sm text-muted-foreground">People asking for OneWater in their city. The city at the top has the most demand — a good candidate to expand to next.</p>
        <ErrorNote>{waitlist.error}</ErrorNote>
        <Card title="Demand by city" className="max-w-xl">
          {waitlist.data.by_city.length === 0 && <p className="text-sm text-muted-foreground">{waitlist.loading ? 'Loading…' : 'No waitlist sign-ups yet.'}</p>}
          <div className="space-y-2">
            {waitlist.data.by_city.map((c, i) => (
              <div key={c.city} className="flex items-center gap-3 text-sm">
                <span className={`w-32 truncate ${i === 0 ? 'font-bold text-primary' : ''}`}>{c.city}</span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full water-gradient" style={{ width: `${(c.count / maxCount) * 100}%` }} />
                </div>
                <span className="w-10 text-right font-semibold">{c.count}</span>
              </div>
            ))}
          </div>
        </Card>
        <div className="glass-card rounded-xl overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow><TableHead>Joined</TableHead><TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>City</TableHead><TableHead /></TableRow>
            </TableHeader>
            <TableBody>
              {!waitlist.loading && waitlist.data.entries.length === 0 && <TableMessage cols={5}>No entries.</TableMessage>}
              {waitlist.data.entries.map(e => (
                <TableRow key={e.id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{fmtDate(e.created_at)}</TableCell>
                  <TableCell>{e.name}</TableCell>
                  <TableCell><PhoneLinks phone={e.phone} /></TableCell>
                  <TableCell>{e.city}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => removeEntry(e)} aria-label="Remove entry"><Trash2 className="w-4 h-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
