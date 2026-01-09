import { describe, it, expect } from 'vitest';
import {
  getYearMonths,
  addDays,
  addMonths,
  addYears,
  compareDates,
  areDatesEqual,
  getDaysDifference,
  isRamadan,
  isDhulHijjah,
  getFirstDayOfMonth,
  getLastDayOfMonth,
} from './utils';
import type { HijriDate } from './types';
import { toHijri } from './conversion';

// Known Islamic dates for testing
const ISLAMIC_NEW_YEAR_1445: HijriDate = { year: 1445, month: 1, day: 1 };
const RAMADAN_START_1445: HijriDate = { year: 1445, month: 9, day: 1 };
const _EID_AL_FITR_1445: HijriDate = { year: 1445, month: 10, day: 1 };
const EID_AL_ADHA_1445: HijriDate = { year: 1445, month: 12, day: 10 };

// All 12 Islamic month names
const ISLAMIC_MONTHS_ENGLISH = [
  'Muharram',
  'Safar',
  'Rabi al-Awwal',
  'Rabi al-Thani',
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  'Shaban',
  'Ramadan',
  'Shawwal',
  'Dhul Qadah',
  'Dhul Hijjah',
];

const ISLAMIC_MONTHS_ARABIC = [
  'محرم',
  'صفر',
  'ربيع الأول',
  'ربيع الثاني',
  'جمادى الأولى',
  'جمادى الآخرة',
  'رجب',
  'شعبان',
  'رمضان',
  'شوال',
  'ذو القعدة',
  'ذو الحجة',
];

// Note: getHijriToday uses dynamic require which has issues with ESM in Vitest.
// We test the expected behavior by directly testing with toHijri, which is what
// getHijriToday uses internally. This validates the conversion logic works correctly.
describe('getHijriToday equivalent behavior', () => {
  // Since getHijriToday internally calls toHijri(new Date()), we test
  // the conversion logic directly to validate the expected behavior.

  it('toHijri returns a valid HijriDate object for current date', () => {
    const result = toHijri(new Date());

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveProperty('year');
      expect(result.data).toHaveProperty('month');
      expect(result.data).toHaveProperty('day');
      expect(typeof result.data.year).toBe('number');
      expect(typeof result.data.month).toBe('number');
      expect(typeof result.data.day).toBe('number');
    }
  });

  it('toHijri returns a reasonable year for current date', () => {
    const result = toHijri(new Date());

    expect(result.success).toBe(true);
    if (result.success) {
      // Current Hijri year should be around 1446 (as of 2024-2025)
      expect(result.data.year).toBeGreaterThanOrEqual(1440);
      expect(result.data.year).toBeLessThanOrEqual(1500);
    }
  });

  it('toHijri returns a valid month for current date', () => {
    const result = toHijri(new Date());

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.month).toBeGreaterThanOrEqual(1);
      expect(result.data.month).toBeLessThanOrEqual(12);
    }
  });

  it('toHijri returns a valid day for current date', () => {
    const result = toHijri(new Date());

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.day).toBeGreaterThanOrEqual(1);
      expect(result.data.day).toBeLessThanOrEqual(30);
    }
  });

  it('consistently returns same result for same timestamp', () => {
    const fixedDate = new Date('2024-06-15T12:00:00Z');
    const result1 = toHijri(fixedDate);
    const result2 = toHijri(fixedDate);

    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);
    if (result1.success && result2.success) {
      expect(result1.data).toEqual(result2.data);
    }
  });
});

