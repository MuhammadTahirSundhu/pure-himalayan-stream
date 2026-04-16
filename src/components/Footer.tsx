import { Link } from 'react-router-dom';
import { Droplets, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-foreground text-primary-foreground/80">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full water-gradient flex items-center justify-center">
                <Droplets className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-heading font-bold text-lg text-primary-foreground">
                One Water
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              Pure Himalayan mineral water from Pakistan's pristine northern glaciers. 
              PSQCA certified. Eco-friendly. Trusted by thousands.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-primary-foreground mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2">
              {[
                { to: '/products', label: 'Products' },
                { to: '/quality', label: 'Quality & Purity' },
                { to: '/offers', label: 'Special Offers' },
                { to: '/about', label: 'About Us' },
              ].map(link => (
                <Link key={link.to} to={link.to} className="text-sm hover:text-primary transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-primary-foreground mb-4">Services</h4>
            <div className="flex flex-col gap-2">
              {[
                { to: '/delivery', label: '19L Home Delivery' },
                { to: '/events', label: 'Bulk & Events' },
                { to: '/checkout', label: 'Order Now' },
                { to: '/contact', label: 'Contact Us' },
              ].map(link => (
                <Link key={link.to} to={link.to} className="text-sm hover:text-primary transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-primary-foreground mb-4">Contact</h4>
            <div className="flex flex-col gap-3 text-sm">
              <a href="tel:+923001234567" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Phone className="w-4 h-4" /> +92 300 123 4567
              </a>
              <a href="mailto:info@onewater.pk" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Mail className="w-4 h-4" /> info@onewater.pk
              </a>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>One Water Plant, GT Road, Gujranwala, Punjab, Pakistan</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-8 pt-8 text-center text-sm">
          <p>© {new Date().getFullYear()} One Water Pakistan. All rights reserved. PSQCA Certified.</p>
        </div>
      </div>
    </footer>
  );
}
