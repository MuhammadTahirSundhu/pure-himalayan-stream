import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api, ApiError } from '@/lib/api';

export interface CartItem {
  id: string;          // product id (one line per product)
  name: string;
  size: string;
  price: number;       // display only — the server re-prices
  image: string;
  category: 'bottle' | 'dispenser';
  quantity: number;
  newBottles?: number; // 19L only: bottles needing a deposit (rest are exchanged empties)
}

export type DeliverySchedule = 'once' | 'weekly' | 'biweekly' | 'monthly';

interface PromoState { code: string; discount: number; minOrder: number }

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number, opts?: { open?: boolean }) => void;
  setItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  schedule: DeliverySchedule;
  setSchedule: (s: DeliverySchedule) => void;
  promo: PromoState | null;
  /** Validates a code with the server; returns an error message or null. */
  applyPromo: (code: string) => Promise<string | null>;
  removePromo: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const STORAGE_KEY = 'ow_cart_v2';

interface Persisted { items: CartItem[]; schedule: DeliverySchedule; promo: PromoState | null }

function load(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Persisted;
      if (Array.isArray(p.items)) return { items: p.items, schedule: p.schedule || 'once', promo: p.promo ?? null };
    }
  } catch { /* storage unavailable or corrupt — start empty */ }
  return { items: [], schedule: 'once', promo: null };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [initial] = useState(load);
  const [items, setItems] = useState<CartItem[]>(initial.items);
  const [schedule, setSchedule] = useState<DeliverySchedule>(initial.schedule);
  const [promo, setPromo] = useState<PromoState | null>(initial.promo);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, schedule, promo })); } catch { /* ignore */ }
  }, [items, schedule, promo]);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>, quantity = 1, opts: { open?: boolean } = {}) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => i.id === item.id
          ? { ...i, quantity: i.quantity + quantity, newBottles: i.category === 'dispenser' ? (i.newBottles ?? i.quantity) + (item.newBottles ?? quantity) : undefined }
          : i);
      }
      return [...prev, { ...item, quantity, newBottles: item.category === 'dispenser' ? item.newBottles ?? quantity : undefined }];
    });
    if (opts.open !== false) setIsOpen(true);
  }, []);

  const setItem = useCallback((item: CartItem) => {
    setItems((prev) => (prev.some((i) => i.id === item.id) ? prev.map((i) => (i.id === item.id ? item : i)) : [...prev, item]));
  }, []);

  const removeItem = useCallback((id: string) => setItems((prev) => prev.filter((i) => i.id !== id)), []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) => quantity <= 0
      ? prev.filter((i) => i.id !== id)
      : prev.map((i) => i.id === id
        ? { ...i, quantity, newBottles: i.newBottles === undefined ? undefined : Math.min(quantity, i.newBottles + Math.max(0, quantity - i.quantity)) }
        : i));
  }, []);

  const clearCart = useCallback(() => { setItems([]); setPromo(null); setSchedule('once'); }, []);

  const applyPromo = useCallback(async (code: string) => {
    try {
      const data = await api<{ valid: boolean; code?: string; discount_percentage?: number; min_order_amount?: number; message?: string }>(
        '/api/promo/validate', { method: 'POST', json: { code } }
      );
      if (!data.valid) return data.message || 'This promo code is not valid.';
      setPromo({ code: data.code!, discount: data.discount_percentage!, minOrder: data.min_order_amount ?? 0 });
      return null;
    } catch (err) {
      return err instanceof ApiError ? err.message : 'Could not check the code. Please try again.';
    }
  }, []);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, isOpen, setIsOpen, addItem, setItem, removeItem, updateQuantity, clearCart, itemCount,
      schedule, setSchedule, promo, applyPromo, removePromo: () => setPromo(null),
    }}>
      {children}
    </CartContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
