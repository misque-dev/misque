import {
  type Coordinates,
  KAABA_COORDINATES,
  toRadians,
  toDegrees,
  normalizeAngle,
  calculateDistance,
  validateCoordinates,
  type Result,
} from '@misque/core';
import type { QiblaDirection, CompassDirection, QiblaOptions } from './types';

/**
 * Calculate the Qibla direction from any location
 *
 * Uses the great circle formula to calculate the initial bearing
 * from the given location to the Kaaba in Mecca.
 *
 * @param location - The coordinates to calculate Qibla from
 * @param options - Optional calculation options
 * @returns Qibla direction information
 *
 * @example
 * ```ts
 * const london = { latitude: 51.5074, longitude: -0.1278 };
 * const result = calculateQibla(london);
 * if (result.success) {
 *   console.log(`Qibla is ${result.data.bearing}° from north`);
 * }
 * ```
 */
export function calculateQibla(
  location: Coordinates,
  options: QiblaOptions = {}
): Result<QiblaDirection> {
  // Validate coordinates
  const validation = validateCoordinates(location);
  if (!validation.success) {
    return validation;
  }

  const { magneticDeclination = 0 } = options;

  // Convert to radians
  const lat1 = toRadians(location.latitude);
  const lon1 = toRadians(location.longitude);
  const lat2 = toRadians(KAABA_COORDINATES.latitude);
  const lon2 = toRadians(KAABA_COORDINATES.longitude);

  // Calculate the bearing using the great circle formula
  const dLon = lon2 - lon1;

  const x = Math.cos(lat2) * Math.sin(dLon);
  const y =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  let bearing = toDegrees(Math.atan2(x, y));

  // Normalize to 0-360
  bearing = normalizeAngle(bearing);

  // Apply magnetic declination if provided
  bearing = normalizeAngle(bearing + magneticDeclination);

  // Calculate distance
  const distance = calculateDistance(location, KAABA_COORDINATES);

  // Get compass direction
  const compassDirection = bearingToCompassDirection(bearing);

  return {
    success: true,
    data: {
      bearing: Math.round(bearing * 100) / 100, // Round to 2 decimal places
      distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
      compassDirection,
    },
  };
}

/**
 * Convert bearing angle to compass direction
 */
export function bearingToCompassDirection(bearing: number): CompassDirection {
  const directions: CompassDirection[] = [
    'N',
    'NNE',
    'NE',
    'ENE',
    'E',
    'ESE',
    'SE',
    'SSE',
    'S',
    'SSW',
    'SW',
    'WSW',
    'W',
    'WNW',
    'NW',
    'NNW',
  ];

  const index = Math.round(normalizeAngle(bearing) / 22.5) % 16;
  return directions[index] ?? 'N';
}

/**
 * Get the Kaaba coordinates
 */
export function getKaabaCoordinates(): Coordinates {
  return { ...KAABA_COORDINATES };
}

/**
 * Check if a location is at or very near the Kaaba
 * @param location - The coordinates to check
 * @param thresholdKm - Distance threshold in kilometers (default: 0.1 km = 100m)
 */
export function isAtKaaba(
  location: Coordinates,
  thresholdKm = 0.1
): boolean {
  const distance = calculateDistance(location, KAABA_COORDINATES);
  return distance <= thresholdKm;
}

/**
 * Get Qibla bearing as a formatted string
 */
export function formatQiblaBearing(
  bearing: number,
  includeDirection = true
): string {
  const rounded = Math.round(bearing);
  if (includeDirection) {
    const direction = bearingToCompassDirection(bearing);
    return `${rounded}° (${direction})`;
  }
  return `${rounded}°`;
}
