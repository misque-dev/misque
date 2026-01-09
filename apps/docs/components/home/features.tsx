import { Zap, Shield, Package, Code } from 'lucide-react';

const features = [
  {
    name: 'Type-Safe',
    description: 'Full TypeScript support with comprehensive type definitions.',
    icon: Code,
  },
  {
    name: 'Tree-Shakable',
    description: 'Import only what you need. Optimized for minimal bundle size.',
    icon: Package,
  },
  {
    name: 'Zero Dependencies',
    description: 'Core packages have no external dependencies for reliability.',
    icon: Shield,
  },
  {
    name: 'Performant',
    description: 'Optimized algorithms for fast calculations and data access.',
    icon: Zap,
  },
];

export function Features() {
  return (
    <section className="border-t py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Built for Developers
          </h2>
          <p className="mt-4 text-muted-foreground">
            Modern, well-tested libraries designed for production use.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.name} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <feature.icon className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="mt-4 font-semibold">{feature.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
