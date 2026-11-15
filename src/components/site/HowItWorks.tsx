import { MousePointerClick, MessageCircleCheck, Truck } from 'lucide-react';
import Reveal from '@/components/Reveal';
import { useLang } from '@/contexts/LanguageContext';

export default function HowItWorks() {
  const { t } = useLang();
  const STEPS = [
    { icon: MousePointerClick, title: t('Order in 1 minute', '1 منٹ میں آرڈر کریں'), text: t('Pick your bottles online or send us a WhatsApp message.', 'آن لائن بوتلیں چنیں یا ہمیں واٹس ایپ میسج بھیجیں۔') },
    { icon: MessageCircleCheck, title: t('We confirm on WhatsApp', 'ہم واٹس ایپ پر کنفرم کرتے ہیں'), text: t('Our team confirms your order, address and delivery time.', 'ہماری ٹیم آپ کا آرڈر، پتہ اور ڈیلیوری کا وقت کنفرم کرتی ہے۔') },
    { icon: Truck, title: t('Delivered to your door', 'آپ کے دروازے پر ڈیلیوری'), text: t('Fresh, sealed water delivered anywhere in Gujranwala. Pay cash on delivery.', 'تازہ، سیل بند پانی گوجرانوالہ میں کہیں بھی ڈیلیور۔ کیش آن ڈیلیوری۔') },
  ];
  return (
    <div className="relative grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      <div aria-hidden className="hidden md:block absolute top-10 left-[16%] right-[16%] h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.5), transparent)' }} />
      {STEPS.map(({ icon: Icon, title, text }, i) => (
        <Reveal key={i} delay={i * 120} className="ow-card ow-card-hover p-6 h-full text-center relative">
          <div className="relative w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.18), rgba(0,212,255,0.04))', border: '1px solid rgba(0,212,255,0.3)' }}>
            <Icon className="w-8 h-8 ow-cyan" />
            <span className="absolute -top-1 -end-1 w-7 h-7 rounded-full text-xs font-black flex items-center justify-center text-white"
              style={{ background: 'linear-gradient(135deg,#00d4ff,#0284c7)' }}>{i + 1}</span>
          </div>
          <h3 className="font-heading font-bold text-lg text-white mb-2">{title}</h3>
          <p className="ow-muted text-sm leading-relaxed">{text}</p>
        </Reveal>
      ))}
    </div>
  );
}
