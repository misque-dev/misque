import Link from 'next/link';

import { Button } from '@/components/ui/button';

export const GetStartedButton = () => {
  return (
    <Button asChild className="rounded-none">
      <Link href="/docs">Get Started</Link>
    </Button>
  );
};
