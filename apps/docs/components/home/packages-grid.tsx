import Link from 'next/link';
import { Book, Clock, Compass, Calendar } from 'lucide-react';

const packages = [
  {
    name: '@misque/quran',
    description: 'Complete Quran text, translations, audio, and search APIs.',
    href: '/docs/packages/quran',
    icon: Book,
  },
  {
    name: '@misque/prayer-times',
    description: 'Accurate prayer time calculations for any location.',
    href: '/docs/packages/prayer-times',
    icon: Clock,
  },
  {
    name: '@misque/qibla',
    description: 'Calculate Qibla direction from any coordinates.',
    href: '/docs/packages/qibla',
    icon: Compass,
  },
  {
    name: '@misque/hijri',
    description: 'Hijri calendar conversion and formatting utilities.',
    href: '/docs/packages/hijri',
    icon: Calendar,
  },
];

export function PackagesGrid() {
  return (
    <section className="border-t py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold">Packages</h2>
        <p className="mt-4 text-center text-muted-foreground">
          Modular packages you can use independently or together.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {packages.map((pkg) => (
            <Link
              key={pkg.name}
              href={pkg.href}
              className="group rounded-xl border p-6 transition-colors hover:border-emerald-600 hover:bg-muted/50"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <pkg.icon className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-mono text-sm font-semibold">{pkg.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {pkg.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
