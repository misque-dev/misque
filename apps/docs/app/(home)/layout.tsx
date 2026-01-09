import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import type { ReactNode } from 'react';

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
