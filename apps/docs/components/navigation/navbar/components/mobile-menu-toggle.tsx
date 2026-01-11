import { Menu } from 'lucide-react';
import React from 'react';
import { useMobileMenuStore } from '../config/mobile-mene-store';

export const MobileMenuToggle = () => {
  const { setIsOpen } = useMobileMenuStore();

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
      aria-label="Open menu"
    >
      <Menu className="w-5 h-5" />
    </button>
  );
};
