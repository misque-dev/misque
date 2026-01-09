import { Hero } from '@/components/home/hero';
import { Features } from '@/components/home/features';
import { PackagesGrid } from '@/components/home/packages-grid';
import { CTA } from '@/components/home/cta';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <PackagesGrid />
      <CTA />
    </>
  );
}
