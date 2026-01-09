import { describe, it, expect } from 'vitest';
import {
  toRadians,
  toDegrees,
  normalizeAngle,
  calculateDistance,
  validateCoordinates,
  formatTime,
  toJulianDay,
  fromJulianDay,
} from './utils';

describe('toRadians', () => {
  it('converts degrees to radians', () => {
    expect(toRadians(0)).toBe(0);
    expect(toRadians(90)).toBeCloseTo(Math.PI / 2);
    expect(toRadians(180)).toBeCloseTo(Math.PI);
    expect(toRadians(360)).toBeCloseTo(2 * Math.PI);
  });
});

describe('toDegrees', () => {
  it('converts radians to degrees', () => {
    expect(toDegrees(0)).toBe(0);
    expect(toDegrees(Math.PI / 2)).toBeCloseTo(90);
    expect(toDegrees(Math.PI)).toBeCloseTo(180);
    expect(toDegrees(2 * Math.PI)).toBeCloseTo(360);
  });
});

describe('normalizeAngle', () => {
  it('normalizes angles to 0-360 range', () => {
    expect(normalizeAngle(0)).toBe(0);
    expect(normalizeAngle(360)).toBe(0);
    expect(normalizeAngle(450)).toBe(90);
    expect(normalizeAngle(-90)).toBe(270);
    expect(normalizeAngle(-360)).toBe(0);
  });
});

describe('calculateDistance', () => {
  it('calculates distance between two points', () => {
    const london = { latitude: 51.5074, longitude: -0.1278 };
    const paris = { latitude: 48.8566, longitude: 2.3522 };
    const distance = calculateDistance(london, paris);
    // Approximate distance between London and Paris is ~344 km
    expect(distance).toBeGreaterThan(340);
    expect(distance).toBeLessThan(350);
  });

  it('returns 0 for same location', () => {
    const point = { latitude: 40.7128, longitude: -74.006 };
    expect(calculateDistance(point, point)).toBe(0);
  });
});

describe('validateCoordinates', () => {
  it('validates correct coordinates', () => {
    const result = validateCoordinates({ latitude: 45, longitude: 90 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.latitude).toBe(45);
    }
  });

  it('rejects invalid latitude', () => {
    const result = validateCoordinates({ latitude: 100, longitude: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects invalid longitude', () => {
    const result = validateCoordinates({ latitude: 0, longitude: 200 });
    expect(result.success).toBe(false);
  });
});

describe('formatTime', () => {
  it('formats time correctly', () => {
    expect(formatTime(5, 30)).toBe('05:30');
    expect(formatTime(12, 0)).toBe('12:00');
    expect(formatTime(23, 59)).toBe('23:59');
  });

  it('pads single digits', () => {
    expect(formatTime(1, 5)).toBe('01:05');
  });
});

describe('Julian Day conversions', () => {
  it('converts date to Julian Day and back', () => {
    const date = new Date(Date.UTC(2024, 0, 1)); // Jan 1, 2024
    const jd = toJulianDay(date);
    const recovered = fromJulianDay(jd);
    expect(recovered.getUTCFullYear()).toBe(2024);
    expect(recovered.getUTCMonth()).toBe(0);
    expect(recovered.getUTCDate()).toBe(1);
  });

  it('handles known Julian Day values', () => {
    // Jan 1, 2000 at noon = JD 2451545.0
    const date = new Date(Date.UTC(2000, 0, 1));
    const jd = toJulianDay(date);
    expect(jd).toBeCloseTo(2451545, 0);
  });
});
