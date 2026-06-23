import { Button } from '@/components/ui/button';
import { qualityResults } from '@/data/products';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Shield, CheckCircle, Download, Droplets, Sparkles, Award } from 'lucide-react';
import PurificationPipeline from '@/components/PurificationPipeline';
import Certifications from '@/components/Certifications';
import { useEffect, useRef, useState } from 'react';
import labReport from '@/assets/certificates/6.jpeg';

const CYAN = '#00d4ff';

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

export default function Quality() {
  return (
    <div className="min-h-screen" style={{ background: '#030D1A' }}>

      {/* Hero */}
      <section className="relative py-20 overflow-hidden" style={{ background: 'linear-gradient(180deg, #000f20, #030D1A)' }}>
        <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="hex-q" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
            <polygon points="30,1 58,15 58,37 30,51 2,37 2,15" fill="none" stroke="#00d4ff" strokeWidth="0.8" />
          </pattern></defs>
          <rect width="100%" height="100%" fill="url(#hex-q)" />
        </svg>
        {/* Orbs */}
        <div className="absolute top-10 left-10 w-64 h-64 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%)', animation: 'floatOrb 8s ease-in-out infinite alternate' }} />
        <div className="absolute bottom-10 right-10 w-48 h-48 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', animation: 'floatOrb 10s ease-in-out 2s infinite alternate' }} />

        <div className="container mx-auto px-4 relative text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
            style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
            <Sparkles className="w-4 h-4" style={{ color: CYAN }} />
            <span className="text-sm font-semibold" style={{ color: CYAN }}>PSQCA Certified Purity</span>
          </div>
          <h1 className="font-heading font-black text-4xl md:text-6xl text-white mb-5"
            style={{ textShadow: '0 0 60px rgba(0,212,255,0.2)' }}>
            Quality &{' '}
            <span style={{ background: 'linear-gradient(135deg, #00d4ff, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Purity
            </span>
          </h1>
          <p className="text-lg" style={{ color: 'rgba(150,200,255,0.7)' }}>
            Every drop of One Water travels through a meticulous 10-step purification journey,
            tested rigorously against the highest international standards.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none" style={{ background: 'linear-gradient(to bottom, transparent, #030D1A)' }} />
      </section>

      {/* Purification Pipeline */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <FadeIn className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
              style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
              <Droplets className="w-4 h-4" style={{ color: CYAN }} />
              <span className="text-sm font-medium" style={{ color: CYAN }}>Purification Journey</span>
            </div>
            <h2 className="font-heading font-black text-3xl md:text-4xl text-white mb-3">
              Our{' '}
              <span style={{ background: 'linear-gradient(135deg, #00d4ff, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                10-Step
              </span>{' '}Process
            </h2>
            <p className="max-w-xl mx-auto" style={{ color: 'rgba(150,200,255,0.7)' }}>
              From the icy Himalayan glaciers to your hands — follow the path of every drop.
            </p>
          </FadeIn>
          <PurificationPipeline />
        </div>
      </section>

      {/* Certifications */}
      <section style={{ background: 'linear-gradient(180deg, #030D1A 0%, #041422 50%, #030D1A 100%)' }}>
        <Certifications />
      </section>

      {/* Lab Results Table */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <FadeIn className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
              style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
              <Shield className="w-4 h-4" style={{ color: CYAN }} />
              <span className="text-sm font-medium" style={{ color: CYAN }}>Independent Testing</span>
            </div>
            <h2 className="font-heading font-black text-3xl md:text-4xl text-white mb-3">
              PSQCA Lab{' '}
              <span style={{ background: 'linear-gradient(135deg, #00d4ff, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Results
              </span>
            </h2>
            <p style={{ color: 'rgba(150,200,255,0.7)' }}>
              Transparent, parameter-by-parameter results — well within all safety limits.
            </p>
          </FadeIn>

          <FadeIn>
            <div className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid rgba(0,212,255,0.15)', boxShadow: '0 0 40px rgba(0,0,0,0.4)' }}>
              <Table>
                <TableHeader>
                  <TableRow style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(59,130,246,0.1))' }}>
                    {['Parameter', 'PSQCA Max', 'Our Result', 'Status'].map((h, i) => (
                      <TableHead key={i} className={`font-bold text-white ${i === 3 ? 'text-right' : ''}`}>{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {qualityResults.map((row, i) => (
                    <TableRow
                      key={i}
                      style={{
                        background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.015)',
                        borderBottom: '1px solid rgba(0,212,255,0.06)',
                      }}
                    >
                      <TableCell className="font-medium text-white">{row.parameter}</TableCell>
                      <TableCell style={{ color: 'rgba(150,200,255,0.65)' }}>{row.allowedMax} {row.unit}</TableCell>
                      <TableCell className="font-semibold" style={{ color: CYAN }}>{row.actual} {row.unit}</TableCell>
                      <TableCell className="text-right">
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-400">
                          <CheckCircle className="w-4 h-4" /> Pass
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </FadeIn>

          <FadeIn className="text-center mt-10 flex flex-wrap gap-3 justify-center">
            <a
              href={labReport}
              download="One-Water-PCRWR-Lab-Report.jpeg"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, #00d4ff, #0284c7)', boxShadow: '0 0 25px rgba(0,212,255,0.35)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 40px rgba(0,212,255,0.6)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 25px rgba(0,212,255,0.35)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
            >
              <Download className="w-5 h-5" /> Download Full Lab Report
            </a>
            <a
              href="#certifications"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold transition-all duration-300"
              style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.3)', color: CYAN }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,212,255,0.15)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,212,255,0.08)'; }}
            >
              <Award className="w-5 h-5" /> View All Certificates
            </a>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
