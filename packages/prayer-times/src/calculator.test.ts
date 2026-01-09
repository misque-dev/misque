import { describe, it, expect } from 'vitest';
import {
  calculatePrayerTimes,
  getDefaultParams,
  formatPrayerTimes,
  getCurrentPrayer,
} from './calculator';
import type { PrayerLocation, PrayerTimes } from './types';

describe('calculatePrayerTimes', () => {
  const london: PrayerLocation = {
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: 'Europe/London',
  };

  const mecca: PrayerLocation = {
    latitude: 21.4225,
    longitude: 39.8262,
    timezone: 'Asia/Riyadh',
  };

  it('calculates prayer times for London', () => {
    const date = new Date(2024, 5, 15); // June 15, 2024
    const params = getDefaultParams();
    const result = calculatePrayerTimes(date, london, params);

    expect(result.success).toBe(true);
    if (result.success) {
      const times = result.data;

      // All prayer times should be valid Date objects
      expect(times.fajr).toBeInstanceOf(Date);
      expect(times.sunrise).toBeInstanceOf(Date);
      expect(times.dhuhr).toBeInstanceOf(Date);
      expect(times.asr).toBeInstanceOf(Date);
      expect(times.maghrib).toBeInstanceOf(Date);
      expect(times.isha).toBeInstanceOf(Date);

      // All times should be on the same day
      expect(times.dhuhr.getDate()).toBe(date.getDate());
    }
  });

  it('calculates prayer times for Mecca', () => {
    const date = new Date(2024, 0, 1); // January 1, 2024
    const params = getDefaultParams();
    const result = calculatePrayerTimes(date, mecca, params);

    expect(result.success).toBe(true);
    if (result.success) {
      const times = result.data;

      // All prayer times should be valid Date objects
      expect(times.fajr).toBeInstanceOf(Date);
      expect(times.sunrise).toBeInstanceOf(Date);
      expect(times.dhuhr).toBeInstanceOf(Date);
      expect(times.asr).toBeInstanceOf(Date);
      expect(times.maghrib).toBeInstanceOf(Date);
      expect(times.isha).toBeInstanceOf(Date);

      // Dhuhr should be around midday
      expect(times.dhuhr.getDate()).toBe(date.getDate());
    }
  });

  it('handles winter dates correctly', () => {
    const date = new Date(2024, 11, 21); // December 21, 2024 (winter solstice)
    const params = getDefaultParams();
    const result = calculatePrayerTimes(date, london, params);

    expect(result.success).toBe(true);
    if (result.success) {
      const times = result.data;

      // Fajr should be later in winter
      expect(times.fajr.getHours()).toBeGreaterThanOrEqual(5);

      // Maghrib should be early in winter
      expect(times.maghrib.getHours()).toBeLessThanOrEqual(17);
    }
  });
});

describe('formatPrayerTimes', () => {
  const mockTimes: PrayerTimes = {
    fajr: new Date(2024, 0, 1, 5, 30),
    sunrise: new Date(2024, 0, 1, 7, 15),
    dhuhr: new Date(2024, 0, 1, 12, 30),
    asr: new Date(2024, 0, 1, 15, 45),
    maghrib: new Date(2024, 0, 1, 17, 30),
    isha: new Date(2024, 0, 1, 19, 0),
  };

  it('formats times in 24-hour format', () => {
    const formatted = formatPrayerTimes(mockTimes, true);

    expect(formatted.fajr).toBe('05:30');
    expect(formatted.dhuhr).toBe('12:30');
    expect(formatted.asr).toBe('15:45');
  });

  it('formats times in 12-hour format', () => {
    const formatted = formatPrayerTimes(mockTimes, false);

    expect(formatted.fajr).toBe('5:30 AM');
    expect(formatted.dhuhr).toBe('12:30 PM');
    expect(formatted.asr).toBe('3:45 PM');
  });
});

