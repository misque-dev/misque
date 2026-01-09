import { describe, it, expect } from 'vitest';
import {
  getHijriDateInfo,
  formatHijri,
  formatHijriArabic,
  getMonthName,
} from './format';
import type { HijriDate } from './types';

// Known Islamic dates for testing
const ISLAMIC_NEW_YEAR_1445: HijriDate = { year: 1445, month: 1, day: 1 };
const RAMADAN_START_1445: HijriDate = { year: 1445, month: 9, day: 1 };
const EID_AL_FITR_1445: HijriDate = { year: 1445, month: 10, day: 1 };
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

describe('getHijriDateInfo', () => {
  it('returns correct info for Islamic New Year', () => {
    const info = getHijriDateInfo(ISLAMIC_NEW_YEAR_1445);

    expect(info.year).toBe(1445);
    expect(info.month).toBe(1);
    expect(info.day).toBe(1);
    expect(info.monthName).toBe('Muharram');
    expect(info.monthNameArabic).toBe('محرم');
    expect(info.isLeapYear).toBe(true); // 1445 is a leap year
  });

  it('returns correct info for start of Ramadan', () => {
    const info = getHijriDateInfo(RAMADAN_START_1445);

    expect(info.year).toBe(1445);
    expect(info.month).toBe(9);
    expect(info.day).toBe(1);
    expect(info.monthName).toBe('Ramadan');
    expect(info.monthNameArabic).toBe('رمضان');
  });

  it('returns correct info for Eid al-Fitr', () => {
    const info = getHijriDateInfo(EID_AL_FITR_1445);

    expect(info.monthName).toBe('Shawwal');
    expect(info.monthNameArabic).toBe('شوال');
  });

  it('returns correct info for Eid al-Adha', () => {
    const info = getHijriDateInfo(EID_AL_ADHA_1445);

    expect(info.day).toBe(10);
    expect(info.monthName).toBe('Dhul Hijjah');
    expect(info.monthNameArabic).toBe('ذو الحجة');
  });

  it('includes day of week information', () => {
    const info = getHijriDateInfo(ISLAMIC_NEW_YEAR_1445);

    expect(info.dayOfWeek).toBeGreaterThanOrEqual(0);
    expect(info.dayOfWeek).toBeLessThanOrEqual(6);
    expect(info.dayOfWeekName).toBeTruthy();
    expect(info.dayOfWeekNameArabic).toBeTruthy();
  });

  it('returns English day of week names', () => {
    const validDayNames = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const info = getHijriDateInfo(ISLAMIC_NEW_YEAR_1445);

    expect(validDayNames).toContain(info.dayOfWeekName);
  });

  it('returns Arabic day of week names', () => {
    const validDayNamesAr = [
      'الأحد',
      'الإثنين',
      'الثلاثاء',
      'الأربعاء',
      'الخميس',
      'الجمعة',
      'السبت',
    ];
    const info = getHijriDateInfo(ISLAMIC_NEW_YEAR_1445);

    expect(validDayNamesAr).toContain(info.dayOfWeekNameArabic);
  });

  it('correctly identifies leap years', () => {
    // 1445 is a leap year
    const leapYearInfo = getHijriDateInfo({ year: 1445, month: 1, day: 1 });
    expect(leapYearInfo.isLeapYear).toBe(true);

    // 1444 is not a leap year
    const nonLeapYearInfo = getHijriDateInfo({ year: 1444, month: 1, day: 1 });
    expect(nonLeapYearInfo.isLeapYear).toBe(false);
  });

  it('handles all 12 months correctly', () => {
    for (let month = 1; month <= 12; month++) {
      const info = getHijriDateInfo({ year: 1445, month, day: 1 });
      expect(info.monthName).toBe(ISLAMIC_MONTHS_ENGLISH[month - 1]);
      expect(info.monthNameArabic).toBe(ISLAMIC_MONTHS_ARABIC[month - 1]);
    }
  });

  it('handles mid-month dates', () => {
    const info = getHijriDateInfo({ year: 1445, month: 6, day: 15 });

    expect(info.year).toBe(1445);
    expect(info.month).toBe(6);
    expect(info.day).toBe(15);
    expect(info.monthName).toBe('Jumada al-Thani');
  });

  it('handles last day of month', () => {
    const info = getHijriDateInfo({ year: 1445, month: 1, day: 30 });

    expect(info.day).toBe(30);
    expect(info.monthName).toBe('Muharram');
  });
});

