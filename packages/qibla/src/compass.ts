import type { Coordinates } from '@misque/core';
import { normalizeAngle } from '@misque/core';
import { calculateQibla } from './qibla';
import type {
  CompassVisualization,
  DeviceOrientation,
  QiblaCompassOptions,
} from './types';

/**
 * QiblaCompass class for calculating and visualizing Qibla direction.
 * Supports device orientation for compass applications.
 *
 * @example
 * ```typescript
 * const compass = new QiblaCompass({ latitude: 40.7128, longitude: -74.0060 });
 * const bearing = compass.getBearing();
 * console.log(`Qibla is ${bearing}° from North`);
 *
 * // With device orientation (browser only)
 * compass.startOrientationTracking({
 *   onOrientationChange: (viz) => {
 *     console.log(`Turn ${viz.turnDirection} by ${viz.alignmentDistance}°`);
 *   }
 * });
 * ```
 */
export class QiblaCompass {
  private coordinates: Coordinates;
  private orientationListener:
    | ((event: DeviceOrientationEvent) => void)
    | null = null;
  private options: Required<QiblaCompassOptions>;
  private currentOrientation: DeviceOrientation | null = null;

  /**
   * Creates a new QiblaCompass instance.
   * @param coordinates Location coordinates to calculate Qibla from
   * @param options Optional compass options
   */
  constructor(coordinates: Coordinates, options: QiblaCompassOptions = {}) {
    this.coordinates = coordinates;
    this.options = {
      useTrueNorth: options.useTrueNorth ?? false,
      onOrientationChange: options.onOrientationChange ?? (() => {}),
      alignmentThreshold: options.alignmentThreshold ?? 5,
    };
  }

  /**
   * Gets the Qibla bearing in degrees from North (0-360).
   * @returns Qibla bearing in degrees
   */
  getBearing(): number {
    const result = calculateQibla(this.coordinates);
    if (!result.success) {
      return 0;
    }
    return normalizeAngle(result.data.bearing);
  }

  /**
   * Gets the Qibla bearing formatted as a string.
   * @param precision Number of decimal places (default: 1)
   * @returns Formatted bearing string
   */
  getBearingFormatted(precision: number = 1): string {
    return `${this.getBearing().toFixed(precision)}°`;
  }

  /**
   * Gets the cardinal direction for the Qibla bearing.
   * @returns Cardinal direction (N, NE, E, SE, S, SW, W, NW)
   */
  getCardinalDirection(): string {
    const bearing = this.getBearing();
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(bearing / 45) % 8;
    return directions[index] ?? 'N';
  }

  /**
   * Calculates the angle difference between two bearings.
   * @param bearing1 First bearing in degrees
   * @param bearing2 Second bearing in degrees
   * @returns Angle difference in degrees (-180 to 180)
   */
  static calculateAngleDifference(bearing1: number, bearing2: number): number {
    let diff = bearing2 - bearing1;
    if (diff > 180) {
      diff -= 360;
    } else if (diff < -180) {
      diff += 360;
    }
    return diff;
  }

  /**
   * Gets compass visualization data.
   * @param deviceHeading Optional device heading in degrees (0-360)
   * @returns Compass visualization data
   */
  getVisualization(deviceHeading: number | null = null): CompassVisualization {
    const qiblaBearing = this.getBearing();
    const heading = deviceHeading ?? this.currentOrientation?.heading ?? null;

    let angleDifference: number | null = null;
    let turnDirection: 'left' | 'right' | 'aligned' | null = null;
    let alignmentDistance: number | null = null;

    if (heading !== null) {
      angleDifference = QiblaCompass.calculateAngleDifference(
        heading,
        qiblaBearing
      );
      alignmentDistance = Math.abs(angleDifference);

      if (alignmentDistance <= this.options.alignmentThreshold) {
        turnDirection = 'aligned';
      } else if (angleDifference > 0) {
        turnDirection = 'right';
      } else {
        turnDirection = 'left';
      }
    }

    return {
      qiblaBearing,
      deviceHeading: heading,
      angleDifference,
      turnDirection,
      alignmentDistance,
    };
  }

  /**
   * Checks if device orientation API is available.
   * @returns True if device orientation is supported
   */
  static isOrientationSupported(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    return 'DeviceOrientationEvent' in window;
  }