describe('getYearMonths', () => {
  it('returns 12 months for any year', () => {
    const months = getYearMonths(1445);
    expect(months).toHaveLength(12);
  });

  it('returns correct month numbers', () => {
    const months = getYearMonths(1445);

    for (let i = 0; i < 12; i++) {
      expect(months[i].number).toBe(i + 1);
    }
  });

  it('returns correct English month names', () => {
    const months = getYearMonths(1445);

    for (let i = 0; i < 12; i++) {
      expect(months[i].name).toBe(ISLAMIC_MONTHS_ENGLISH[i]);
    }
  });

  it('returns correct Arabic month names', () => {
    const months = getYearMonths(1445);

    for (let i = 0; i < 12; i++) {
      expect(months[i].nameArabic).toBe(ISLAMIC_MONTHS_ARABIC[i]);
    }
  });

  it('returns correct days for leap year (1445)', () => {
    const months = getYearMonths(1445);

    // Odd months have 30 days
    expect(months[0].days).toBe(30); // Muharram
    expect(months[2].days).toBe(30); // Rabi al-Awwal
    expect(months[4].days).toBe(30); // Jumada al-Awwal
    expect(months[6].days).toBe(30); // Rajab
    expect(months[8].days).toBe(30); // Ramadan
    expect(months[10].days).toBe(30); // Dhul Qadah

    // Even months have 29 days
    expect(months[1].days).toBe(29); // Safar
    expect(months[3].days).toBe(29); // Rabi al-Thani
    expect(months[5].days).toBe(29); // Jumada al-Thani
    expect(months[7].days).toBe(29); // Shaban
    expect(months[9].days).toBe(29); // Shawwal

    // Dhul Hijjah has 30 days in leap year
    expect(months[11].days).toBe(30);
  });

  it('returns correct days for non-leap year (1444)', () => {
    const months = getYearMonths(1444);

    // Dhul Hijjah has 29 days in non-leap year
    expect(months[11].days).toBe(29);
  });

  it('works for historical years', () => {
    const months = getYearMonths(1400);
    expect(months).toHaveLength(12);
    expect(months[0].name).toBe('Muharram');
  });

  it('works for future years', () => {
    const months = getYearMonths(1500);
    expect(months).toHaveLength(12);
    expect(months[11].name).toBe('Dhul Hijjah');
  });
});

describe('addDays', () => {
  describe('adding positive days', () => {
    it('adds days within the same month', () => {
      const date: HijriDate = { year: 1445, month: 1, day: 1 };
      const result = addDays(date, 5);

      expect(result.year).toBe(1445);
      expect(result.month).toBe(1);
      expect(result.day).toBe(6);
    });

    it('adds days crossing to next month', () => {
      const date: HijriDate = { year: 1445, month: 1, day: 28 };
      const result = addDays(date, 5);

      expect(result.year).toBe(1445);
      expect(result.month).toBe(2);
      expect(result.day).toBe(3);
    });

    it('adds days crossing to next year', () => {
      const date: HijriDate = { year: 1445, month: 12, day: 28 };
      const result = addDays(date, 5);

      expect(result.year).toBe(1446);
      expect(result.month).toBe(1);
    });

    it('adds days spanning multiple months', () => {
      const date: HijriDate = { year: 1445, month: 1, day: 1 };
      const result = addDays(date, 59);

      // From day 1 of Muharram, add 59 days:
      // 29 days remain in Muharram (reach day 30) + 29 days in Safar = 58 days
      // Day 59 lands on 1 Rabi al-Awwal
      expect(result.month).toBe(3);
      expect(result.day).toBe(1);
    });

    it('adds days spanning a full year', () => {
      const date: HijriDate = { year: 1445, month: 1, day: 1 };
      const result = addDays(date, 355); // 1445 is a leap year with 355 days

      expect(result.year).toBe(1446);
      expect(result.month).toBe(1);
      expect(result.day).toBe(1);
    });
  });

  describe('adding zero days', () => {
    it('returns the same date when adding 0 days', () => {
      const date: HijriDate = { year: 1445, month: 6, day: 15 };
      const result = addDays(date, 0);

      expect(result).toEqual(date);
    });
  });

  describe('subtracting days (negative)', () => {
    it('subtracts days within the same month', () => {
      const date: HijriDate = { year: 1445, month: 1, day: 10 };
      const result = addDays(date, -5);

      expect(result.year).toBe(1445);
      expect(result.month).toBe(1);
      expect(result.day).toBe(5);
    });

    it('subtracts days crossing to previous month', () => {
      const date: HijriDate = { year: 1445, month: 2, day: 3 };
      const result = addDays(date, -5);

      expect(result.year).toBe(1445);
      expect(result.month).toBe(1);
      expect(result.day).toBe(28);
    });

    it('subtracts days crossing to previous year', () => {
      const date: HijriDate = { year: 1445, month: 1, day: 3 };
      const result = addDays(date, -5);

      expect(result.year).toBe(1444);
      expect(result.month).toBe(12);
    });

    it('subtracts days spanning multiple months', () => {
      const date: HijriDate = { year: 1445, month: 3, day: 1 };
      const result = addDays(date, -30);

      // From 1 Rabi al-Awwal, subtract 30 days:
      // 1 day to reach end of Safar (day 29) + 29 more days = 30 days
      // Should land on 30 Muharram (day 30 of month 1)
      expect(result.month).toBe(1);
      expect(result.day).toBe(30);
    });
  });

  describe('edge cases', () => {
    it('handles adding from last day of month', () => {
      const date: HijriDate = { year: 1445, month: 1, day: 30 };
      const result = addDays(date, 1);

      expect(result.month).toBe(2);
      expect(result.day).toBe(1);
    });

    it('handles adding from first day of month', () => {
      const date: HijriDate = { year: 1445, month: 2, day: 1 };
      const result = addDays(date, -1);

      expect(result.month).toBe(1);
      expect(result.day).toBe(30);
    });

    it('handles large number of days', () => {
      const date: HijriDate = { year: 1445, month: 1, day: 1 };
      const result = addDays(date, 1000);

      // 1000 days from 1445 should land around year 1447 or 1448
      // (355 days in 1445 + 354 in 1446 = 709 days, so ~291 more to reach year 1447)
      expect(result.year).toBeGreaterThanOrEqual(1447);
    });
  });
});

