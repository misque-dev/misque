/**
 * Hijri date components
 */
export interface HijriDate {
  year: number;
  month: number;
  day: number;
}

/**
 * Full Hijri date with additional information
 */
export interface HijriDateInfo extends HijriDate {
  monthName: string;
  monthNameArabic: string;
  dayOfWeek: number;
  dayOfWeekName: string;
  dayOfWeekNameArabic: string;
  isLeapYear: boolean;
}

/**
 * Gregorian date components
 */
export interface GregorianDate {
  year: number;
  month: number;
  day: number;
}

/**
 * Conversion result
 */
export interface ConversionResult {
  hijri: HijriDate;
  gregorian: GregorianDate;
  julianDay: number;
}

/**
 * Format options for Hijri dates
 */
export interface HijriFormatOptions {
  /** Include day of week */
  includeDayOfWeek?: boolean;
  /** Use Arabic names */
  useArabic?: boolean;
  /** Format style */
  style?: 'short' | 'medium' | 'long' | 'full';
  /** Include year */
  includeYear?: boolean;
}

/**
 * Month info
 */
export interface HijriMonthInfo {
  number: number;
  name: string;
  nameArabic: string;
  days: number;
}
