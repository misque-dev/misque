import { describe, it, expect } from 'vitest';
import {
  calculateQibla,
  bearingToCompassDirection,
  getKaabaCoordinates,
  isAtKaaba,
  formatQiblaBearing,
} from './qibla';
import { KAABA_COORDINATES } from '@misque/core';

describe('calculateQibla', () => {
  it('calculates qibla from London', () => {
    const london = { latitude: 51.5074, longitude: -0.1278 };
    const result = calculateQibla(london);

    expect(result.success).toBe(true);
    if (result.success) {
      // Qibla from London is roughly 119° (ESE)
      expect(result.data.bearing).toBeGreaterThan(115);
      expect(result.data.bearing).toBeLessThan(125);
      expect(result.data.compassDirection).toBe('ESE');
    }
  });

  it('calculates qibla from New York', () => {
    const newYork = { latitude: 40.7128, longitude: -74.006 };
    const result = calculateQibla(newYork);

    expect(result.success).toBe(true);
    if (result.success) {
      // Qibla from New York is roughly 58° (ENE)
      expect(result.data.bearing).toBeGreaterThan(55);
      expect(result.data.bearing).toBeLessThan(65);
    }
  });

  it('calculates qibla from Tokyo', () => {
    const tokyo = { latitude: 35.6762, longitude: 139.6503 };
    const result = calculateQibla(tokyo);

    expect(result.success).toBe(true);
    if (result.success) {
      // Qibla from Tokyo is roughly 293° (WNW)
      expect(result.data.bearing).toBeGreaterThan(285);
      expect(result.data.bearing).toBeLessThan(300);
    }
  });

  it('returns error for invalid coordinates', () => {
    const invalid = { latitude: 100, longitude: 0 };
    const result = calculateQibla(invalid);
    expect(result.success).toBe(false);
  });

  it('applies magnetic declination', () => {
    const london = { latitude: 51.5074, longitude: -0.1278 };
    const withoutDeclination = calculateQibla(london);
    const withDeclination = calculateQibla(london, { magneticDeclination: 5 });

    if (withoutDeclination.success && withDeclination.success) {
      const diff = Math.abs(
        withDeclination.data.bearing - withoutDeclination.data.bearing
      );
      expect(diff).toBeCloseTo(5, 1);
    }
  });
});

describe('bearingToCompassDirection', () => {
  it('converts bearings to compass directions', () => {
    expect(bearingToCompassDirection(0)).toBe('N');
    expect(bearingToCompassDirection(45)).toBe('NE');
    expect(bearingToCompassDirection(90)).toBe('E');
    expect(bearingToCompassDirection(180)).toBe('S');
    expect(bearingToCompassDirection(270)).toBe('W');
    expect(bearingToCompassDirection(360)).toBe('N');
  });
});

describe('getKaabaCoordinates', () => {
  it('returns Kaaba coordinates', () => {
    const coords = getKaabaCoordinates();
    expect(coords.latitude).toBe(KAABA_COORDINATES.latitude);
    expect(coords.longitude).toBe(KAABA_COORDINATES.longitude);
  });
});

describe('isAtKaaba', () => {
  it('returns true for Kaaba location', () => {
    expect(isAtKaaba(KAABA_COORDINATES)).toBe(true);
  });

  it('returns false for distant location', () => {
    const london = { latitude: 51.5074, longitude: -0.1278 };
    expect(isAtKaaba(london)).toBe(false);
  });
});

describe('formatQiblaBearing', () => {
  it('formats bearing with direction', () => {
    expect(formatQiblaBearing(119.5)).toBe('120° (ESE)');
  });

  it('formats bearing without direction', () => {
    expect(formatQiblaBearing(119.5, false)).toBe('120°');
  });
});
