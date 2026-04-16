import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { qualityResults, purificationSteps } from '@/data/products';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Shield, CheckCircle, Download, Droplets } from 'lucide-react';

export default function Quality() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-3">
            Quality & <span className="text-primary">Purity</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Every drop of One Water undergoes a rigorous 10-step purification process and is tested against PSQCA standards.
          </p>
        </div>

        {/* 10-Step Purification */}
        <section className="mb-16">
          <h2 className="font-heading font-semibold text-2xl text-foreground mb-8 text-center">
            <Droplets className="inline w-6 h-6 text-primary mr-2" />
            10-Step Purification Process
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {purificationSteps.map(step => (
              <button
                key={step.step}
                className={`glass-card rounded-xl p-4 text-center transition-all cursor-pointer hover:shadow-lg hover:-translate-y-1 ${
                  activeStep === step.step ? 'ring-2 ring-primary shadow-lg' : ''
                }`}
                onClick={() => setActiveStep(activeStep === step.step ? null : step.step)}
              >
                <div className="w-10 h-10 rounded-full water-gradient flex items-center justify-center mx-auto mb-2">
                  <span className="text-sm font-bold text-primary-foreground">{step.step}</span>
                </div>
                <h4 className="font-semibold text-xs text-foreground mb-1">{step.title}</h4>
                {activeStep === step.step && (
                  <p className="text-xs text-muted-foreground mt-2 animate-in fade-in">{step.description}</p>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* PSQCA Table */}
        <section className="mb-16 max-w-3xl mx-auto">
          <h2 className="font-heading font-semibold text-2xl text-foreground mb-6 text-center">
            <Shield className="inline w-6 h-6 text-primary mr-2" />
            PSQCA Lab Results
          </h2>
          <div className="glass-card rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="water-gradient">
                  <TableHead className="text-primary-foreground font-semibold">Parameter</TableHead>
                  <TableHead className="text-primary-foreground font-semibold">PSQCA Max</TableHead>
                  <TableHead className="text-primary-foreground font-semibold">Our Result</TableHead>
                  <TableHead className="text-primary-foreground font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {qualityResults.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{row.parameter}</TableCell>
                    <TableCell>{row.allowedMax} {row.unit}</TableCell>
                    <TableCell className="font-semibold text-primary">{row.actual} {row.unit}</TableCell>
                    <TableCell>
                      <CheckCircle className="w-5 h-5 text-accent" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* Download */}
        <div className="text-center">
          <Button size="lg" className="water-gradient text-primary-foreground font-semibold">
            <Download className="w-5 h-5 mr-2" /> Download Full Lab Report (PDF)
          </Button>
        </div>
      </div>
    </div>
  );
}
