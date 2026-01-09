/**
 * Base error class for all Quran library errors
 */
export class QuranError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly data?: unknown
  ) {
    super(message);
    this.name = 'QuranError';
    // V8 engines (Node.js, Chrome) have captureStackTrace
    const ErrorWithCapture = Error as typeof Error & {
      captureStackTrace?: (target: object, constructor?: Function) => void;
    };
    if (typeof ErrorWithCapture.captureStackTrace === 'function') {
      ErrorWithCapture.captureStackTrace(this, QuranError);
    }
  }
}

/**
 * Error codes used throughout the library
 */
export enum QuranErrorCode {
  /** Invalid surah number (must be 1-114) */
  INVALID_SURAH_NUMBER = 'INVALID_SURAH_NUMBER',
  /** Invalid ayah number */
  INVALID_AYAH_NUMBER = 'INVALID_AYAH_NUMBER',
  /** Reciter not found */
  RECITER_NOT_FOUND = 'RECITER_NOT_FOUND',
  /** Audio URL not found for the specified reciter/surah/ayah */
  AUDIO_URL_NOT_FOUND = 'AUDIO_URL_NOT_FOUND',
  /** Error loading data files */
  DATA_LOAD_ERROR = 'DATA_LOAD_ERROR',
  /** Data validation failed */
  DATA_VALIDATION_ERROR = 'DATA_VALIDATION_ERROR',
  /** Search query is invalid */
  INVALID_SEARCH_QUERY = 'INVALID_SEARCH_QUERY',
}

/**
 * Creates an error for invalid surah number
 */
export function createInvalidSurahNumberError(surahNumber: number): QuranError {
  return new QuranError(
    `Invalid surah number: ${surahNumber}. Must be between 1 and 114.`,
    QuranErrorCode.INVALID_SURAH_NUMBER,
    { surahNumber }
  );
}

/**
 * Creates an error for invalid ayah number
 */
export function createInvalidAyahNumberError(
  surahNumber: number,
  ayahNumber: number,
  maxAyahs: number
): QuranError {
  return new QuranError(
    `Invalid ayah number: ${ayahNumber} for surah ${surahNumber}. Must be between 1 and ${maxAyahs}.`,
    QuranErrorCode.INVALID_AYAH_NUMBER,
    { surahNumber, ayahNumber, maxAyahs }
  );
}

/**
 * Creates an error for reciter not found
 */
export function createReciterNotFoundError(reciterId: string): QuranError {
  return new QuranError(
    `Reciter not found: ${reciterId}`,
    QuranErrorCode.RECITER_NOT_FOUND,
    { reciterId }
  );
}

/**
 * Creates an error for audio URL not found
 */
export function createAudioUrlNotFoundError(
  reciterId: string,
  surahNumber: number,
  ayahNumber?: number
): QuranError {
  const message = ayahNumber
    ? `Audio URL not found for reciter ${reciterId}, surah ${surahNumber}, ayah ${ayahNumber}`
    : `Audio URLs not found for reciter ${reciterId}, surah ${surahNumber}`;
  return new QuranError(message, QuranErrorCode.AUDIO_URL_NOT_FOUND, {
    reciterId,
    surahNumber,
    ayahNumber,
  });
}

/**
 * Creates an error for data loading failures
 */
export function createDataLoadError(
  resource: string,
  originalError?: Error
): QuranError {
  return new QuranError(
    `Failed to load data: ${resource}. ${originalError?.message || ''}`,
    QuranErrorCode.DATA_LOAD_ERROR,
    { resource, originalError }
  );
}

/**
 * Creates an error for data validation failures
 */
export function createDataValidationError(
  message: string,
  data?: unknown
): QuranError {
  return new QuranError(
    `Data validation failed: ${message}`,
    QuranErrorCode.DATA_VALIDATION_ERROR,
    data
  );
}
