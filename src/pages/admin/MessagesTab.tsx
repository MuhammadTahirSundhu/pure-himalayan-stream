import { Mail, MailOpen, Trash2, RefreshCw, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { adminApi } from '@/lib/api';
import { useAdminData, run, fmtDate, toIntlPk, ErrorNote, PageTitle } from './ui';

interface Message {
  id: string; name: string; email: string | null; phone: string | null;
  message: string; is_read: boolean; created_at: string;
}

export default function MessagesTab({ onChanged }: { onChanged?: () => void }) {
  const { data: messages, setData, loading, error, reload } = useAdminData<Message[]>('/messages', []);
  const unread = messages.filter(m => !m.is_read).length;

  const setRead = async (m: Message, is_read: boolean) => {
    if (await run(() => adminApi(`/messages/${m.id}`, { method: 'PATCH', json: { is_read } }))) {
      setData(list => list.map(x => (x.id === m.id ? { ...x, is_read } : x)));
      onChanged?.();
    }
  };

  const remove = async (m: Message) => {
    if (!window.confirm(`Delete the message from ${m.name}?`)) return;
    if (await run(() => adminApi(`/messages/${m.id}`, { method: 'DELETE' }), 'Message deleted.')) {
      setData(list => list.filter(x => x.id !== m.id));
      onChanged?.();
    }
  };

  return (
    <div>
      <PageTitle actions={<Button variant="outline" size="sm" onClick={reload}><RefreshCw className="w-4 h-4 mr-2" /> Refresh</Button>}>
        Contact Messages {unread > 0 && <span className="ml-2 text-sm font-medium text-primary">({unread} unread)</span>}
      </PageTitle>
      <ErrorNote>{error}</ErrorNote>
      <div className="space-y-3">
        {loading && <p className="text-muted-foreground text-sm">Loading messages…</p>}
        {!loading && messages.length === 0 && <p className="text-muted-foreground text-sm">No messages yet.</p>}
        {messages.map(m => (
          <div key={m.id} className={`glass-card rounded-xl p-4 space-y-2 border-l-4 ${m.is_read ? 'border-l-transparent opacity-75' : 'border-l-primary'}`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <span className={`text-foreground ${m.is_read ? 'font-medium' : 'font-bold'}`}>{m.name}</span>
                {!m.is_read && <span className="ml-2 text-[10px] uppercase tracking-wide bg-primary/20 text-primary rounded px-1.5 py-0.5">New</span>}
                <p className="text-xs text-muted-foreground mt-0.5 flex flex-wrap gap-x-3">
                  {m.phone && (
                    <span className="inline-flex items-center gap-2">
                      <a href={`tel:+${toIntlPk(m.phone)}`} className="hover:underline inline-flex items-center gap-1"><Phone className="w-3 h-3" />{m.phone}</a>
                      <a href={`https://wa.me/${toIntlPk(m.phone)}`} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:underline">WhatsApp</a>
                    </span>
                  )}
                  {m.email && <a href={`mailto:${m.email}`} className="hover:underline">{m.email}</a>}
                  {!m.phone && !m.email && <span>No contact details</span>}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">{fmtDate(m.created_at)}</span>
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap">{m.message}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setRead(m, !m.is_read)}>
                {m.is_read ? <><Mail className="w-4 h-4 mr-1" /> Mark unread</> : <><MailOpen className="w-4 h-4 mr-1" /> Mark read</>}
              </Button>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => remove(m)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
