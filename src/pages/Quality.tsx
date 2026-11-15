import { CheckCircle2, Download, Droplets, ShieldCheck, Award, FlaskConical, Factory } from 'lucide-react';
import { qualityResults, labReport } from '@/data/products';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import PurificationPipeline from '@/components/PurificationPipeline';
import Certifications from '@/components/Certifications';
import PageHero from '@/components/site/PageHero';
import SectionHeading from '@/components/site/SectionHeading';
import Reveal from '@/components/Reveal';
import Seo from '@/components/site/Seo';
import labReportImage from '@/assets/certificates/6.jpeg';

const HIGHLIGHTS = [
  { label: 'pH', value: '7.8', note: 'WHO range 6.5–8.5' },
  { label: 'TDS', value: '130', note: 'mg/L · WHO limit 1000' },
  { label: 'Sodium', value: '20', note: 'mg/L · WHO limit 200' },
  { label: 'E. coli', value: '0', note: 'CFU/100ml' },
];

export default function Quality() {
  const { settings } = useSiteSettings();
  const reportUrl = settings.lab_report_url || labReportImage;

  return (
    <div className="ow-page">
      <Seo
        title="Water Quality, Lab Report & 10-Stage Purification | One Water"
        description="See One Water's PCRWR lab results (pH 7.8, TDS 130 mg/L, zero E. coli), certificates and the 10-stage purification process at our Gujranwala plant."
        path="/quality"
      />
      <PageHero
        eyebrow={<><ShieldCheck className="w-4 h-4" /> Quality & Purity</>}
        title={<>Tested, certified, <span className="ow-gradient-text">nothing hidden</span></>}
        subtitle="One Water is produced at our own plant in Gujranwala. Here is exactly how we purify it — and what the lab found."
      />

      <section className="py-10">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {HIGHLIGHTS.map((h, i) => (
              <Reveal key={h.label} delay={i * 80} className="ow-card ow-card-hover p-5 text-center">
                <p className="text-xs uppercase tracking-wider ow-subtle">{h.label}</p>
                <p className="font-heading font-black text-4xl ow-gradient-text my-1">{h.value}</p>
                <p className="text-xs ow-muted">{h.note}</p>
              </Reveal>
            ))}
          </div>
          <p className="text-center text-xs ow-subtle mt-4">Source: {labReport.lab}, report {labReport.code}, {labReport.reported}.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <SectionHeading
            eyebrow={<><Droplets className="w-4 h-4" /> Purification journey</>}
            title={<>Our <span className="ow-gradient-text">10-stage</span> process</>}
            subtitle="Every litre is filtered, purified by reverse osmosis, mineral-balanced and disinfected before it is sealed."
          />
          <PurificationPipeline />
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Reveal className="ow-card p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start">
            <Factory className="w-10 h-10 ow-cyan shrink-0" />
            <div>
              <h2 className="font-heading font-bold text-2xl text-white mb-2">Where does One Water come from?</h2>
              <p className="ow-muted leading-relaxed">
                We don't bottle mountain springs or glaciers — and we won't pretend to. One Water is purified at our own plant at
                Green Valley Phase 1, Gujranwala. Reverse osmosis removes impurities, then essential minerals are added back so the
                water tastes clean and balanced. We publish our independent lab results below so you can judge for yourself.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <div style={{ background: 'linear-gradient(180deg, #030d1a 0%, #041422 50%, #030d1a 100%)' }}>
        <Certifications />
      </div>

      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <SectionHeading
            eyebrow={<><FlaskConical className="w-4 h-4" /> Independent lab test</>}
            title={<>PCRWR <span className="ow-gradient-text">lab results</span></>}
            subtitle={`“${labReport.remark}” — ${labReport.lab}`}
          />
          <Reveal className="ow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(59,130,246,0.1))' }}>
                    <th scope="col" className="text-left font-bold text-white p-4">Parameter</th>
                    <th scope="col" className="text-left font-bold text-white p-4">Highest desirable level</th>
                    <th scope="col" className="text-left font-bold text-white p-4">One Water</th>
                    <th scope="col" className="text-right font-bold text-white p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {qualityResults.map((row, i) => (
                    <tr key={row.parameter} style={{ background: i % 2 ? 'rgba(255,255,255,0.015)' : 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(0,212,255,0.06)' }}>
                      <th scope="row" className="text-left font-medium text-white p-4">{row.parameter}</th>
                      <td className="p-4 ow-muted">{row.allowedMax} {row.allowedMax.startsWith('No') ? '' : row.unit}</td>
                      <td className="p-4 font-semibold ow-cyan">{row.actual} {row.unit}</td>
                      <td className="p-4 text-right"><span className="inline-flex items-center gap-1 font-medium text-emerald-400"><CheckCircle2 className="w-4 h-4" /> Pass</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
          <Reveal className="text-center mt-10 flex flex-wrap gap-3 justify-center">
            <a href={reportUrl} target="_blank" rel="noopener noreferrer" className="ow-btn"><Download className="w-5 h-5" /> View the full lab report</a>
            <a href="#certifications" className="ow-btn-ghost"><Award className="w-5 h-5" /> View all certificates</a>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
