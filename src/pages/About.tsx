import { Mountain, Leaf, Shield, Users, Clock } from 'lucide-react';
import aboutHero from '@/assets/brand/about-hero.jpg';

const timeline = [
  { year: '2020', title: 'Founded', desc: 'One Water established in Gujranwala, Punjab with a vision for pure, affordable hydration.' },
  { year: '2021', title: 'PSQCA Certified', desc: 'Achieved full PSQCA certification and began commercial production.' },
  { year: '2022', title: 'Expanded Delivery', desc: 'Launched 19L home delivery across Gujranwala, Lahore, and Islamabad.' },
  { year: '2023', title: 'Eco Initiative', desc: 'Introduced recyclable bottles and carbon-neutral delivery vehicles.' },
  { year: '2024', title: 'National Growth', desc: 'Available in 50+ cities. Trusted by over 100,000 families.' },
  { year: '2026', title: 'Digital First', desc: 'Launched online ordering and subscription platform for nationwide delivery.' },
];

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <img src={aboutHero} alt="Himalayan valley" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-foreground/50" />
        <div className="relative z-10 text-center">
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-primary-foreground mb-3">Our Story</h1>
          <p className="text-primary-foreground/80 text-lg">Born from the Himalayas, made for Pakistan</p>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
                Why <span className="text-primary">One Water</span>?
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                One Water was born from a simple belief: every Pakistani deserves access to safe, 
                pure, and affordable drinking water. Sourced from pristine Himalayan glaciers and 
                purified through a 10-step process, we bring nature's best to your doorstep.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Based in Gujranwala, our state-of-the-art plant processes water that meets and exceeds
                PSQCA standards. From our family to yours — pure, transparent, Pakistani.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Mountain, label: 'Himalayan Source', value: 'Glacial Springs' },
                { icon: Shield, label: 'PSQCA Certified', value: '100% Compliant' },
                { icon: Leaf, label: 'Eco-Friendly', value: 'Recyclable Bottles' },
                { icon: Users, label: 'Families Served', value: '100,000+' },
              ].map((stat, i) => (
                <div key={i} className="glass-card rounded-xl p-4 text-center">
                  <stat.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="font-semibold text-sm text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-heading font-bold text-2xl text-foreground mb-8 text-center">
            <Clock className="inline w-6 h-6 text-primary mr-2" /> Our Journey
          </h2>
          <div className="space-y-6">
            {timeline.map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full water-gradient flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary-foreground">{item.year}</span>
                  </div>
                  {i < timeline.length - 1 && <div className="w-0.5 flex-1 bg-primary/20 mt-1" />}
                </div>
                <div className="pb-6">
                  <h3 className="font-heading font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
