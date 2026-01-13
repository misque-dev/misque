import {
  Rocket,
  Box,
  Code,
  type LucideIcon,
} from 'lucide-react';

type SidebarItem = {
  title: string;
  href: string;
  isNew?: boolean;
  group?: boolean;
};

type SidebarSection = {
  title: string;
  Icon: LucideIcon;
  isNew?: boolean;
  list: SidebarItem[];
};

export const contents: SidebarSection[] = [
  {
    title: 'Get Started',
    Icon: Rocket,
    list: [
      {
        title: 'Introduction',
        href: '/docs',
      },
      {
        title: 'Getting Started',
        href: '/docs/getting-started',
      },
    ],
  },
  {
    title: 'Packages',
    Icon: Box,
    list: [
      {
        title: 'Quran',
        href: '/docs/packages/quran',
      },
      {
        title: 'Prayer Times',
        href: '/docs/packages/prayer-times',
      },
      {
        title: 'Qibla',
        href: '/docs/packages/qibla',
      },
      {
        title: 'Hijri',
        href: '/docs/packages/hijri',
      },
      {
        title: 'Mosques Finder',
        href: '/docs/packages/mosques-finder',
        isNew: true,
      },
      {
        title: 'Zakat',
        href: '/docs/packages/zakat',
        isNew: true,
      },
    ],
  },
];

export const examples: SidebarSection[] = [
  {
    title: 'Examples',
    Icon: Code,
    list: [
      {
        title: 'Basic Usage',
        href: '/docs/examples/basic-usage',
      },
    ],
  },
];
