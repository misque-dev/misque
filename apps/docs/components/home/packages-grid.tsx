'use client';

import Link from 'next/link';
import { Book, Clock, Compass, Calendar, ArrowUpRight, Copy, Check } from 'lucide-react';
import { useState } from 'react';

const packages = [
  {
    name: '@misque/quran',
    shortName: 'quran',
    description: 'Complete Quran text, translations, audio, and search APIs.',
    href: '/docs/packages/quran',
    icon: Book,
    color: 'from-emerald-500/20 to-teal-500/10',
    borderColor: 'group-hover:border-emerald-500/50',
    features: ['114 Surahs', 'Multiple Reciters', 'Search API', 'Translations'],
  },
  {
    name: '@misque/prayer-times',
    shortName: 'prayer-times',
    description: 'Accurate Islamic prayer time calculations for any location.',
    href: '/docs/packages/prayer-times',
    icon: Clock,
    color: 'from-amber-500/20 to-orange-500/10',
    borderColor: 'group-hover:border-amber-500/50',
    features: ['12+ Methods', 'High Latitude', 'Sunnah Times', 'Adjustments'],
  },
  {
    name: '@misque/qibla',
    shortName: 'qibla',
    description: 'Calculate Qibla direction and distance from any coordinates.',
    href: '/docs/packages/qibla',
    icon: Compass,
    color: 'from-blue-500/20 to-cyan-500/10',
    borderColor: 'group-hover:border-blue-500/50',
    features: ['Direction', 'Distance', 'Compass UI', 'Device Orientation'],
  },
  {
    name: '@misque/hijri',
    shortName: 'hijri',
    description: 'Hijri calendar conversion, formatting, and date utilities.',
    href: '/docs/packages/hijri',
    icon: Calendar,
    color: 'from-purple-500/20 to-pink-500/10',
    borderColor: 'group-hover:border-purple-500/50',
    features: ['Conversion', 'Formatting', 'Validation', 'Date Math'],
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      await window.navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-md hover:bg-muted transition-colors"
      aria-label="Copy install command"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-teal" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
      )}
    </button>
  );
}

function PackageCard({
  pkg,
  index,
}: {
  pkg: (typeof packages)[0];
  index: number;
}) {
  const Icon = pkg.icon;

  return (
    <Link
      href={pkg.href}
      className="group relative block opacity-0 animate-reveal-up"
      style={{ animationDelay: `${100 + index * 100}ms` }}
    >
      {/* Glow effect */}
      <div
        className={`absolute -inset-0.5 rounded-3xl bg-gradient-to-br ${pkg.color} opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500`}
      />

      <div
        className={`relative h-full rounded-2xl border border-border bg-card p-8 transition-all duration-300 ${pkg.borderColor}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className={`icon-box bg-gradient-to-br ${pkg.color}`}>
            <Icon className="w-6 h-6 text-foreground" />
          </div>
          <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </div>

        {/* Package name */}
        <div className="mt-6">
          <h3 className="font-mono text-sm font-medium text-accent">
            {pkg.name}
          </h3>
          <p className="mt-2 text-lg font-serif font-semibold text-foreground">
            {pkg.description}
          </p>
        </div>

        {/* Features */}
        <div className="mt-6 flex flex-wrap gap-2">
          {pkg.features.map((feature) => (
            <span key={feature} className="tag-muted">
              {feature}
            </span>
          ))}
        </div>

        {/* Install command */}
        <div className="mt-6 flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
          <code className="font-mono text-xs text-muted-foreground">
            pnpm add {pkg.name}
          </code>
          <CopyButton text={`pnpm add ${pkg.name}`} />
        </div>
      </div>
    </Link>
  );
}

export function PackagesGrid() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-glow opacity-50" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/20 bg-accent/5 mb-6 opacity-0 animate-reveal-up">
            <span className="text-xs font-medium text-accent uppercase tracking-wider">
              Packages
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-foreground opacity-0 animate-reveal-up delay-100">
            Everything You Need to{' '}
            <span className="text-gradient">Build Islamic Apps</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed opacity-0 animate-reveal-up delay-200">
            Modular packages you can use independently or together.
            Each one is carefully crafted with accuracy and performance in mind.
          </p>
        </div>

        {/* Package grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {packages.map((pkg, index) => (
            <PackageCard key={pkg.name} pkg={pkg} index={index} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center opacity-0 animate-reveal-up delay-500">
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 text-accent hover:text-accent/80 font-medium transition-colors"
          >
            View all packages documentation
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