describe('formatHijri', () => {
  describe('short style', () => {
    it('formats date in short style with year', () => {
      const result = formatHijri(ISLAMIC_NEW_YEAR_1445, { style: 'short' });
      expect(result).toBe('1/1/1445');
    });

    it('formats date in short style without year', () => {
      const result = formatHijri(ISLAMIC_NEW_YEAR_1445, {
        style: 'short',
        includeYear: false,
      });
      expect(result).toBe('1/1');
    });

    it('formats double-digit day and month', () => {
      const date: HijriDate = { year: 1445, month: 12, day: 25 };
      const result = formatHijri(date, { style: 'short' });
      expect(result).toBe('25/12/1445');
    });
  });

  describe('medium style (default)', () => {
    it('formats date in medium style with year', () => {
      const result = formatHijri(ISLAMIC_NEW_YEAR_1445);
      expect(result).toBe('1 Muharram 1445');
    });

    it('formats date in medium style without year', () => {
      const result = formatHijri(ISLAMIC_NEW_YEAR_1445, { includeYear: false });
      expect(result).toBe('1 Muharram');
    });

    it('formats Ramadan date', () => {
      const result = formatHijri(RAMADAN_START_1445, { style: 'medium' });
      expect(result).toBe('1 Ramadan 1445');
    });
  });

  describe('long style', () => {
    it('formats date in long style with AH suffix', () => {
      const result = formatHijri(ISLAMIC_NEW_YEAR_1445, { style: 'long' });
      expect(result).toBe('1 Muharram 1445 AH');
    });

    it('formats date in long style without year', () => {
      const result = formatHijri(ISLAMIC_NEW_YEAR_1445, {
        style: 'long',
        includeYear: false,
      });
      expect(result).toBe('1 Muharram');
    });

    it('formats Eid al-Adha date', () => {
      const result = formatHijri(EID_AL_ADHA_1445, { style: 'long' });
      expect(result).toBe('10 Dhul Hijjah 1445 AH');
    });
  });

  describe('full style', () => {
    it('formats date in full style without day of week', () => {
      const result = formatHijri(ISLAMIC_NEW_YEAR_1445, { style: 'full' });
      expect(result).toBe('1 Muharram 1445 AH');
    });

    it('formats date in full style with day of week', () => {
      const result = formatHijri(ISLAMIC_NEW_YEAR_1445, {
        style: 'full',
        includeDayOfWeek: true,
      });
      // Should include day name followed by comma
      expect(result).toMatch(/^\w+day, 1 Muharram 1445 AH$/);
    });

    it('formats date in full style without year', () => {
      const result = formatHijri(ISLAMIC_NEW_YEAR_1445, {
        style: 'full',
        includeYear: false,
      });
      expect(result).toBe('1 Muharram');
    });
  });

  describe('day of week option', () => {
    it('includes day of week in short style', () => {
      const result = formatHijri(ISLAMIC_NEW_YEAR_1445, {
        style: 'short',
        includeDayOfWeek: true,
      });
      expect(result).toMatch(/^\w+day, 1\/1\/1445$/);
    });

    it('includes day of week in medium style', () => {
      const result = formatHijri(ISLAMIC_NEW_YEAR_1445, {
        style: 'medium',
        includeDayOfWeek: true,
      });
      expect(result).toMatch(/^\w+day, 1 Muharram 1445$/);
    });

    it('includes day of week in long style', () => {
      const result = formatHijri(ISLAMIC_NEW_YEAR_1445, {
        style: 'long',
        includeDayOfWeek: true,
      });
      expect(result).toMatch(/^\w+day, 1 Muharram 1445 AH$/);
    });
  });

  describe('Arabic formatting', () => {
    it('formats with Arabic month name in medium style', () => {
      const result = formatHijri(ISLAMIC_NEW_YEAR_1445, {
        style: 'medium',
        useArabic: true,
      });
      expect(result).toBe('1 محرم 1445');
    });

    it('formats with Arabic month name in long style', () => {
      const result = formatHijri(ISLAMIC_NEW_YEAR_1445, {
        style: 'long',
        useArabic: true,
      });
      expect(result).toBe('1 محرم 1445 AH');
    });

    it('formats Ramadan in Arabic', () => {
      const result = formatHijri(RAMADAN_START_1445, {
        style: 'medium',
        useArabic: true,
      });
      expect(result).toBe('1 رمضان 1445');
    });

    it('includes Arabic day of week', () => {
      const result = formatHijri(ISLAMIC_NEW_YEAR_1445, {
        style: 'full',
        useArabic: true,
        includeDayOfWeek: true,
      });
      // Should include Arabic day name
      expect(result).toContain('محرم');
    });
  });

  describe('default options', () => {
    it('uses medium style by default', () => {
      const result = formatHijri(ISLAMIC_NEW_YEAR_1445);
      expect(result).toBe('1 Muharram 1445');
    });

    it('includes year by default', () => {
      const result = formatHijri(ISLAMIC_NEW_YEAR_1445);
      expect(result).toContain('1445');
    });

    it('does not include day of week by default', () => {
      const result = formatHijri(ISLAMIC_NEW_YEAR_1445);
      expect(result).not.toMatch(/day,/);
    });

    it('uses English by default', () => {
      const result = formatHijri(ISLAMIC_NEW_YEAR_1445);
      expect(result).toContain('Muharram');
      expect(result).not.toContain('محرم');
    });
  });
});

