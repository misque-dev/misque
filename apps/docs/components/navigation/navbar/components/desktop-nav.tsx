import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface NavItem {
  name: string;
  path: string;
}

interface DesktopNavProps {
  items: NavItem[];
  pathname: string;
  className?: string;
}

export const DesktopNav = ({ items, pathname, className }: DesktopNavProps) => {
  return (
    <nav className={cn('hidden md:flex items-center h-full', className)}>
      {items.map((item) => {
        const isActive =
          pathname === item.path ||
          (item.path !== '/' && pathname.startsWith(item.path));
        return (
          <Link
            key={item.path}
            href={item.path}
            className={cn(
              'relative px-3 h-full flex items-center text-sm font-mono transition-colors',
              isActive
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {item.name}
            {isActive && (
              <span className="absolute top-5 mt-3.5 left-3 right-3 h-px bg-foreground" />
            )}
          </Link>
        );
      })}
    </nav>
  );
};
