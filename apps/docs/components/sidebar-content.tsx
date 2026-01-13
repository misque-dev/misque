import {
  BookOpen,
  Clock,
  Compass,
  Calendar,
  Rocket,
  Box,
  FileText,
  Code,
  MapPin,
  type LucideIcon,
} from 'lucide-react';

type SidebarItem = {
  title: string;
  href: string;
  icon: LucideIcon;
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
        icon: FileText,
      },
      {
        title: 'Getting Started',
        href: '/docs/getting-started',
        icon: Rocket,
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
        icon: BookOpen,
      },
      {
        title: 'Prayer Times',
        href: '/docs/packages/prayer-times',
        icon: Clock,
      },
      {
        title: 'Qibla',
        href: '/docs/packages/qibla',
        icon: Compass,
      },
      {
        title: 'Hijri',
        href: '/docs/packages/hijri',
        icon: Calendar,
      },
      {
        title: 'Mosques Finder',
        href: '/docs/packages/mosques-finder',
        icon: MapPin,
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
        icon: Code,
      },
    ],
  },
];
