import type {
  PrayerTimes,
  PrayerTimesFormatted,
  CalculationParams,
  PrayerLocation,
  AsrMethod,
  HighLatitudeMethod,
  CurrentPrayer,
  PrayerAdjustments,
} from './types';
import { toRadians, toDegrees, formatTime, type Result } from '@misque/core';
import { getMethod } from './methods';

/** Internal type for prayer time calculations (hours as decimals) */
interface PrayerTimesNumeric {
  fajr: number;
  sunrise: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
}

/**
 * Calculate prayer times for a specific date and location
 *
 * @example
 * ```ts
 * const location = { latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' };
 * const params = getDefaultParams();
 * const result = calculatePrayerTimes(new Date(), location, params);
 * if (result.success) {
 *   console.log(result.data.fajr);
 * }
 * ```
 */
export function calculatePrayerTimes(
  date: Date,
  location: PrayerLocation,
  params: CalculationParams
): Result<PrayerTimes> {
  try {
    const { latitude, longitude, elevation = 0 } = location;
    const { method, asrMethod, highLatitudeMethod, adjustments = {} } = params;

    // Get Julian Day
    const jd = getJulianDay(date);

    // Calculate sun position
    const sunPosition = calculateSunPosition(jd);

    // Calculate prayer times
    const times: PrayerTimesNumeric = computePrayerTimes(
      latitude,
      longitude,
      elevation,
      sunPosition,
      method.fajrAngle,
      method.ishaAngle,
      method.maghribAngle,
      method.ishaInterval,
      asrMethod
    );

    // Apply high latitude adjustments if needed
    const adjusted: PrayerTimesNumeric = applyHighLatitudeAdjustments(
      times,
      highLatitudeMethod,
      latitude,
      method.fajrAngle,
      method.ishaAngle
    );

    // Apply manual adjustments
    const final: PrayerTimesNumeric = applyManualAdjustments(adjusted, adjustments);

    // Convert to Date objects
    const result = convertToDateObjects(final, date);

    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Calculation failed'),
    };
  }
}

/**
 * Get default calculation parameters
 */
export function getDefaultParams(): CalculationParams {
  return {
    method: getMethod('MWL'),
    asrMethod: 'Standard',
    highLatitudeMethod: 'NightMiddle',
  };
}

/**
 * Format prayer times as strings
 */
