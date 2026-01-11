import Link from 'next/link';

import { Button } from '@misque/ui';

export const GetStartedButton = () => {
  return (
    <Button asChild className="rounded-none">
      <Link href="/docs">Get Started</Link>
    </Button>
  );
};
