import { LabelBadge } from './label-badge';

export const HeroHeading = () => {
  return (
    <div className="space-y-2">
      <LabelBadge />
      <p className="text-zinc-800 dark:text-zinc-300 tracking-tight text-xl sm:text-2xl md:text-3xl text-balance break-words">
        Open-source, type-safe packages for Quran, Prayer Times, Qibla, and
        Hijri Calendar.
      </p>
    </div>
  );
};
