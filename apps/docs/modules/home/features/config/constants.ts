import {
  BookOpen,
  Clock,
  Compass,
  Calendar,
  Code2,
  Feather,
} from 'lucide-react';

export const features = [
  {
    id: 1,
    label: 'Quran Package',
    title: 'Complete <strong>Quran</strong> Data & Audio.',
    description:
      'Full Quran text, translations, audio from 50+ reciters, and search APIs.',
    icon: BookOpen,
    iconColor: 'text-emerald-500',
    href: '/docs/packages/quran',
  },
  {
    id: 2,
    label: 'Prayer Times',
    title: 'Accurate <strong>Prayer Time</strong> Calculations.',
    description:
      'Support for all major calculation methods: MWL, ISNA, Egypt, Makkah, and more.',
    icon: Clock,
    iconColor: 'text-amber-500',
    href: '/docs/packages/prayer-times',
  },
  {
    id: 3,
    label: 'Qibla Direction',
    title: 'Precise <strong>Qibla</strong> Direction.',
    description:
      'Calculate Qibla direction from any coordinates with high accuracy.',
    icon: Compass,
    iconColor: 'text-blue-500',
    href: '/docs/packages/qibla',
  },
  {
    id: 4,
    label: 'Hijri Calendar',
    title: '<strong>Hijri</strong> Date Conversion.',
    description:
      'Convert between Gregorian and Hijri calendars with timezone support.',
    icon: Calendar,
    iconColor: 'text-purple-500',
    href: '/docs/packages/hijri',
  },
  {
    id: 5,
    label: 'Type-Safe',
    title: 'Full <strong>TypeScript</strong> Support.',
    description:
      'Complete type definitions with strict mode compatibility and IntelliSense.',
    icon: Code2,
    iconColor: 'text-teal-500',
    href: '/docs/getting-started',
  },
  {
    id: 6,
    label: 'Zero Dependencies',
    title: 'Lightweight & <strong>Tree-Shakable</strong>.',
    description:
      'Core packages have zero external dependencies. Import only what you need.',
    icon: Feather,
    iconColor: 'text-pink-500',
    href: '/docs/getting-started',
  },
];
