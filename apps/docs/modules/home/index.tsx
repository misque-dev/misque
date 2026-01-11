import Hero from '@/modules/home/hero';
import { Features } from '@/modules/home/features';
import { CTASection } from '@/modules/home/cta';

interface Props {
  stars: string | null;
}
export const HomePage = ({ stars = '0' }: Props) => {
  return (
    <main className="h-min w-full max-w-full overflow-hidden">
      <Hero />
      <Features />
      <CTASection stars={stars || '0'} />
    </main>
  );
};
