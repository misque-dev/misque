import type { Coordinates } from '@misque/core';

/**
 * Qibla direction result
 */
export interface QiblaDirection {
  /** Bearing angle in degrees from true north (0-360) */
  bearing: number;
  /** Distance to Kaaba in kilometers */
  distance: number;
  /** Compass direction description */
  compassDirection: CompassDirection;
}

/**
 * Compass direction enum
 */
export type CompassDirection =
  | 'N'
  | 'NNE'
  | 'NE'
  | 'ENE'
  | 'E'
  | 'ESE'
  | 'SE'
  | 'SSE'
  | 'S'
  | 'SSW'
  | 'SW'
  | 'WSW'
  | 'W'
  | 'WNW'
  | 'NW'
  | 'NNW';

/**
 * Qibla calculation options
 */
export interface QiblaOptions {
  /** Apply magnetic declination correction */
  magneticDeclination?: number;
}

/**
 * Location with qibla information
 */
export interface LocationWithQibla extends Coordinates {
  qibla: QiblaDirection;
}

/**
 * Device orientation data from browser sensors
 */
export interface DeviceOrientation {
  /** Device heading in degrees (0-360) from magnetic north */
  heading: number | null;
  /** Device heading in degrees (0-360) from true north */
  trueHeading: number | null;
  /** Device alpha rotation (z-axis) in degrees */
  alpha: number | null;
  /** Device beta rotation (x-axis) in degrees */
  beta: number | null;
  /** Device gamma rotation (y-axis) in degrees */
  gamma: number | null;
}

/**
 * Compass visualization data
 */
export interface CompassVisualization {
  /** Qibla bearing in degrees from North (0-360) */
  qiblaBearing: number;
  /** Current device heading in degrees from North (0-360) */
  deviceHeading: number | null;
  /** Angle difference between device heading and Qibla direction */
  angleDifference: number | null;
  /** Direction to turn: 'left', 'right', or 'aligned' */
  turnDirection: 'left' | 'right' | 'aligned' | null;
  /** Distance to Qibla alignment in degrees (0-180) */
  alignmentDistance: number | null;
}

/**
 * Options for QiblaCompass
 */
export interface QiblaCompassOptions {
  /** Whether to use true north instead of magnetic north (default: false) */
  useTrueNorth?: boolean;
  /** Callback function called when device orientation changes */
  onOrientationChange?: (visualization: CompassVisualization) => void;
  /** Threshold in degrees for considering device aligned with Qibla (default: 5) */
  alignmentThreshold?: number;
}
