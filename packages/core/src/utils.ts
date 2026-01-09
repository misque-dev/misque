import type { Coordinates, Result } from './types';

/**
 * Convert degrees to radians
 */
export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Convert radians to degrees
 */
export function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Normalize angle to be within 0-360 degrees
 */
export function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

/**
 * Calculate the distance between two coordinates using Haversine formula
 * @returns Distance in kilometers
 */
export function calculateDistance(
  from: Coordinates,
  to: Coordinates
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Validate coordinates
 */
export function validateCoordinates(coords: Coordinates): Result<Coordinates> {
  if (coords.latitude < -90 || coords.latitude > 90) {
    return {
      success: false,
      error: new Error('Latitude must be between -90 and 90 degrees'),
    };
  }

  if (coords.longitude < -180 || coords.longitude > 180) {
    return {
      success: false,
      error: new Error('Longitude must be between -180 and 180 degrees'),
    };
  }

  return { success: true, data: coords };
}

/**
 * Format time as HH:MM
 */
export function formatTime(hours: number, minutes: number): string {
  const h = Math.floor(hours).toString().padStart(2, '0');
  const m = Math.floor(minutes).toString().padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Get Julian Day Number from a Date
 */
export function toJulianDay(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;

  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

/**
 * Get Date from Julian Day Number
 */
export function fromJulianDay(jd: number): Date {
  const z = Math.floor(jd + 0.5);
  const f = jd + 0.5 - z;

  let a: number;
  if (z < 2299161) {
    a = z;
  } else {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + alpha - Math.floor(alpha / 4);
  }

  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);

  const day = b - d - Math.floor(30.6001 * e) + f;
  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4716 : c - 4715;

  return new Date(Date.UTC(year, month - 1, Math.floor(day)));
}
