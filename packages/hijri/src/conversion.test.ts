import { describe, it, expect } from 'vitest';
import {
  toHijri,
  toGregorian,
  gregorianToHijri,
  hijriToGregorian,
  getMonthLength,
  isHijriLeapYear,
  getYearLength,
} from './conversion';

describe('toHijri', () => {
  it('converts January 1, 2024 to Hijri', () => {
    const date = new Date(Date.UTC(2024, 0, 1));
    const result = toHijri(date);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.year).toBe(1445);
      expect(result.data.month).toBe(6);
      // Day may vary slightly based on algorithm
      expect(result.data.day).toBeGreaterThan(15);
      expect(result.data.day).toBeLessThan(25);
    }
  });

  it('converts Islamic New Year 1445', () => {
    // 1 Muharram 1445 is approximately July 19, 2023
    const date = new Date(Date.UTC(2023, 6, 19));
    const result = toHijri(date);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.year).toBe(1445);
      expect(result.data.month).toBe(1);
    }
  });
});

describe('toGregorian', () => {
  it('converts 1 Muharram 1445 to Gregorian', () => {
    const result = toGregorian({ year: 1445, month: 1, day: 1 });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.getUTCFullYear()).toBe(2023);
      expect(result.data.getUTCMonth()).toBe(6); // July
    }
  });

  it('returns error for invalid Hijri date', () => {
    const result = toGregorian({ year: 1445, month: 13, day: 1 });
    expect(result.success).toBe(false);
  });

  it('returns error for invalid day', () => {
    const result = toGregorian({ year: 1445, month: 2, day: 31 });
    expect(result.success).toBe(false);
  });
});

describe('gregorianToHijri', () => {
  it('converts Gregorian components', () => {
    const result = gregorianToHijri(2024, 1, 1);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.year).toBe(1445);
    }
  });
});

describe('hijriToGregorian', () => {
  it('converts Hijri components', () => {
    const result = hijriToGregorian(1445, 1, 1);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.year).toBe(2023);
    }
  });
});

describe('getMonthLength', () => {
  it('returns 30 for odd months', () => {
    expect(getMonthLength(1445, 1)).toBe(30);
    expect(getMonthLength(1445, 3)).toBe(30);
    expect(getMonthLength(1445, 5)).toBe(30);
  });

  it('returns 29 for even months in non-leap year', () => {
    // 1444 is not a leap year (11*1444+14) % 30 = 28 >= 11
    expect(getMonthLength(1444, 2)).toBe(29);
    expect(getMonthLength(1444, 4)).toBe(29);
  });

  it('returns 30 for Dhul Hijjah in leap year', () => {
    // 1445 is a leap year (11*1445+14) % 30 = 9 < 11
    expect(getMonthLength(1445, 12)).toBe(30);
  });
});

describe('isHijriLeapYear', () => {
  it('identifies leap years correctly', () => {
    // Leap years are when (11 * year + 14) % 30 < 11
    // 1442: (11*1442+14) % 30 = 6 < 11 → leap year
    // 1443: (11*1443+14) % 30 = 17 >= 11 → not leap
    // 1444: (11*1444+14) % 30 = 28 >= 11 → not leap
    // 1445: (11*1445+14) % 30 = 9 < 11 → leap year
    expect(isHijriLeapYear(1442)).toBe(true);
    expect(isHijriLeapYear(1443)).toBe(false);
    expect(isHijriLeapYear(1444)).toBe(false);
    expect(isHijriLeapYear(1445)).toBe(true);
  });
});

describe('getYearLength', () => {
  it('returns 355 for leap years', () => {
    expect(getYearLength(1445)).toBe(355);
  });

  it('returns 354 for non-leap years', () => {
    expect(getYearLength(1444)).toBe(354);
  });
});
