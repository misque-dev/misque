import Link from 'next/link';
import { Github } from 'lucide-react';
import { Logo } from '../../logo';

export const BrandSection = () => {
  return (
    <div className="lg:col-span-2">
      <Logo />
      <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-sm">
        Open-source JavaScript libraries for building Islamic applications.
        Built with TypeScript for the modern web.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Link
          href="https://github.com/asadkomi/misque"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          aria-label="GitHub"
        >
          <Github className="w-4 h-4" />
        </Link>
        <Link
          href="https://x.com/misquedev"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          aria-label="Twitter"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </Link>
      </div>
    </div>
  );
};
