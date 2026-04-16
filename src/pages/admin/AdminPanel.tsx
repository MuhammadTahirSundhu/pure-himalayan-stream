import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  LayoutDashboard, ShoppingCart, Package, Megaphone,
  FlaskConical, Settings, LogOut, ChevronRight, Eye, Check, X, Truck, Clock
} from 'lucide-react';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const mockOrders = [
  { id: 'OW-ABC123', customer: 'Ahmed Khan', phone: '0300-1234567', city: 'Lahore', items: '3x 500ml, 2x 1.5L', total: 350, method: 'Easypaisa', status: 'pending', date: '2026-04-16', screenshot: '', notes: '' },
  { id: 'OW-DEF456', customer: 'Sara Ali', phone: '0301-7654321', city: 'Islamabad', items: '1x 19L', total: 1250, method: 'JazzCash', status: 'confirmed', date: '2026-04-15', screenshot: '', notes: '' },
  { id: 'OW-GHI789', customer: 'Usman Raza', phone: '0302-1111111', city: 'Gujranwala', items: '6x 1L', total: 480, method: 'COD', status: 'dispatched', date: '2026-04-14', screenshot: '', notes: '' },
  { id: 'OW-JKL012', customer: 'Fatima Noor', phone: '0303-2222222', city: 'Rawalpindi', items: '12x 500ml', total: 600, method: 'SadaPay', status: 'delivered', date: '2026-04-13', screenshot: '', notes: '' },
];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  dispatched: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'offers', label: 'Offers', icon: Megaphone },
  { id: 'quality', label: 'Lab Reports', icon: FlaskConical },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState('dashboard');
  const [orders, setOrders] = useState(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<typeof mockOrders[0] | null>(null);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-foreground text-primary-foreground/80 flex flex-col shrink-0">
        <div className="p-4 border-b border-primary-foreground/10">
          <h2 className="font-heading font-bold text-lg text-primary-foreground">One Water Admin</h2>
        </div>
        <nav className="flex-1 p-2">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1 ${
                tab === item.id ? 'bg-primary/20 text-primary-foreground' : 'hover:bg-primary-foreground/5'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-primary-foreground/10">
          <Button variant="ghost" className="w-full text-primary-foreground/60 hover:text-primary-foreground" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 overflow-auto">
        {/* Dashboard */}
        {tab === 'dashboard' && (
          <div>
            <h1 className="font-heading font-bold text-2xl text-foreground mb-6">Dashboard</h1>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Today's Orders", value: '12', icon: ShoppingCart, color: 'text-primary' },
                { label: 'Pending Payments', value: '5', icon: Clock, color: 'text-yellow-600' },
                { label: 'Dispatched', value: '3', icon: Truck, color: 'text-purple-600' },
                { label: 'Total Revenue', value: 'PKR 48,500', icon: Package, color: 'text-accent' },
              ].map((stat, i) => (
                <div key={i} className="glass-card rounded-xl p-5">
                  <stat.icon className={`w-8 h-8 ${stat.color} mb-2`} />
                  <p className="font-heading font-bold text-2xl text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
            <h2 className="font-heading font-semibold text-lg text-foreground mb-4">Recent Orders</h2>
            <OrdersTable orders={orders.slice(0, 5)} onView={setSelectedOrder} />
          </div>
        )}

        {/* Orders */}
        {tab === 'orders' && (
          <div>
            <h1 className="font-heading font-bold text-2xl text-foreground mb-6">Order Management</h1>
            <OrdersTable orders={orders} onView={setSelectedOrder} />
          </div>
        )}

        {/* Products */}
        {tab === 'products' && (
          <div>
            <h1 className="font-heading font-bold text-2xl text-foreground mb-6">Product Management</h1>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Price (PKR)</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {['300ml', '500ml', '1L', '1.5L', '19L'].map((size, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">One Water {size}</TableCell>
                    <TableCell>{size}</TableCell>
                    <TableCell>{[30, 50, 80, 100, 250][i]}</TableCell>
                    <TableCell><span className="text-accent font-medium">In Stock</span></TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Offers */}
        {tab === 'offers' && (
          <div>
            <h1 className="font-heading font-bold text-2xl text-foreground mb-6">Homepage & Offers</h1>
            <div className="space-y-6 max-w-xl">
              <div className="glass-card rounded-xl p-6 space-y-4">
                <h3 className="font-semibold">Hero Banner</h3>
                <Input defaultValue="Pure. Transparent. Pakistani." placeholder="Hero Title" />
                <Textarea defaultValue="Premium Himalayan mineral water delivered fresh." placeholder="Hero Subtitle" />
                <Button className="water-gradient text-primary-foreground">Update Hero</Button>
              </div>
              <div className="glass-card rounded-xl p-6 space-y-4">
                <h3 className="font-semibold">Active Promo Codes</h3>
                {['EID2026 — 15%', 'RAMADAN10 — 10%', 'WELCOME5 — 5%', 'ONEWATER20 — 20%'].map((code, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded bg-muted">
                    <code className="text-sm font-mono">{code}</code>
                    <Button variant="ghost" size="sm"><X className="w-4 h-4" /></Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quality */}
        {tab === 'quality' && (
          <div>
            <h1 className="font-heading font-bold text-2xl text-foreground mb-6">Lab Reports & Quality</h1>
            <div className="glass-card rounded-xl p-6 space-y-4 max-w-xl">
              <h3 className="font-semibold">Upload New Lab Report</h3>
              <Input type="file" accept=".pdf" />
              <Button className="water-gradient text-primary-foreground">Upload PDF</Button>
            </div>
          </div>
        )}

        {/* Settings */}
        {tab === 'settings' && (
          <div>
            <h1 className="font-heading font-bold text-2xl text-foreground mb-6">Settings</h1>
            <div className="space-y-6 max-w-xl">
              <div className="glass-card rounded-xl p-6 space-y-4">
                <h3 className="font-semibold">Payment Accounts</h3>
                <div className="space-y-3">
                  <div><label className="text-sm font-medium block mb-1">Easypaisa</label><Input defaultValue="0300-1234567" /></div>
                  <div><label className="text-sm font-medium block mb-1">JazzCash</label><Input defaultValue="0301-7654321" /></div>
                  <div><label className="text-sm font-medium block mb-1">SadaPay / NayaPay</label><Input defaultValue="0302-9876543" /></div>
                </div>
                <Button className="water-gradient text-primary-foreground">Save Accounts</Button>
              </div>
              <div className="glass-card rounded-xl p-6 space-y-4">
                <h3 className="font-semibold">Contact Info</h3>
                <Input defaultValue="+92 300 123 4567" placeholder="Phone" />
                <Input defaultValue="info@onewater.pk" placeholder="Email" />
                <Input defaultValue="GT Road, Gujranwala" placeholder="Address" />
                <Button className="water-gradient text-primary-foreground">Save Contact</Button>
              </div>
              <div className="glass-card rounded-xl p-6 space-y-4">
                <h3 className="font-semibold">Change Admin Password</h3>
                <Input type="password" placeholder="New Password" />
                <Button className="water-gradient text-primary-foreground">Update Password</Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Order Detail Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order {selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Customer:</span> <strong>{selectedOrder.customer}</strong></div>
                <div><span className="text-muted-foreground">Phone:</span> <strong>{selectedOrder.phone}</strong></div>
                <div><span className="text-muted-foreground">City:</span> <strong>{selectedOrder.city}</strong></div>
                <div><span className="text-muted-foreground">Payment:</span> <strong>{selectedOrder.method}</strong></div>
              </div>
              <div className="text-sm"><span className="text-muted-foreground">Items:</span> {selectedOrder.items}</div>
              <div className="text-lg font-heading font-bold">Total: PKR {selectedOrder.total}</div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[selectedOrder.status]}`}>
                  {selectedOrder.status.toUpperCase()}
                </span>
              </div>
              <Select defaultValue={selectedOrder.status}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="dispatched">Dispatched</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Textarea placeholder="Notes (e.g. rejection reason)" />
              <div className="flex gap-2">
                <Button className="flex-1 bg-accent text-accent-foreground"><Check className="w-4 h-4 mr-1" /> Confirm</Button>
                <Button variant="destructive" className="flex-1"><X className="w-4 h-4 mr-1" /> Reject</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OrdersTable({ orders, onView }: { orders: typeof mockOrders; onView: (o: typeof mockOrders[0]) => void }) {
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map(order => (
            <TableRow key={order.id}>
              <TableCell className="font-mono font-medium text-xs">{order.id}</TableCell>
              <TableCell>{order.customer}</TableCell>
              <TableCell>{order.city}</TableCell>
              <TableCell className="font-semibold">PKR {order.total}</TableCell>
              <TableCell>{order.method}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                  {order.status}
                </span>
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