describe('getCurrentPrayer', () => {
  const mockTimes: PrayerTimes = {
    fajr: new Date(2024, 0, 1, 5, 30),
    sunrise: new Date(2024, 0, 1, 7, 15),
    dhuhr: new Date(2024, 0, 1, 12, 30),
    asr: new Date(2024, 0, 1, 15, 45),
    maghrib: new Date(2024, 0, 1, 17, 30),
    isha: new Date(2024, 0, 1, 19, 0),
  };

  it('identifies current prayer as Fajr in the morning', () => {
    const now = new Date(2024, 0, 1, 6, 0);
    const result = getCurrentPrayer(mockTimes, now);

    expect(result.current).toBe('fajr');
    expect(result.next).toBe('sunrise');
  });

  it('identifies current prayer as Dhuhr at noon', () => {
    const now = new Date(2024, 0, 1, 13, 0);
    const result = getCurrentPrayer(mockTimes, now);

    expect(result.current).toBe('dhuhr');
    expect(result.next).toBe('asr');
  });

  it('identifies current prayer as Isha at night', () => {
    const now = new Date(2024, 0, 1, 20, 0);
    const result = getCurrentPrayer(mockTimes, now);

    expect(result.current).toBe('isha');
    expect(result.next).toBe('fajr');
  });

  it('calculates time until next prayer', () => {
    const now = new Date(2024, 0, 1, 12, 0);
    const result = getCurrentPrayer(mockTimes, now);

    // 30 minutes until Dhuhr at 12:30
    expect(result.timeUntilNext).toBe(30);
  });
});

describe('getDefaultParams', () => {
  it('returns default calculation parameters', () => {
    const params = getDefaultParams();

    expect(params.method.name).toBe('MWL');
    expect(params.asrMethod).toBe('Standard');
    expect(params.highLatitudeMethod).toBe('NightMiddle');
  });
});

describe('new calculation methods', () => {
  const dubai: PrayerLocation = {
    latitude: 25.2048,
    longitude: 55.2708,
    timezone: 'Asia/Dubai',
  };

  const singapore: PrayerLocation = {
    latitude: 1.3521,
    longitude: 103.8198,
    timezone: 'Asia/Singapore',
  };

  const istanbul: PrayerLocation = {
    latitude: 41.0082,
    longitude: 28.9784,
    timezone: 'Europe/Istanbul',
  };

  it('calculates prayer times with Dubai method', () => {
    const date = new Date(2024, 0, 1);
    const params = { ...getDefaultParams() };
    params.method = {
      name: 'Dubai' as const,
      fajrAngle: 18.2,
      ishaAngle: 18.2,
      methodAdjustments: {
        sunrise: -3,
        dhuhr: 3,
        asr: 3,
        maghrib: 3,
      },
    };
    const result = calculatePrayerTimes(date, dubai, params);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.fajr).toBeInstanceOf(Date);
      expect(result.data.isha).toBeInstanceOf(Date);
    }
  });

  it('calculates prayer times with Singapore method', () => {
    const date = new Date(2024, 0, 1);
    const params = { ...getDefaultParams() };
    params.method = {
      name: 'Singapore' as const,
      fajrAngle: 20,
      ishaAngle: 18,
      methodAdjustments: { dhuhr: 1 },
      rounding: 'up',
    };
    const result = calculatePrayerTimes(date, singapore, params);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.fajr).toBeInstanceOf(Date);
    }
  });

  it('calculates prayer times with Turkey method', () => {
    const date = new Date(2024, 0, 1);
    const params = { ...getDefaultParams() };
    params.method = {
      name: 'Turkey' as const,
      fajrAngle: 18,
      ishaAngle: 17,
      methodAdjustments: {
        sunrise: -7,
        dhuhr: 5,
        asr: 4,
        maghrib: 7,
      },
    };
    const result = calculatePrayerTimes(date, istanbul, params);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.fajr).toBeInstanceOf(Date);
      expect(result.data.isha).toBeInstanceOf(Date);
    }
  });

  it('calculates prayer times with Qatar method (interval-based Isha)', () => {
    const doha: PrayerLocation = {
      latitude: 25.2854,
      longitude: 51.531,
      timezone: 'Asia/Qatar',
    };
    const date = new Date(2024, 0, 1);
    const params = { ...getDefaultParams() };
    params.method = {
      name: 'Qatar' as const,
      fajrAngle: 18,
      ishaAngle: 0,
      ishaInterval: 90, // 90 minutes after Maghrib
    };
    const result = calculatePrayerTimes(date, doha, params);

    expect(result.success).toBe(true);
    if (result.success) {
      // Isha should be 90 minutes after Maghrib
      const maghribMs = result.data.maghrib.getTime();
      const ishaMs = result.data.isha.getTime();
      const diffMinutes = (ishaMs - maghribMs) / (1000 * 60);
      expect(diffMinutes).toBeCloseTo(90, 0);
    }
  });
});
