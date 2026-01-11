import type { LucideIcon } from 'lucide-react';

export type Feature = {
  id: number;
  label: string;
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  href: string;
};
