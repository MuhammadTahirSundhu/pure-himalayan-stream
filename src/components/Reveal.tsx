import { ReactNode } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { cn } from '@/lib/utils';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'left' | 'right' | 'scale';
  as?: 'div' | 'section' | 'article';
}

export default function Reveal({
  children,
  className,
  delay = 0,
  direction = 'up',
  as: Tag = 'div',
}: RevealProps) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();

  const hidden = {
    up: 'opacity-0 translate-y-8',
    left: 'opacity-0 -translate-x-8',
    right: 'opacity-0 translate-x-8',
    scale: 'opacity-0 scale-95',
  }[direction];

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
      className={cn(
        'transition-all duration-700 ease-out will-change-transform',
        visible ? 'opacity-100 translate-x-0 translate-y-0 scale-100' : hidden,
        className
      )}
    >
      {children}
    </Tag>
  );
}
