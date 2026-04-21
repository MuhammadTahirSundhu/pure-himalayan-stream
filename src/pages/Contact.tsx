import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MapPin, MessageCircle, CheckCircle2 } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (response.ok) {
        setIsSuccess(true);
        setForm({ name: '', phone: '', email: '', message: '' });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (err) {
      alert('Error sending message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-3">
            Contact <span className="text-primary">Us</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Have questions? We'd love to hear from you. Reach out via WhatsApp, phone, or the form below.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-6">
            <a
              href="https://wa.me/+923203133140?text=Hi%20One%20Water!"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 glass-card rounded-xl hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="font-semibold text-foreground">WhatsApp Chat</p>
                <p className="text-sm text-muted-foreground">0320 313 3140 — Instant Reply</p>
              </div>
            </a>

            <div className="flex items-center gap-4 p-5 glass-card rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Phone</p>
                <p className="text-sm text-muted-foreground">0320 313 3140</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-5 glass-card rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Email</p>
                <p className="text-sm text-muted-foreground">info@onewater.pk</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 glass-card rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Plant Address</p>
                <p className="text-sm text-muted-foreground">One Water – Main Office Green Valley Phase 1, near Sialkot Bypass, Gujranwala</p>
              </div>
            </div>

            {/* Google Map */}
            <div className="rounded-xl overflow-hidden border border-border h-64">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d27105.25!2d74.18!3d32.16!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391f2949d8e6a7e3%3A0x2b5f8a8e2b0c1f0a!2sGujranwala%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="One Water Gujranwala"
              />
            </div>
          </div>

          {/* Contact Form */}
          <div className="glass-card rounded-2xl p-6 space-y-4 h-fit">
            {isSuccess ? (
              <div className="py-8 text-center space-y-4">
                <CheckCircle2 className="w-16 h-16 text-accent mx-auto" />
                <h2 className="font-heading font-semibold text-xl text-foreground">Message Sent!</h2>
                <p className="text-muted-foreground">Thank you for reaching out. We'll get back to you shortly.</p>
                <Button variant="outline" onClick={() => setIsSuccess(false)}>Send Another Message</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="font-heading font-semibold text-xl text-foreground mb-2">Send us a Message</h2>
                <Input 
                  placeholder="Full Name" 
                  value={form.name} 
                  onChange={e => setForm({ ...form, name: e.target.value })} 
                  required 
                />
                <Input 
                  placeholder="Phone Number" 
                  value={form.phone} 
                  onChange={e => setForm({ ...form, phone: e.target.value })} 
                />
                <Input 
                  placeholder="Email Address" 
                  type="email" 
                  value={form.email} 
                  onChange={e => setForm({ ...form, email: e.target.value })} 
                  required 
                />
                <Textarea 
                  placeholder="Your Message (at least 10 characters)" 
                  rows={5} 
                  value={form.message} 
                  onChange={e => setForm({ ...form, message: e.target.value })} 
                  required 
                  minLength={10}
                />
                <Button 
                  type="submit" 
                  className="w-full water-gradient text-primary-foreground font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
