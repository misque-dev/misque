import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CTA() {
  return (
    <section className="border-t py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to get started?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Install the packages you need and start building Islamic
            applications.
          </p>
          <div className="mt-8">
            <code className="rounded-lg bg-muted px-4 py-2 text-sm">
              pnpm add @misque/quran @misque/prayer-times
            </code>
          </div>
          <div className="mt-8">
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-500 font-medium"
            >
              Read the documentation
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
