// Shared building blocks for the admin tabs.
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { X, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { adminApi } from '@/lib/api';

export const errMsg = (err: unknown) => (err instanceof Error ? err.message : 'Something went wrong.');

export const pkr = (n: number | string | null | undefined) => `PKR ${Number(n || 0).toLocaleString()}`;

export const fmtDate = (iso?: string | null, withTime = true) =>
  iso ? new Date(iso).toLocaleString(undefined, withTime ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' }) : '—';

/** 03XXXXXXXXX → 923XXXXXXXXX (for wa.me links). */
export const toIntlPk = (phone?: string | null) => {
  const d = String(phone || '').replace(/\D/g, '');
  if (d.startsWith('92')) return d;
  if (d.startsWith('0')) return `92${d.slice(1)}`;
  return d;
};

export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp';
export const isAllowedImage = (f: File) => ['image/jpeg', 'image/png', 'image/webp'].includes(f.type);

/** Runs an admin call, toasting the API error message on failure. Returns undefined on error. */
export async function run<T>(fn: () => Promise<T>, success?: string): Promise<T | undefined> {
  try {
    const out = await fn();
    if (success) toast.success(success);
    return out;
  } catch (err) {
    toast.error(errMsg(err));
    return undefined;
  }
}

/** GET an admin resource with loading/error state. */
export function useAdminData<T>(path: string, initial: T) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await adminApi<T>(path));
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  }, [path]);
  useEffect(() => { reload(); }, [reload]);
  return { data, setData, loading, error, reload };
}

export function PageTitle({ children, actions }: { children: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h1 className="font-heading font-bold text-2xl text-foreground">{children}</h1>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, icon, children, className = '' }: { title?: ReactNode; icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={`glass-card rounded-xl p-6 space-y-4 ${className}`}>
      {title && <h3 className="font-semibold flex items-center gap-2">{icon}{title}</h3>}
      {children}
    </div>
  );
}

export function Field({ label, hint, children, className = '' }: { label: string; hint?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <label className={`block space-y-1 ${className}`}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted-foreground/80">{hint}</span>}
    </label>
  );
}

export function ErrorNote({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="text-sm text-destructive">{children}</p>;
}

export function StatusPill({ className, children }: { className: string; children: ReactNode }) {
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>{children}</span>;
}

export const Spinner = () => (
  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
);

/** Image picker restricted to JPG/PNG/WebP with a size cap and preview. */
export function ImagePicker({ file, onChange, maxMb, label, hint }: {
  file: File | null; onChange: (f: File | null) => void; maxMb: number; label: string; hint?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    if (!file) { setPreview(null); if (ref.current) ref.current.value = ''; return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (f && !isAllowedImage(f)) { toast.error('Please choose a JPG, PNG or WebP image.'); e.target.value = ''; return; }
    if (f && f.size > maxMb * 1024 * 1024) { toast.error(`That image is too large (max ${maxMb} MB).`); e.target.value = ''; return; }
    onChange(f);
  };

  return (
    <div>
      <p className="text-sm font-medium text-foreground mb-2">{label} <span className="text-muted-foreground font-normal">(JPG, PNG or WebP · max {maxMb} MB)</span></p>
      <input ref={ref} type="file" accept={IMAGE_ACCEPT} className="hidden" onChange={pick} />
      {preview ? (
        <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/30">
          <img src={preview} alt="Preview" className="h-16 w-16 object-contain rounded-lg border border-border bg-white p-1" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{file?.name}</p>
            <p className="text-xs text-muted-foreground">{file ? `${(file.size / 1024).toFixed(0)} KB` : ''}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onChange(null)} className="shrink-0 text-destructive hover:text-destructive"><X className="w-4 h-4" /></Button>
        </div>
      ) : (
        <button type="button" onClick={() => ref.current?.click()} className="w-full flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-colors">
          <Upload className="w-5 h-5 text-primary" />
          <p className="text-sm font-medium text-foreground">Click to choose an image</p>
        </button>
      )}
      {hint && <p className="text-xs text-muted-foreground mt-2">{hint}</p>}
    </div>
  );
}

export const TableMessage = ({ cols, children }: { cols: number; children: ReactNode }) => (
  <tr><td colSpan={cols} className="text-center py-8 text-sm text-muted-foreground">{children}</td></tr>
);
