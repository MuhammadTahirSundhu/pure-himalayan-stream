import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adminApi } from '@/lib/api';
import { useAdminData, run, pkr, Card, Field, ImagePicker, ErrorNote, TableMessage, PageTitle, Spinner, StatusPill } from './ui';

interface Product {
  id: string; name: string; size: string; price: number; in_stock: boolean;
  category: 'bottle' | 'dispenser'; description?: string | null; image_url?: string | null;
}

const ID_RE = /^[a-z0-9-]{1,40}$/i;
const EMPTY = { id: '', name: '', size: '', price: '', category: 'bottle' as Product['category'], description: '' };

export default function ProductsTab() {
  const { data: products, setData: setProducts, loading, error } = useAdminData<Product[]>('/products', []);
  const [editing, setEditing] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [image, setImage] = useState<File | null>(null);
  const [formError, setFormError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const update = async (id: string, json: Partial<Product>, success: string) => {
    const res = await run(() => adminApi<{ product: Product }>(`/products/${encodeURIComponent(id)}`, { method: 'PUT', json }), success);
    if (res) setProducts(list => list.map(p => (p.id === id ? res.product : p)));
    return !!res;
  };

  const savePrice = async (id: string) => {
    const price = Number(editPrice);
    if (editPrice.trim() === '' || !Number.isFinite(price) || price < 0) return void toast.error('Price must be 0 or more.');
    if (await update(id, { price }, 'Price updated.')) setEditing(null);
  };

  const add = async () => {
    setFormError('');
    if (!form.id || !form.name || !form.size || form.price === '') return setFormError('ID, name, size and price are required.');
    if (!ID_RE.test(form.id.trim())) return setFormError('ID may only contain letters, numbers and dashes (e.g. 19l-bottle).');
    if (!(Number(form.price) >= 0)) return setFormError('Price must be 0 or more.');
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v).trim()));
    if (image) fd.append('image', image);
    setIsAdding(true);
    const res = await run(() => adminApi<{ product: Product }>('/products', { method: 'POST', body: fd }), 'Product added.');
    setIsAdding(false);
    if (res) {
      setProducts(list => [...list, res.product].sort((a, b) => Number(a.price) - Number(b.price)));
      setForm(EMPTY);
      setImage(null);
    }
  };

  const remove = async (p: Product) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    if (await run(() => adminApi(`/products/${encodeURIComponent(p.id)}`, { method: 'DELETE' }), 'Product deleted.')) {
      setProducts(list => list.filter(x => x.id !== p.id));
    }
  };

  return (
    <div className="space-y-6">
      <PageTitle>Product Management</PageTitle>
      <Card title="Add New Product" icon={<Plus className="w-4 h-4 text-primary" />} className="max-w-3xl">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          <Field label="ID *" hint="Letters, numbers and dashes only"><Input placeholder="e.g. 500ml-bottle" value={form.id} onChange={set('id')} /></Field>
          <Field label="Name *"><Input placeholder="e.g. 500ml Bottle" value={form.name} onChange={set('name')} /></Field>
          <Field label="Size *"><Input placeholder="e.g. 500ml" value={form.size} onChange={set('size')} /></Field>
          <Field label="Price (PKR) *" hint="0 is allowed"><Input type="number" min="0" value={form.price} onChange={set('price')} /></Field>
          <Field
            label="Category *"
            hint={form.category === 'dispenser'
              ? 'Returnable 19L bottle — customers pay the refundable bottle deposit (set in Settings) for each new bottle.'
              : 'Disposable bottle — no deposit.'}
          >
            <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v as Product['category'] }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bottle">Bottle (disposable)</SelectItem>
                <SelectItem value="dispenser">Dispenser (19L returnable)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Description"><Input placeholder="Optional" value={form.description} onChange={set('description')} /></Field>
        </div>
        <ImagePicker label="Product image" file={image} onChange={setImage} maxMb={5} />
        <ErrorNote>{formError}</ErrorNote>
        <Button className="water-gradient text-primary-foreground" onClick={add} disabled={isAdding}>
          {isAdding ? <span className="flex items-center gap-2"><Spinner /> Uploading…</span> : 'Add Product'}
        </Button>
      </Card>

      <ErrorNote>{error}</ErrorNote>
      <div className="glass-card rounded-xl overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead><TableHead>Size</TableHead><TableHead>Category</TableHead>
              <TableHead>Price</TableHead><TableHead>Stock</TableHead><TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && <TableMessage cols={6}>Loading products…</TableMessage>}
            {!loading && products.length === 0 && <TableMessage cols={6}>No products yet.</TableMessage>}
            {products.map(p => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{p.id}</div>
                </TableCell>
                <TableCell>{p.size}</TableCell>
                <TableCell className="text-xs">{p.category === 'dispenser' ? '19L returnable' : 'Bottle'}</TableCell>
                <TableCell>
                  {editing === p.id ? (
                    <div className="flex gap-2">
                      <Input type="number" min="0" value={editPrice} onChange={e => setEditPrice(e.target.value)} className="w-24 h-8"
                        onKeyDown={e => e.key === 'Enter' && savePrice(p.id)} autoFocus />
                      <Button size="sm" onClick={() => savePrice(p.id)}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditing(null)}><X className="w-4 h-4" /></Button>
                    </div>
                  ) : pkr(p.price)}
                </TableCell>
                <TableCell>
                  <StatusPill className={p.in_stock ? 'bg-green-500/15 text-green-500' : 'bg-red-500/15 text-red-400'}>
                    {p.in_stock ? 'In stock' : 'Out of stock'}
                  </StatusPill>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setEditing(p.id); setEditPrice(String(Number(p.price))); }}>Edit price</Button>
                    <Button variant="ghost" size="sm" onClick={() => update(p.id, { in_stock: !p.in_stock }, p.in_stock ? 'Marked out of stock.' : 'Marked in stock.')}>
                      {p.in_stock ? 'Mark out' : 'Mark in'}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => remove(p)} aria-label="Delete product"><X className="w-4 h-4" /></Button>
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
