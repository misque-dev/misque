/**
 * Quran data and search APIs
 * @module @misque/quran
 */

// Types
export type {
  Ayah,
  Surah,
  Reciter,
  AudioUrl,
  FilterOptions,
  PaginationOptions,
  PaginatedResult,
  SearchOptions,
  SearchResult,
  QuranMetadata,
  VerseReference,
  VerseRange,
  Juz,
  PlayerData,
  QuranDataFile,
  RecitersDataFile,
} from './types';

// Core classes
export { Quran, QuranSession, ReciterManager, AudioManager } from './core';

// Factory functions
export {
  createQuran,
  createQuranWithReciter,
  createQuranSession,
  createQuranWithData,
} from './factory';

// Errors
export {
  QuranError,
  QuranErrorCode,
  createInvalidSurahNumberError,
  createInvalidAyahNumberError,
  createReciterNotFoundError,
  createAudioUrlNotFoundError,
  createDataLoadError,
  createDataValidationError,
} from './errors/errors';

// Utilities
export {
  validateSurahNumber,
  validateAyahNumber,
  validateSurah,
  validateAyah,
  validateReciter,
} from './utils/validation';

export {
  loadQuranData,
  loadRecitersData,
  loadQuranDataSync,
  loadRecitersDataSync,
} from './utils/data-loader';
