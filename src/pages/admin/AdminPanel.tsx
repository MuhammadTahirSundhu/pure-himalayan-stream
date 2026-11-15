import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard, ShoppingCart, Package, Megaphone, Settings, LogOut, Truck, Clock, CheckCircle2,
  MessageSquare, Tag, RefreshCw, Building2, X, Menu, Inbox, MapPin, Wallet,
} from 'lucide-react';
import { adminApi, adminToken } from '@/lib/api';
import { pkr, errMsg, ErrorNote, PageTitle } from './ui';
import OrdersTab from './OrdersTab';
import ProductsTab from './ProductsTab';
import MessagesTab from './MessagesTab';
import InquiriesTab from './InquiriesTab';
import PromoCodesTab from './PromoCodesTab';
import OffersTab from './OffersTab';
import ClientsTab from './ClientsTab';
import SettingsTab from './SettingsTab';

interface Stats {
  orders: { total: number; pending: number; confirmed: number; dispatched: number; delivered: number; rejected: number; total_revenue: number };
  today: { orders: number; revenue: number };
  messages: number;
  new_inquiries: number;
  waitlist: number;
}

type TabId = 'dashboard' | 'orders' | 'products' | 'messages' | 'inquiries' | 'offers' | 'promo_codes' | 'clients' | 'settings';

const sidebarItems: { id: TabId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'inquiries', label: 'Inquiries', icon: Inbox },
  { id: 'offers', label: 'Offers', icon: Megaphone },
  { id: 'promo_codes', label: 'Promo Codes', icon: Tag },
  { id: 'clients', label: 'Clients', icon: Building2 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

/** Reads the username from the JWT payload (display only — never trusted). */
const usernameFromToken = () => {
  try {
    const payload = adminToken.get()?.split('.')[1];
    if (!payload) return 'Admin';
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))).username || 'Admin';
  } catch {
    return 'Admin';
  }
};

export default function AdminPanel({ onLogout }: { onLogout: (message?: string) => void }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tab, setTab] = useState<TabId>('dashboard');
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsError, setStatsError] = useState('');
  const [ordersKey, setOrdersKey] = useState(0);
  const [adminUsername] = useState(usernameFromToken);

  const fetchStats = useCallback(async () => {
    try {
      setStats(await adminApi<Stats>('/stats'));
      setStatsError('');
    } catch (err) {
      setStatsError(errMsg(err));
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const badges: Partial<Record<TabId, number>> = {
    orders: stats?.orders.pending,
    messages: stats?.messages,
    inquiries: stats?.new_inquiries,
  };

  const go = (id: TabId) => { setTab(id); setIsSidebarOpen(false); };

  const cards = stats ? [
    { label: "Today's orders", value: String(stats.today.orders), icon: ShoppingCart, color: 'text-primary', tab: 'orders' as TabId },
    { label: 'Pending', value: String(stats.orders.pending), icon: Clock, color: 'text-yellow-500', tab: 'orders' as TabId },
    { label: 'Confirmed', value: String(stats.orders.confirmed), icon: CheckCircle2, color: 'text-blue-400', tab: 'orders' as TabId },
    { label: 'Dispatched', value: String(stats.orders.dispatched), icon: Truck, color: 'text-purple-400', tab: 'orders' as TabId },
    { label: "Today's water revenue", value: pkr(stats.today.revenue), icon: Wallet, color: 'text-accent', tab: 'orders' as TabId },
    { label: 'Water revenue (delivered)', value: pkr(stats.orders.total_revenue), icon: Wallet, color: 'text-green-500', tab: 'orders' as TabId, hint: 'Excludes refundable bottle deposits' },
    { label: 'Unread messages', value: String(stats.messages), icon: MessageSquare, color: 'text-primary', tab: 'messages' as TabId },
    { label: 'New event inquiries', value: String(stats.new_inquiries), icon: Inbox, color: 'text-primary', tab: 'inquiries' as TabId },
    { label: 'City waitlist sign-ups', value: String(stats.waitlist), icon: MapPin, color: 'text-primary', tab: 'inquiries' as TabId },
  ] : [];

  return (
    <div className="flex h-screen bg-background relative overflow-hidden">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#020a14] text-slate-300 border-r border-cyan-400/10 flex flex-col shrink-0 transform transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-cyan-400/10 flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-heading font-bold text-lg text-white">OneWater Admin</h2>
            <p className="text-xs text-white/40 mt-0.5">Welcome, {adminUsername}</p>
          </div>
          <button className="md:hidden text-white/60 p-1 hover:text-white transition-colors" onClick={() => setIsSidebarOpen(false)} aria-label="Close menu">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-2 overflow-y-auto">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => go(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1 ${tab === item.id ? 'bg-primary/20 text-white' : 'hover:bg-white/5'}`}
            >
              <item.icon className="w-4 h-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {!!badges[item.id] && <span className="min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] leading-5 text-center">{badges[item.id]}</span>}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-cyan-400/10 shrink-0">
          <Button variant="ghost" className="w-full text-white/60 hover:text-white" onClick={() => onLogout()}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen">
        <div className="md:hidden flex items-center p-4 border-b border-border/50 shrink-0 bg-card z-10">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 mr-2 text-foreground hover:bg-muted rounded-lg transition-colors" aria-label="Open menu">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="font-heading font-bold text-lg text-foreground">Admin Panel</h1>
        </div>

        <div className="flex-1 p-4 md:p-6 overflow-x-hidden overflow-y-auto w-full">
          {tab === 'dashboard' && (
            <div>
              <PageTitle actions={
                <Button variant="outline" size="sm" onClick={() => { fetchStats(); setOrdersKey(k => k + 1); }}>
                  <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                </Button>
              }>Dashboard</PageTitle>
              <ErrorNote>{statsError}</ErrorNote>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                {!stats && !statsError && <p className="text-sm text-muted-foreground">Loading…</p>}
                {cards.map(card => (
                  <button key={card.label} onClick={() => go(card.tab)} className="glass-card rounded-xl p-5 text-left hover:ring-1 hover:ring-primary/40 transition">
                    <card.icon className={`w-7 h-7 ${card.color} mb-2`} />
                    <p className="font-heading font-bold text-2xl text-foreground">{card.value}</p>
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    {card.hint && <p className="text-xs text-muted-foreground/70 mt-1">{card.hint}</p>}
                  </button>
                ))}
              </div>
              <h2 className="font-heading font-semibold text-lg text-foreground mb-4">Recent orders</h2>
              <OrdersTab key={ordersKey} recent onChanged={fetchStats} />
            </div>
          )}
          {tab === 'orders' && <OrdersTab onChanged={fetchStats} />}
          {tab === 'products' && <ProductsTab />}
          {tab === 'messages' && <MessagesTab onChanged={fetchStats} />}
          {tab === 'inquiries' && <InquiriesTab onChanged={fetchStats} />}
          {tab === 'offers' && <OffersTab />}
          {tab === 'promo_codes' && <PromoCodesTab />}
          {tab === 'clients' && <ClientsTab />}
          {tab === 'settings' && <SettingsTab onLogout={onLogout} />}
        </div>
      </main>
    </div>
  );
}