describe('formatHijriArabic', () => {
  it('formats date in Arabic long style', () => {
    const result = formatHijriArabic(ISLAMIC_NEW_YEAR_1445);
    expect(result).toBe('1 محرم 1445 AH');
  });

  it('formats Ramadan date in Arabic', () => {
    const result = formatHijriArabic(RAMADAN_START_1445);
    expect(result).toBe('1 رمضان 1445 AH');
  });

  it('formats Eid al-Fitr date in Arabic', () => {
    const result = formatHijriArabic(EID_AL_FITR_1445);
    expect(result).toBe('1 شوال 1445 AH');
  });

  it('formats Eid al-Adha date in Arabic', () => {
    const result = formatHijriArabic(EID_AL_ADHA_1445);
    expect(result).toBe('10 ذو الحجة 1445 AH');
  });

  it('formats all months in Arabic', () => {
    for (let month = 1; month <= 12; month++) {
      const date: HijriDate = { year: 1445, month, day: 1 };
      const result = formatHijriArabic(date);
      expect(result).toContain(ISLAMIC_MONTHS_ARABIC[month - 1]);
    }
  });
});

describe('getMonthName', () => {
  describe('English month names', () => {
    it('returns correct name for all 12 months', () => {
      for (let month = 1; month <= 12; month++) {
        const result = getMonthName(month);
        expect(result).toBe(ISLAMIC_MONTHS_ENGLISH[month - 1]);
      }
    });

    it('returns Muharram for month 1', () => {
      expect(getMonthName(1)).toBe('Muharram');
    });

    it('returns Ramadan for month 9', () => {
      expect(getMonthName(9)).toBe('Ramadan');
    });

    it('returns Dhul Hijjah for month 12', () => {
      expect(getMonthName(12)).toBe('Dhul Hijjah');
    });
  });

  describe('Arabic month names', () => {
    it('returns correct Arabic name for all 12 months', () => {
      for (let month = 1; month <= 12; month++) {
        const result = getMonthName(month, true);
        expect(result).toBe(ISLAMIC_MONTHS_ARABIC[month - 1]);
      }
    });

    it('returns محرم for month 1', () => {
      expect(getMonthName(1, true)).toBe('محرم');
    });

    it('returns رمضان for month 9', () => {
      expect(getMonthName(9, true)).toBe('رمضان');
    });

    it('returns ذو الحجة for month 12', () => {
      expect(getMonthName(12, true)).toBe('ذو الحجة');
    });
  });

  describe('boundary conditions', () => {
    it('returns empty string for month 0', () => {
      expect(getMonthName(0)).toBe('');
    });

    it('returns empty string for month 13', () => {
      expect(getMonthName(13)).toBe('');
    });

    it('returns empty string for negative month', () => {
      expect(getMonthName(-1)).toBe('');
    });

    it('returns empty string for month 100', () => {
      expect(getMonthName(100)).toBe('');
    });

    it('returns empty string for month 0 in Arabic', () => {
      expect(getMonthName(0, true)).toBe('');
    });

    it('returns empty string for month 13 in Arabic', () => {
      expect(getMonthName(13, true)).toBe('');
    });
  });

  describe('default language parameter', () => {
    it('defaults to English when arabic parameter is not provided', () => {
      expect(getMonthName(1)).toBe('Muharram');
      expect(getMonthName(1, false)).toBe('Muharram');
    });
  });
});

describe('Islamic calendar significant dates', () => {
  it('formats Islamic New Year correctly', () => {
    const date: HijriDate = { year: 1446, month: 1, day: 1 };
    const result = formatHijri(date, { style: 'long' });
    expect(result).toBe('1 Muharram 1446 AH');
  });

  it('formats Ashura (10th Muharram) correctly', () => {
    const date: HijriDate = { year: 1445, month: 1, day: 10 };
    const result = formatHijri(date, { style: 'long' });
    expect(result).toBe('10 Muharram 1445 AH');
  });

  it('formats Mawlid (12th Rabi al-Awwal) correctly', () => {
    const date: HijriDate = { year: 1445, month: 3, day: 12 };
    const result = formatHijri(date, { style: 'long' });
    expect(result).toBe('12 Rabi al-Awwal 1445 AH');
  });

  it('formats Laylat al-Qadr (27th Ramadan) correctly', () => {
    const date: HijriDate = { year: 1445, month: 9, day: 27 };
    const result = formatHijri(date, { style: 'long' });
    expect(result).toBe('27 Ramadan 1445 AH');
  });

  it('formats Day of Arafah (9th Dhul Hijjah) correctly', () => {
    const date: HijriDate = { year: 1445, month: 12, day: 9 };
    const result = formatHijri(date, { style: 'long' });
    expect(result).toBe('9 Dhul Hijjah 1445 AH');
  });
});
