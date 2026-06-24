import { Link } from 'react-router-dom';
import { Droplets, Phone, Mail, MapPin, MessageCircle, ArrowRight } from 'lucide-react';

const CYAN = '#00d4ff';

export default function Footer() {
  return (
    <footer
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #030D1A 0%, #000d1a 100%)',
        borderTop: '1px solid rgba(0,212,255,0.12)',
      }}
    >
      {/* Top glow line */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)' }} />

      {/* Background hex grid */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.025] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="footer-hex" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
            <polygon points="30,1 58,15 58,37 30,51 2,37 2,15" fill="none" stroke="#00d4ff" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#footer-hex)" />
      </svg>

      <div className="container mx-auto px-4 py-14 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #00d4ff, #0284c7)', boxShadow: '0 0 16px rgba(0,212,255,0.4)' }}
              >
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading font-bold text-xl text-white">
                One<span style={{ color: CYAN }}>Water</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(150,200,255,0.65)' }}>
              Pure Himalayan mineral water from Pakistan's pristine northern glaciers.
              PSQCA certified. Eco-friendly. Trusted by thousands.
            </p>
            <a
              href="https://wa.me/+923203133140?text=Hi%20One%20Water!"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)', color: CYAN }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,212,255,0.18)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,212,255,0.1)'; }}
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp Us
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-5">Quick Links</h4>
            <div className="flex flex-col gap-2.5">
              {[
                { to: '/products', label: 'Products'       },
                { to: '/quality',  label: 'Quality & Purity'},
                { to: '/offers',   label: 'Special Offers'  },
                { to: '/about',    label: 'About Us'        },
              ].map(link => (
                <Link
                  key={link.to} to={link.to}
                  className="flex items-center gap-1.5 text-sm transition-all duration-200 group"
                  style={{ color: 'rgba(150,200,255,0.65)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = CYAN; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(150,200,255,0.65)'; }}
                >
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-5">Services</h4>
            <div className="flex flex-col gap-2.5">
              {[
                { to: '/delivery', label: '19L Home Delivery'},
                { to: '/events',   label: 'Bulk & Events'    },
                { to: '/checkout', label: 'Order Now'         },
                { to: '/contact',  label: 'Contact Us'        },
              ].map(link => (
                <Link
                  key={link.to} to={link.to}
                  className="flex items-center gap-1.5 text-sm transition-all duration-200 group"
                  style={{ color: 'rgba(150,200,255,0.65)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = CYAN; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(150,200,255,0.65)'; }}
                >
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-5">Contact</h4>
            <div className="flex flex-col gap-3">
              {[
                { icon: Phone,  href: 'tel:+923203133140',        text: '0320 313 3140' },
                { icon: Mail,   href: 'mailto:onewater.pk@gmail.com',  text: 'onewater.pk@gmail.com' },
              ].map((item, i) => (
                <a
                  key={i}
                  href={item.href}
                  className="flex items-center gap-2.5 text-sm transition-all duration-200"
                  style={{ color: 'rgba(150,200,255,0.65)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = CYAN; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(150,200,255,0.65)'; }}
                >
                  <item.icon className="w-4 h-4 shrink-0" style={{ color: CYAN }} />
                  {item.text}
                </a>
              ))}
              <div className="flex items-start gap-2.5 text-sm" style={{ color: 'rgba(150,200,255,0.65)' }}>
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: CYAN }} />
                <span>One Water – Green Valley Phase 1, near Sialkot Bypass, Gujranwala</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm"
          style={{ borderTop: '1px solid rgba(0,212,255,0.10)', color: 'rgba(100,160,210,0.5)' }}
        >
          <p>© {new Date().getFullYear()} One Water Pakistan. All rights reserved.</p>
          <div className="flex items-center gap-1" style={{ color: CYAN, opacity: 0.6 }}>
            <Droplets className="w-3 h-3" />
            <span className="text-xs">Pure · Transparent · Pakistani</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
