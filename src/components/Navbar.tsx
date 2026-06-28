import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, Droplets } from 'lucide-react';
import logoIcon from '@/assets/media/2.jpeg';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';

const navLinks = [
  { to: '/',         label: 'Home'        },
  { to: '/products', label: 'Products'    },
  { to: '/delivery', label: '19L Delivery'},
  { to: '/quality',  label: 'Quality'     },
  { to: '/offers',   label: 'Offers'      },
  { to: '/events',   label: 'Events'      },
  { to: '/about',    label: 'About'       },
  { to: '/contact',  label: 'Contact'     },
];

const BG   = '#030D1A';
const CYAN  = '#00d4ff';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const { setIsOpen, itemCount } = useCart();
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav
      className="fixed w-full top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(3,13,26,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: `1px solid ${scrolled ? 'rgba(0,212,255,0.18)' : 'transparent'}`,
        boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.4)' : 'none',
      }}
    >
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center"
            style={{ border: `1px solid ${CYAN}40`, boxShadow: `0 0 12px ${CYAN}30` }}>
            <img src={logoIcon} alt="OneWater Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-heading font-bold text-xl text-white">
            One<span style={{ color: CYAN }}>Water</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map(link => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className="px-3 py-2 rounded-md text-sm font-medium transition-all duration-200"
                style={{
                  color: active ? CYAN : 'rgba(160,210,255,0.75)',
                  background: active ? 'rgba(0,212,255,0.10)' : 'transparent',
                  boxShadow: active ? `0 0 12px rgba(0,212,255,0.15)` : 'none',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = 'rgba(160,210,255,0.75)'; }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          {/* Cart */}
          <button
            className="relative p-2 rounded-lg transition-all duration-200"
            style={{ color: 'rgba(160,210,255,0.8)' }}
            onClick={() => setIsOpen(true)}
            aria-label="Open cart"
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = CYAN; (e.currentTarget as HTMLElement).style.background = 'rgba(0,212,255,0.1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(160,210,255,0.8)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                style={{ background: `linear-gradient(135deg, ${CYAN}, #0284c7)`, boxShadow: `0 0 8px ${CYAN}80` }}
              >
                {itemCount}
              </span>
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-lg transition-colors"
            style={{ color: 'rgba(160,210,255,0.8)' }}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="lg:hidden border-t"
          style={{ background: 'rgba(3,13,26,0.98)', borderColor: 'rgba(0,212,255,0.12)', backdropFilter: 'blur(20px)' }}
        >
          <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {navLinks.map(link => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 rounded-md text-sm font-medium transition-all"
                  style={{
                    color: active ? CYAN : 'rgba(160,210,255,0.75)',
                    background: active ? 'rgba(0,212,255,0.10)' : 'transparent',
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
