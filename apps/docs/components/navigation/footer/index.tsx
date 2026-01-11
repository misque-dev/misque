import { FooterSection } from '@/components/navigation/footer/components/footer-section';
import { footerLinks } from '@/components/navigation/footer/config/constants';
import { BrandSection } from '@/components/navigation/footer/components/brand-section';
import { BottomBar } from '@/components/navigation/footer/components/bottom-bar';

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-8 grid-cols-2 lg:grid-cols-5">
          <BrandSection />
          <FooterSection title="Packages" links={footerLinks.packages} />
          <FooterSection title="Resources" links={footerLinks.resources} />
          <FooterSection title="Links" links={footerLinks.links} />
        </div>
        <BottomBar />
      </div>
    </footer>
  );
};