describe('addMonths', () => {
  describe('adding positive months', () => {
    it('adds months within the same year', () => {
      const date: HijriDate = { year: 1445, month: 1, day: 15 };
      const result = addMonths(date, 3);

      expect(result.year).toBe(1445);
      expect(result.month).toBe(4);
      expect(result.day).toBe(15);
    });

    it('adds months crossing to next year', () => {
      const date: HijriDate = { year: 1445, month: 10, day: 15 };
      const result = addMonths(date, 5);

      expect(result.year).toBe(1446);
      expect(result.month).toBe(3);
      expect(result.day).toBe(15);
    });

    it('adds 12 months (full year)', () => {
      const date: HijriDate = { year: 1445, month: 6, day: 15 };
      const result = addMonths(date, 12);

      expect(result.year).toBe(1446);
      expect(result.month).toBe(6);
      expect(result.day).toBe(15);
    });

    it('adds many months spanning multiple years', () => {
      const date: HijriDate = { year: 1445, month: 1, day: 1 };
      const result = addMonths(date, 25);

      expect(result.year).toBe(1447);
      expect(result.month).toBe(2);
    });
  });

  describe('adding zero months', () => {
    it('returns the same date when adding 0 months', () => {
      const date: HijriDate = { year: 1445, month: 6, day: 15 };
      const result = addMonths(date, 0);

      expect(result).toEqual(date);
    });
  });

  describe('subtracting months (negative)', () => {
    it('subtracts months within the same year', () => {
      const date: HijriDate = { year: 1445, month: 6, day: 15 };
      const result = addMonths(date, -3);

      expect(result.year).toBe(1445);
      expect(result.month).toBe(3);
      expect(result.day).toBe(15);
    });

    it('subtracts months crossing to previous year', () => {
      const date: HijriDate = { year: 1445, month: 3, day: 15 };
      const result = addMonths(date, -5);

      expect(result.year).toBe(1444);
      expect(result.month).toBe(10);
      expect(result.day).toBe(15);
    });

    it('subtracts 12 months (full year)', () => {
      const date: HijriDate = { year: 1445, month: 6, day: 15 };
      const result = addMonths(date, -12);

      expect(result.year).toBe(1444);
      expect(result.month).toBe(6);
      expect(result.day).toBe(15);
    });
  });

  describe('day adjustment for shorter months', () => {
    it('adjusts day when target month is shorter', () => {
      // Day 30 moving to a 29-day month
      const date: HijriDate = { year: 1445, month: 1, day: 30 };
      const result = addMonths(date, 1); // Safar has 29 days

      expect(result.year).toBe(1445);
      expect(result.month).toBe(2);
      expect(result.day).toBe(29);
    });

    it('adjusts day from Dhul Hijjah in leap year to non-leap year', () => {
      // 1445 is leap year (30 days in Dhul Hijjah)
      // 1444 is non-leap year (29 days in Dhul Hijjah)
      const date: HijriDate = { year: 1445, month: 12, day: 30 };
      const result = addMonths(date, -12);

      expect(result.year).toBe(1444);
      expect(result.month).toBe(12);
      expect(result.day).toBe(29);
    });
  });
});

