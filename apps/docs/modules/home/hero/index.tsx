'use client';

import { Npm } from './components/left-section/npm';
import { GetStartedButton } from './components/left-section/get-started-button';
import { HeroHeading } from './components/left-section/hero-heading';
import { CodePreview } from './components/right-section/code-preview';

export default function Hero() {
  return (
    <div className="relative flex flex-col lg:flex-row gap-12 lg:gap-20 items-center justify-center py-16 lg:py-24 lg:px-8">
      <div className="z-10 text-left w-full lg:max-w-[50%] space-y-6">
        <HeroHeading />
        <Npm />
        <GetStartedButton />
      </div>

      <div className="w-full lg:w-auto lg:flex-1 max-w-full overflow-x-auto lg:static xl:pl-10 lg:h-96">
        <CodePreview />
      </div>
    </div>
  );
}
