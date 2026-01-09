import { describe, it, expect } from 'vitest';
import {
  calculateSunnahTimes,
  getNightDuration,
  getNightPortion,
  isLastThirdOfNight,
  getQiyamTimeRange,
} from './sunnah';
import type { PrayerTimes } from './types';

describe('calculateSunnahTimes', () => {
  const mockTimes: PrayerTimes = {
    fajr: new Date(2024, 0, 1, 5, 30),
    sunrise: new Date(2024, 0, 1, 7, 15),
    dhuhr: new Date(2024, 0, 1, 12, 30),
    asr: new Date(2024, 0, 1, 15, 45),
    maghrib: new Date(2024, 0, 1, 17, 30),
    isha: new Date(2024, 0, 1, 19, 0),
  };

  const tomorrowFajr = new Date(2024, 0, 2, 5, 30);

  it('calculates middle of the night correctly', () => {
    const sunnah = calculateSunnahTimes(mockTimes, tomorrowFajr);

    // Night is 12 hours (17:30 to 5:30)
    // Middle should be at 23:30
    expect(sunnah.middleOfTheNight.getHours()).toBe(23);
    expect(sunnah.middleOfTheNight.getMinutes()).toBe(30);
  });

  it('calculates last third of the night correctly', () => {
    const sunnah = calculateSunnahTimes(mockTimes, tomorrowFajr);

    // Night is 12 hours
    // Last third starts at 2/3 of the way = 8 hours from maghrib
    // 17:30 + 8 hours = 1:30 AM
    expect(sunnah.lastThirdOfTheNight.getHours()).toBe(1);
    expect(sunnah.lastThirdOfTheNight.getMinutes()).toBe(30);
  });
});

describe('getNightDuration', () => {
  it('calculates night duration in hours', () => {
    const maghrib = new Date(2024, 0, 1, 17, 30);
    const fajr = new Date(2024, 0, 2, 5, 30);

    const duration = getNightDuration(maghrib, fajr);

    expect(duration).toBe(12); // 12 hours
  });

  it('handles shorter winter nights', () => {
    const maghrib = new Date(2024, 0, 1, 16, 0);
    const fajr = new Date(2024, 0, 2, 6, 0);

    const duration = getNightDuration(maghrib, fajr);

    expect(duration).toBe(14); // 14 hours
  });
});

describe('getNightPortion', () => {
  const maghrib = new Date(2024, 0, 1, 18, 0);
  const fajr = new Date(2024, 0, 2, 6, 0);

  it('calculates half of the night', () => {
    const middle = getNightPortion(maghrib, fajr, 0.5);

    expect(middle.getHours()).toBe(0);
    expect(middle.getMinutes()).toBe(0);
  });

  it('calculates seventh of the night', () => {
    // 12 hour night, 1/7 = ~1.71 hours = 1 hour 43 minutes from maghrib
    const seventh = getNightPortion(maghrib, fajr, 1 / 7);

    expect(seventh.getHours()).toBe(19);
  });

  it('calculates two-thirds of the night', () => {
    // 12 hour night, 2/3 = 8 hours from maghrib = 2:00 AM
    const twoThirds = getNightPortion(maghrib, fajr, 2 / 3);

    expect(twoThirds.getHours()).toBe(2);
    expect(twoThirds.getMinutes()).toBe(0);
  });
});

describe('isLastThirdOfNight', () => {
  const maghrib = new Date(2024, 0, 1, 18, 0);
  const fajr = new Date(2024, 0, 2, 6, 0);

  it('returns true for time in last third', () => {
    const time = new Date(2024, 0, 2, 3, 0); // 3 AM
    expect(isLastThirdOfNight(time, maghrib, fajr)).toBe(true);
  });

  it('returns true for time at start of last third', () => {
    const time = new Date(2024, 0, 2, 2, 0); // 2 AM (exactly 2/3)
    expect(isLastThirdOfNight(time, maghrib, fajr)).toBe(true);
  });

  it('returns false for time before last third', () => {
    const time = new Date(2024, 0, 1, 23, 0); // 11 PM
    expect(isLastThirdOfNight(time, maghrib, fajr)).toBe(false);
  });

  it('returns false for time after Fajr', () => {
    const time = new Date(2024, 0, 2, 7, 0); // 7 AM
    expect(isLastThirdOfNight(time, maghrib, fajr)).toBe(false);
  });
});

describe('getQiyamTimeRange', () => {
  const maghrib = new Date(2024, 0, 1, 18, 0);
  const fajr = new Date(2024, 0, 2, 6, 0);

  it('returns correct time range', () => {
    const range = getQiyamTimeRange(maghrib, fajr);

    // Start is middle of night (midnight for 12-hour night)
    expect(range.start.getHours()).toBe(0);

    // Optimal is last third (2 AM for 12-hour night)
    expect(range.optimal.getHours()).toBe(2);

    // End is Fajr
    expect(range.end.getTime()).toBe(fajr.getTime());
  });
});
