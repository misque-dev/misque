import type { Coordinates } from '@misque/core';

/**
 * Prayer times for a single day
 */
export interface PrayerTimes {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
}

/**
 * Prayer times as formatted strings
 */
export interface PrayerTimesFormatted {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

/**
 * Calculation method name
 */
export type CalculationMethodName =
  | 'MWL' // Muslim World League
  | 'ISNA' // Islamic Society of North America
  | 'Egypt' // Egyptian General Authority
  | 'Makkah' // Umm al-Qura, Makkah
  | 'Karachi' // University of Islamic Sciences, Karachi
  | 'Tehran' // Institute of Geophysics, Tehran
  | 'Jafari' // Shia Ithna Ashari
  | 'Dubai' // Dubai
  | 'Qatar' // Qatar
  | 'Kuwait' // Kuwait
  | 'Singapore' // Singapore
  | 'Turkey' // Diyanet, Turkey
  | 'MoonsightingCommittee' // Moonsighting Committee Worldwide
  | 'Custom';

/**
 * Shafaq (twilight) type for Moonsighting Committee method
 * Affects Isha calculation at high latitudes
 */
export type Shafaq = 'general' | 'ahmer' | 'abyad';

/**
 * Rounding mode for prayer times
 */
export type Rounding = 'nearest' | 'up' | 'none';

/**
 * Polar circle resolution method
 * Used when sun doesn't rise or set in polar regions
 */
export type PolarCircleResolution =
  | 'AqrabYaum' // Use nearest day with valid sunrise/sunset
  | 'AqrabBalad' // Use nearest latitude with valid sunrise/sunset
  | 'Unresolved'; // Return invalid times

/**
 * Calculation method parameters
 */
export interface CalculationMethod {
  name: CalculationMethodName;
  /** Fajr angle below horizon */
  fajrAngle: number;
  /** Isha angle below horizon (if using angle) */
  ishaAngle: number;
  /** Isha minutes after Maghrib (if using interval) */
  ishaInterval?: number;
  /** Maghrib angle below horizon (if different from sunset) */
  maghribAngle?: number;
  /** Midnight calculation method */
  midnight?: 'Standard' | 'Jafari';
  /** Method-specific adjustments (in minutes) */
  methodAdjustments?: PrayerAdjustments;
  /** Rounding mode */
  rounding?: Rounding;
  /** Shafaq type for Isha at high latitudes (MoonsightingCommittee) */
  shafaq?: Shafaq;
}

/**
 * Asr calculation method
 */
export type AsrMethod = 'Standard' | 'Hanafi';

/**
 * High latitude adjustment method
 */
export type HighLatitudeMethod =
  | 'None'
  | 'NightMiddle'
  | 'OneSeventh'
  | 'AngleBased';

/**
 * Calculation parameters
 */
export interface CalculationParams {
  method: CalculationMethod;
  asrMethod: AsrMethod;
  highLatitudeMethod: HighLatitudeMethod;
  adjustments?: PrayerAdjustments;
  polarCircleResolution?: PolarCircleResolution;
  shafaq?: Shafaq;
}

/**
 * Manual adjustments for prayer times (in minutes)
 */
export interface PrayerAdjustments {
  fajr?: number;
  sunrise?: number;
  dhuhr?: number;
  asr?: number;
  maghrib?: number;
  isha?: number;
}

/**
 * Location with calculation parameters
 */
export interface PrayerLocation extends Coordinates {
  elevation?: number;
  timezone: string;
}

/**
 * Current prayer info
 */
export interface CurrentPrayer {
  current: keyof PrayerTimes;
  next: keyof PrayerTimes;
  timeUntilNext: number; // in minutes
}

/**
 * Sunnah times for night prayers
 */
export interface SunnahTimes {
  /** Middle of the night (between Maghrib and Fajr) */
  middleOfTheNight: Date;
  /** Last third of the night (optimal time for Tahajjud) */
  lastThirdOfTheNight: Date;
}