describe('addYears', () => {
  describe('adding positive years', () => {
    it('adds one year', () => {
      const date: HijriDate = { year: 1445, month: 6, day: 15 };
      const result = addYears(date, 1);

      expect(result.year).toBe(1446);
      expect(result.month).toBe(6);
      expect(result.day).toBe(15);
    });

    it('adds multiple years', () => {
      const date: HijriDate = { year: 1445, month: 6, day: 15 };
      const result = addYears(date, 5);

      expect(result.year).toBe(1450);
      expect(result.month).toBe(6);
      expect(result.day).toBe(15);
    });
  });

  describe('adding zero years', () => {
    it('returns the same date when adding 0 years', () => {
      const date: HijriDate = { year: 1445, month: 6, day: 15 };
      const result = addYears(date, 0);

      expect(result).toEqual(date);
    });
  });

  describe('subtracting years (negative)', () => {
    it('subtracts one year', () => {
      const date: HijriDate = { year: 1445, month: 6, day: 15 };
      const result = addYears(date, -1);

      expect(result.year).toBe(1444);
      expect(result.month).toBe(6);
      expect(result.day).toBe(15);
    });

    it('subtracts multiple years', () => {
      const date: HijriDate = { year: 1445, month: 6, day: 15 };
      const result = addYears(date, -10);

      expect(result.year).toBe(1435);
      expect(result.month).toBe(6);
      expect(result.day).toBe(15);
    });
  });

  describe('day adjustment for leap years', () => {
    it('adjusts day when moving from leap year to non-leap year in Dhul Hijjah', () => {
      // 1445 is leap year (30 days in Dhul Hijjah)
      // 1444 is non-leap year (29 days in Dhul Hijjah)
      const date: HijriDate = { year: 1445, month: 12, day: 30 };
      const result = addYears(date, -1);

      expect(result.year).toBe(1444);
      expect(result.month).toBe(12);
      expect(result.day).toBe(29);
    });

    it('preserves day when moving between leap years', () => {
      // 1445 and 1442 are both leap years
      const date: HijriDate = { year: 1445, month: 12, day: 30 };
      const result = addYears(date, -3);

      expect(result.year).toBe(1442);
      expect(result.month).toBe(12);
      expect(result.day).toBe(30);
    });
  });
});

describe('compareDates', () => {
  describe('year comparison', () => {
    it('returns -1 when first date year is earlier', () => {
      const a: HijriDate = { year: 1444, month: 6, day: 15 };
      const b: HijriDate = { year: 1445, month: 6, day: 15 };

      expect(compareDates(a, b)).toBe(-1);
    });

    it('returns 1 when first date year is later', () => {
      const a: HijriDate = { year: 1446, month: 6, day: 15 };
      const b: HijriDate = { year: 1445, month: 6, day: 15 };

      expect(compareDates(a, b)).toBe(1);
    });
  });

  describe('month comparison', () => {
    it('returns -1 when first date month is earlier', () => {
      const a: HijriDate = { year: 1445, month: 5, day: 15 };
      const b: HijriDate = { year: 1445, month: 6, day: 15 };

      expect(compareDates(a, b)).toBe(-1);
    });

    it('returns 1 when first date month is later', () => {
      const a: HijriDate = { year: 1445, month: 7, day: 15 };
      const b: HijriDate = { year: 1445, month: 6, day: 15 };

      expect(compareDates(a, b)).toBe(1);
    });
  });

  describe('day comparison', () => {
    it('returns -1 when first date day is earlier', () => {
      const a: HijriDate = { year: 1445, month: 6, day: 10 };
      const b: HijriDate = { year: 1445, month: 6, day: 15 };

      expect(compareDates(a, b)).toBe(-1);
    });

    it('returns 1 when first date day is later', () => {
      const a: HijriDate = { year: 1445, month: 6, day: 20 };
      const b: HijriDate = { year: 1445, month: 6, day: 15 };

      expect(compareDates(a, b)).toBe(1);
    });
  });

  describe('equal dates', () => {
    it('returns 0 for identical dates', () => {
      const a: HijriDate = { year: 1445, month: 6, day: 15 };
      const b: HijriDate = { year: 1445, month: 6, day: 15 };

      expect(compareDates(a, b)).toBe(0);
    });

    it('returns 0 for the same date object', () => {
      const date: HijriDate = { year: 1445, month: 6, day: 15 };

      expect(compareDates(date, date)).toBe(0);
    });
  });

  describe('significant Islamic dates', () => {
    it('compares Islamic New Year correctly', () => {
      const before: HijriDate = { year: 1444, month: 12, day: 30 };
      const newYear: HijriDate = { year: 1445, month: 1, day: 1 };

      expect(compareDates(before, newYear)).toBe(-1);
      expect(compareDates(newYear, before)).toBe(1);
    });

    it('compares Ramadan dates correctly', () => {
      const startRamadan: HijriDate = { year: 1445, month: 9, day: 1 };
      const endRamadan: HijriDate = { year: 1445, month: 9, day: 30 };

      expect(compareDates(startRamadan, endRamadan)).toBe(-1);
    });
  });
});

