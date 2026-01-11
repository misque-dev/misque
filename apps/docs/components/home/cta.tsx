'use client';

import Link from 'next/link';
import { ArrowRight, Heart, Github, Star } from 'lucide-react';

export function CTA() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 geometric-pattern opacity-40" />
      <div className="absolute inset-0 gradient-mesh-hero opacity-50" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 lg:px-8">
        <div className="relative">
          {/* Glow background */}
          <div className="absolute inset-0 -m-8 rounded-4xl bg-gradient-to-b from-accent/10 via-transparent to-teal/10 blur-2xl" />

          {/* Card */}
          <div className="relative rounded-3xl border border-border bg-card/80 backdrop-blur-xl p-12 sm:p-16 text-center">
            {/* Icon */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-teal/20 border border-accent/20 flex items-center justify-center mb-8 animate-float">
              <Heart className="w-8 h-8 text-accent" />
            </div>

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-foreground">
              Built by Muslims,{' '}
              <span className="text-gradient">for Muslims</span>
            </h2>

            {/* Description */}
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Misque is open-source and community-driven. We believe in building
              high-quality tools that serve the Ummah. Join us in making Islamic
              technology accessible to everyone.
            </p>

            {/* Install command */}
            <div className="mt-10 flex justify-center">
              <div className="relative group inline-block">
                <div className="absolute -inset-1 bg-gradient-to-r from-accent/30 via-teal/30 to-accent/30 rounded-2xl blur opacity-50 group-hover:opacity-100 transition duration-500" />
                <div className="relative glass-strong rounded-xl px-8 py-4">
                  <code className="font-mono text-base text-foreground">
                    <span className="text-muted-foreground">$</span>{' '}
                    <span className="text-teal">pnpm add</span>{' '}
                    <span className="text-accent">@misque/quran @misque/prayer-times @misque/hijri @misque/qibla</span>
                  </code>
                </div>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/docs" className="btn-primary group inline-flex items-center gap-2">
                Read the Documentation
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="https://github.com/misque/misque"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary inline-flex items-center gap-2"
              >
                <Star className="w-4 h-4" />
                Star on GitHub
              </Link>
            </div>

            {/* Community links */}
            <div className="mt-12 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4">
                Want to contribute?
              </p>
              <div className="flex items-center justify-center gap-6">
                <Link
                  href="https://github.com/misque/misque"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </Link>
                <Link
                  href="https://github.com/misque/misque/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Report Issues
                </Link>
                <Link
                  href="https://github.com/misque/misque/pulls"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pull Requests
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
