import Link from 'next/link';

import { GitHubIcon, NpmIcon } from '@/components/icons';

export const Npm = () => {
  return (
    <div className="w-full flex items-center justify-between gap-2 bg-accent dark:bg-sidebar p-2">
      <div className="w-full flex flex-col min-[350px]:flex-row min-[350px]:items-center gap-0.5 min-[350px]:gap-2 min-w-0">
        <p className="text-xs sm:text-sm font-mono select-none tracking-tighter space-x-1 shrink-0">
          <span className="italic text-red-500">$</span>
        </p>
        <p className="relative inline tracking-tight opacity-90 md:text-sm text-xs dark:text-white font-mono text-black">
          npm add{' '}
          <span className="relative text-fuchsia-500">
            @misque/prayer-times
          </span>
        </p>
      </div>
      <div className="flex gap-2 items-center">
        <Link
          href="https://www.npmjs.com/package/@misque/prayer-times"
          target="_blank"
        >
          <NpmIcon />
        </Link>
        <Link href="https://github.com/asadkomi/misque" target="_blank">
          <GitHubIcon />
        </Link>
      </div>
    </div>
  );
};
