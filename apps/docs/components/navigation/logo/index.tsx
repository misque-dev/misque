import Link from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';
import { Logo as LogoIcon } from '@/components/shared/logo';
import { cn } from '@/lib/utils';

const logoVariants = cva('flex items-center', {
  variants: {
    size: {
      sm: 'gap-1.5',
      md: 'gap-2',
      lg: 'gap-2.5',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const textVariants = cva('font-semibold tracking-tight', {
  variants: {
    size: {
      sm: 'text-sm',
      md: 'text-lg',
      lg: 'text-xl',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const iconSizes = {
  sm: 16,
  md: 20,
  lg: 24,
} as const;

export interface LogoProps extends VariantProps<typeof logoVariants> {
  showText?: boolean;
  className?: string;
}

export const Logo = ({
  size = 'md',
  showText = true,
  className,
}: LogoProps) => {
  const iconSize = iconSizes[size || 'md'];

  return (
    <div className={className}>
      <Link href="/" className={cn(logoVariants({ size }))}>
        <LogoIcon size={iconSize} />
        {showText && <span className={cn(textVariants({ size }))}>Misque</span>}
      </Link>
    </div>
  );
};