export function formatPrayerTimes(
  times: PrayerTimes,
  use24Hour = true
): PrayerTimesFormatted {
  const format = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();

    if (use24Hour) {
      return formatTime(hours, minutes);
    }

    const h = hours % 12 || 12;
    const period = hours < 12 ? 'AM' : 'PM';
    return `${h}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return {
    fajr: format(times.fajr),
    sunrise: format(times.sunrise),
    dhuhr: format(times.dhuhr),
    asr: format(times.asr),
    maghrib: format(times.maghrib),
    isha: format(times.isha),
  };
}

/**
 * Get the current prayer based on the current time
 */
export function getCurrentPrayer(
  times: PrayerTimes,
  now: Date = new Date()
): CurrentPrayer {
  const prayers: (keyof PrayerTimes)[] = [
    'fajr',
    'sunrise',
    'dhuhr',
    'asr',
    'maghrib',
    'isha',
  ];

  const nowTime = now.getTime();
  let current: keyof PrayerTimes = 'isha';
  let next: keyof PrayerTimes = 'fajr';

  for (let i = 0; i < prayers.length; i++) {
    const prayer = prayers[i]!;
    const nextPrayer = prayers[i + 1] ?? 'fajr';
    const prayerTime = times[prayer].getTime();
    const nextPrayerTime = times[nextPrayer]?.getTime() ?? times.fajr.getTime() + 86400000;

    if (nowTime >= prayerTime && nowTime < nextPrayerTime) {
      current = prayer;
      next = nextPrayer;
      break;
    }
  }

  const timeUntilNext = Math.round((times[next].getTime() - nowTime) / 60000);

  return { current, next, timeUntilNext };
}

/**
 * Get time until next prayer in minutes
 */
export function getTimeUntilNextPrayer(
  times: PrayerTimes,
  now: Date = new Date()
): number {
  return getCurrentPrayer(times, now).timeUntilNext;
}

// Internal helper functions

interface SunPosition {
  declination: number;
  equationOfTime: number;
}

function getJulianDay(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

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

function calculateSunPosition(jd: number): SunPosition {
  const d = jd - 2451545.0;

  // Mean longitude of the sun
  const g = 357.529 + 0.98560028 * d;
  const gRad = toRadians(g);

  // Equation of center
  const c = 1.915 * Math.sin(gRad) + 0.02 * Math.sin(2 * gRad);

  // Ecliptic longitude
  const L = 280.459 + 0.98564736 * d + c;
  const lambda = toRadians(L);

  // Obliquity of the ecliptic
  const epsilon = toRadians(23.439 - 0.00000036 * d);

  // Declination
  const declination = toDegrees(
    Math.asin(Math.sin(epsilon) * Math.sin(lambda))
  );

  // Equation of time
  const y = Math.tan(epsilon / 2) ** 2;
  const LRad = toRadians(L);
  const eot =
    4 *
    toDegrees(
      y * Math.sin(2 * LRad) -
        2 * 0.0167 * Math.sin(gRad) +
        4 * 0.0167 * y * Math.sin(gRad) * Math.cos(2 * LRad) -
        0.5 * y * y * Math.sin(4 * LRad) -
        1.25 * 0.0167 * 0.0167 * Math.sin(2 * gRad)
    );

  return { declination, equationOfTime: eot };
}

function computePrayerTimes(
  latitude: number,
  longitude: number,
  elevation: number,
  sunPosition: SunPosition,
  fajrAngle: number,
  ishaAngle: number,
  maghribAngle: number | undefined,
  ishaInterval: number | undefined,
  asrMethod: AsrMethod
): PrayerTimesNumeric {
  const { declination, equationOfTime } = sunPosition;
  const latRad = toRadians(latitude);
  const decRad = toRadians(declination);

  // Solar noon
  const noon = 12 + (-longitude / 15) - equationOfTime / 60;

  // Sunrise/Sunset angle adjustment for elevation
  const elevationAdjustment = 0.833 + 0.0347 * Math.sqrt(Math.max(0, elevation));

  // Hour angle calculation
  const hourAngle = (angle: number) => {
    const a = toRadians(angle);
    const cos_ha =
      (Math.sin(a) - Math.sin(latRad) * Math.sin(decRad)) /
      (Math.cos(latRad) * Math.cos(decRad));
    return toDegrees(Math.acos(Math.max(-1, Math.min(1, cos_ha)))) / 15;
  };

  // Calculate times
  const sunrise = noon - hourAngle(elevationAdjustment);
  const sunset = noon + hourAngle(elevationAdjustment);
  const fajr = noon - hourAngle(fajrAngle);

  // Asr calculation
  const asrFactor = asrMethod === 'Hanafi' ? 2 : 1;
  const asrAngle = toDegrees(
    Math.atan(1 / (asrFactor + Math.tan(Math.abs(latRad - decRad))))
  );
  const asr = noon + hourAngle(90 - asrAngle);

  // Maghrib
  const maghrib = maghribAngle ? noon + hourAngle(maghribAngle) : sunset;

  // Isha
  const isha = ishaInterval
    ? maghrib + ishaInterval / 60
    : noon + hourAngle(ishaAngle);

  return {
    fajr,
    sunrise,
    dhuhr: noon,
    asr,
    maghrib,
    isha,
  };
}

function applyHighLatitudeAdjustments(
  times: PrayerTimesNumeric,
  method: HighLatitudeMethod,
  latitude: number,
  fajrAngle: number,
  ishaAngle: number
): PrayerTimesNumeric {
  if (method === 'None' || Math.abs(latitude) < 48) {
    return times;
  }

  const nightDuration = times.sunrise - times.maghrib + 24;
  let fajrDiff = 0;
  let ishaDiff = 0;

  switch (method) {
    case 'NightMiddle':
      fajrDiff = nightDuration / 2;
      ishaDiff = nightDuration / 2;
      break;
    case 'OneSeventh':
      fajrDiff = nightDuration / 7;
      ishaDiff = nightDuration / 7;
      break;
    case 'AngleBased':
      fajrDiff = (nightDuration * fajrAngle) / 60;
      ishaDiff = (nightDuration * ishaAngle) / 60;
      break;
  }

  return {
    ...times,
    fajr: Math.max(times.fajr, times.sunrise - fajrDiff),
    isha: Math.min(times.isha, times.maghrib + ishaDiff),
  };
}

function applyManualAdjustments(
  times: PrayerTimesNumeric,
  adjustments: PrayerAdjustments
): PrayerTimesNumeric {
  return {
    fajr: times.fajr + (adjustments.fajr ?? 0) / 60,
    sunrise: times.sunrise + (adjustments.sunrise ?? 0) / 60,
    dhuhr: times.dhuhr + (adjustments.dhuhr ?? 0) / 60,
    asr: times.asr + (adjustments.asr ?? 0) / 60,
    maghrib: times.maghrib + (adjustments.maghrib ?? 0) / 60,
    isha: times.isha + (adjustments.isha ?? 0) / 60,
  };
}

function convertToDateObjects(
  times: PrayerTimesNumeric,
  date: Date
): PrayerTimes {
  const toDate = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    const d = new Date(date);
    d.setHours(h, m, 0, 0);
    return d;
  };

  return {
    fajr: toDate(times.fajr),
    sunrise: toDate(times.sunrise),
    dhuhr: toDate(times.dhuhr),
    asr: toDate(times.asr),
    maghrib: toDate(times.maghrib),
    isha: toDate(times.isha),
  };
}
