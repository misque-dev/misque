import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import type { ReactNode } from 'react';
import { MainLines } from '@/modules/home/components/main-lines';

export default function ChangelogsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <MainLines>{children}</MainLines>
      <Footer />
    </>
  );
}
