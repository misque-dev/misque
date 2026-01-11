'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { cn } from '@misque/ui/lib/utils';
import { Logo } from '@/components/navigation/logo';
import { Container } from '@/components/container';
import { navbarLinks } from '@/components/navigation/navbar/config/constants';
import { ThemeToggle } from '@/components/navigation/navbar/components/theme-toggle';
import { DesktopNav } from '@/components/navigation/navbar/components/desktop-nav';
import { GitHubLink } from '@/components/navigation/navbar/components/github-link';
import { MobileMenu } from '@/components/navigation/navbar/components/mobile-menu';
import { MobileMenuToggle } from '@/components/navigation/navbar/components/mobile-menu-toggle';

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-200 border-b ',
          scrolled ? 'bg-background/75 backdrop-blur-sm' : 'bg-background'
        )}
      >
        <Container className="flex items-center justify-between h-12">
          <Logo />

          <div className="flex items-center gap-12">
            <DesktopNav items={navbarLinks} pathname={pathname} />
            <div className="flex items-center gap-2">
              <ThemeToggle />

              <GitHubLink variant="desktop" />
              <MobileMenuToggle />
            </div>
          </div>
        </Container>
      </header>

      <MobileMenu pathname={pathname} />
    </>
  );
}
