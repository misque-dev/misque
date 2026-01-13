import Link from 'next/link';
import { Github } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const githubLinkVariants = cva('transition-colors', {
  variants: {
    variant: {
      desktop:
        'hidden sm:flex p-2 rounded-lg text-muted-foreground hover:text-foreground',
      mobile:
        'flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80',
    },
  },
  defaultVariants: {
    variant: 'desktop',
  },
});

export interface GitHubLinkProps extends VariantProps<
  typeof githubLinkVariants
> {
  href?: string;
  className?: string;
}

export const GitHubLink = ({
  variant = 'desktop',
  href = 'https://github.com/misque-dev/misque',
  className,
}: GitHubLinkProps) => {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(githubLinkVariants({ variant }), className)}
      aria-label={variant === 'mobile' ? 'View on GitHub' : 'GitHub'}
    >
      <Github className="w-4 h-4" />
      {variant === 'mobile' && <span>View on GitHub</span>}
    </Link>
  );
};
