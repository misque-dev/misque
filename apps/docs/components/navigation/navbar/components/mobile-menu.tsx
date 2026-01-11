import { cn } from '@misque/ui/lib/utils';
import { useMobileMenuStore } from '@/components/navigation/navbar/config/mobile-mene-store';
import {
  X,
  BookOpen,
  Clock,
  Compass,
  Calendar,
  Rocket,
  FileText,
} from 'lucide-react';
import { navbarLinks } from '@/components/navigation/navbar/config/constants';
import { MobileNav } from '@/components/navigation/navbar/components/mobile-nav';
import { GitHubLink } from '@/components/navigation/navbar/components/github-link';
import Link from 'next/link';
import { Logo } from '../../logo';

interface Props {
  pathname: string;
}

const docsLinks = [
  { title: 'Introduction', href: '/docs', icon: FileText },
  { title: 'Getting Started', href: '/docs/getting-started', icon: Rocket },
  { title: '@misque/quran', href: '/docs/packages/quran', icon: BookOpen },
  {
    title: '@misque/prayer-times',
    href: '/docs/packages/prayer-times',
    icon: Clock,
  },
  { title: '@misque/qibla', href: '/docs/packages/qibla', icon: Compass },
  { title: '@misque/hijri', href: '/docs/packages/hijri', icon: Calendar },
];

export const MobileMenu = ({ pathname }: Props) => {
  const { isOpen, setIsOpen } = useMobileMenuStore();
  const isDocsPage = pathname.startsWith('/docs');

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 navbar:hidden',
        isOpen ? 'pointer-events-auto' : 'pointer-events-none'
      )}
    >
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Menu panel */}
      <div
        className={cn(
          'absolute right-0 top-0 h-full w-full max-w-sm bg-background border-l border-border shadow-2xl transition-transform duration-300 flex flex-col',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-4">
          <div className=" ">
            <Logo />
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <MobileNav
            items={navbarLinks}
            pathname={pathname}
            onItemClick={() => setIsOpen(false)}
          />

          {/* Docs Navigation - shown when on docs pages */}
          {isDocsPage && (
            <div className="px-6 pb-6">
              <div className="pt-12">
                <p className="text-xs font-medium text-primary uppercase tracking-wider mb-3 px-4">
                  Documentation
                </p>
                <nav className="space-y-1">
                  {docsLinks.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors',
                          isActive
                            ? 'bg-muted text-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {item.title}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          )}
        </div>

        <div className="p-4  mt-auto">
          <GitHubLink variant="mobile" />
        </div>
      </div>
    </div>
  );
};
