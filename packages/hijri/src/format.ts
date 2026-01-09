import type { HijriDate, HijriDateInfo, HijriFormatOptions } from './types';
import { ISLAMIC_MONTHS, ISLAMIC_MONTHS_AR, DAYS_OF_WEEK_AR } from '@misque/core';
import { isHijriLeapYear } from './conversion';

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

/**
 * Get detailed information about a Hijri date
 */
export function getHijriDateInfo(date: HijriDate): HijriDateInfo {
  // Calculate day of week (approximate - would need exact JD calculation)
  const dayOfWeek = calculateDayOfWeek(date);

  return {
    ...date,
    monthName: ISLAMIC_MONTHS[date.month - 1] ?? '',
    monthNameArabic: ISLAMIC_MONTHS_AR[date.month - 1] ?? '',
    dayOfWeek,
    dayOfWeekName: DAYS_OF_WEEK[dayOfWeek] ?? '',
    dayOfWeekNameArabic: DAYS_OF_WEEK_AR[dayOfWeek] ?? '',
    isLeapYear: isHijriLeapYear(date.year),
  };
}

/**
 * Format a Hijri date to string
 */
export function formatHijri(
  date: HijriDate,
  options: HijriFormatOptions = {}
): string {
  const {
    includeDayOfWeek = false,
    useArabic = false,
    style = 'medium',
    includeYear = true,
  } = options;

  const info = getHijriDateInfo(date);

  const monthName = useArabic ? info.monthNameArabic : info.monthName;
  const dayName = useArabic ? info.dayOfWeekNameArabic : info.dayOfWeekName;

  let result = '';

  switch (style) {
    case 'short':
      result = `${date.day}/${date.month}`;
      if (includeYear) result += `/${date.year}`;
      break;

    case 'medium':
      result = `${date.day} ${monthName}`;
      if (includeYear) result += ` ${date.year}`;
      break;

    case 'long':
      result = `${date.day} ${monthName}`;
      if (includeYear) result += ` ${date.year} AH`;
      break;

    case 'full':
      if (includeDayOfWeek) {
        result = `${dayName}, `;
      }
      result += `${date.day} ${monthName}`;
      if (includeYear) result += ` ${date.year} AH`;
      break;
  }

  if (includeDayOfWeek && style !== 'full') {
    result = `${dayName}, ${result}`;
  }

  return result;
}

/**
 * Format Hijri date in Arabic
 */
export function formatHijriArabic(date: HijriDate): string {
  return formatHijri(date, { useArabic: true, style: 'long' });
}

/**
 * Get month name by number (1-12)
 */
export function getMonthName(month: number, arabic = false): string {
  if (month < 1 || month > 12) {
    return '';
  }
  return arabic
    ? ISLAMIC_MONTHS_AR[month - 1] ?? ''
    : ISLAMIC_MONTHS[month - 1] ?? '';
}

/**
 * Calculate day of week for a Hijri date
 * This is an approximation - for exact calculation, use JD
 */
function calculateDayOfWeek(date: HijriDate): number {
  // Simplified calculation
  const a = Math.floor((14 - date.month) / 12);
  const y = date.year - a;
  const m = date.month + 12 * a - 2;

  const daysSinceEpoch =
    date.day +
    Math.floor((13 * m + 1) / 5) +
    354 * y +
    Math.floor((3 + 11 * y) / 30) +
    5;

  return daysSinceEpoch % 7;
}
