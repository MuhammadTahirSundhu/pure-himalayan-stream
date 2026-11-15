import { useState } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { adminApi } from '@/lib/api';
import { useAdminData, run, Card, Field, ImagePicker, ErrorNote, PageTitle, Spinner } from './ui';

interface Photo { id: string; image_url: string; caption: string | null; is_active: boolean; sort_order: number; created_at: string }

const sorted = (list: Photo[]) => [...list].sort((a, b) => a.sort_order - b.sort_order || b.created_at.localeCompare(a.created_at));

export default function PhotosTab() {
  const { data: photos, setData, loading, error } = useAdminData<Photo[]>('/content/gallery', []);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [order, setOrder] = useState('0');
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');

  const upload = async () => {
    setFormError('');
    if (!file) return setFormError('Please choose a photo.');
    const fd = new FormData();
    fd.append('image', file);
    if (caption.trim()) fd.append('caption', caption.trim());
    fd.append('sort_order', String(Math.trunc(Number(order) || 0)));
    setBusy(true);
    const res = await run(() => adminApi<Photo>('/content/gallery', { method: 'POST', body: fd }), 'Photo uploaded.');
    setBusy(false);
    if (res) {
      setData(list => sorted([...list, res]));
      setFile(null);
      setCaption('');
      setOrder('0');
    }
  };

  const patch = async (id: string, json: Partial<Pick<Photo, 'caption' | 'is_active' | 'sort_order'>>, success?: string) => {
    const res = await run(() => adminApi<Photo>(`/content/gallery/${id}`, { method: 'PATCH', json }), success);
    if (res) setData(list => sorted(list.map(p => (p.id === id ? res : p))));
  };

  const remove = async (p: Photo) => {
    if (!window.confirm('Delete this photo? It will disappear from the website.')) return;
    if (await run(() => adminApi(`/content/gallery/${p.id}`, { method: 'DELETE' }), 'Photo deleted.')) setData(list => list.filter(x => x.id !== p.id));
  };

  return (
    <div className="space-y-6">
      <PageTitle>Photos</PageTitle>
      <Card title="Upload a photo" icon={<Plus className="w-4 h-4 text-primary" />} className="max-w-3xl">
        <p className="text-sm text-muted-foreground">Real photos of your plant, team and delivery riders build trust. Use your own photos — not stock images.</p>
        <ImagePicker label="Photo" file={file} onChange={setFile} maxMb={8} hint="Large photos are resized automatically." />
        <div className="grid sm:grid-cols-[1fr_8rem] gap-3">
          <Field label="Caption"><Input maxLength={120} placeholder="e.g. Our RO filtration plant, Gujranwala" value={caption} onChange={e => setCaption(e.target.value)} /></Field>
          <Field label="Sort order" hint="Lower first"><Input type="number" value={order} onChange={e => setOrder(e.target.value)} /></Field>
        </div>
        <ErrorNote>{formError}</ErrorNote>
        <Button className="water-gradient text-primary-foreground" onClick={upload} disabled={busy || !file}>
          {busy ? <span className="flex items-center gap-2"><Spinner /> Uploading…</span> : 'Upload photo'}
        </Button>
      </Card>

      <ErrorNote>{error}</ErrorNote>
      {loading && <p className="text-sm text-muted-foreground">Loading photos…</p>}
      {!loading && photos.length === 0 && <p className="text-sm text-muted-foreground">No photos yet.</p>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map(p => <PhotoCard key={`${p.id}-${p.caption}-${p.sort_order}`} photo={p} onPatch={(json, msg) => patch(p.id, json, msg)} onDelete={() => remove(p)} />)}
      </div>
    </div>
  );
}

function PhotoCard({ photo: p, onPatch, onDelete }: {
  photo: Photo; onPatch: (json: Partial<Pick<Photo, 'caption' | 'is_active' | 'sort_order'>>, msg?: string) => void; onDelete: () => void;
}) {
  const [caption, setCaption] = useState(p.caption || '');
  const [order, setOrder] = useState(String(p.sort_order));
  const dirty = caption.trim() !== (p.caption || '') || Math.trunc(Number(order) || 0) !== p.sort_order;
  return (
    <div className={`glass-card rounded-xl overflow-hidden ${p.is_active ? '' : 'opacity-60'}`}>
      <a href={p.image_url} target="_blank" rel="noopener noreferrer"><img src={p.image_url} alt={p.caption || 'Gallery photo'} className="w-full aspect-[4/3] object-cover bg-muted" loading="lazy" /></a>
      <div className="p-3 space-y-2">
        <div className="flex gap-2">
          <Input className="h-8" maxLength={120} placeholder="Caption" value={caption} onChange={e => setCaption(e.target.value)} />
          <Input className="h-8 w-16" type="number" title="Sort order" value={order} onChange={e => setOrder(e.target.value)} />
          <Button size="sm" className="h-8" disabled={!dirty} aria-label="Save caption and order"
            onClick={() => onPatch({ caption: caption.trim() || null, sort_order: Math.trunc(Number(order) || 0) }, 'Photo updated.')}><Check className="w-4 h-4" /></Button>
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Switch checked={p.is_active} onCheckedChange={v => onPatch({ is_active: v })} /> {p.is_active ? 'Shown on website' : 'Hidden'}
          </label>
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={onDelete} aria-label="Delete photo"><Trash2 className="w-4 h-4" /></Button>
        </div>
      </div>
    </div>
  );
}