describe('areDatesEqual', () => {
  it('returns true for identical dates', () => {
    const a: HijriDate = { year: 1445, month: 6, day: 15 };
    const b: HijriDate = { year: 1445, month: 6, day: 15 };

    expect(areDatesEqual(a, b)).toBe(true);
  });

  it('returns true for the same date object', () => {
    const date: HijriDate = { year: 1445, month: 6, day: 15 };

    expect(areDatesEqual(date, date)).toBe(true);
  });

  it('returns false when years differ', () => {
    const a: HijriDate = { year: 1445, month: 6, day: 15 };
    const b: HijriDate = { year: 1446, month: 6, day: 15 };

    expect(areDatesEqual(a, b)).toBe(false);
  });

  it('returns false when months differ', () => {
    const a: HijriDate = { year: 1445, month: 6, day: 15 };
    const b: HijriDate = { year: 1445, month: 7, day: 15 };

    expect(areDatesEqual(a, b)).toBe(false);
  });

  it('returns false when days differ', () => {
    const a: HijriDate = { year: 1445, month: 6, day: 15 };
    const b: HijriDate = { year: 1445, month: 6, day: 16 };

    expect(areDatesEqual(a, b)).toBe(false);
  });

  it('returns true for significant Islamic dates', () => {
    expect(areDatesEqual(ISLAMIC_NEW_YEAR_1445, { year: 1445, month: 1, day: 1 })).toBe(true);
    expect(areDatesEqual(RAMADAN_START_1445, { year: 1445, month: 9, day: 1 })).toBe(true);
  });
});

describe('getDaysDifference', () => {
  it('returns 0 for the same date', () => {
    const date: HijriDate = { year: 1445, month: 6, day: 15 };

    expect(getDaysDifference(date, date)).toBe(0);
  });

  it('returns positive number when to is after from', () => {
    const from: HijriDate = { year: 1445, month: 6, day: 10 };
    const to: HijriDate = { year: 1445, month: 6, day: 15 };

    expect(getDaysDifference(from, to)).toBe(5);
  });

  it('returns negative number when to is before from', () => {
    const from: HijriDate = { year: 1445, month: 6, day: 15 };
    const to: HijriDate = { year: 1445, month: 6, day: 10 };

    expect(getDaysDifference(from, to)).toBe(-5);
  });

  it('calculates difference across months', () => {
    const from: HijriDate = { year: 1445, month: 1, day: 1 };
    const to: HijriDate = { year: 1445, month: 2, day: 1 };

    // Muharram has 30 days
    expect(getDaysDifference(from, to)).toBe(30);
  });

  it('calculates difference across years', () => {
    const from: HijriDate = { year: 1445, month: 1, day: 1 };
    const to: HijriDate = { year: 1446, month: 1, day: 1 };

    // 1445 is a leap year with 355 days
    expect(getDaysDifference(from, to)).toBe(355);
  });

  it('calculates difference for a full month (Ramadan)', () => {
    const from: HijriDate = { year: 1445, month: 9, day: 1 };
    const to: HijriDate = { year: 1445, month: 10, day: 1 };

    // Ramadan has 30 days (odd month)
    expect(getDaysDifference(from, to)).toBe(30);
  });

  it('calculates difference between Eid dates', () => {
    const eidFitr: HijriDate = { year: 1445, month: 10, day: 1 };
    const eidAdha: HijriDate = { year: 1445, month: 12, day: 10 };

    // Shawwal (29) + Dhul Qadah (30) + 9 days = 68 days
    expect(getDaysDifference(eidFitr, eidAdha)).toBe(68);
  });
});

