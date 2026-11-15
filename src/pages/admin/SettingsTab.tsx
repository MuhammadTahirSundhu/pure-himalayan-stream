import { useEffect, useState, type ReactNode } from 'react';
import { CreditCard, Phone, Truck, MapPin, FlaskConical, KeyRound, Plus, Trash2, X, ExternalLink, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adminApi } from '@/lib/api';
import { useAdminData, errMsg, Card, Field, ErrorNote, PageTitle, Spinner } from './ui';

type PaymentId = 'easypaisa' | 'jazzcash' | 'sadapay' | 'nayapay' | 'bank';
interface PaymentAccount { id: PaymentId; label: string; number: string; title: string; enabled: boolean }
interface Settings {
  payment_accounts: PaymentAccount[];
  contact_info: { phone: string; whatsapp: string; email: string; address: string; hours: string };
  delivery_info: { bottle_deposit: number; charge_delivery: boolean; base_delivery_fee: number; free_delivery_threshold: number; delivery_time: string };
  service_areas: { cities: string[]; note: string };
  lab_report_url: string;
}
type SectionKey = Exclude<keyof Settings, 'lab_report_url'>;

const PAYMENT_LABELS: Record<PaymentId, string> = {
  easypaisa: 'Easypaisa', jazzcash: 'JazzCash', sadapay: 'SadaPay', nayapay: 'NayaPay', bank: 'Bank Transfer',
};

const EMPTY: Settings = {
  payment_accounts: [],
  contact_info: { phone: '', whatsapp: '', email: '', address: '', hours: '' },
  delivery_info: { bottle_deposit: 0, charge_delivery: false, base_delivery_fee: 0, free_delivery_threshold: 0, delivery_time: '' },
  service_areas: { cities: [], note: '' },
  lab_report_url: '',
};

const num = (v: string) => (v === '' ? 0 : Math.max(0, Number(v) || 0));

export default function SettingsTab({ onLogout }: { onLogout: (message?: string) => void }) {
  const { data: saved, setData: setSaved, loading, error } = useAdminData<Settings>('/settings', EMPTY);
  const [draft, setDraft] = useState<Settings>(EMPTY);
  useEffect(() => { setDraft(saved); }, [saved]);

  const patch = <K extends keyof Settings>(key: K, value: Settings[K]) => setDraft(d => ({ ...d, [key]: value }));
  const dirty = (key: SectionKey) => JSON.stringify(draft[key]) !== JSON.stringify(saved[key]);

  /** Saves one section; the server returns the full, sanitised settings. */
  const save = async (key: SectionKey) => {
    const res = await adminApi<{ settings: Settings }>('/settings', { method: 'PUT', json: { settings: { [key]: draft[key] } } });
    setSaved(res.settings);
  };

  if (loading) return <div><PageTitle>Settings</PageTitle><p className="text-sm text-muted-foreground">Loading settings…</p></div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <PageTitle>Settings</PageTitle>
      <ErrorNote>{error}</ErrorNote>
      {!error && (
        <>
          <PaymentSection value={draft.payment_accounts} onChange={v => patch('payment_accounts', v)} dirty={dirty('payment_accounts')} onSave={() => save('payment_accounts')} />
          <ContactSection value={draft.contact_info} onChange={v => patch('contact_info', v)} dirty={dirty('contact_info')} onSave={() => save('contact_info')} />
          <DeliverySection value={draft.delivery_info} onChange={v => patch('delivery_info', v)} dirty={dirty('delivery_info')} onSave={() => save('delivery_info')} />
          <AreasSection value={draft.service_areas} onChange={v => patch('service_areas', v)} dirty={dirty('service_areas')} onSave={() => save('service_areas')} />
          <LabReportSection url={saved.lab_report_url} onUploaded={url => setSaved(s => ({ ...s, lab_report_url: url }))} />
        </>
      )}
      <PasswordSection onChanged={() => onLogout('Password changed — all sessions were signed out. Please log in with your new password.')} />
    </div>
  );
}

// ─── Shared section frame with its own Save button ──────────────────────────

