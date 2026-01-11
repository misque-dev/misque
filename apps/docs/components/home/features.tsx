'use client';

import { Zap, Shield, Package, Code, Check } from 'lucide-react';

const features = [
  {
    name: 'Type-Safe',
    description:
      'Full TypeScript support with comprehensive type definitions. Catch errors at compile time.',
    icon: Code,
    highlights: [
      'Strict mode enabled',
      'IntelliSense support',
      'JSDoc comments',
    ],
  },
  {
    name: 'Tree-Shakable',
    description:
      'Import only what you need. ESM-first design ensures minimal bundle impact.',
    icon: Package,
    highlights: [
      'ESM & CJS output',
      'Dead code elimination',
      'Optimized imports',
    ],
  },
  {
    name: 'Zero Dependencies',
    description:
      'Core packages have no external dependencies. Maximum reliability and security.',
    icon: Shield,
    highlights: [
      'No supply chain risk',
      'Reduced bundle size',
      'Predictable behavior',
    ],
  },
  {
    name: 'Performant',
    description:
      'Optimized algorithms for fast calculations. Built for production workloads.',
    icon: Zap,
    highlights: [
      'Lazy loading',
      'Cached computations',
      'Efficient data structures',
    ],
  },
];

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0];
  index: number;
}) {
  const Icon = feature.icon;

  return (
    <div
      className="group relative opacity-0 animate-reveal-up"
      style={{ animationDelay: `${200 + index * 100}ms` }}
    >
      {/* Glow effect on hover */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

      <div className="relative h-full rounded-2xl border border-border bg-card/50 p-8 backdrop-blur-sm transition-all duration-300 group-hover:border-accent/30 group-hover:bg-card/80">
        {/* Icon */}
        <div className="icon-box group-hover:animate-glow-pulse">
          <Icon className="w-6 h-6 text-accent" />
        </div>

        {/* Content */}
        <h3 className="mt-6 text-xl font-serif font-semibold text-foreground">
          {feature.name}
        </h3>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          {feature.description}
        </p>

        {/* Highlights */}
        <ul className="mt-6 space-y-2">
          {feature.highlights.map((highlight) => (
            <li key={highlight} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-teal shrink-0" />
              <span className="text-muted-foreground">{highlight}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function Features({ stars }: { stars: string }) {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 geometric-pattern-dense opacity-30" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/20 bg-accent/5 mb-6 opacity-0 animate-reveal-up">
            <span className="text-xs font-medium text-accent uppercase tracking-wider">
              Why Misque
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-foreground opacity-0 animate-reveal-up delay-100">
            Built for <span className="text-gradient">Modern Development</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed opacity-0 animate-reveal-up delay-200">
            Production-ready libraries designed with developer experience in
            mind. Every package follows best practices for TypeScript, testing,
            and documentation.
          </p>
        </div>

        {/* Feature grid */}
        <div className="mt-20 grid gap-8 sm:grid-cols-2">
          {features.map((feature, index) => (
            <FeatureCard key={feature.name} feature={feature} index={index} />
          ))}
        </div>

        {/* Decorative divider */}
        <div className="divider-ornate mt-24">
          <span className="text-2xl">&#x2726;</span>
        </div>
      </div>
    </section>
  );
}