describe('isRamadan', () => {
  it('returns true for dates in Ramadan (month 9)', () => {
    expect(isRamadan({ year: 1445, month: 9, day: 1 })).toBe(true);
    expect(isRamadan({ year: 1445, month: 9, day: 15 })).toBe(true);
    expect(isRamadan({ year: 1445, month: 9, day: 30 })).toBe(true);
  });

  it('returns false for dates not in Ramadan', () => {
    expect(isRamadan({ year: 1445, month: 1, day: 1 })).toBe(false);
    expect(isRamadan({ year: 1445, month: 8, day: 30 })).toBe(false);
    expect(isRamadan({ year: 1445, month: 10, day: 1 })).toBe(false);
    expect(isRamadan({ year: 1445, month: 12, day: 10 })).toBe(false);
  });

  it('returns true for Ramadan in different years', () => {
    expect(isRamadan({ year: 1444, month: 9, day: 1 })).toBe(true);
    expect(isRamadan({ year: 1446, month: 9, day: 1 })).toBe(true);
    expect(isRamadan({ year: 1500, month: 9, day: 1 })).toBe(true);
  });

  it('correctly identifies Laylat al-Qadr date as Ramadan', () => {
    expect(isRamadan({ year: 1445, month: 9, day: 27 })).toBe(true);
  });
});

describe('isDhulHijjah', () => {
  it('returns true for dates in Dhul Hijjah (month 12)', () => {
    expect(isDhulHijjah({ year: 1445, month: 12, day: 1 })).toBe(true);
    expect(isDhulHijjah({ year: 1445, month: 12, day: 9 })).toBe(true);
    expect(isDhulHijjah({ year: 1445, month: 12, day: 10 })).toBe(true);
    expect(isDhulHijjah({ year: 1445, month: 12, day: 30 })).toBe(true);
  });

  it('returns false for dates not in Dhul Hijjah', () => {
    expect(isDhulHijjah({ year: 1445, month: 1, day: 1 })).toBe(false);
    expect(isDhulHijjah({ year: 1445, month: 9, day: 1 })).toBe(false);
    expect(isDhulHijjah({ year: 1445, month: 11, day: 30 })).toBe(false);
  });

  it('returns true for Dhul Hijjah in different years', () => {
    expect(isDhulHijjah({ year: 1444, month: 12, day: 10 })).toBe(true);
    expect(isDhulHijjah({ year: 1446, month: 12, day: 10 })).toBe(true);
  });

  it('correctly identifies Day of Arafah', () => {
    expect(isDhulHijjah({ year: 1445, month: 12, day: 9 })).toBe(true);
  });

  it('correctly identifies Eid al-Adha', () => {
    expect(isDhulHijjah(EID_AL_ADHA_1445)).toBe(true);
  });

  it('correctly identifies Days of Tashreeq', () => {
    expect(isDhulHijjah({ year: 1445, month: 12, day: 11 })).toBe(true);
    expect(isDhulHijjah({ year: 1445, month: 12, day: 12 })).toBe(true);
    expect(isDhulHijjah({ year: 1445, month: 12, day: 13 })).toBe(true);
  });
});

describe('getFirstDayOfMonth', () => {
  it('returns first day of Muharram', () => {
    const result = getFirstDayOfMonth(1445, 1);

    expect(result).toEqual({ year: 1445, month: 1, day: 1 });
  });

  it('returns first day of Ramadan', () => {
    const result = getFirstDayOfMonth(1445, 9);

    expect(result).toEqual({ year: 1445, month: 9, day: 1 });
  });

  it('returns first day of Dhul Hijjah', () => {
    const result = getFirstDayOfMonth(1445, 12);

    expect(result).toEqual({ year: 1445, month: 12, day: 1 });
  });

  it('returns first day for all 12 months', () => {
    for (let month = 1; month <= 12; month++) {
      const result = getFirstDayOfMonth(1445, month);
      expect(result.year).toBe(1445);
      expect(result.month).toBe(month);
      expect(result.day).toBe(1);
    }
  });

  it('works for different years', () => {
    expect(getFirstDayOfMonth(1400, 1)).toEqual({ year: 1400, month: 1, day: 1 });
    expect(getFirstDayOfMonth(1500, 1)).toEqual({ year: 1500, month: 1, day: 1 });
  });
});

