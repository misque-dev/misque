'use client';

import { cn } from '@/lib/utils';

interface RippleProps {
  mainCircleSize?: number;
  mainCircleOpacity?: number;
  numCircles?: number;
  className?: string;
}

export function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 8,
  className,
}: RippleProps) {
  return (
    <div
      className={cn(
        'absolute inset-0 mask-[linear-gradient(to_bottom,white,transparent)]',
        className
      )}
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 70;
        const opacity = mainCircleOpacity - i * 0.03;
        const animationDelay = `${i * 0.06}s`;

        return (
          <div
            key={i}
            className={cn(
              'absolute animate-ripple rounded-full bg-foreground/2 border-foreground/4',
              `[--i:${i}]`
            )}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              opacity,
              animationDelay,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) scale(1)',
            }}
          />
        );
      })}
    </div>
  );
}
