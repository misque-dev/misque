import { newPackages } from './config/constants';
import { cn } from '@misque/ui/lib/utils';
import { ChevronRightIcon } from 'lucide-react';
import Link from 'next/link';

export const NewPackages = () => {
  return (
    <section className="relative w-full px-4 mx-auto max-w-5xl mt-16">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-xs font-medium uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full">
          Just Released
        </div>
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          New Packages
        </h2>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Expanding the ecosystem with new tools for Islamic applications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border">
        {newPackages.map((pkg, index) => {
          const Icon = pkg.icon;
          return (
            <div
              key={pkg.id}
              className={cn(
                'relative p-6 md:p-8 group hover:bg-muted/30 transition-colors duration-200 flex flex-col h-full',
                index === 0 && 'border-b md:border-b-0 md:border-r'
              )}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center">
                  <Icon className={cn(pkg.iconColor, 'w-4 h-4')} />
                </div>
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {pkg.label}
                </span>
                {pkg.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded">
                    {pkg.badge}
                  </span>
                )}
              </div>

              {/* Safe: content is static from constants file, not user input */}
              <h3
                className="text-xl font-medium text-primary dark:text-zinc-100 mb-2"
                dangerouslySetInnerHTML={{ __html: pkg.title }}
              />

              <p className="text-sm text-muted-foreground mb-4 flex-1">
                {pkg.description}
              </p>

              <Link
                href={pkg.href}
                className="inline-flex items-center text-sm text-blue-500 hover:text-blue-500/80 transition-colors group-hover:underline mt-auto"
              >
                Learn more
                <ChevronRightIcon className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-0.5 text-blue-500" />
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
};
