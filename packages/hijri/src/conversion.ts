import type { HijriDate, GregorianDate, ConversionResult } from './types';
import type { Result } from '@misque/core';
import { toJulianDay, fromJulianDay } from '@misque/core';

/**
 * Hijri calendar epoch in Julian Day Number
 * (July 16, 622 CE Julian / July 19, 622 CE Gregorian)
 */
const HIJRI_EPOCH = 1948439.5;

/**
 * Convert Gregorian date to Hijri date
 *
 * Uses the Kuwaiti algorithm for accurate conversion.
 *
 * @example
 * ```ts
 * const hijri = toHijri(new Date(2024, 0, 1));
 * if (hijri.success) {
 *   console.log(hijri.data); // { year: 1445, month: 6, day: 19 }
 * }
 * ```
 */
export function toHijri(date: Date): Result<HijriDate> {
  try {
    const jd = toJulianDay(date);
    return julianDayToHijri(jd);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Conversion failed'),
    };
  }
}

/**
 * Convert Hijri date to Gregorian date
 *
 * @example
 * ```ts
 * const gregorian = toGregorian({ year: 1445, month: 6, day: 19 });
 * if (gregorian.success) {
 *   console.log(gregorian.data); // Date object for Jan 1, 2024
 * }
 * ```
 */
export function toGregorian(hijri: HijriDate): Result<Date> {
  const validation = validateHijriDate(hijri);
  if (!validation.success) {
    return validation;
  }

  try {
    const jd = hijriToJulianDay(hijri);
    return { success: true, data: fromJulianDay(jd) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Conversion failed'),
    };
  }
}

/**
 * Convert Gregorian date components to Hijri
 */
export function gregorianToHijri(
  year: number,
  month: number,
  day: number
): Result<HijriDate> {
  const date = new Date(Date.UTC(year, month - 1, day));
  return toHijri(date);
}

/**
 * Convert Hijri date to Gregorian components
 */
export function hijriToGregorian(
  year: number,
  month: number,
  day: number
): Result<GregorianDate> {
  const result = toGregorian({ year, month, day });
  if (!result.success) {
    return result;
  }

  const date = result.data;
  return {
    success: true,
    data: {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      day: date.getUTCDate(),
    },
  };
}

/**
 * Get full conversion result with both dates and Julian Day
 */
export function convert(date: Date | HijriDate): Result<ConversionResult> {
  if (date instanceof Date) {
    const jd = toJulianDay(date);
    const hijriResult = julianDayToHijri(jd);

    if (!hijriResult.success) {
      return hijriResult;
    }

    return {
      success: true,
      data: {
        hijri: hijriResult.data,
        gregorian: {
          year: date.getUTCFullYear(),
          month: date.getUTCMonth() + 1,
          day: date.getUTCDate(),
        },
        julianDay: jd,
      },
    };
  } else {
    const jd = hijriToJulianDay(date);
    const gregorian = fromJulianDay(jd);

    return {
      success: true,
      data: {
        hijri: date,
        gregorian: {
          year: gregorian.getUTCFullYear(),
          month: gregorian.getUTCMonth() + 1,
          day: gregorian.getUTCDate(),
        },
        julianDay: jd,
      },
    };
  }
}

/**
 * Convert Julian Day to Hijri date
 */
function julianDayToHijri(jd: number): Result<HijriDate> {
  const l = Math.floor(jd - HIJRI_EPOCH) + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) +
    Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;

  const month = Math.floor((24 * l3) / 709);
  const day = l3 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;

  return {
    success: true,
    data: { year, month, day },
  };
}

/**
 * Convert Hijri date to Julian Day
 */
function hijriToJulianDay(hijri: HijriDate): number {
  const { year, month, day } = hijri;

  return (
    day +
    Math.ceil(29.5 * month - 29) +
    (year - 1) * 354 +
    Math.floor((3 + 11 * year) / 30) +
    HIJRI_EPOCH -
    1
  );
}

/**
 * Validate Hijri date
 */
function validateHijriDate(hijri: HijriDate): Result<HijriDate> {
  const { year, month, day } = hijri;

  if (year < 1) {
    return {
      success: false,
      error: new Error('Year must be at least 1'),
    };
  }

  if (month < 1 || month > 12) {
    return {
      success: false,
      error: new Error('Month must be between 1 and 12'),
    };
  }

  const maxDays = getMonthLength(year, month);
  if (day < 1 || day > maxDays) {
    return {
      success: false,
      error: new Error(`Day must be between 1 and ${maxDays} for this month`),
    };
  }

  return { success: true, data: hijri };
}

/**
 * Get the number of days in a Hijri month
 */
export function getMonthLength(year: number, month: number): number {
  // Odd months have 30 days, even months have 29 days
  // Except in leap years, month 12 has 30 days
  if (month % 2 === 1) {
    return 30;
  }

  if (month === 12 && isHijriLeapYear(year)) {
    return 30;
  }

  return 29;
}

/**
 * Check if a Hijri year is a leap year
 */
export function isHijriLeapYear(year: number): boolean {
  return (11 * year + 14) % 30 < 11;
}

/**
 * Get the number of days in a Hijri year
 */
export function getYearLength(year: number): number {
  return isHijriLeapYear(year) ? 355 : 354;
}
