import { Link } from 'react-router-dom';
import { Factory, ShieldCheck, Eye, HeartHandshake, MapPin, Rocket, FlaskConical, Award } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import PageHero from '@/components/site/PageHero';
import SectionHeading from '@/components/site/SectionHeading';
import WaitlistForm from '@/components/site/WaitlistForm';
import Reveal from '@/components/Reveal';
import Seo from '@/components/site/Seo';
import bottleFamily from '@/assets/media/7.jpeg';
import bottleStudio from '@/assets/media/13.jpeg';
import bottle19 from '@/assets/media/15.jpeg';

const VALUES = [
  { icon: ShieldCheck, title: 'Safety first', text: 'Produced under a Punjab Food Authority licence and an ISO 9001 quality system.' },
  { icon: Eye, title: 'Radical honesty', text: 'We tell you exactly where our water comes from and publish our lab results.' },
  { icon: FlaskConical, title: 'Proven, not promised', text: 'Independent PCRWR testing: “fit for drinking” on every parameter.' },
  { icon: HeartHandshake, title: 'Local service', text: 'A Gujranwala team you can call or WhatsApp — and a rider who knows your street.' },
];

const ROADMAP = [
  { icon: Factory, title: 'Our plant in Gujranwala', text: 'Every bottle is purified, mineral-balanced and sealed at our own facility.', done: true },
  { icon: MapPin, title: 'Delivering across Gujranwala', text: 'Homes, offices, shops and events across the whole city.', done: true },
  { icon: Rocket, title: 'Next: more cities in Pakistan', text: 'We are preparing to expand. Tell us your city and help decide where we go next.', done: false },
];

export default function About() {
  const { settings } = useSiteSettings();
  const city = settings.service_areas.cities[0] ?? 'Gujranwala';

  return (
    <div className="ow-page">
      <Seo
        title="About One Water | Gujranwala Mineral Water Plant"
        description="One Water is a Gujranwala mineral water brand. Learn how we purify our water, our certifications, and our plan to bring One Water to more cities in Pakistan."
        path="/about"
        jsonLd={[{ '@type': 'AboutPage', name: 'About One Water', url: 'https://www.onewaterpakistan.com/about' }]}
      />
      <PageHero
        eyebrow={<><Award className="w-4 h-4" /> Our story</>}
        title={<>Made in {city}. <span className="ow-gradient-text">Built on trust.</span></>}
        subtitle="One Water — “Quality is our Identity”. Clean, safe drinking water from our own plant, delivered by people who live in your city."
      />

      <section className="py-16">
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center max-w-6xl">
          <Reveal direction="left" className="space-y-5">
            <h2 className="font-heading font-black text-3xl md:text-4xl text-white">Why we started One Water</h2>
            <p className="ow-muted leading-relaxed">
              Families in {city} deserve drinking water they don't have to worry about. So we built our own purification plant at
              Green Valley Phase 1 and set one rule: every bottle must be something we would give our own children.
            </p>
            <p className="ow-muted leading-relaxed">
              Our water goes through a 10-stage process — filtration, activated carbon, reverse osmosis, mineral balancing, UV,
              ozone and micron filtration — before it is sealed. We don't claim mountain springs or glaciers. We'd rather show
              you the lab report.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/quality" className="ow-btn">See our lab results</Link>
              <Link to="/contact" className="ow-btn-ghost">Visit or call us</Link>
            </div>
          </Reveal>
          <Reveal direction="right" className="grid grid-cols-2 gap-4">
            <img src={bottleStudio} alt="One Water bottle" loading="lazy" className="rounded-2xl object-cover w-full h-64 md:h-80 ow-card" />
            <div className="grid gap-4">
              <img src={bottleFamily} alt="One Water bottles in two sizes" loading="lazy" className="rounded-2xl object-cover w-full h-[7.5rem] md:h-[9.5rem] ow-card" />
              <img src={bottle19} alt="One Water 19 litre bottle" loading="lazy" className="rounded-2xl object-cover w-full h-[7.5rem] md:h-[9.5rem] ow-card" />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-16" style={{ background: 'linear-gradient(180deg, #030d1a 0%, #041422 50%, #030d1a 100%)' }}>
        <div className="container mx-auto px-4">
          <SectionHeading eyebrow="What we stand for" title={<>Our <span className="ow-gradient-text">promises</span></>} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {VALUES.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 90} className="ow-card ow-card-hover p-6">
                <Icon className="w-8 h-8 ow-cyan mb-3" />
                <h3 className="font-heading font-bold text-white mb-2">{title}</h3>
                <p className="text-sm ow-muted leading-relaxed">{text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <SectionHeading eyebrow="Where we're going" title={<>{city} today, <span className="ow-gradient-text">Pakistan next</span></>} />
          <ol className="relative space-y-6 before:absolute before:left-6 before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-cyan-400/60 before:to-cyan-400/0">
            {ROADMAP.map(({ icon: Icon, title, text, done }, i) => (
              <li key={title}>
                <Reveal delay={i * 120} className="relative flex gap-5">
                  <span className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: done ? 'linear-gradient(135deg,#00d4ff,#0284c7)' : 'rgba(255,255,255,0.05)', border: done ? 'none' : '1px dashed rgba(0,212,255,0.5)' }}>
                    <Icon className={`w-5 h-5 ${done ? 'text-white' : 'ow-cyan'}`} />
                  </span>
                  <div className="ow-card p-5 flex-1">
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: done ? '#34d399' : '#fbbf24' }}>{done ? 'Today' : 'Coming soon'}</p>
                    <h3 className="font-heading font-bold text-white">{title}</h3>
                    <p className="text-sm ow-muted">{text}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
          <Reveal className="ow-card p-6 mt-10">
            <p className="font-semibold text-white mb-3">Want One Water in your city? Join the waitlist.</p>
            <WaitlistForm />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
