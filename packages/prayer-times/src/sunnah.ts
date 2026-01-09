import type { PrayerTimes, SunnahTimes } from './types';

/**
 * Calculate Sunnah times based on prayer times
 *
 * Sunnah times are:
 * - Middle of the Night: Exact midpoint between Maghrib and next day Fajr
 * - Last Third of the Night: 2/3 point of the night (optimal time for Tahajjud)
 *
 * @param todayTimes - Today's prayer times
 * @param tomorrowFajr - Tomorrow's Fajr time (needed to calculate night duration)
 * @returns Sunnah times for the night
 *
 * @example
 * ```typescript
 * const today = calculatePrayerTimes(new Date(), location, params);
 * const tomorrow = calculatePrayerTimes(addDays(new Date(), 1), location, params);
 *
 * const sunnah = calculateSunnahTimes(today.data, tomorrow.data.fajr);
 * console.log(`Middle of night: ${sunnah.middleOfTheNight}`);
 * console.log(`Last third: ${sunnah.lastThirdOfTheNight}`);
 * ```
 */
export function calculateSunnahTimes(
  todayTimes: PrayerTimes,
  tomorrowFajr: Date
): SunnahTimes {
  const maghrib = todayTimes.maghrib.getTime();
  const fajr = tomorrowFajr.getTime();

  // Calculate night duration in milliseconds
  const nightDuration = fajr - maghrib;

  // Middle of the night is exactly halfway
  const middleOfTheNight = new Date(maghrib + nightDuration / 2);

  // Last third of the night is 2/3 of the way through
  // This is the optimal time for Tahajjud (night prayer)
  const lastThirdOfTheNight = new Date(maghrib + (nightDuration * 2) / 3);

  return {
    middleOfTheNight,
    lastThirdOfTheNight,
  };
}

/**
 * Get the night duration in hours
 *
 * @param maghrib - Maghrib time
 * @param fajr - Next day's Fajr time
 * @returns Night duration in hours
 */
export function getNightDuration(maghrib: Date, fajr: Date): number {
  const durationMs = fajr.getTime() - maghrib.getTime();
  return durationMs / (1000 * 60 * 60); // Convert to hours
}

/**
 * Calculate the night portion for a given fraction
 * Useful for high latitude calculations
 *
 * @param maghrib - Maghrib time
 * @param fajr - Next day's Fajr time
 * @param fraction - Portion of the night (e.g., 0.5 for middle, 1/7 for seventh)
 * @returns Date representing that portion of the night
 */
export function getNightPortion(
  maghrib: Date,
  fajr: Date,
  fraction: number
): Date {
  const nightDuration = fajr.getTime() - maghrib.getTime();
  return new Date(maghrib.getTime() + nightDuration * fraction);
}

/**
 * Check if a given time is during the "last third" of the night
 * This is the blessed time mentioned in hadith
 *
 * @param time - Time to check
 * @param maghrib - Maghrib time
 * @param fajr - Next day's Fajr time
 * @returns true if the time is in the last third of the night
 */
export function isLastThirdOfNight(
  time: Date,
  maghrib: Date,
  fajr: Date
): boolean {
  const timeMs = time.getTime();
  const maghribMs = maghrib.getTime();
  const fajrMs = fajr.getTime();

  const lastThirdStart = maghribMs + ((fajrMs - maghribMs) * 2) / 3;

  return timeMs >= lastThirdStart && timeMs <= fajrMs;
}

/**
 * Calculate Qiyam al-Layl (night prayer) time range
 * Returns the recommended time range for night prayers
 *
 * @param maghrib - Maghrib time
 * @param fajr - Next day's Fajr time
 * @returns Object with start (middle of night) and optimal (last third) times
 */
export function getQiyamTimeRange(
  maghrib: Date,
  fajr: Date
): {
  start: Date;
  optimal: Date;
  end: Date;
} {
  const nightDuration = fajr.getTime() - maghrib.getTime();

  return {
    start: new Date(maghrib.getTime() + nightDuration / 2),
    optimal: new Date(maghrib.getTime() + (nightDuration * 2) / 3),
    end: fajr,
  };
}
