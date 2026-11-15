import { useState } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { adminApi } from '@/lib/api';
import { useAdminData, run, Card, Field, ImagePicker, ErrorNote, PageTitle, TableMessage, StatusPill, Spinner } from './ui';

interface Client {
  id: string; name: string; logo_url: string | null; website_url: string | null; is_active: boolean; sort_order: number;
}

const isHttpUrl = (s: string) => {
  try { return ['http:', 'https:'].includes(new URL(s).protocol); } catch { return false; }
};

export default function ClientsTab() {
  const { data: clients, setData, loading, error } = useAdminData<Client[]>('/clients', []);
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [logo, setLogo] = useState<File | null>(null);
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const add = async () => {
    setFormError('');
    if (!name.trim()) return setFormError('Client name is required.');
    if (website.trim() && !isHttpUrl(website.trim())) return setFormError('Website must start with http:// or https://');
    const fd = new FormData();
    fd.append('name', name.trim());
    fd.append('website_url', website.trim());
    fd.append('sort_order', sortOrder);
    if (logo) fd.append('logo', logo);
    setBusy(true);
    const res = await run(() => adminApi<{ client: Client }>('/clients', { method: 'POST', body: fd }), 'Client added.');
    setBusy(false);
    if (res) {
      setData(list => [...list, res.client].sort((a, b) => a.sort_order - b.sort_order));
      setName(''); setWebsite(''); setSortOrder('0'); setLogo(null);
    }
  };

  const toggle = async (c: Client) => {
    const res = await run(() => adminApi<{ client: Client }>(`/clients/${c.id}/toggle`, { method: 'PATCH' }));
    if (res) setData(list => list.map(x => (x.id === c.id ? res.client : x)));
  };

  const remove = async (c: Client) => {
    if (!window.confirm(`Delete client "${c.name}"?`)) return;
    if (await run(() => adminApi(`/clients/${c.id}`, { method: 'DELETE' }), 'Client deleted.')) {
      setData(list => list.filter(x => x.id !== c.id));
    }
  };

  return (
    <div className="space-y-6">
      <PageTitle>Featured Clients</PageTitle>
      <Card title="Add New Client" icon={<Plus className="w-4 h-4 text-primary" />} className="max-w-2xl">
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="Client / company name *"><Input value={name} onChange={e => setName(e.target.value)} maxLength={80} /></Field>
          <Field label="Website" hint="Optional, must start with https://"><Input placeholder="https://example.com" value={website} onChange={e => setWebsite(e.target.value)} /></Field>
          <Field label="Sort order" hint="0 = first"><Input type="number" min="0" value={sortOrder} onChange={e => setSortOrder(e.target.value)} /></Field>
        </div>
        <ImagePicker label="Client logo" file={logo} onChange={setLogo} maxMb={3}
          hint="If no logo is uploaded, initials will be shown with a unique colour on the homepage." />
        <ErrorNote>{formError}</ErrorNote>
        <Button className="water-gradient text-primary-foreground" onClick={add} disabled={busy}>
          {busy ? <span className="flex items-center gap-2"><Spinner /> Uploading…</span> : 'Add client'}
        </Button>
      </Card>

      <ErrorNote>{error}</ErrorNote>
      <div className="glass-card rounded-xl overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead><TableHead>Logo</TableHead><TableHead>Website</TableHead>
              <TableHead>Order</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && <TableMessage cols={6}>Loading clients…</TableMessage>}
            {!loading && clients.length === 0 && <TableMessage cols={6}>No clients yet. Add your first client above.</TableMessage>}
            {clients.map(c => (
              <TableRow key={c.id}>
                <TableCell className="font-semibold">{c.name}</TableCell>
                <TableCell>
                  {c.logo_url
                    ? <img src={c.logo_url} alt={c.name} className="h-8 w-auto max-w-[80px] object-contain rounded" onError={e => (e.currentTarget.style.display = 'none')} />
                    : <span className="text-xs text-muted-foreground italic">No logo</span>}
                </TableCell>
                <TableCell className="text-xs text-primary truncate max-w-[160px]">
                  {c.website_url ? <a href={c.website_url} target="_blank" rel="noopener noreferrer" className="hover:underline">{c.website_url}</a> : '—'}
                </TableCell>
                <TableCell>{c.sort_order}</TableCell>
                <TableCell>
                  <StatusPill className={c.is_active ? 'bg-green-500/15 text-green-500' : 'bg-muted text-muted-foreground'}>{c.is_active ? 'Visible' : 'Hidden'}</StatusPill>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => toggle(c)} title={c.is_active ? 'Hide' : 'Show'}>
                      {c.is_active ? <ToggleRight className="w-4 h-4 text-accent" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => remove(c)} aria-label="Delete client"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
