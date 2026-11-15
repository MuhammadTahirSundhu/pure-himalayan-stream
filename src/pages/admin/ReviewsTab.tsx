import { useState } from 'react';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adminApi } from '@/lib/api';
import { useAdminData, run, Card, Field, ErrorNote, PageTitle, StatusPill } from './ui';

type Source = 'google' | 'whatsapp' | 'facebook' | 'in-person';
interface Review {
  id: string; name: string; area: string | null; text: string; rating: number | null;
  source: Source | null; is_active: boolean; sort_order: number; created_at: string;
}

const SOURCES: Record<Source, string> = { google: 'Google', whatsapp: 'WhatsApp', facebook: 'Facebook', 'in-person': 'In person' };
const EMPTY = { name: '', area: '', text: '', rating: '5', source: 'none', is_active: true, sort_order: '0' };
type Form = typeof EMPTY;

const toBody = (f: Form) => ({
  name: f.name.trim(), area: f.area.trim() || null, text: f.text.trim(),
  rating: f.rating === 'none' ? null : Number(f.rating), source: f.source === 'none' ? null : f.source,
  is_active: f.is_active, sort_order: Math.trunc(Number(f.sort_order) || 0),
});
const fromReview = (r: Review): Form => ({
  name: r.name, area: r.area || '', text: r.text, rating: r.rating ? String(r.rating) : 'none',
  source: r.source || 'none', is_active: r.is_active, sort_order: String(r.sort_order ?? 0),
});
const sorted = (list: Review[]) => [...list].sort((a, b) => a.sort_order - b.sort_order || b.created_at.localeCompare(a.created_at));

export default function ReviewsTab() {
  const { data: reviews, setData, loading, error } = useAdminData<Review[]>('/content/testimonials', []);
  const [form, setForm] = useState<Form>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const reset = () => { setForm(EMPTY); setEditingId(null); setFormError(''); };

  const save = async () => {
    setFormError('');
    const body = toBody(form);
    if (body.name.length < 2) return setFormError('Name must be at least 2 characters.');
    if (body.text.length < 5) return setFormError('Review text must be at least 5 characters.');
    setBusy(true);
    const res = await run(() => adminApi<Review>(editingId ? `/content/testimonials/${editingId}` : '/content/testimonials', { method: editingId ? 'PUT' : 'POST', json: body }),
      editingId ? 'Review updated.' : 'Review added.');
    setBusy(false);
    if (!res) return;
    setData(list => sorted(editingId ? list.map(r => (r.id === editingId ? res : r)) : [...list, res]));
    reset();
  };

  const toggle = async (r: Review) => {
    const res = await run(() => adminApi<Review>(`/content/testimonials/${r.id}`, { method: 'PUT', json: { ...toBody(fromReview(r)), is_active: !r.is_active } }));
    if (res) setData(list => list.map(x => (x.id === r.id ? res : x)));
  };

  const remove = async (r: Review) => {
    if (!window.confirm(`Delete the review from ${r.name}?`)) return;
    if (await run(() => adminApi(`/content/testimonials/${r.id}`, { method: 'DELETE' }), 'Review deleted.')) {
      setData(list => list.filter(x => x.id !== r.id));
      if (editingId === r.id) reset();
    }
  };

  return (
    <div className="space-y-6">
      <PageTitle>Customer Reviews</PageTitle>
      <div id="review-form" className="scroll-mt-4" />
      <Card title={editingId ? 'Edit review' : 'Add a review'} icon={editingId ? <Pencil className="w-4 h-4 text-primary" /> : <Plus className="w-4 h-4 text-primary" />} className="max-w-3xl">
        <p className="text-sm text-yellow-500">Only add real reviews from real customers. Copy their words as written (you may translate) — made-up reviews break trust and Google's rules.</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Customer name *"><Input maxLength={60} placeholder="e.g. Ahmed R." value={form.name} onChange={set('name')} /></Field>
          <Field label="Area"><Input maxLength={60} placeholder="e.g. Model Town" value={form.area} onChange={set('area')} /></Field>
          <Field label="Rating">
            <Select value={form.rating} onValueChange={v => setForm(f => ({ ...f, rating: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No rating</SelectItem>
                {[5, 4, 3, 2, 1].map(n => <SelectItem key={n} value={String(n)}>{'★'.repeat(n)} ({n})</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Where they left it">
            <Select value={form.source} onValueChange={v => setForm(f => ({ ...f, source: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Not specified</SelectItem>
                {(Object.keys(SOURCES) as Source[]).map(s => <SelectItem key={s} value={s}>{SOURCES[s]}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Review text *" className="sm:col-span-2"><Textarea rows={3} maxLength={600} value={form.text} onChange={set('text')} /></Field>
          <Field label="Sort order" hint="Lower numbers show first"><Input type="number" value={form.sort_order} onChange={set('sort_order')} /></Field>
          <label className="flex items-center gap-2 text-sm self-center pt-4 cursor-pointer">
            <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} /> Show on website
          </label>
        </div>
        <ErrorNote>{formError}</ErrorNote>
        <div className="flex gap-2">
          <Button className="water-gradient text-primary-foreground" onClick={save} disabled={busy}>{busy ? 'Saving…' : editingId ? 'Save changes' : 'Add review'}</Button>
          {editingId && <Button variant="ghost" onClick={reset}>Cancel</Button>}
        </div>
      </Card>

      <ErrorNote>{error}</ErrorNote>
      {loading && <p className="text-sm text-muted-foreground">Loading reviews…</p>}
      {!loading && reviews.length === 0 && <p className="text-sm text-muted-foreground">No reviews yet. Ask happy customers on WhatsApp or Google and add their words here.</p>}
      <div className="grid md:grid-cols-2 gap-4">
        {reviews.map(r => (
          <div key={r.id} className={`glass-card rounded-xl p-5 space-y-2 ${r.is_active ? '' : 'opacity-60'}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{r.name}{r.area && <span className="font-normal text-muted-foreground"> · {r.area}</span>}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  {r.rating ? <span className="text-yellow-500 inline-flex">{Array.from({ length: r.rating }, (_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}</span> : null}
                  {r.source && SOURCES[r.source]} · order {r.sort_order}
                </p>
              </div>
              <StatusPill className={r.is_active ? 'bg-green-500/15 text-green-500' : 'bg-muted text-muted-foreground'}>{r.is_active ? 'Shown' : 'Hidden'}</StatusPill>
            </div>
            <p className="text-sm whitespace-pre-wrap">&ldquo;{r.text}&rdquo;</p>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={() => { setEditingId(r.id); setForm(fromReview(r)); setFormError(''); document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' }); }}><Pencil className="w-4 h-4 mr-1" /> Edit</Button>
              <Button variant="ghost" size="sm" onClick={() => toggle(r)}>{r.is_active ? 'Hide' : 'Show'}</Button>
              <Button variant="destructive" size="sm" onClick={() => remove(r)} aria-label="Delete review"><Trash2 className="w-4 h-4" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
