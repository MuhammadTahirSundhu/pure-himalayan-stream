import { useState } from 'react';
import { Button } from '@/components/ui/button';

const API_URL = import.meta.env.VITE_API_URL || '';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, Users, Calendar, MapPin, Tag, Heart } from 'lucide-react';

export default function Events() {
  const [guests, setGuests] = useState('');
  const [eventType, setEventType] = useState('');
  const [quote, setQuote] = useState<{ bottles: number; price: number } | null>(null);

  // Inquiry Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [bottleSize, setBottleSize] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const calculateQuote = () => {
    const g = parseInt(guests) || 0;
    const bottlesPerPerson = eventType === 'wedding' ? 3 : eventType === 'corporate' ? 2 : 2;
    const bottles = g * bottlesPerPerson;
    const pricePerBottle = bottles >= 100 ? 40 : 50;
    setQuote({ bottles, price: bottles * pricePerBottle });
  };

  const handleSubmit = async () => {
    if (!name || !phone) {
      setStatusMsg('Name and Phone are required.');
      return;
    }
    setLoading(true);
    setStatusMsg('');
    try {
      const res = await fetch(`${API_URL}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, phone, email, event_date: date, event_location: location,
          bottle_size: bottleSize, quantity, notes
        })
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg('✅ Inquiry submitted successfully! We will contact you soon.');
        setName(''); setPhone(''); setEmail(''); setDate(''); setLocation('');
        setBottleSize(''); setQuantity(''); setNotes('');
      } else {
        setStatusMsg(`❌ Error: ${data.message || 'Failed to submit'}`);
      }
    } catch (err) {
      setStatusMsg('❌ Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-3">
            Events & <span className="text-primary">Bulk Orders</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Premium hydration for weddings, corporate events, and community gatherings. Custom labels available!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Smart Quote Calculator */}
          <div>
            <h2 className="font-heading font-semibold text-xl text-foreground mb-6 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" /> Smart Quote Calculator
            </h2>
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  <Users className="w-4 h-4 inline mr-1" /> Number of Guests
                </label>
                <Input type="number" min="1" value={guests} onChange={e => setGuests(e.target.value)} placeholder="e.g. 200" />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  <Calendar className="w-4 h-4 inline mr-1" /> Event Type
                </label>
                <Select value={eventType} onValueChange={setEventType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wedding">Wedding</SelectItem>
                    <SelectItem value="corporate">Corporate Event</SelectItem>
                    <SelectItem value="community">Community Gathering</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full water-gradient text-primary-foreground font-semibold" onClick={calculateQuote}>
                Calculate Quote
              </Button>

              {quote && (
                <div className="mt-4 p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-2">
                  <h3 className="font-heading font-semibold text-foreground">Estimated Quote</h3>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Recommended Bottles (500ml)</span>
                    <span className="font-semibold">{quote.bottles}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estimated Price</span>
                    <span className="font-heading font-bold text-lg text-primary">PKR {quote.price.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">* Includes bulk discount for orders 100+ bottles</p>
                </div>
              )}
            </div>

            {/* Custom Labels */}
            <div className="mt-6 glass-card rounded-2xl p-6">
              <h3 className="font-heading font-semibold text-foreground mb-2 flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" /> Custom Label Printing
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add your event name, logo, or message on every bottle. Minimum order: 100 bottles.
              </p>
              <Button variant="outline">Request Custom Labels</Button>
            </div>

            {/* Ramadan Charity */}
            <div className="mt-6 glass-card rounded-2xl p-6 bg-accent/5">
              <h3 className="font-heading font-semibold text-foreground mb-2 flex items-center gap-2">
                <Heart className="w-5 h-5 text-accent" /> Ramadan Charity Donations
              </h3>
              <p className="text-sm text-muted-foreground">
                Donate clean water to underprivileged communities this Ramadan. 
                We match every 10 bottles donated with 5 more from us.
              </p>
            </div>
          </div>

          {/* Inquiry Form */}
          <div>
            <h2 className="font-heading font-semibold text-xl text-foreground mb-6">
              <MapPin className="w-5 h-5 text-primary inline mr-2" /> Event Inquiry Form
            </h2>
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <Input placeholder="Full Name *" value={name} onChange={e => setName(e.target.value)} />
              <Input placeholder="Phone Number *" value={phone} onChange={e => setPhone(e.target.value)} />
              <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
              <Input type="date" placeholder="Event Date" value={date} onChange={e => setDate(e.target.value)} />
              <Input placeholder="Event Location" value={location} onChange={e => setLocation(e.target.value)} />
              <Select value={bottleSize} onValueChange={setBottleSize}>
                <SelectTrigger>
                  <SelectValue placeholder="Bottle Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="300ml">300ml</SelectItem>
                  <SelectItem value="500ml">500ml</SelectItem>
                  <SelectItem value="1000ml">1L</SelectItem>
                  <SelectItem value="1500ml">1.5L</SelectItem>
                </SelectContent>
              </Select>
              <Input type="number" placeholder="Estimated Quantity" value={quantity} onChange={e => setQuantity(e.target.value)} />
              <Textarea placeholder="Additional Notes (custom labels, delivery timing, etc.)" value={notes} onChange={e => setNotes(e.target.value)} />
              
              {statusMsg && (
                <p className={`text-sm ${statusMsg.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
                  {statusMsg}
                </p>
              )}

              <Button 
                className="w-full water-gradient text-primary-foreground font-semibold" 
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Inquiry'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
