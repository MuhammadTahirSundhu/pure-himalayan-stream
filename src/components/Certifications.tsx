import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Award, ZoomIn } from 'lucide-react';
import Reveal from '@/components/Reveal';
import cert1 from '@/assets/certificates/1.jpeg';
import cert2 from '@/assets/certificates/2.jpeg';
import cert3 from '@/assets/certificates/3.jpeg';
import cert4 from '@/assets/certificates/4.jpeg';
import cert5 from '@/assets/certificates/5.jpeg';
import cert6 from '@/assets/certificates/6.jpeg';

const certificates = [
  { src: cert1, title: 'PSQCA Certification' },
  { src: cert2, title: 'Quality Standard Approval' },
  { src: cert3, title: 'Lab Test Certificate' },
  { src: cert4, title: 'Compliance Document' },
  { src: cert5, title: 'Government License' },
  { src: cert6, title: 'Quality Assurance' },
];

export default function Certifications() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-16 bg-gradient-to-b from-background via-water-ice/20 to-background">
      <div className="container mx-auto px-4">
        <Reveal className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-4">
            <Award className="w-4 h-4 text-accent" />
            <span className="text-sm font-semibold text-accent">Legalization & Compliance</span>
          </div>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-3">
            Certified by <span className="text-primary">Authorities</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Every certification represents our unwavering commitment to purity, safety, and trust.
            Tap any certificate to view the full document.
          </p>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          {certificates.map((cert, i) => (
            <Reveal key={i} delay={i * 80} direction="scale">
              <button
                onClick={() => setOpen(i)}
                className="group relative w-full aspect-[3/4] rounded-2xl overflow-hidden glass-card hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-2"
              >
                <img
                  src={cert.src}
                  alt={cert.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <div className="flex items-center gap-2 text-primary-foreground">
                    <ZoomIn className="w-4 h-4" />
                    <span className="text-sm font-semibold">{cert.title}</span>
                  </div>
                </div>
                {/* Corner ribbon */}
                <div className="absolute top-3 right-3 w-9 h-9 rounded-full water-gradient flex items-center justify-center shadow-lg">
                  <Award className="w-4 h-4 text-primary-foreground" />
                </div>
              </button>
            </Reveal>
          ))}
        </div>

        <Dialog open={open !== null} onOpenChange={() => setOpen(null)}>
          <DialogContent className="max-w-3xl p-2 bg-background/95 backdrop-blur-xl">
            <DialogTitle className="sr-only">
              {open !== null ? certificates[open].title : 'Certificate'}
            </DialogTitle>
            {open !== null && (
              <img
                src={certificates[open].src}
                alt={certificates[open].title}
                className="w-full h-auto rounded-lg"
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
