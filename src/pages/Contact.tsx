import { useState, useEffect, useRef } from 'react';
import { Phone, Mail, MapPin, MessageCircle, CheckCircle2, Send, ArrowRight } from 'lucide-react';

const CYAN = '#00d4ff';
const API_URL = import.meta.env.VITE_API_URL || '';

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{ opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(24px)', transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms` }}>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 16px', borderRadius: '12px', outline: 'none',
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,212,255,0.2)',
  color: '#fff', fontSize: '14px', transition: 'border-color 0.2s, box-shadow 0.2s',
};

export default function Contact() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setIsSuccess(true);
        setForm({ name: '', phone: '', email: '', message: '' });
      } else throw new Error('Failed');
    } catch { alert('Error sending message. Please try again later.'); }
    finally { setIsSubmitting(false); }
  };

  const contacts = [
    {
      icon: MessageCircle,
      label: 'WhatsApp Chat',
      value: '0320 313 3140 — Instant Reply',
      href: 'https://wa.me/+923203133140?text=Hi%20One%20Water!',
      color: 'from-emerald-500/20 to-emerald-700/5',
      ic: 'text-emerald-400',
    },
    {
      icon: Phone,
      label: 'Phone',
      value: '0320 313 3140',
      href: 'tel:+923203133140',
      color: 'from-cyan-500/20 to-cyan-700/5',
      ic: 'text-cyan-400',
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'info@onewater.pk',
      href: 'mailto:info@onewater.pk',
      color: 'from-blue-500/20 to-blue-700/5',
      ic: 'text-blue-400',
    },
    {
      icon: MapPin,
      label: 'Plant Address',
      value: 'Green Valley Phase 1, near Sialkot Bypass, Gujranwala',
      href: null,
      color: 'from-violet-500/20 to-violet-700/5',
      ic: 'text-violet-400',
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#030D1A' }}>
      {/* Hero */}
      <section className="relative py-16 overflow-hidden" style={{ background: 'linear-gradient(180deg, #000f20, #030D1A)' }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(0,212,255,0.08) 0%, transparent 70%)' }} />
        <div className="container mx-auto px-4 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
            style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
            <MessageCircle className="w-4 h-4" style={{ color: CYAN }} />
            <span className="text-sm font-medium" style={{ color: CYAN }}>Get In Touch</span>
          </div>
          <h1 className="font-heading font-black text-4xl md:text-5xl text-white mb-4">
            Contact{' '}
            <span style={{ background: 'linear-gradient(135deg, #00d4ff, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Us
            </span>
          </h1>
          <p className="max-w-lg mx-auto text-lg" style={{ color: 'rgba(150,200,255,0.7)' }}>
            Have questions? We'd love to hear from you. Reach out via WhatsApp, phone, or the form below.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 max-w-5xl mx-auto">

            {/* Contact cards */}
            <div className="space-y-4">
              {contacts.map((c, i) => (
                <FadeIn key={i} delay={i * 80}>
                  {c.href ? (
                    <a href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                      className="flex items-center gap-4 p-5 rounded-2xl transition-all duration-300 group"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,212,255,0.12)', backdropFilter: 'blur(12px)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,212,255,0.35)'; (e.currentTarget as HTMLElement).style.background = 'rgba(0,212,255,0.05)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,212,255,0.12)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                        <c.icon className={`w-6 h-6 ${c.ic}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">{c.label}</p>
                        <p className="text-sm" style={{ color: 'rgba(150,200,255,0.7)' }}>{c.value}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: CYAN }} />
                    </a>
                  ) : (
                    <div className="flex items-start gap-4 p-5 rounded-2xl"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,212,255,0.12)', backdropFilter: 'blur(12px)' }}>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center shrink-0`}>
                        <c.icon className={`w-6 h-6 ${c.ic}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{c.label}</p>
                        <p className="text-sm" style={{ color: 'rgba(150,200,255,0.7)' }}>{c.value}</p>
                      </div>
                    </div>
                  )}
                </FadeIn>
              ))}

              {/* Map */}
              <FadeIn delay={320}>
                <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(0,212,255,0.15)', height: '220px' }}>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d27105.25!2d74.18!3d32.16!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391f2949d8e6a7e3%3A0x2b5f8a8e2b0c1f0a!2sGujranwala%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1"
                    width="100%" height="100%" style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
                    allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                    title="One Water Gujranwala"
                  />
                </div>
              </FadeIn>
            </div>

            {/* Form */}
            <FadeIn delay={100}>
              <div className="rounded-2xl p-8 h-fit"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,212,255,0.15)', backdropFilter: 'blur(20px)' }}>
                {isSuccess ? (
                  <div className="py-10 text-center space-y-4">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
                      style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', boxShadow: '0 0 30px rgba(0,212,255,0.2)' }}>
                      <CheckCircle2 className="w-10 h-10" style={{ color: CYAN }} />
                    </div>
                    <h2 className="font-heading font-bold text-2xl text-white">Message Sent!</h2>
                    <p style={{ color: 'rgba(150,200,255,0.7)' }}>Thank you for reaching out. We'll get back to you shortly.</p>
                    <button
                      onClick={() => setIsSuccess(false)}
                      className="px-6 py-2.5 rounded-xl font-medium transition-all"
                      style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: CYAN }}
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <h2 className="font-heading font-bold text-2xl text-white mb-6">Send us a Message</h2>

                    {[
                      { placeholder: 'Full Name', key: 'name', type: 'text', required: true },
                      { placeholder: 'Phone Number', key: 'phone', type: 'tel', required: false },
                      { placeholder: 'Email Address', key: 'email', type: 'email', required: true },
                    ].map(field => (
                      <input
                        key={field.key}
                        type={field.type}
                        placeholder={field.placeholder}
                        required={field.required}
                        value={form[field.key as keyof typeof form]}
                        onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                        style={inputStyle}
                        onFocus={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,212,255,0.1)'; }}
                        onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)'; e.currentTarget.style.boxShadow = 'none'; }}
                      />
                    ))}

                    <textarea
                      placeholder="Your Message (at least 10 characters)"
                      rows={5}
                      required
                      minLength={10}
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      style={{ ...inputStyle, resize: 'none' }}
                      onFocus={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,212,255,0.1)'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)'; e.currentTarget.style.boxShadow = 'none'; }}
                    />

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white transition-all duration-300"
                      style={{
                        background: isSubmitting ? 'rgba(0,212,255,0.3)' : 'linear-gradient(135deg, #00d4ff, #0284c7)',
                        boxShadow: isSubmitting ? 'none' : '0 0 25px rgba(0,212,255,0.35)',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <Send className="w-4 h-4" />
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                )}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  );
}
