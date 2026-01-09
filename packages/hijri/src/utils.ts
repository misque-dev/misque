import type { HijriDate, HijriMonthInfo } from './types';
import { ISLAMIC_MONTHS, ISLAMIC_MONTHS_AR } from '@misque/core';
import { getMonthLength, isHijriLeapYear } from './conversion';

/**
 * Get today's Hijri date
 */
export function getHijriToday(): HijriDate {
  const { toHijri } = require('./conversion');
  const result = toHijri(new Date());
  if (result.success) {
    return result.data;
  }
  // Fallback (should not happen)
  return { year: 1, month: 1, day: 1 };
}

/**
 * Get all months info for a year
 */
export function getYearMonths(year: number): HijriMonthInfo[] {
  return ISLAMIC_MONTHS.map((name, index) => ({
    number: index + 1,
    name,
    nameArabic: ISLAMIC_MONTHS_AR[index] ?? '',
    days: getMonthLength(year, index + 1),
  }));
}

/**
 * Add days to a Hijri date
 */
export function addDays(date: HijriDate, days: number): HijriDate {
  let { year, month, day } = date;

  if (days > 0) {
    while (days > 0) {
      const monthDays = getMonthLength(year, month);
      const daysLeft = monthDays - day;

      if (days <= daysLeft) {
        day += days;
        days = 0;
      } else {
        days -= daysLeft + 1;
        day = 1;
        month++;
        if (month > 12) {
          month = 1;
          year++;
        }
      }
    }
  } else if (days < 0) {
    days = Math.abs(days);
    while (days > 0) {
      if (days < day) {
        day -= days;
        days = 0;
      } else {
        days -= day;
        month--;
        if (month < 1) {
          month = 12;
          year--;
        }
        day = getMonthLength(year, month);
      }
    }
  }

  return { year, month, day };
}

/**
 * Add months to a Hijri date
 */
export function addMonths(date: HijriDate, months: number): HijriDate {
  let { year, month, day } = date;

  const totalMonths = (year - 1) * 12 + (month - 1) + months;
  year = Math.floor(totalMonths / 12) + 1;
  month = (totalMonths % 12) + 1;

  // Adjust day if it exceeds the month length
  const maxDay = getMonthLength(year, month);
  if (day > maxDay) {
    day = maxDay;
  }

  return { year, month, day };
}

/**
 * Add years to a Hijri date
 */
export function addYears(date: HijriDate, years: number): HijriDate {
  const newYear = date.year + years;
  let { month, day } = date;

  // Adjust day for leap year changes
  const maxDay = getMonthLength(newYear, month);
  if (day > maxDay) {
    day = maxDay;
  }

  return { year: newYear, month, day };
}

/**
 * Compare two Hijri dates
 * Returns: -1 if a < b, 0 if equal, 1 if a > b
 */
export function compareDates(a: HijriDate, b: HijriDate): number {
  if (a.year !== b.year) {
    return a.year < b.year ? -1 : 1;
  }
  if (a.month !== b.month) {
    return a.month < b.month ? -1 : 1;
  }
  if (a.day !== b.day) {
    return a.day < b.day ? -1 : 1;
  }
  return 0;
}

/**
 * Check if two Hijri dates are equal
 */
export function areDatesEqual(a: HijriDate, b: HijriDate): boolean {
  return compareDates(a, b) === 0;
}

/**
 * Get the difference in days between two Hijri dates
 */
export function getDaysDifference(from: HijriDate, to: HijriDate): number {
  // Convert both to an approximate day count for comparison
  const fromDays = hijriToApproximateDays(from);
  const toDays = hijriToApproximateDays(to);
  return toDays - fromDays;
}

/**
 * Convert Hijri date to approximate total days (for comparison)
 */
function hijriToApproximateDays(date: HijriDate): number {
  let days = 0;

  // Add days for complete years
  for (let y = 1; y < date.year; y++) {
    days += isHijriLeapYear(y) ? 355 : 354;
  }

  // Add days for complete months
  for (let m = 1; m < date.month; m++) {
    days += getMonthLength(date.year, m);
  }

  // Add remaining days
  days += date.day;

  return days;
}

/**
 * Check if a date is in Ramadan
 */
export function isRamadan(date: HijriDate): boolean {
  return date.month === 9;
}

/**
 * Check if a date is in Dhul Hijjah (pilgrimage month)
 */
export function isDhulHijjah(date: HijriDate): boolean {
  return date.month === 12;
}

/**
 * Get the first day of a month
 */
export function getFirstDayOfMonth(year: number, month: number): HijriDate {
  return { year, month, day: 1 };
}

/**
 * Get the last day of a month
 */
export function getLastDayOfMonth(year: number, month: number): HijriDate {
  return { year, month, day: getMonthLength(year, month) };
}