  /**
   * Requests permission for device orientation (iOS 13+).
   * @returns Promise resolving to permission status
   */
  static async requestOrientationPermission(): Promise<PermissionState> {
    if (typeof window === 'undefined') {
      return 'denied';
    }

    const DeviceOrientationEvent = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<PermissionState>;
    };

    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        return permission;
      } catch {
        return 'denied';
      }
    }

    // Permission not required (Android, older iOS)
    return 'granted';
  }

  /**
   * Starts tracking device orientation.
   * @param options Optional options override
   * @returns Promise resolving when tracking starts
   */
  async startOrientationTracking(
    options?: Partial<QiblaCompassOptions>
  ): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error(
        'Device orientation is only available in browser environments'
      );
    }

    // Request permission if needed
    const permission = await QiblaCompass.requestOrientationPermission();
    if (permission !== 'granted') {
      throw new Error('Device orientation permission denied');
    }

    // Merge options
    const mergedOptions = {
      ...this.options,
      ...options,
    };

    // Stop existing tracking if any
    this.stopOrientationTracking();

    this.orientationListener = (event: DeviceOrientationEvent) => {
      const orientation: DeviceOrientation = {
        heading: event.absolute ? (event.alpha ?? null) : null,
        trueHeading: event.absolute ? (event.alpha ?? null) : null,
        alpha: event.alpha ?? null,
        beta: event.beta ?? null,
        gamma: event.gamma ?? null,
      };

      // Calculate heading from alpha if available
      if (orientation.alpha !== null) {
        const heading = normalizeAngle(360 - orientation.alpha);
        orientation.heading = heading;
        if (event.absolute) {
          orientation.trueHeading = heading;
        }
      }

      this.currentOrientation = orientation;

      // Get visualization and call callback
      const visualization = this.getVisualization(orientation.heading ?? null);
      mergedOptions.onOrientationChange(visualization);
    };

    window.addEventListener('deviceorientation', this.orientationListener);
  }

  /**
   * Stops tracking device orientation.
   */
  stopOrientationTracking(): void {
    if (this.orientationListener && typeof window !== 'undefined') {
      window.removeEventListener('deviceorientation', this.orientationListener);
      this.orientationListener = null;
      this.currentOrientation = null;
    }
  }

  /**
   * Updates the coordinates and recalculates Qibla bearing.
   * @param coordinates New coordinates
   */
  updateCoordinates(coordinates: Coordinates): void {
    this.coordinates = coordinates;
    // Trigger callback if orientation is being tracked
    if (this.currentOrientation) {
      const visualization = this.getVisualization(
        this.currentOrientation.heading ?? null
      );
      this.options.onOrientationChange(visualization);
    }
  }

  /**
   * Gets helper text for compass visualization.
   * @param visualization Compass visualization data
   * @returns Helper text string
   */
  static getHelperText(visualization: CompassVisualization): string {
    if (visualization.turnDirection === null) {
      return `Qibla is ${visualization.qiblaBearing.toFixed(1)}° from North`;
    }

    if (visualization.turnDirection === 'aligned') {
      return 'You are facing Qibla!';
    }

    const direction =
      visualization.turnDirection === 'right' ? 'right' : 'left';
    const distance = visualization.alignmentDistance?.toFixed(1) ?? '0';
    return `Turn ${direction} ${distance}° to face Qibla`;
  }

  /**
   * Gets the current device orientation.
   * @returns Current device orientation or null if not tracking
   */
  getCurrentOrientation(): DeviceOrientation | null {
    return this.currentOrientation;
  }

  /**
   * Gets the distance to Kaaba in kilometers.
   * @returns Distance in kilometers
   */
  getDistance(): number {
    const result = calculateQibla(this.coordinates);
    if (!result.success) {
      return 0;
    }
    return result.data.distance;
  }
}

/**
 * Create a QiblaCompass instance
 * @param coordinates Location coordinates
 * @param options Compass options
 * @returns QiblaCompass instance
 */
export function createQiblaCompass(
  coordinates: Coordinates,
  options?: QiblaCompassOptions
): QiblaCompass {
  return new QiblaCompass(coordinates, options);
}
