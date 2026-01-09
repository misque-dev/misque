import { describe, it, expect } from 'vitest';
import {
  createAdjustments,
  adjustPrayerTimes,
  ADJUSTMENT_PRESETS,
  getPreset,
} from './adjustments';
import type { PrayerAdjustments, PrayerTimes } from './types';

describe('createAdjustments', () => {
  it('creates adjustments with all default values when empty object provided', () => {
    const adjustments = createAdjustments({});

    expect(adjustments.fajr).toBe(0);
    expect(adjustments.sunrise).toBe(0);
    expect(adjustments.dhuhr).toBe(0);
    expect(adjustments.asr).toBe(0);
    expect(adjustments.maghrib).toBe(0);
    expect(adjustments.isha).toBe(0);
  });

  it('creates adjustments with partial values, defaulting others to 0', () => {
    const adjustments = createAdjustments({ fajr: -5, dhuhr: 3 });

    expect(adjustments.fajr).toBe(-5);
    expect(adjustments.sunrise).toBe(0);
    expect(adjustments.dhuhr).toBe(3);
    expect(adjustments.asr).toBe(0);
    expect(adjustments.maghrib).toBe(0);
    expect(adjustments.isha).toBe(0);
  });

  it('creates adjustments with all values specified', () => {
    const adjustments = createAdjustments({
      fajr: -2,
      sunrise: -1,
      dhuhr: 3,
      asr: 2,
      maghrib: 5,
      isha: 4,
    });

    expect(adjustments.fajr).toBe(-2);
    expect(adjustments.sunrise).toBe(-1);
    expect(adjustments.dhuhr).toBe(3);
    expect(adjustments.asr).toBe(2);
    expect(adjustments.maghrib).toBe(5);
    expect(adjustments.isha).toBe(4);
  });

  it('handles positive adjustments', () => {
    const adjustments = createAdjustments({
      fajr: 10,
      dhuhr: 15,
      asr: 20,
    });

    expect(adjustments.fajr).toBe(10);
    expect(adjustments.dhuhr).toBe(15);
    expect(adjustments.asr).toBe(20);
  });

  it('handles negative adjustments', () => {
    const adjustments = createAdjustments({
      fajr: -10,
      sunrise: -5,
      maghrib: -3,
    });

    expect(adjustments.fajr).toBe(-10);
    expect(adjustments.sunrise).toBe(-5);
    expect(adjustments.maghrib).toBe(-3);
  });

  it('handles zero values explicitly provided', () => {
    const adjustments = createAdjustments({
      fajr: 0,
      dhuhr: 0,
      isha: 0,
    });

    expect(adjustments.fajr).toBe(0);
    expect(adjustments.dhuhr).toBe(0);
    expect(adjustments.isha).toBe(0);
  });

  it('handles large positive adjustments', () => {
    const adjustments = createAdjustments({
      fajr: 60,
      dhuhr: 120,
    });

    expect(adjustments.fajr).toBe(60);
    expect(adjustments.dhuhr).toBe(120);
  });

  it('handles large negative adjustments', () => {
    const adjustments = createAdjustments({
      sunrise: -60,
      maghrib: -90,
    });

    expect(adjustments.sunrise).toBe(-60);
    expect(adjustments.maghrib).toBe(-90);
  });

  it('handles decimal minute values', () => {
    const adjustments = createAdjustments({
      fajr: 2.5,
      dhuhr: 3.75,
    });

    expect(adjustments.fajr).toBe(2.5);
    expect(adjustments.dhuhr).toBe(3.75);
  });

  it('preserves undefined values as 0', () => {
    const adjustments = createAdjustments({
      fajr: undefined,
      dhuhr: 5,
    });

    expect(adjustments.fajr).toBe(0);
    expect(adjustments.dhuhr).toBe(5);
  });
});