function Section({ title, icon, children, dirty, onSave, validate }: {
  title: string; icon: ReactNode; children: ReactNode; dirty: boolean; onSave: () => Promise<void>; validate?: () => string;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const submit = async () => {
    const problem = validate?.() || '';
    setErr(problem);
    if (problem) return;
    setBusy(true);
    try {
      await onSave();
      toast.success(`${title} saved.`);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card title={title} icon={icon}>
      {children}
      <ErrorNote>{err}</ErrorNote>
      <div className="flex items-center gap-3">
        <Button className="water-gradient text-primary-foreground" onClick={submit} disabled={busy || !dirty}>
          {busy ? <span className="flex items-center gap-2"><Spinner /> Saving…</span> : 'Save'}
        </Button>
        {dirty && <span className="text-xs text-yellow-500">Unsaved changes</span>}
      </div>
    </Card>
  );
}

interface SectionProps<T> { value: T; onChange: (v: T) => void; dirty: boolean; onSave: () => Promise<void> }

// ─── Payment accounts ───────────────────────────────────────────────────────

function PaymentSection({ value, onChange, dirty, onSave }: SectionProps<PaymentAccount[]>) {
  const unused = (Object.keys(PAYMENT_LABELS) as PaymentId[]).filter(id => !value.some(a => a.id === id));
  const update = (i: number, p: Partial<PaymentAccount>) => onChange(value.map((a, j) => (j === i ? { ...a, ...p } : a)));
  const live = value.filter(a => a.enabled && a.number.trim()).length;

  return (
    <Section title="Payment accounts" icon={<CreditCard className="w-4 h-4 text-primary" />} dirty={dirty} onSave={onSave}>
      <p className="text-sm text-muted-foreground">
        Accounts customers can pay into at checkout (they upload a payment screenshot). An account is <strong className="text-foreground">only shown to customers when it is enabled AND has an account number</strong>.
        {live === 0 && ' Right now no account qualifies, so customers only see Cash on Delivery.'}
      </p>
      <div className="space-y-3">
        {value.map((a, i) => {
          const shown = a.enabled && a.number.trim();
          return (
            <div key={a.id} className={`rounded-lg border p-4 space-y-3 ${shown ? 'border-green-500/40' : 'border-border'}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{PAYMENT_LABELS[a.id]}</span>
                  {shown ? (
                    <span className="inline-flex items-center gap-1 text-xs text-green-500"><CheckCircle2 className="w-3 h-3" /> Shown at checkout</span>
                  ) : a.enabled ? (
                    <span className="inline-flex items-center gap-1 text-xs text-yellow-500"><AlertTriangle className="w-3 h-3" /> NOT shown — add an account number</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Disabled — not shown</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Switch checked={a.enabled} onCheckedChange={v => update(i, { enabled: v })} /> Enabled
                  </label>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Remove account">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <Field label="Label shown to customers"><Input value={a.label} maxLength={40} onChange={e => update(i, { label: e.target.value })} /></Field>
                <Field label={a.id === 'bank' ? 'Account number / IBAN' : 'Account number'}>
                  <Input value={a.number} maxLength={40} placeholder={a.id === 'bank' ? 'PK00 XXXX …' : '03XX XXXXXXX'} onChange={e => update(i, { number: e.target.value })} />
                </Field>
                <Field label={a.id === 'bank' ? 'Account title & bank' : 'Account title'}>
                  <Input value={a.title} maxLength={80} placeholder="Name on the account" onChange={e => update(i, { title: e.target.value })} />
                </Field>
              </div>
            </div>
          );
        })}
      </div>
      {unused.length > 0 && (
        <Select value="" onValueChange={id => onChange([...value, { id: id as PaymentId, label: PAYMENT_LABELS[id as PaymentId], number: '', title: '', enabled: true }])}>
          <SelectTrigger className="w-56"><span className="flex items-center gap-2 text-sm"><Plus className="w-4 h-4" /> Add payment account</span></SelectTrigger>
          <SelectContent>{unused.map(id => <SelectItem key={id} value={id}>{PAYMENT_LABELS[id]}</SelectItem>)}</SelectContent>
        </Select>
      )}
    </Section>
  );
}

// ─── Contact info ────────────────────────────────────────────────────────────

function ContactSection({ value, onChange, dirty, onSave }: SectionProps<Settings['contact_info']>) {
  const set = (k: keyof Settings['contact_info']) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, [k]: k === 'whatsapp' ? e.target.value.replace(/\D/g, '') : e.target.value });
  return (
    <Section
      title="Contact info" icon={<Phone className="w-4 h-4 text-primary" />} dirty={dirty} onSave={onSave}
      validate={() => (value.whatsapp && !/^92\d{10}$/.test(value.whatsapp) ? 'WhatsApp number must be 12 digits starting with 92, e.g. 923203133140.' : '')}
    >
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Phone (as displayed)"><Input value={value.phone} onChange={set('phone')} placeholder="0320 313 3140" /></Field>
        <Field label="WhatsApp number" hint="Digits only, with country code — e.g. 923203133140"><Input inputMode="numeric" value={value.whatsapp} onChange={set('whatsapp')} /></Field>
        <Field label="Email"><Input type="email" value={value.email} onChange={set('email')} /></Field>
        <Field label="Opening hours"><Input value={value.hours} onChange={set('hours')} /></Field>
        <Field label="Address" className="sm:col-span-2"><Input value={value.address} onChange={set('address')} /></Field>
      </div>
    </Section>
  );
}

// ─── Delivery ────────────────────────────────────────────────────────────────

function DeliverySection({ value, onChange, dirty, onSave }: SectionProps<Settings['delivery_info']>) {
  const setNum = (k: 'bottle_deposit' | 'base_delivery_fee' | 'free_delivery_threshold') => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, [k]: num(e.target.value) });
  return (
    <Section title="Delivery & bottle deposit" icon={<Truck className="w-4 h-4 text-primary" />} dirty={dirty} onSave={onSave}>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="19L bottle deposit (PKR)" hint="Refundable; charged per NEW returnable bottle, not on exchanges.">
          <Input type="number" min="0" value={value.bottle_deposit} onChange={setNum('bottle_deposit')} />
        </Field>
        <Field label="Delivery time (shown to customers)"><Input value={value.delivery_time} onChange={e => onChange({ ...value, delivery_time: e.target.value })} /></Field>
      </div>
      <label className="flex items-center gap-3 text-sm cursor-pointer">
        <Switch checked={value.charge_delivery} onCheckedChange={v => onChange({ ...value, charge_delivery: v })} />
        Charge a delivery fee {!value.charge_delivery && <span className="text-muted-foreground">(off — delivery is free for everyone)</span>}
      </label>
      {value.charge_delivery && (
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Delivery fee (PKR)"><Input type="number" min="0" value={value.base_delivery_fee} onChange={setNum('base_delivery_fee')} /></Field>
          <Field label="Free delivery from (PKR)" hint="Orders whose water total (after discount) reaches this get free delivery. 0 = always charge.">
            <Input type="number" min="0" value={value.free_delivery_threshold} onChange={setNum('free_delivery_threshold')} />
          </Field>
        </div>
      )}
    </Section>
  );
}

// ─── Service areas ──────────────────────────────────────────────────────────

function AreasSection({ value, onChange, dirty, onSave }: SectionProps<Settings['service_areas']>) {
  const [city, setCity] = useState('');
  const addCity = () => {
    const c = city.trim();
    if (!c) return;
    if (!value.cities.some(x => x.toLowerCase() === c.toLowerCase())) onChange({ ...value, cities: [...value.cities, c] });
    setCity('');
  };
  return (
    <Section
      title="Service areas" icon={<MapPin className="w-4 h-4 text-primary" />} dirty={dirty} onSave={onSave}
      validate={() => (value.cities.length ? '' : 'At least one service city is required.')}
    >
      <p className="text-sm text-muted-foreground">Orders are only accepted from these cities. Customers elsewhere can join the waitlist (see Inquiries).</p>
      <div className="flex flex-wrap gap-2">
        {value.cities.map(c => (
          <span key={c} className="inline-flex items-center gap-1 rounded-full bg-primary/15 text-primary px-3 py-1 text-sm">
            {c}
            <button type="button" aria-label={`Remove ${c}`} onClick={() => onChange({ ...value, cities: value.cities.filter(x => x !== c) })}><X className="w-3 h-3" /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2 max-w-sm">
        <Input placeholder="Add a city" value={city} maxLength={60} onChange={e => setCity(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCity()} />
        <Button variant="outline" onClick={addCity}><Plus className="w-4 h-4" /></Button>
      </div>
      <Field label="Note shown to customers"><Input value={value.note} maxLength={200} onChange={e => onChange({ ...value, note: e.target.value })} /></Field>
    </Section>
  );
}

// ─── Lab report ─────────────────────────────────────────────────────────────

function LabReportSection({ url, onUploaded }: { url: string; onUploaded: (url: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [inputKey, setInputKey] = useState(0);

  const upload = async () => {
    setErr('');
    if (!file) return setErr('Please choose a file first.');
    if (!/^(application\/pdf|image\/(jpeg|png|webp))$/.test(file.type)) return setErr('Upload a PDF, JPG, PNG or WebP file.');
    if (file.size > 10 * 1024 * 1024) return setErr('That file is too large (max 10 MB).');
    const fd = new FormData();
    fd.append('report', file);
    setBusy(true);
    try {
      const res = await adminApi<{ url: string }>('/settings/quality', { method: 'POST', body: fd });
      onUploaded(res.url);
      setFile(null);
      setInputKey(k => k + 1);
      toast.success('Lab report uploaded.');
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card title="Lab report (Quality page)" icon={<FlaskConical className="w-4 h-4 text-primary" />}>
      <p className="text-sm text-muted-foreground">
        {url
          ? <>Current report: <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">view <ExternalLink className="w-3 h-3" /></a></>
          : 'No lab report uploaded yet.'}
      </p>
      <Input key={inputKey} type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={e => setFile(e.target.files?.[0] || null)} />
      <p className="text-xs text-muted-foreground">PDF, JPG, PNG or WebP · max 10 MB. Uploading replaces the current report.</p>
      <ErrorNote>{err}</ErrorNote>
      <Button className="water-gradient text-primary-foreground" onClick={upload} disabled={busy || !file}>
        {busy ? <span className="flex items-center gap-2"><Spinner /> Uploading…</span> : 'Upload report'}
      </Button>
    </Card>
  );
}

// ─── Password ───────────────────────────────────────────────────────────────

function PasswordSection({ onChanged }: { onChanged: () => void }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!current || !next) return setErr('Enter your current and new password.');
    if (next.length < 10) return setErr('New password must be at least 10 characters.');
    if (next !== confirm) return setErr('The new passwords do not match.');
    setBusy(true);
    try {
      await adminApi('/settings/password', { method: 'PUT', json: { current_password: current, new_password: next } });
      toast.success('Password updated. Please log in again.');
      onChanged();
    } catch (e2) {
      setErr(errMsg(e2));
      setBusy(false);
    }
  };

  return (
    <Card title="Change admin password" icon={<KeyRound className="w-4 h-4 text-primary" />}>
      <form className="space-y-3 max-w-sm" onSubmit={submit}>
        <Input type="password" placeholder="Current password" autoComplete="current-password" value={current} onChange={e => setCurrent(e.target.value)} />
        <Input type="password" placeholder="New password (min 10 characters)" autoComplete="new-password" value={next} onChange={e => setNext(e.target.value)} />
        <Input type="password" placeholder="Confirm new password" autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} />
        <p className="text-xs text-muted-foreground">Changing the password signs out every admin session, including this one.</p>
        <ErrorNote>{err}</ErrorNote>
        <Button type="submit" className="water-gradient text-primary-foreground" disabled={busy}>{busy ? 'Updating…' : 'Update password'}</Button>
      </form>
    </Card>
  );
}
