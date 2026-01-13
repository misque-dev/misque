import { MapPin, Calculator } from 'lucide-react';

export const newPackages = [
  {
    id: 1,
    label: 'Mosques Finder',
    title: 'Find <strong>Nearby Mosques</strong>.',
    description:
      'Locate mosques using OpenStreetMap data with configurable radius and filters.',
    icon: MapPin,
    iconColor: 'text-rose-500',
    href: '/docs/packages/mosques-finder',
    badge: 'New',
  },
  {
    id: 2,
    label: 'Zakat Calculator',
    title: '<strong>Zakat</strong> Calculation.',
    description:
      'Calculate Zakat with support for different madhabs and real-time metal prices.',
    icon: Calculator,
    iconColor: 'text-yellow-500',
    href: '/docs/packages/zakat',
    badge: 'New',
  },
];