describe('adjustPrayerTimes', () => {
  const baseTimes: PrayerTimes = {
    fajr: new Date(2024, 0, 1, 5, 30, 0),
    sunrise: new Date(2024, 0, 1, 7, 15, 0),
    dhuhr: new Date(2024, 0, 1, 12, 30, 0),
    asr: new Date(2024, 0, 1, 15, 45, 0),
    maghrib: new Date(2024, 0, 1, 17, 30, 0),
    isha: new Date(2024, 0, 1, 19, 0, 0),
  };

  it('returns unchanged times when all adjustments are 0', () => {
    const adjustments = createAdjustments({});
    const adjusted = adjustPrayerTimes(baseTimes, adjustments);

    expect(adjusted.fajr.getTime()).toBe(baseTimes.fajr.getTime());
    expect(adjusted.sunrise.getTime()).toBe(baseTimes.sunrise.getTime());
    expect(adjusted.dhuhr.getTime()).toBe(baseTimes.dhuhr.getTime());
    expect(adjusted.asr.getTime()).toBe(baseTimes.asr.getTime());
    expect(adjusted.maghrib.getTime()).toBe(baseTimes.maghrib.getTime());
    expect(adjusted.isha.getTime()).toBe(baseTimes.isha.getTime());
  });

  it('applies positive minute adjustments correctly', () => {
    const adjustments = createAdjustments({
      fajr: 5,
      dhuhr: 10,
      maghrib: 3,
    });
    const adjusted = adjustPrayerTimes(baseTimes, adjustments);

    // Fajr should be 5:35 (5 minutes later)
    expect(adjusted.fajr.getHours()).toBe(5);
    expect(adjusted.fajr.getMinutes()).toBe(35);

    // Dhuhr should be 12:40 (10 minutes later)
    expect(adjusted.dhuhr.getHours()).toBe(12);
    expect(adjusted.dhuhr.getMinutes()).toBe(40);

    // Maghrib should be 17:33 (3 minutes later)
    expect(adjusted.maghrib.getHours()).toBe(17);
    expect(adjusted.maghrib.getMinutes()).toBe(33);
  });

  it('applies negative minute adjustments correctly', () => {
    const adjustments = createAdjustments({
      fajr: -5,
      sunrise: -10,
      isha: -15,
    });
    const adjusted = adjustPrayerTimes(baseTimes, adjustments);

    // Fajr should be 5:25 (5 minutes earlier)
    expect(adjusted.fajr.getHours()).toBe(5);
    expect(adjusted.fajr.getMinutes()).toBe(25);

    // Sunrise should be 7:05 (10 minutes earlier)
    expect(adjusted.sunrise.getHours()).toBe(7);
    expect(adjusted.sunrise.getMinutes()).toBe(5);

    // Isha should be 18:45 (15 minutes earlier)
    expect(adjusted.isha.getHours()).toBe(18);
    expect(adjusted.isha.getMinutes()).toBe(45);
  });

  it('handles adjustments that cross hour boundaries', () => {
    const adjustments = createAdjustments({
      fajr: 35, // 5:30 + 35 = 6:05
      dhuhr: -45, // 12:30 - 45 = 11:45
    });
    const adjusted = adjustPrayerTimes(baseTimes, adjustments);

    expect(adjusted.fajr.getHours()).toBe(6);
    expect(adjusted.fajr.getMinutes()).toBe(5);

    expect(adjusted.dhuhr.getHours()).toBe(11);
    expect(adjusted.dhuhr.getMinutes()).toBe(45);
  });

  it('handles large positive adjustments (multiple hours)', () => {
    const adjustments = createAdjustments({
      fajr: 120, // 5:30 + 2 hours = 7:30
    });
    const adjusted = adjustPrayerTimes(baseTimes, adjustments);

    expect(adjusted.fajr.getHours()).toBe(7);
    expect(adjusted.fajr.getMinutes()).toBe(30);
  });

  it('handles large negative adjustments (multiple hours)', () => {
    const adjustments = createAdjustments({
      isha: -180, // 19:00 - 3 hours = 16:00
    });
    const adjusted = adjustPrayerTimes(baseTimes, adjustments);

    expect(adjusted.isha.getHours()).toBe(16);
    expect(adjusted.isha.getMinutes()).toBe(0);
  });

  it('preserves original times object (immutability)', () => {
    const adjustments = createAdjustments({ fajr: 30 });
    const originalFajrTime = baseTimes.fajr.getTime();

    adjustPrayerTimes(baseTimes, adjustments);

    expect(baseTimes.fajr.getTime()).toBe(originalFajrTime);
  });

  it('returns new Date objects when adjustments are non-zero', () => {
    const adjustments = createAdjustments({
      fajr: 1,
      sunrise: 1,
      dhuhr: 1,
      asr: 1,
      maghrib: 1,
      isha: 1,
    });
    const adjusted = adjustPrayerTimes(baseTimes, adjustments);

    expect(adjusted.fajr).not.toBe(baseTimes.fajr);
    expect(adjusted.sunrise).not.toBe(baseTimes.sunrise);
    expect(adjusted.dhuhr).not.toBe(baseTimes.dhuhr);
    expect(adjusted.asr).not.toBe(baseTimes.asr);
    expect(adjusted.maghrib).not.toBe(baseTimes.maghrib);
    expect(adjusted.isha).not.toBe(baseTimes.isha);
  });

  it('returns same Date references when adjustments are zero (optimization)', () => {
    const adjustments = createAdjustments({});
    const adjusted = adjustPrayerTimes(baseTimes, adjustments);

    // When adjustment is 0, the function returns the original date for performance
    expect(adjusted.fajr).toBe(baseTimes.fajr);
    expect(adjusted.sunrise).toBe(baseTimes.sunrise);
    expect(adjusted.dhuhr).toBe(baseTimes.dhuhr);
    expect(adjusted.asr).toBe(baseTimes.asr);
    expect(adjusted.maghrib).toBe(baseTimes.maghrib);
    expect(adjusted.isha).toBe(baseTimes.isha);
  });

  it('applies adjustments to all six prayers', () => {
    const adjustments = createAdjustments({
      fajr: 1,
      sunrise: 2,
      dhuhr: 3,
      asr: 4,
      maghrib: 5,
      isha: 6,
    });
    const adjusted = adjustPrayerTimes(baseTimes, adjustments);

    // Check each prayer has the correct adjustment applied
    const expectedDiffs = [1, 2, 3, 4, 5, 6];
    const prayers: (keyof PrayerTimes)[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

    prayers.forEach((prayer, index) => {
      const diffMinutes =
        (adjusted[prayer].getTime() - baseTimes[prayer].getTime()) / (60 * 1000);
      expect(diffMinutes).toBe(expectedDiffs[index]);
    });
  });

  it('handles midnight boundary crossing with positive adjustment', () => {
    const lateNightTimes: PrayerTimes = {
      ...baseTimes,
      isha: new Date(2024, 0, 1, 23, 45, 0),
    };
    const adjustments = createAdjustments({ isha: 30 });
    const adjusted = adjustPrayerTimes(lateNightTimes, adjustments);

    // Isha at 23:45 + 30 minutes = 00:15 next day
    expect(adjusted.isha.getDate()).toBe(2);
    expect(adjusted.isha.getHours()).toBe(0);
    expect(adjusted.isha.getMinutes()).toBe(15);
  });

  it('handles midnight boundary crossing with negative adjustment', () => {
    const earlyMorningTimes: PrayerTimes = {
      ...baseTimes,
      fajr: new Date(2024, 0, 2, 0, 15, 0),
    };
    const adjustments = createAdjustments({ fajr: -30 });
    const adjusted = adjustPrayerTimes(earlyMorningTimes, adjustments);

    // Fajr at 00:15 - 30 minutes = 23:45 previous day
    expect(adjusted.fajr.getDate()).toBe(1);
    expect(adjusted.fajr.getHours()).toBe(23);
    expect(adjusted.fajr.getMinutes()).toBe(45);
  });

  it('preserves seconds when adjusting', () => {
    const timesWithSeconds: PrayerTimes = {
      ...baseTimes,
      fajr: new Date(2024, 0, 1, 5, 30, 45),
    };
    const adjustments = createAdjustments({ fajr: 5 });
    const adjusted = adjustPrayerTimes(timesWithSeconds, adjustments);

    expect(adjusted.fajr.getSeconds()).toBe(45);
  });

  it('preserves milliseconds when adjusting', () => {
    const timesWithMs: PrayerTimes = {
      ...baseTimes,
      fajr: new Date(2024, 0, 1, 5, 30, 0, 500),
    };
    const adjustments = createAdjustments({ fajr: 5 });
    const adjusted = adjustPrayerTimes(timesWithMs, adjustments);

    expect(adjusted.fajr.getMilliseconds()).toBe(500);
  });
});

describe('ADJUSTMENT_PRESETS', () => {
  describe('conservative preset', () => {
    const preset = ADJUSTMENT_PRESETS.conservative;

    it('has fajr adjustment of -2 minutes', () => {
      expect(preset.fajr).toBe(-2);
    });

    it('has sunrise adjustment of 0 minutes', () => {
      expect(preset.sunrise).toBe(0);
    });

    it('has dhuhr adjustment of 2 minutes', () => {
      expect(preset.dhuhr).toBe(2);
    });

    it('has asr adjustment of 2 minutes', () => {
      expect(preset.asr).toBe(2);
    });

    it('has maghrib adjustment of 2 minutes', () => {
      expect(preset.maghrib).toBe(2);
    });

    it('has isha adjustment of 0 minutes', () => {
      expect(preset.isha).toBe(0);
    });

    it('adds safety margin before Fajr (earlier time)', () => {
      expect(preset.fajr).toBeLessThan(0);
    });

    it('delays other prayers slightly (later times)', () => {
      expect(preset.dhuhr).toBeGreaterThan(0);
      expect(preset.asr).toBeGreaterThan(0);
      expect(preset.maghrib).toBeGreaterThan(0);
    });
  });

  describe('standard preset', () => {
    const preset = ADJUSTMENT_PRESETS.standard;

    it('has all adjustments set to 0', () => {
      expect(preset.fajr).toBe(0);
      expect(preset.sunrise).toBe(0);
      expect(preset.dhuhr).toBe(0);
      expect(preset.asr).toBe(0);
      expect(preset.maghrib).toBe(0);
      expect(preset.isha).toBe(0);
    });

    it('makes no changes to calculated times', () => {
      const allZero = Object.values(preset).every((v) => v === 0);
      expect(allZero).toBe(true);
    });
  });

  describe('withPreparation preset', () => {
    const preset = ADJUSTMENT_PRESETS.withPreparation;

    it('has fajr adjustment of -5 minutes', () => {
      expect(preset.fajr).toBe(-5);
    });

    it('has sunrise adjustment of 0 minutes', () => {
      expect(preset.sunrise).toBe(0);
    });

    it('has dhuhr adjustment of 5 minutes', () => {
      expect(preset.dhuhr).toBe(5);
    });

    it('has asr adjustment of 5 minutes', () => {
      expect(preset.asr).toBe(5);
    });

    it('has maghrib adjustment of 3 minutes', () => {
      expect(preset.maghrib).toBe(3);
    });

    it('has isha adjustment of 0 minutes', () => {
      expect(preset.isha).toBe(0);
    });

    it('provides more preparation time before Fajr than conservative', () => {
      expect(preset.fajr).toBeLessThan(ADJUSTMENT_PRESETS.conservative.fajr!);
    });

    it('provides more delay for dhuhr and asr than conservative', () => {
      expect(preset.dhuhr).toBeGreaterThan(ADJUSTMENT_PRESETS.conservative.dhuhr!);
      expect(preset.asr).toBeGreaterThan(ADJUSTMENT_PRESETS.conservative.asr!);
    });
  });

  describe('preset immutability', () => {
    it('presets are defined as const', () => {
      // This test verifies the structure is as expected
      expect(ADJUSTMENT_PRESETS).toHaveProperty('conservative');
      expect(ADJUSTMENT_PRESETS).toHaveProperty('standard');
      expect(ADJUSTMENT_PRESETS).toHaveProperty('withPreparation');
    });

    it('contains exactly 3 presets', () => {
      const presetKeys = Object.keys(ADJUSTMENT_PRESETS);
      expect(presetKeys).toHaveLength(3);
    });
  });

  describe('preset completeness', () => {
    const prayers: (keyof PrayerAdjustments)[] = [
      'fajr',
      'sunrise',
      'dhuhr',
      'asr',
      'maghrib',
      'isha',
    ];

    it('conservative preset has all prayer adjustments defined', () => {
      prayers.forEach((prayer) => {
        expect(ADJUSTMENT_PRESETS.conservative[prayer]).toBeDefined();
        expect(typeof ADJUSTMENT_PRESETS.conservative[prayer]).toBe('number');
      });
    });

    it('standard preset has all prayer adjustments defined', () => {
      prayers.forEach((prayer) => {
        expect(ADJUSTMENT_PRESETS.standard[prayer]).toBeDefined();
        expect(typeof ADJUSTMENT_PRESETS.standard[prayer]).toBe('number');
      });
    });

    it('withPreparation preset has all prayer adjustments defined', () => {
      prayers.forEach((prayer) => {
        expect(ADJUSTMENT_PRESETS.withPreparation[prayer]).toBeDefined();
        expect(typeof ADJUSTMENT_PRESETS.withPreparation[prayer]).toBe('number');
      });
    });
  });
});

describe('getPreset', () => {
  it('returns a copy of the conservative preset', () => {
    const preset = getPreset('conservative');

    expect(preset.fajr).toBe(-2);
    expect(preset.dhuhr).toBe(2);
    expect(preset.asr).toBe(2);
    expect(preset.maghrib).toBe(2);
  });

  it('returns a copy of the standard preset', () => {
    const preset = getPreset('standard');

    expect(preset.fajr).toBe(0);
    expect(preset.sunrise).toBe(0);
    expect(preset.dhuhr).toBe(0);
    expect(preset.asr).toBe(0);
    expect(preset.maghrib).toBe(0);
    expect(preset.isha).toBe(0);
  });

  it('returns a copy of the withPreparation preset', () => {
    const preset = getPreset('withPreparation');

    expect(preset.fajr).toBe(-5);
    expect(preset.dhuhr).toBe(5);
    expect(preset.asr).toBe(5);
    expect(preset.maghrib).toBe(3);
  });

  it('returns a new object, not a reference to the original', () => {
    const preset1 = getPreset('conservative');
    const preset2 = getPreset('conservative');

    expect(preset1).not.toBe(preset2);
    expect(preset1).toEqual(preset2);
  });

  it('modifying returned preset does not affect original', () => {
    const preset = getPreset('conservative');
    preset.fajr = 999;

    expect(ADJUSTMENT_PRESETS.conservative.fajr).toBe(-2);
  });

  it('returns all required properties', () => {
    const preset = getPreset('standard');

    expect(preset).toHaveProperty('fajr');
    expect(preset).toHaveProperty('sunrise');
    expect(preset).toHaveProperty('dhuhr');
    expect(preset).toHaveProperty('asr');
    expect(preset).toHaveProperty('maghrib');
    expect(preset).toHaveProperty('isha');
  });
});

describe('integration: createAdjustments with adjustPrayerTimes', () => {
  const baseTimes: PrayerTimes = {
    fajr: new Date(2024, 0, 1, 5, 30, 0),
    sunrise: new Date(2024, 0, 1, 7, 15, 0),
    dhuhr: new Date(2024, 0, 1, 12, 30, 0),
    asr: new Date(2024, 0, 1, 15, 45, 0),
    maghrib: new Date(2024, 0, 1, 17, 30, 0),
    isha: new Date(2024, 0, 1, 19, 0, 0),
  };

  it('applies conservative preset correctly', () => {
    const adjustments = getPreset('conservative');
    const adjusted = adjustPrayerTimes(baseTimes, adjustments);

    // Fajr should be 2 minutes earlier (5:28)
    expect(adjusted.fajr.getHours()).toBe(5);
    expect(adjusted.fajr.getMinutes()).toBe(28);

    // Dhuhr should be 2 minutes later (12:32)
    expect(adjusted.dhuhr.getHours()).toBe(12);
    expect(adjusted.dhuhr.getMinutes()).toBe(32);

    // Asr should be 2 minutes later (15:47)
    expect(adjusted.asr.getHours()).toBe(15);
    expect(adjusted.asr.getMinutes()).toBe(47);

    // Maghrib should be 2 minutes later (17:32)
    expect(adjusted.maghrib.getHours()).toBe(17);
    expect(adjusted.maghrib.getMinutes()).toBe(32);
  });

  it('applies standard preset correctly (no changes)', () => {
    const adjustments = getPreset('standard');
    const adjusted = adjustPrayerTimes(baseTimes, adjustments);

    expect(adjusted.fajr.getTime()).toBe(baseTimes.fajr.getTime());
    expect(adjusted.sunrise.getTime()).toBe(baseTimes.sunrise.getTime());
    expect(adjusted.dhuhr.getTime()).toBe(baseTimes.dhuhr.getTime());
    expect(adjusted.asr.getTime()).toBe(baseTimes.asr.getTime());
    expect(adjusted.maghrib.getTime()).toBe(baseTimes.maghrib.getTime());
    expect(adjusted.isha.getTime()).toBe(baseTimes.isha.getTime());
  });

  it('applies withPreparation preset correctly', () => {
    const adjustments = getPreset('withPreparation');
    const adjusted = adjustPrayerTimes(baseTimes, adjustments);

    // Fajr should be 5 minutes earlier (5:25)
    expect(adjusted.fajr.getHours()).toBe(5);
    expect(adjusted.fajr.getMinutes()).toBe(25);

    // Dhuhr should be 5 minutes later (12:35)
    expect(adjusted.dhuhr.getHours()).toBe(12);
    expect(adjusted.dhuhr.getMinutes()).toBe(35);

    // Asr should be 5 minutes later (15:50)
    expect(adjusted.asr.getHours()).toBe(15);
    expect(adjusted.asr.getMinutes()).toBe(50);

    // Maghrib should be 3 minutes later (17:33)
    expect(adjusted.maghrib.getHours()).toBe(17);
    expect(adjusted.maghrib.getMinutes()).toBe(33);
  });

  it('custom adjustments work with adjustPrayerTimes', () => {
    const customAdjustments = createAdjustments({
      fajr: -10,
      dhuhr: 7,
      maghrib: 5,
    });
    const adjusted = adjustPrayerTimes(baseTimes, customAdjustments);

    // Fajr should be 10 minutes earlier (5:20)
    expect(adjusted.fajr.getHours()).toBe(5);
    expect(adjusted.fajr.getMinutes()).toBe(20);

    // Dhuhr should be 7 minutes later (12:37)
    expect(adjusted.dhuhr.getHours()).toBe(12);
    expect(adjusted.dhuhr.getMinutes()).toBe(37);

    // Maghrib should be 5 minutes later (17:35)
    expect(adjusted.maghrib.getHours()).toBe(17);
    expect(adjusted.maghrib.getMinutes()).toBe(35);
  });
});

describe('edge cases and error handling', () => {
  const baseTimes: PrayerTimes = {
    fajr: new Date(2024, 0, 1, 5, 30, 0),
    sunrise: new Date(2024, 0, 1, 7, 15, 0),
    dhuhr: new Date(2024, 0, 1, 12, 30, 0),
    asr: new Date(2024, 0, 1, 15, 45, 0),
    maghrib: new Date(2024, 0, 1, 17, 30, 0),
    isha: new Date(2024, 0, 1, 19, 0, 0),
  };

  it('handles adjustment at exact midnight', () => {
    const midnightTimes: PrayerTimes = {
      ...baseTimes,
      isha: new Date(2024, 0, 1, 0, 0, 0),
    };
    const adjustments = createAdjustments({ isha: -5 });
    const adjusted = adjustPrayerTimes(midnightTimes, adjustments);

    // 00:00 - 5 minutes = 23:55 previous day
    expect(adjusted.isha.getDate()).toBe(31);
    expect(adjusted.isha.getMonth()).toBe(11); // December (0-indexed)
    expect(adjusted.isha.getFullYear()).toBe(2023);
    expect(adjusted.isha.getHours()).toBe(23);
    expect(adjusted.isha.getMinutes()).toBe(55);
  });

  it('handles adjustment crossing year boundary', () => {
    const newYearsEveTimes: PrayerTimes = {
      ...baseTimes,
      isha: new Date(2023, 11, 31, 23, 55, 0),
    };
    const adjustments = createAdjustments({ isha: 10 });
    const adjusted = adjustPrayerTimes(newYearsEveTimes, adjustments);

    // 23:55 + 10 minutes = 00:05 next year
    expect(adjusted.isha.getFullYear()).toBe(2024);
    expect(adjusted.isha.getMonth()).toBe(0);
    expect(adjusted.isha.getDate()).toBe(1);
    expect(adjusted.isha.getHours()).toBe(0);
    expect(adjusted.isha.getMinutes()).toBe(5);
  });

  it('handles adjustment on leap year February 29', () => {
    const leapDayTimes: PrayerTimes = {
      ...baseTimes,
      fajr: new Date(2024, 1, 29, 5, 30, 0), // Feb 29, 2024
    };
    const adjustments = createAdjustments({ fajr: -10 });
    const adjusted = adjustPrayerTimes(leapDayTimes, adjustments);

    expect(adjusted.fajr.getDate()).toBe(29);
    expect(adjusted.fajr.getMonth()).toBe(1);
    expect(adjusted.fajr.getHours()).toBe(5);
    expect(adjusted.fajr.getMinutes()).toBe(20);
  });

  it('handles very large adjustment values gracefully', () => {
    const adjustments = createAdjustments({ fajr: 1440 }); // 24 hours
    const adjusted = adjustPrayerTimes(baseTimes, adjustments);

    // Should move to next day, same time
    expect(adjusted.fajr.getDate()).toBe(2);
    expect(adjusted.fajr.getHours()).toBe(5);
    expect(adjusted.fajr.getMinutes()).toBe(30);
  });

  it('handles negative adjustment moving to previous month', () => {
    const firstOfMonthTimes: PrayerTimes = {
      ...baseTimes,
      fajr: new Date(2024, 2, 1, 0, 30, 0), // March 1
    };
    const adjustments = createAdjustments({ fajr: -60 });
    const adjusted = adjustPrayerTimes(firstOfMonthTimes, adjustments);

    // Should move to February 29 (leap year)
    expect(adjusted.fajr.getMonth()).toBe(1);
    expect(adjusted.fajr.getDate()).toBe(29);
    expect(adjusted.fajr.getHours()).toBe(23);
    expect(adjusted.fajr.getMinutes()).toBe(30);
  });
});
