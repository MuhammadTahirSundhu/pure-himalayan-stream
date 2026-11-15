import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { adminApi } from '@/lib/api';
import { useAdminData, run, pkr, Card, Field, ImagePicker, ErrorNote, PageTitle, TableMessage, StatusPill, Spinner } from './ui';

interface Offer {
  id: string; title: string; description: string; original_price: number; sale_price: number;
  promo_code: string; discount_text: string; image_url: string | null; badge_text: string;
  color_gradient: string; icon_color: string; sort_order: number; is_active: boolean;
}

const EMPTY = {
  title: '', description: '', original_price: '', sale_price: '', promo_code: '', discount_text: '',
  badge_text: '', color_gradient: 'from-cyan-500/20 to-cyan-700/5', icon_color: 'text-cyan-400', sort_order: '0', is_active: true,
};
type Form = typeof EMPTY;

const toForm = (o: Offer): Form => ({
  title: o.title, description: o.description, original_price: String(Number(o.original_price) || ''),
  sale_price: String(Number(o.sale_price) || ''), promo_code: o.promo_code || '', discount_text: o.discount_text,
  badge_text: o.badge_text || '', color_gradient: o.color_gradient || '', icon_color: o.icon_color || '',
  sort_order: String(o.sort_order ?? 0), is_active: o.is_active,
});

