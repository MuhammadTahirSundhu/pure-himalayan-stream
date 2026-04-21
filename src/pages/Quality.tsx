import { Button } from '@/components/ui/button';
import { qualityResults } from '@/data/products';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Shield, CheckCircle, Download, Droplets, Sparkles, Award } from 'lucide-react';
import PurificationPipeline from '@/components/PurificationPipeline';
import Certifications from '@/components/Certifications';
import Reveal from '@/components/Reveal';
import labReport from '@/assets/certificates/6.jpeg';

export default function Quality() {
  return (
    <div>
      {/* Hero */}
      <section className="relative py-20 hero-gradient overflow-hidden">
        {/* Floating water drops decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-primary/10 blur-3xl animate-float-slow" />
          <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-accent/10 blur-3xl animate-float" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <Reveal className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">PSQCA Certified Purity</span>
            </div>
            <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
              Quality & <span className="text-gradient">Purity</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Every drop of One Water travels through a meticulous 10-step purification journey,
              tested rigorously against the highest international standards.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 10-Step Purification Pipeline */}
      <section className="py-20 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4">
          <Reveal className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-3">
              <Droplets className="w-6 h-6 text-primary" />
              <span className="text-sm font-bold uppercase tracking-wider text-primary">
                Purification Journey
              </span>
            </div>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-3">
              Our <span className="text-primary">10-Step</span> Process
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From the icy Himalayan glaciers to your hands — follow the path of every drop.
            </p>
          </Reveal>

          <PurificationPipeline />
        </div>
      </section>

      {/* Certifications */}
      <Certifications />

      {/* PSQCA Lab Results */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <Reveal className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-3">
              <Shield className="w-6 h-6 text-primary" />
              <span className="text-sm font-bold uppercase tracking-wider text-primary">
                Independent Testing
              </span>
            </div>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-3">
              PSQCA Lab <span className="text-primary">Results</span>
            </h2>
            <p className="text-muted-foreground">
              Transparent, parameter-by-parameter results — well within all safety limits.
            </p>
          </Reveal>

          <Reveal direction="scale">
            <div className="glass-card rounded-2xl overflow-hidden shadow-xl">
              <Table>
                <TableHeader>
                  <TableRow className="water-gradient hover:bg-transparent">
                    <TableHead className="text-primary-foreground font-semibold">Parameter</TableHead>
                    <TableHead className="text-primary-foreground font-semibold">PSQCA Max</TableHead>
                    <TableHead className="text-primary-foreground font-semibold">Our Result</TableHead>
                    <TableHead className="text-primary-foreground font-semibold text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {qualityResults.map((row, i) => (
                    <TableRow key={i} className="hover:bg-water-ice/30 transition-colors">
                      <TableCell className="font-medium">{row.parameter}</TableCell>
                      <TableCell className="text-muted-foreground">{row.allowedMax} {row.unit}</TableCell>
                      <TableCell className="font-semibold text-primary">{row.actual} {row.unit}</TableCell>
                      <TableCell className="text-right">
                        <span className="inline-flex items-center gap-1 text-accent text-sm font-medium">
                          <CheckCircle className="w-4 h-4" /> Pass
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Reveal>

          <Reveal className="text-center mt-10 flex flex-wrap gap-3 justify-center">
            <Button
              size="lg"
              asChild
              className="water-gradient text-primary-foreground font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all hover:-translate-y-0.5"
            >
              <a href={labReport} download="One-Water-PCRWR-Lab-Report.jpeg">
                <Download className="w-5 h-5 mr-2" /> Download Full Lab Report
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="font-semibold border-primary/30 hover:bg-primary/5"
            >
              <a href="#certifications">
                <Award className="w-5 h-5 mr-2" /> View All Certificates
              </a>
            </Button>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
