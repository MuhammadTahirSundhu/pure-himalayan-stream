import step1 from '@/assets/purification/step-1-source.png';
import step2 from '@/assets/purification/step-2-prefilter.png';
import step3 from '@/assets/purification/step-3-carbon.png';
import step4 from '@/assets/purification/step-4-ro.png';
import step5 from '@/assets/purification/step-5-minerals.png';
import step6 from '@/assets/purification/step-6-uv.png';
import step7 from '@/assets/purification/step-7-ozone.png';
import step8 from '@/assets/purification/step-8-micron.png';
import step9 from '@/assets/purification/step-9-testing.png';
import step10 from '@/assets/purification/step-10-bottling.png';
import { purificationSteps } from '@/data/products';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { cn } from '@/lib/utils';

const stepImages = [step1, step2, step3, step4, step5, step6, step7, step8, step9, step10];

function PipelineNode({
  index,
  title,
  description,
  image,
}: {
  index: number;
  title: string;
  description: string;
  image: string;
}) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>({ threshold: 0.25 });
  const isEven = index % 2 === 0;

  return (
    <div
      ref={ref}
      className={cn(
        'relative grid md:grid-cols-2 gap-6 md:gap-12 items-center transition-all duration-700',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      )}
      style={{ transitionDelay: `${(index % 2) * 100}ms` }}
    >
      {/* Image side */}
      <div className={cn('flex justify-center', isEven ? 'md:order-1' : 'md:order-2')}>
        <div className="relative group">
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl group-hover:bg-primary/30 transition-colors" />
          <div className="relative w-44 h-44 md:w-56 md:h-56 rounded-3xl glass-card flex items-center justify-center p-4 group-hover:-translate-y-2 transition-transform duration-500">
            <img
              src={image}
              alt={title}
              loading="lazy"
              width={512}
              height={512}
              className="max-h-full max-w-full object-contain animate-float-slow"
            />
            {/* Step badge */}
            <div className="absolute -top-3 -left-3 w-12 h-12 rounded-2xl water-gradient flex items-center justify-center shadow-lg shadow-primary/30">
              <span className="font-heading font-bold text-primary-foreground">{index + 1}</span>
            </div>
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-3xl border-2 border-primary/40 animate-pulse-ring pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Content side */}
      <div className={cn(isEven ? 'md:order-2 md:text-left' : 'md:order-1 md:text-right')}>
        <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
          STEP {String(index + 1).padStart(2, '0')}
        </div>
        <h3 className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-3">
          {title}
        </h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export default function PurificationPipeline() {
  return (
    <div className="relative max-w-5xl mx-auto">
      {/* Vertical pipeline line */}
      <div
        aria-hidden
        className="hidden md:block absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-1 rounded-full overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-water-ice via-primary/40 to-eco/40" />
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <line
            x1="50%"
            y1="0"
            x2="50%"
            y2="100%"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            className="animate-flow-dash"
          />
        </svg>
      </div>

      <div className="space-y-16 md:space-y-24 relative">
        {purificationSteps.map((step, i) => (
          <PipelineNode
            key={step.step}
            index={i}
            title={step.title}
            description={step.description}
            image={stepImages[i]}
          />
        ))}
      </div>
    </div>
  );
}