describe('getLastDayOfMonth', () => {
  it('returns last day of Muharram (30 days)', () => {
    const result = getLastDayOfMonth(1445, 1);

    expect(result).toEqual({ year: 1445, month: 1, day: 30 });
  });

  it('returns last day of Safar (29 days)', () => {
    const result = getLastDayOfMonth(1445, 2);

    expect(result).toEqual({ year: 1445, month: 2, day: 29 });
  });

  it('returns last day of Ramadan (30 days)', () => {
    const result = getLastDayOfMonth(1445, 9);

    expect(result).toEqual({ year: 1445, month: 9, day: 30 });
  });

  it('returns last day of Dhul Hijjah in leap year (30 days)', () => {
    // 1445 is a leap year
    const result = getLastDayOfMonth(1445, 12);

    expect(result).toEqual({ year: 1445, month: 12, day: 30 });
  });

  it('returns last day of Dhul Hijjah in non-leap year (29 days)', () => {
    // 1444 is not a leap year
    const result = getLastDayOfMonth(1444, 12);

    expect(result).toEqual({ year: 1444, month: 12, day: 29 });
  });

  it('returns correct last day for all odd months (30 days)', () => {
    const oddMonths = [1, 3, 5, 7, 9, 11];
    for (const month of oddMonths) {
      const result = getLastDayOfMonth(1445, month);
      expect(result.day).toBe(30);
    }
  });

  it('returns correct last day for even months except Dhul Hijjah (29 days)', () => {
    const evenMonths = [2, 4, 6, 8, 10];
    for (const month of evenMonths) {
      const result = getLastDayOfMonth(1445, month);
      expect(result.day).toBe(29);
    }
  });
});

describe('integration tests', () => {
  it('adding then subtracting returns original date', () => {
    const original: HijriDate = { year: 1445, month: 6, day: 15 };

    let result = addDays(original, 100);
    result = addDays(result, -100);

    expect(areDatesEqual(result, original)).toBe(true);
  });

  it('adding 12 months equals adding 1 year (for most dates)', () => {
    const original: HijriDate = { year: 1445, month: 6, day: 15 };

    const byMonths = addMonths(original, 12);
    const byYears = addYears(original, 1);

    expect(areDatesEqual(byMonths, byYears)).toBe(true);
  });

  it('first and last day difference equals month length minus 1', () => {
    for (let month = 1; month <= 12; month++) {
      const first = getFirstDayOfMonth(1445, month);
      const last = getLastDayOfMonth(1445, month);
      const diff = getDaysDifference(first, last);

      // Difference should be (month length - 1)
      expect(diff).toBe(last.day - 1);
    }
  });

  it('comparing first and last day of month returns correct order', () => {
    const first = getFirstDayOfMonth(1445, 9);
    const last = getLastDayOfMonth(1445, 9);

    expect(compareDates(first, last)).toBe(-1);
    expect(compareDates(last, first)).toBe(1);
    expect(areDatesEqual(first, last)).toBe(false);
  });

  it('adding days from first day reaches last day correctly', () => {
    const first = getFirstDayOfMonth(1445, 1);
    const monthLength = 30; // Muharram has 30 days
    const result = addDays(first, monthLength - 1);

    const last = getLastDayOfMonth(1445, 1);
    expect(areDatesEqual(result, last)).toBe(true);
  });

  it('Ramadan check works with addDays', () => {
    const lastShaban: HijriDate = { year: 1445, month: 8, day: 29 };
    const firstRamadan = addDays(lastShaban, 1);

    expect(isRamadan(lastShaban)).toBe(false);
    expect(isRamadan(firstRamadan)).toBe(true);
  });

  it('getDaysDifference is consistent with addDays', () => {
    const from: HijriDate = { year: 1445, month: 1, day: 1 };
    const to: HijriDate = { year: 1445, month: 3, day: 15 };

    const diff = getDaysDifference(from, to);
    const result = addDays(from, diff);

    expect(areDatesEqual(result, to)).toBe(true);
  });
});
