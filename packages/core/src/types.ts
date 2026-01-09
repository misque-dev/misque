/**
 * Geographic coordinates
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Location with optional elevation
 */
export interface Location extends Coordinates {
  elevation?: number;
  timezone?: string;
}

/**
 * Date components for Islamic calendar operations
 */
export interface DateComponents {
  year: number;
  month: number;
  day: number;
}

/**
 * Time components
 */
export interface TimeComponents {
  hours: number;
  minutes: number;
  seconds?: number;
}

/**
 * Result wrapper for operations that can fail
 */
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Async result wrapper
 */
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

/**
 * Language codes for localization
 */
export type LanguageCode = 'ar' | 'en' | 'fr' | 'id' | 'ms' | 'tr' | 'ur';

/**
 * Direction for text rendering
 */
export type TextDirection = 'ltr' | 'rtl';