export default function OffersTab() {
  const { data: offers, setData, loading, error, reload } = useAdminData<Offer[]>('/offers', []);
  const [form, setForm] = useState<Form>(EMPTY);
  const [editing, setEditing] = useState<Offer | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const reset = () => { setForm(EMPTY); setEditing(null); setImage(null); setRemoveImage(false); setFormError(''); };

  const startEdit = (o: Offer) => {
    setEditing(o); setForm(toForm(o)); setImage(null); setRemoveImage(false); setFormError('');
    document.getElementById('offer-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const submit = async () => {
    setFormError('');
    if (!form.title.trim() || !form.description.trim() || !form.discount_text.trim()) {
      return setFormError('Title, description and discount text are required.');
    }
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
    if (image) fd.append('image', image);
    else if (editing && removeImage) fd.append('remove_image', 'true');
    setBusy(true);
    const res = await run(
      () => adminApi<Offer>(editing ? `/offers/${encodeURIComponent(editing.id)}` : '/offers', { method: editing ? 'PUT' : 'POST', body: fd }),
      editing ? 'Offer updated.' : 'Offer added.',
    );
    setBusy(false);
    if (res) { reset(); reload(); }
  };

  const remove = async (o: Offer) => {
    if (!window.confirm(`Delete the offer "${o.title}"?`)) return;
    if (await run(() => adminApi(`/offers/${encodeURIComponent(o.id)}`, { method: 'DELETE' }), 'Offer deleted.')) {
      setData(list => list.filter(x => x.id !== o.id));
      if (editing?.id === o.id) reset();
    }
  };

  return (
    <div className="space-y-6">
      <PageTitle>Offers</PageTitle>
      <div id="offer-form">
        <Card
          title={editing ? `Edit offer — ${editing.title}` : 'Add New Offer'}
          icon={editing ? <Pencil className="w-4 h-4 text-primary" /> : <Plus className="w-4 h-4 text-primary" />}
          className="max-w-2xl"
        >
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Title *"><Input value={form.title} onChange={set('title')} maxLength={80} /></Field>
            <Field label="Discount text *"><Input placeholder="e.g. 15% OFF" value={form.discount_text} onChange={set('discount_text')} maxLength={30} /></Field>
            <Field label="Badge text"><Input placeholder="e.g. Eid Special" value={form.badge_text} onChange={set('badge_text')} maxLength={40} /></Field>
            <Field label="Promo code" hint="Optional — create it under Promo Codes too"><Input value={form.promo_code} onChange={e => setForm(f => ({ ...f, promo_code: e.target.value.toUpperCase() }))} /></Field>
            <Field label="Original price (PKR)"><Input type="number" min="0" value={form.original_price} onChange={set('original_price')} /></Field>
            <Field label="Sale price (PKR)"><Input type="number" min="0" value={form.sale_price} onChange={set('sale_price')} /></Field>
            <Field label="Card gradient (Tailwind classes)"><Input value={form.color_gradient} onChange={set('color_gradient')} /></Field>
            <Field label="Icon colour (Tailwind class)"><Input value={form.icon_color} onChange={set('icon_color')} /></Field>
            <Field label="Sort order" hint="0 = first"><Input type="number" value={form.sort_order} onChange={set('sort_order')} /></Field>
            <label className="flex items-center gap-2 text-sm self-center pt-4 cursor-pointer">
              <Checkbox checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v === true }))} />
              Show on website
            </label>
          </div>
          <Field label="Description *"><Textarea value={form.description} onChange={set('description')} rows={2} maxLength={400} /></Field>

          {editing?.image_url && !image && (
            <div className="flex items-center gap-3 text-sm">
              <img src={editing.image_url} alt="" className={`h-12 w-12 object-contain rounded border border-border bg-white p-1 ${removeImage ? 'opacity-30' : ''}`} />
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={removeImage} onCheckedChange={v => setRemoveImage(v === true)} /> Remove current image
              </label>
            </div>
          )}
          <ImagePicker label={editing?.image_url ? 'Replace image' : 'Offer image'} file={image} onChange={setImage} maxMb={5} />

          <ErrorNote>{formError}</ErrorNote>
          <div className="flex gap-2">
            <Button className="water-gradient text-primary-foreground" onClick={submit} disabled={busy}>
              {busy ? <span className="flex items-center gap-2"><Spinner /> Saving…</span> : editing ? 'Save changes' : 'Add offer'}
            </Button>
            {editing && <Button variant="ghost" onClick={reset}>Cancel</Button>}
          </div>
        </Card>
      </div>

      <ErrorNote>{error}</ErrorNote>
      <div className="glass-card rounded-xl overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead><TableHead>Title</TableHead><TableHead>Promo code</TableHead>
              <TableHead>Prices</TableHead><TableHead>Order</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && <TableMessage cols={7}>Loading offers…</TableMessage>}
            {!loading && offers.length === 0 && <TableMessage cols={7}>No offers yet.</TableMessage>}
            {offers.map(o => (
              <TableRow key={o.id} className={editing?.id === o.id ? 'bg-primary/5' : ''}>
                <TableCell>{o.image_url ? <img src={o.image_url} alt="" className="h-8 w-auto max-w-[50px] object-contain rounded" /> : '—'}</TableCell>
                <TableCell>
                  <div className="font-semibold">{o.title}</div>
                  <div className="text-xs text-muted-foreground">{o.discount_text}</div>
                </TableCell>
                <TableCell>{o.promo_code ? <code className="px-2 py-1 bg-muted rounded font-mono text-xs">{o.promo_code}</code> : '—'}</TableCell>
                <TableCell className="text-sm whitespace-nowrap">
                  {Number(o.original_price) > 0 && <span className="line-through text-muted-foreground mr-2">{pkr(o.original_price)}</span>}
                  {Number(o.sale_price) > 0 && <span className="font-bold text-primary">{pkr(o.sale_price)}</span>}
                </TableCell>
                <TableCell>{o.sort_order}</TableCell>
                <TableCell>
                  <StatusPill className={o.is_active ? 'bg-green-500/15 text-green-500' : 'bg-muted text-muted-foreground'}>{o.is_active ? 'Visible' : 'Hidden'}</StatusPill>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => startEdit(o)}><Pencil className="w-4 h-4 mr-1" /> Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => remove(o)} aria-label="Delete offer"><Trash2 className="w-4 h-4" /></Button>
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
