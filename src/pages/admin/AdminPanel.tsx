import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  LayoutDashboard, ShoppingCart, Package, Megaphone,
  FlaskConical, Settings, LogOut, Eye, Check, X, Truck, Clock,
  MessageSquare, Tag, RefreshCw, Building2, Plus, Trash2, ToggleLeft, ToggleRight, Menu
} from 'lucide-react';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderItem { name: string; quantity: number; price: number; }
interface Order {
  id: string; order_ref: string; customer_name: string; phone: string;
  city: string; total: number; payment_method: string; status: string;
  created_at: string; items: OrderItem[]; notes?: string;
}
interface Stats {
  orders: { total: number; pending: number; confirmed: number; dispatched: number; delivered: number; rejected: number; total_revenue: number };
  today: { orders: number; revenue: number };
  messages: number;
}
interface PromoCode {
  id: string; code: string; discount_percentage: number; is_active: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns the Authorization header using the stored JWT token */
const authHeader = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('ow_admin_token') || ''}`,
});

const statusColors: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-800',
  confirmed:  'bg-blue-100 text-blue-800',
  dispatched: 'bg-purple-100 text-purple-800',
  delivered:  'bg-green-100 text-green-800',
  rejected:   'bg-red-100 text-red-800',
};

const sidebarItems = [
  { id: 'dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { id: 'orders',     label: 'Orders',     icon: ShoppingCart    },
  { id: 'products',   label: 'Products',   icon: Package         },
  { id: 'messages',   label: 'Messages',   icon: MessageSquare   },
  { id: 'offers',     label: 'Offers',     icon: Megaphone       },
  { id: 'promo_codes',label: 'Promo Codes',icon: Tag             },
  { id: 'clients',    label: 'Clients',    icon: Building2       },
  { id: 'quality',    label: 'Lab Reports',icon: FlaskConical    },
  { id: 'settings',   label: 'Settings',   icon: Settings        },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [isSidebarOpen, setIsSidebarOpen]   = useState(false);
  const [tab, setTab]                       = useState('dashboard');
  const [orders, setOrders]                 = useState<Order[]>([]);
  const [stats, setStats]                   = useState<Stats | null>(null);
  const [promoCodes, setPromoCodes]         = useState<PromoCode[]>([]);
  const [selectedOrder, setSelectedOrder]   = useState<Order | null>(null);
  const [isLoading, setIsLoading]           = useState(true);
  const [newPromoCode, setNewPromoCode]     = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState('');
  const [newPassword, setNewPassword]       = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [statusMsg, setStatusMsg]           = useState('');
  const adminUsername = localStorage.getItem('ow_admin_user') || 'Admin';

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/orders', { headers: authHeader() });
      if (res.status === 401) { onLogout(); return; }
      if (res.ok) setOrders(await res.json());
    } catch (err) { console.error('Failed to fetch orders:', err); }
    finally { setIsLoading(false); }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', { headers: authHeader() });
      if (res.ok) setStats(await res.json());
    } catch (err) { console.error('Failed to fetch stats:', err); }
  };

  const fetchPromoCodes = async () => {
    try {
      const res = await fetch('/api/admin/promo-codes', { headers: authHeader() });
      if (res.ok) setPromoCodes(await res.json());
    } catch (err) { console.error('Failed to fetch promo codes:', err); }
  };

  useEffect(() => {
    fetchOrders();
    fetchStats();
    fetchPromoCodes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleUpdateStatus = async (orderId: string, newStatus: string, notes?: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: authHeader(),
        body: JSON.stringify({ status: newStatus, notes }),
      });
      if (res.ok) { fetchOrders(); fetchStats(); setSelectedOrder(null); }
      else alert('Failed to update status. Please try again.');
    } catch { alert('Network error updating status.'); }
  };

  const handleCreatePromo = async () => {
    if (!newPromoCode || !newPromoDiscount) return;
    try {
      const res = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ code: newPromoCode, discount_percentage: Number(newPromoDiscount) }),
      });
      if (res.ok) {
        setNewPromoCode(''); setNewPromoDiscount('');
        fetchPromoCodes();
      } else {
        const d = await res.json();
        alert(d.message || 'Failed to create promo code.');
      }
    } catch { alert('Network error creating promo code.'); }
  };

  const handleTogglePromo = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/promo-codes/${id}/toggle`, { method: 'PATCH', headers: authHeader() });
      if (res.ok) fetchPromoCodes();
    } catch { alert('Network error toggling promo code.'); }
  };

  const handleDeletePromo = async (id: string) => {
    if (!confirm('Delete this promo code?')) return;
    try {
      const res = await fetch(`/api/admin/promo-codes/${id}`, { method: 'DELETE', headers: authHeader() });
      if (res.ok) fetchPromoCodes();
    } catch { alert('Network error deleting promo code.'); }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) return;
    try {
      const res = await fetch('/api/admin/settings/password', {
        method: 'PUT',
        headers: authHeader(),
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      const d = await res.json();
      setStatusMsg(res.ok ? '✅ Password updated successfully!' : `❌ ${d.message}`);
      if (res.ok) { setCurrentPassword(''); setNewPassword(''); }
    } catch { setStatusMsg('❌ Network error. Please try again.'); }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen bg-background relative overflow-hidden">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-foreground text-primary-foreground/80 flex flex-col shrink-0 transform transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-primary-foreground/10 flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-heading font-bold text-lg text-primary-foreground">OneWater Admin</h2>
            <p className="text-xs text-primary-foreground/40 mt-0.5">Welcome, {adminUsername}</p>
          </div>
          <button className="md:hidden text-primary-foreground/60 p-1 hover:text-primary-foreground transition-colors" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-2 overflow-y-auto">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setTab(item.id); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1 ${
                tab === item.id ? 'bg-primary/20 text-primary-foreground' : 'hover:bg-primary-foreground/5'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-primary-foreground/10 shrink-0">
          <Button variant="ghost" className="w-full text-primary-foreground/60 hover:text-primary-foreground" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center p-4 border-b border-border/50 shrink-0 bg-card z-10">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 mr-2 text-foreground hover:bg-muted rounded-lg transition-colors">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="font-heading font-bold text-lg text-foreground">Admin Panel</h1>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-6 overflow-x-hidden overflow-y-auto w-full">

        {/* ── Dashboard ─────────────────────────── */}
        {tab === 'dashboard' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="font-heading font-bold text-2xl text-foreground">Dashboard</h1>
              <Button variant="outline" size="sm" onClick={() => { fetchStats(); fetchOrders(); }}>
                <RefreshCw className="w-4 h-4 mr-2" /> Refresh
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Today's Orders",    value: stats ? String(stats.today.orders) : '—',                           icon: ShoppingCart, color: 'text-primary' },
                { label: 'Pending',           value: stats ? String(stats.orders.pending) : '—',                         icon: Clock,        color: 'text-yellow-600' },
                { label: 'Dispatched',        value: stats ? String(stats.orders.dispatched) : '—',                      icon: Truck,        color: 'text-purple-600' },
                { label: "Today's Revenue",   value: stats ? `PKR ${stats.today.revenue.toLocaleString()}` : '—',        icon: Package,      color: 'text-accent' },
              ].map((stat, i) => (
                <div key={i} className="glass-card rounded-xl p-5">
                  <stat.icon className={`w-8 h-8 ${stat.color} mb-2`} />
                  <p className="font-heading font-bold text-2xl text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
            <h2 className="font-heading font-semibold text-lg text-foreground mb-4">Recent Orders</h2>
            <OrdersTable orders={orders.slice(0, 5)} onView={setSelectedOrder} statusColors={statusColors} isLoading={isLoading} />
          </div>
        )}

        {/* ── Orders ────────────────────────────── */}
        {tab === 'orders' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="font-heading font-bold text-2xl text-foreground">Order Management</h1>
              <Button variant="outline" size="sm" onClick={fetchOrders}>
                <RefreshCw className="w-4 h-4 mr-2" /> Refresh
              </Button>
            </div>
            <OrdersTable orders={orders} onView={setSelectedOrder} statusColors={statusColors} isLoading={isLoading} />
          </div>
        )}

        {/* ── Products ──────────────────────────── */}
        {tab === 'products' && (
          <div>
            <h1 className="font-heading font-bold text-2xl text-foreground mb-6">Product Management</h1>
            <ProductsTab />
          </div>
        )}

        {/* ── Messages ──────────────────────────── */}
        {tab === 'messages' && (
          <div>
            <h1 className="font-heading font-bold text-2xl text-foreground mb-6">Contact Messages</h1>
            <MessagesTab />
          </div>
        )}

        {/* ── Clients ────────────────────── */}
        {tab === 'clients' && (
          <div>
            <h1 className="font-heading font-bold text-2xl text-foreground mb-6">Featured Clients</h1>
            <ClientsTab />
          </div>
        )}

        {/* ── Offers ───────────────────────── */}
        {tab === 'offers' && (
          <div>
            <h1 className="font-heading font-bold text-2xl text-foreground mb-6">Dynamic Offers</h1>
            <OffersTab />
          </div>
        )}

        {/* ── Promo Codes ───────────────────────── */}
        {tab === 'promo_codes' && (
          <div>
            <h1 className="font-heading font-bold text-2xl text-foreground mb-6">Promo Codes</h1>
            <div className="glass-card rounded-xl p-6 space-y-4 max-w-xl mb-6">
              <h3 className="font-semibold">Create New Promo Code</h3>
              <div className="flex gap-2">
                <Input placeholder="Code (e.g. SUMMER15)" value={newPromoCode} onChange={e => setNewPromoCode(e.target.value.toUpperCase())} />
                <Input placeholder="Discount %" type="number" min="1" max="100" value={newPromoDiscount} onChange={e => setNewPromoDiscount(e.target.value)} className="w-32" />
                <Button className="water-gradient text-primary-foreground shrink-0" onClick={handleCreatePromo}>Add</Button>
              </div>
            </div>
            <div className="glass-card rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promoCodes.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No promo codes yet.</TableCell></TableRow>
                  )}
                  {promoCodes.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono font-bold">{p.code}</TableCell>
                      <TableCell>{p.discount_percentage}%</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                          {p.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleTogglePromo(p.id)}>
                          {p.is_active ? 'Disable' : 'Enable'}
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeletePromo(p.id)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* ── Lab Reports ───────────────────────── */}
        {tab === 'quality' && (
          <div>
            <h1 className="font-heading font-bold text-2xl text-foreground mb-6">Lab Reports & Quality</h1>
            <div className="glass-card rounded-xl p-6 space-y-4 max-w-xl">
              <h3 className="font-semibold">Upload New Lab Report</h3>
              <Input type="file" accept=".pdf" id="labReportFile" />
              <Button 
                className="water-gradient text-primary-foreground"
                onClick={async () => {
                  const input = document.getElementById('labReportFile') as HTMLInputElement;
                  if (!input || !input.files || input.files.length === 0) return alert('Please select a PDF file first.');
                  const file = input.files[0];
                  
                  const formData = new FormData();
                  formData.append('report', file);
                  
                  try {
                    const res = await fetch('/api/admin/settings/quality', {
                      method: 'POST',
                      headers: { 'Authorization': `Bearer ${localStorage.getItem('ow_admin_token')}` },
                      body: formData,
                    });
                    const data = await res.json();
                    if (res.ok) {
                      alert('Lab report uploaded successfully!');
                      input.value = ''; // Reset
                    } else {
                      alert(`Error: ${data.message || 'Failed to upload'}`);
                    }
                  } catch (err) {
                    alert('Network error. Please try again.');
                  }
                }}
              >Upload PDF</Button>
            </div>
          </div>
        )}

        {/* ── Settings ──────────────────────────── */}
        {tab === 'settings' && (
          <div>
            <h1 className="font-heading font-bold text-2xl text-foreground mb-6">Settings</h1>
            <div className="space-y-6 max-w-xl">
              <div className="glass-card rounded-xl p-6 space-y-4">
                <h3 className="font-semibold">Change Admin Password</h3>
                <Input type="password" placeholder="Current Password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                <Input type="password" placeholder="New Password (min 8 chars)" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                {statusMsg && <p className="text-sm">{statusMsg}</p>}
                <Button className="water-gradient text-primary-foreground" onClick={handleChangePassword}>
                  Update Password
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── Order Detail Modal ───────────────────── */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order — {selectedOrder?.order_ref}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Customer:</span> <strong>{selectedOrder.customer_name}</strong></div>
                <div><span className="text-muted-foreground">Phone:</span> <strong>{selectedOrder.phone}</strong></div>
                <div><span className="text-muted-foreground">City:</span> <strong>{selectedOrder.city}</strong></div>
                <div><span className="text-muted-foreground">Payment:</span> <strong>{selectedOrder.payment_method}</strong></div>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Items:</span>
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="ml-2">• {item.name} x{item.quantity} — PKR {item.price * item.quantity}</div>
                ))}
              </div>
              <div className="text-lg font-heading font-bold">Total: PKR {Number(selectedOrder.total).toLocaleString()}</div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[selectedOrder.status]}`}>
                {selectedOrder.status.toUpperCase()}
              </span>
              <Select defaultValue={selectedOrder.status} onValueChange={(val) => handleUpdateStatus(selectedOrder.id, val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['pending','confirmed','dispatched','delivered','rejected'].map(s => (
                    <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button className="flex-1 bg-accent text-accent-foreground" onClick={() => handleUpdateStatus(selectedOrder.id, 'confirmed')}>
                  <Check className="w-4 h-4 mr-1" /> Confirm
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => handleUpdateStatus(selectedOrder.id, 'rejected')}>
                  <X className="w-4 h-4 mr-1" /> Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </main>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function OrdersTable({ orders, onView, statusColors, isLoading }: {
  orders: Order[]; onView: (o: Order) => void;
  statusColors: Record<string, string>; isLoading: boolean;
}) {
  return (
    <div className="glass-card rounded-xl overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ref</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading orders...</TableCell></TableRow>
          )}
          {!isLoading && orders.length === 0 && (
            <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No orders found.</TableCell></TableRow>
          )}
          {orders.map(order => (
            <TableRow key={order.id}>
              <TableCell className="font-mono font-medium text-xs">{order.order_ref}</TableCell>
              <TableCell>{order.customer_name}</TableCell>
              <TableCell>{order.city}</TableCell>
              <TableCell className="font-semibold">PKR {Number(order.total).toLocaleString()}</TableCell>
              <TableCell>{order.payment_method}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>{order.status}</span>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => onView(order)}>
                  <Eye className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ProductsTab() {
  const [products, setProducts] = useState<Array<{id:string;name:string;size:string;price:number;in_stock:boolean;category?:string;image_url?:string}>>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');

  // Add product state
  const [newProductId, setNewProductId]     = useState('');
  const [newProductName, setNewProductName] = useState('');
  const [newProductSize, setNewProductSize] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductCat, setNewProductCat]   = useState('bottle');
  const [newProductDesc, setNewProductDesc] = useState('');
  const [imageFile, setImageFile]           = useState<File | null>(null);
  const [imagePreview, setImagePreview]     = useState<string | null>(null);
  const [isAdding, setIsAdding]             = useState(false);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const token = () => localStorage.getItem('ow_admin_token') || '';

  useEffect(() => {
    fetch('/api/admin/products', { headers: { 'Authorization': `Bearer ${token()}` } })
      .then(r => r.json()).then(setProducts).catch(console.error);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };
  const clearImage = () => {
    setImageFile(null); setImagePreview(null);
    if (imgInputRef.current) imgInputRef.current.value = '';
  };

  const savePrice = async (id: string) => {
    await fetch(`/api/admin/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token()}` },
      body: JSON.stringify({ price: Number(editPrice) }),
    });
    setProducts(p => p.map(prod => prod.id === id ? { ...prod, price: Number(editPrice) } : prod));
    setEditing(null);
  };

  const toggleStock = async (id: string, current: boolean) => {
    await fetch(`/api/admin/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token()}` },
      body: JSON.stringify({ in_stock: !current }),
    });
    setProducts(p => p.map(prod => prod.id === id ? { ...prod, in_stock: !current } : prod));
  };

  const handleAddProduct = async () => {
    if (!newProductId || !newProductName || !newProductSize || !newProductPrice) return alert('Fill all required fields');
    setIsAdding(true);
    try {
      const formData = new FormData();
      formData.append('id', newProductId.trim());
      formData.append('name', newProductName.trim());
      formData.append('size', newProductSize.trim());
      formData.append('price', newProductPrice);
      formData.append('category', newProductCat);
      formData.append('description', newProductDesc);
      if (imageFile) formData.append('image', imageFile);

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token()}` }, // NO Content-Type — browser sets multipart boundary
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setProducts([...products, data.product]);
        setNewProductId(''); setNewProductName(''); setNewProductSize('');
        setNewProductPrice(''); setNewProductDesc(''); clearImage();
      } else {
        const d = await res.json();
        alert(`Failed: ${d.message}`);
      }
    } catch { alert('Network error'); }
    finally { setIsAdding(false); }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token()}` },
      });
      if (res.ok) setProducts(p => p.filter(prod => prod.id !== id));
      else alert('Failed to delete product.');
    } catch { alert('Network error'); }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-xl p-6 space-y-4 max-w-3xl">
        <h3 className="font-semibold flex items-center gap-2"><Plus className="w-4 h-4 text-primary" /> Add New Product</h3>

        {/* Text fields */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Input placeholder="ID (e.g. 500ml_bottle) *" value={newProductId} onChange={e => setNewProductId(e.target.value)} />
          <Input placeholder="Name (e.g. 500ml Bottle) *" value={newProductName} onChange={e => setNewProductName(e.target.value)} />
          <Input placeholder="Size (e.g. 500ml) *" value={newProductSize} onChange={e => setNewProductSize(e.target.value)} />
          <Input type="number" placeholder="Price (PKR) *" value={newProductPrice} onChange={e => setNewProductPrice(e.target.value)} />
          <Select value={newProductCat} onValueChange={setNewProductCat}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="bottle">Bottle</SelectItem><SelectItem value="dispenser">Dispenser</SelectItem></SelectContent>
          </Select>
          <Input placeholder="Description (optional)" value={newProductDesc} onChange={e => setNewProductDesc(e.target.value)} />
        </div>

        {/* Image upload */}
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Product Image <span className="text-muted-foreground font-normal">(optional — PNG, JPG, WebP · max 5 MB)</span></p>
          <input ref={imgInputRef} type="file" accept="image/*" className="hidden" id="product-img-upload" onChange={handleImageChange} />

          {imagePreview ? (
            <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/30">
              <img src={imagePreview} alt="Preview" className="h-20 w-20 object-contain rounded-lg border border-border bg-white p-2" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{imageFile?.name}</p>
                <p className="text-xs text-muted-foreground">{imageFile ? `${(imageFile.size / 1024).toFixed(0)} KB` : ''} · Will upload to Cloudinary</p>
              </div>
              <Button variant="ghost" size="sm" onClick={clearImage} className="text-destructive hover:text-destructive">
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <label htmlFor="product-img-upload" className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">Click to upload product image</p>
              <p className="text-xs text-muted-foreground">PNG, JPG, WebP (max 5 MB)</p>
            </label>
          )}
        </div>

        <Button className="water-gradient text-primary-foreground" onClick={handleAddProduct} disabled={isAdding}>
          {isAdding ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
              Uploading...
            </span>
          ) : 'Add Product'}
        </Button>
      </div>


      <div className="glass-card rounded-xl overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead><TableHead>Size</TableHead>
            <TableHead>Price (PKR)</TableHead><TableHead>Stock</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map(p => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.name}</TableCell>
              <TableCell>{p.size}</TableCell>
              <TableCell>
                {editing === p.id
                  ? <div className="flex gap-2"><Input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} className="w-24 h-8" /><Button size="sm" onClick={() => savePrice(p.id)}>Save</Button></div>
                  : p.price
                }
              </TableCell>
              <TableCell>
                <span className={`text-xs font-medium ${p.in_stock ? 'text-accent' : 'text-destructive'}`}>
                  {p.in_stock ? 'In Stock' : 'Out of Stock'}
                </span>
              </TableCell>
              <TableCell className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { setEditing(p.id); setEditPrice(String(p.price)); }}>Edit Price</Button>
                <Button variant="ghost" size="sm" onClick={() => toggleStock(p.id, p.in_stock)}>
                  {p.in_stock ? 'Mark Out' : 'Mark In'}
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(p.id)}>
                  <X className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
    </div>
  );
}

function MessagesTab() {
  const [messages, setMessages] = useState<Array<{id:string;name:string;email:string;phone:string;message:string;created_at:string}>>([]);

  useEffect(() => {
    fetch('/api/admin/messages', { headers: { 'Authorization': `Bearer ${localStorage.getItem('ow_admin_token')}` } })
      .then(r => r.json()).then(setMessages).catch(console.error);
  }, []);

  return (
    <div className="space-y-4">
      {messages.length === 0 && <p className="text-muted-foreground text-sm">No messages yet.</p>}
      {messages.map(m => (
        <div key={m.id} className="glass-card rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground">{m.name}</span>
            <span className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleDateString()}</span>
          </div>
          <p className="text-xs text-muted-foreground">{m.email} {m.phone ? `· ${m.phone}` : ''}</p>
          <p className="text-sm text-foreground">{m.message}</p>
        </div>
      ))}
    </div>
  );
}

// ─── ClientsTab ───────────────────────────────────────────────────────────────

interface Client {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  is_active: boolean;
  sort_order: number;
}

function ClientsTab() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isAdding, setIsAdding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const authToken = () => localStorage.getItem('ow_admin_token') || '';

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/clients', {
        headers: { 'Authorization': `Bearer ${authToken()}` },
      });
      if (res.ok) setClients(await res.json());
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchClients(); }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLogoFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const clearFile = () => {
    setLogoFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAdd = async () => {
    if (!name.trim()) return alert('Client name is required.');
    setIsAdding(true);
    try {
      // Use FormData so we can send both text fields + the logo file
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('website_url', websiteUrl);
      formData.append('sort_order', sortOrder);
      if (logoFile) formData.append('logo', logoFile);

      const res = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken()}` }, // NO Content-Type — let browser set multipart boundary
        body: formData,
      });

      if (res.ok) {
        setName(''); clearFile(); setWebsiteUrl(''); setSortOrder('0');
        fetchClients();
      } else {
        const d = await res.json();
        alert(d.message || 'Failed to add client.');
      }
    } catch { alert('Network error.'); }
    finally { setIsAdding(false); }
  };

  const handleToggle = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/clients/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${authToken()}` },
      });
      if (res.ok) setClients(c => c.map(cl => cl.id === id ? { ...cl, is_active: !cl.is_active } : cl));
    } catch { alert('Network error.'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this client?')) return;
    try {
      const res = await fetch(`/api/admin/clients/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken()}` },
      });
      if (res.ok) setClients(c => c.filter(cl => cl.id !== id));
    } catch { alert('Network error.'); }
  };

  return (
    <div className="space-y-6">
      {/* Add form */}
      <div className="glass-card rounded-xl p-6 space-y-4 max-w-2xl">
        <h3 className="font-semibold flex items-center gap-2"><Plus className="w-4 h-4 text-primary" /> Add New Client</h3>

        <div className="grid sm:grid-cols-2 gap-3">
          <Input placeholder="Client / Company Name *" value={name} onChange={e => setName(e.target.value)} />
          <Input placeholder="Website URL (optional)" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} />
          <Input type="number" placeholder="Sort Order (0 = first)" value={sortOrder} onChange={e => setSortOrder(e.target.value)} min="0" />
        </div>

        {/* Logo file picker */}
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Client Logo <span className="text-muted-foreground font-normal">(optional — PNG, JPG, SVG, WebP · max 3 MB)</span></p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            id="client-logo-upload"
            onChange={handleFileChange}
          />

          {previewUrl ? (
            /* Preview card */
            <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/30">
              <img src={previewUrl} alt="Preview" className="h-16 w-16 object-contain rounded-lg border border-border bg-white p-1" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{logoFile?.name}</p>
                <p className="text-xs text-muted-foreground">{logoFile ? `${(logoFile.size / 1024).toFixed(0)} KB` : ''} · Will upload to Cloudinary</p>
              </div>
              <Button variant="ghost" size="sm" onClick={clearFile} className="shrink-0 text-destructive hover:text-destructive">
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            /* Drop zone */
            <label
              htmlFor="client-logo-upload"
              className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">Click to upload logo</p>
              <p className="text-xs text-muted-foreground">PNG, JPG, SVG, WebP (max 3 MB)</p>
            </label>
          )}
          <p className="text-xs text-muted-foreground mt-2">If no logo is uploaded, initials will be shown with a unique colour on the homepage.</p>
        </div>

        <Button className="water-gradient text-primary-foreground" onClick={handleAdd} disabled={isAdding}>
          {isAdding ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
              Uploading to Cloudinary...
            </span>
          ) : 'Add Client'}
        </Button>
      </div>


      {/* Clients list */}
      <div className="glass-card rounded-xl overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Logo</TableHead>
              <TableHead>Website</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading clients...</TableCell></TableRow>
            )}
            {!isLoading && clients.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No clients yet. Add your first client above.</TableCell></TableRow>
            )}
            {clients.map(cl => (
              <TableRow key={cl.id}>
                <TableCell className="font-semibold">{cl.name}</TableCell>
                <TableCell>
                  {cl.logo_url
                    ? <img src={cl.logo_url} alt={cl.name} className="h-8 w-auto max-w-[80px] object-contain rounded" onError={e => (e.currentTarget.style.display = 'none')} />
                    : <span className="text-xs text-muted-foreground italic">No logo</span>
                  }
                </TableCell>
                <TableCell className="text-xs text-primary truncate max-w-[140px]">
                  {cl.website_url ? <a href={cl.website_url} target="_blank" rel="noopener noreferrer" className="hover:underline">{cl.website_url}</a> : '—'}
                </TableCell>
                <TableCell>{cl.sort_order}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${cl.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                    {cl.is_active ? 'Visible' : 'Hidden'}
                  </span>
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleToggle(cl.id)} title={cl.is_active ? 'Hide' : 'Show'}>
                    {cl.is_active ? <ToggleRight className="w-4 h-4 text-accent" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(cl.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── OffersTab ────────────────────────────────────────────────────────────────

interface Offer {
  id: string; title: string; description: string; original_price: number;
  sale_price: number; promo_code: string; discount_text: string; image_url: string;
  badge_text: string; color_gradient: string; icon_color: string; sort_order: number;
  is_active: boolean;
}

function OffersTab() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discountText, setDiscountText] = useState('');
  const [badgeText, setBadgeText] = useState('');
  const [colorGradient, setColorGradient] = useState('from-cyan-500/20 to-cyan-700/5');
  const [iconColor, setIconColor] = useState('text-cyan-400');
  const [sortOrder, setSortOrder] = useState('0');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchOffers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/offers', { headers: { 'Authorization': `Bearer ${localStorage.getItem('ow_admin_token')}` } });
      if (res.ok) setOffers(await res.json());
    } catch { console.error('Failed to fetch offers'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchOffers(); }, []);

  const clearFile = () => {
    setImageFile(null); setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      if (f.size > 3 * 1024 * 1024) return alert('File is too large (max 3 MB).');
      setImageFile(f); setPreviewUrl(URL.createObjectURL(f));
    }
  };

  const handleAdd = async () => {
    if (!title || !description || !promoCode || !discountText) {
      return alert('Title, Description, Promo Code, and Discount Text are required.');
    }
    setIsAdding(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('original_price', originalPrice);
      formData.append('sale_price', salePrice);
      formData.append('promo_code', promoCode);
      formData.append('discount_text', discountText);
      formData.append('badge_text', badgeText);
      formData.append('color_gradient', colorGradient);
      formData.append('icon_color', iconColor);
      formData.append('sort_order', sortOrder);
      if (imageFile) formData.append('image', imageFile);

      const res = await fetch('/api/admin/offers', {
        method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('ow_admin_token')}` }, body: formData,
      });

      if (res.ok) {
        setTitle(''); setDescription(''); setOriginalPrice(''); setSalePrice('');
        setPromoCode(''); setDiscountText(''); setBadgeText(''); clearFile();
        fetchOffers();
      } else {
        alert('Failed to add offer.');
      }
    } catch { alert('Network error.'); }
    finally { setIsAdding(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this offer?')) return;
    try {
      const res = await fetch(`/api/admin/offers/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('ow_admin_token')}` } });
      if (res.ok) setOffers(o => o.filter(x => x.id !== id));
    } catch { alert('Network error.'); }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-xl p-6 space-y-4 max-w-2xl">
        <h3 className="font-semibold flex items-center gap-2"><Plus className="w-4 h-4 text-primary" /> Add New Offer</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <Input placeholder="Offer Title *" value={title} onChange={e => setTitle(e.target.value)} />
          <Input placeholder="Badge Text (e.g. 🎉 Eid Special)" value={badgeText} onChange={e => setBadgeText(e.target.value)} />
          <Input placeholder="Original Price" type="number" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} />
          <Input placeholder="Sale Price" type="number" value={salePrice} onChange={e => setSalePrice(e.target.value)} />
          <Input placeholder="Promo Code *" value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())} />
          <Input placeholder="Discount Text * (e.g. 15% OFF)" value={discountText} onChange={e => setDiscountText(e.target.value)} />
          <Input placeholder="Sort Order (0 = first)" type="number" value={sortOrder} onChange={e => setSortOrder(e.target.value)} />
        </div>
        <Textarea placeholder="Description *" value={description} onChange={e => setDescription(e.target.value)} rows={2} />
        
        <div>
          <p className="text-sm font-medium mb-2">Offer Image</p>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" id="offer-image-upload" onChange={handleFileChange} />
          {previewUrl ? (
            <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/30">
              <img src={previewUrl} alt="Preview" className="h-16 w-16 object-contain rounded-lg border border-border bg-white p-1" />
              <Button variant="ghost" size="sm" onClick={clearFile} className="shrink-0 text-destructive hover:text-destructive"><X className="w-4 h-4" /></Button>
            </div>
          ) : (
            <label htmlFor="offer-image-upload" className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer">
              <Package className="w-5 h-5 text-primary" />
              <p className="text-sm font-medium">Click to upload image</p>
            </label>
          )}
        </div>

        <Button className="water-gradient text-primary-foreground" onClick={handleAdd} disabled={isAdding}>
          {isAdding ? 'Adding...' : 'Add Offer'}
        </Button>
      </div>

      <div className="glass-card rounded-xl overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Promo Code</TableHead>
              <TableHead>Prices</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offers.map(o => (
              <TableRow key={o.id}>
                <TableCell>
                  {o.image_url ? <img src={o.image_url} alt="" className="h-8 w-auto max-w-[50px] object-contain rounded" /> : '—'}
                </TableCell>
                <TableCell className="font-semibold">{o.title}</TableCell>
                <TableCell><code className="px-2 py-1 bg-muted rounded font-mono text-xs">{o.promo_code}</code></TableCell>
                <TableCell className="text-sm">
                  {o.original_price > 0 && <span className="line-through text-muted-foreground mr-2">{o.original_price}</span>}
                  <span className="font-bold text-primary">{o.sale_price}</span>
                </TableCell>
                <TableCell>{o.sort_order}</TableCell>
                <TableCell>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(o.id)}><Trash2 className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

