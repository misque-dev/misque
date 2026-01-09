import type { PrayerAdjustments, PrayerTimes } from './types';

/**
 * Create prayer adjustments object
 */
export function createAdjustments(
  adjustments: Partial<PrayerAdjustments>
): PrayerAdjustments {
  return {
    fajr: adjustments.fajr ?? 0,
    sunrise: adjustments.sunrise ?? 0,
    dhuhr: adjustments.dhuhr ?? 0,
    asr: adjustments.asr ?? 0,
    maghrib: adjustments.maghrib ?? 0,
    isha: adjustments.isha ?? 0,
  };
}

/**
 * Apply minute adjustments to prayer times
 */
export function adjustPrayerTimes(
  times: PrayerTimes,
  adjustments: PrayerAdjustments
): PrayerTimes {
  const adjust = (date: Date, minutes: number | undefined): Date => {
    if (!minutes) return date;
    return new Date(date.getTime() + minutes * 60 * 1000);
  };

  return {
    fajr: adjust(times.fajr, adjustments.fajr),
    sunrise: adjust(times.sunrise, adjustments.sunrise),
    dhuhr: adjust(times.dhuhr, adjustments.dhuhr),
    asr: adjust(times.asr, adjustments.asr),
    maghrib: adjust(times.maghrib, adjustments.maghrib),
    isha: adjust(times.isha, adjustments.isha),
  };
}

/**
 * Common adjustment presets
 */
export const ADJUSTMENT_PRESETS = {
  /** Add safety margin before Fajr */
  conservative: createAdjustments({
    fajr: -2,
    sunrise: 0,
    dhuhr: 2,
    asr: 2,
    maghrib: 2,
    isha: 0,
  }),

  /** Standard adjustments (no changes) */
  standard: createAdjustments({}),

  /** Add margin for prayer preparation */
  withPreparation: createAdjustments({
    fajr: -5,
    dhuhr: 5,
    asr: 5,
    maghrib: 3,
    isha: 0,
  }),
} as const;

/**
 * Get preset by name
 */
export function getPreset(
  name: keyof typeof ADJUSTMENT_PRESETS
): PrayerAdjustments {
  return { ...ADJUSTMENT_PRESETS[name] };
}
