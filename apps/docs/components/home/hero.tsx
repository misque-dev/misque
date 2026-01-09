import Link from 'next/link';
import { ArrowRight, Github } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Islamic Libraries for{' '}
            <span className="text-emerald-600">JavaScript</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Open-source, type-safe libraries for Quran, Prayer Times, Qibla,
            Hijri Calendar, and more. Built for modern JavaScript applications.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="https://github.com/misque/misque"
              className="inline-flex items-center gap-2 rounded-lg border px-6 py-3 text-sm font-semibold hover:bg-muted transition-colors"
            >
              <Github className="h-4 w-4" />
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
