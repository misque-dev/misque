import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { NavItem } from './desktop-nav';

interface MobileNavProps {
  items: NavItem[];
  pathname: string;
  onItemClick?: () => void;
  className?: string;
}

export const MobileNav = ({
  items,
  pathname,
  onItemClick,
  className,
}: MobileNavProps) => {
  return (
    <nav className={cn('px-4 space-y-1', className)}>
      {items.map((item) => {
        const isActive =
          pathname === item.path ||
          (item.path !== '/' && pathname.startsWith(item.path));
        return (
          <Link
            key={item.path}
            href={item.path}
            onClick={onItemClick}
            className={cn(
              'block px-4 py-3 rounded-lg text-sm font-mono transition-colors',
              isActive
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
};
