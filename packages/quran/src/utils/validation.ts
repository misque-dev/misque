import type { Surah, Reciter, Ayah } from '../types';
import {
  createDataValidationError,
  createInvalidSurahNumberError,
  createInvalidAyahNumberError,
} from '../errors/errors';

/**
 * Validates that a surah number is within valid range (1-114)
 */
export function validateSurahNumber(surahNumber: number): void {
  if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) {
    throw createInvalidSurahNumberError(surahNumber);
  }
}

/**
 * Validates that an ayah number is valid for a given surah
 */
export function validateAyahNumber(
  surahNumber: number,
  ayahNumber: number,
  maxAyahs: number
): void {
  validateSurahNumber(surahNumber);
  if (
    !Number.isInteger(ayahNumber) ||
    ayahNumber < 1 ||
    ayahNumber > maxAyahs
  ) {
    throw createInvalidAyahNumberError(surahNumber, ayahNumber, maxAyahs);
  }
}

/**
 * Validates a surah object structure
 */
export function validateSurah(surah: unknown): surah is Surah {
  if (!surah || typeof surah !== 'object') {
    throw createDataValidationError('Surah must be an object');
  }

  const s = surah as Partial<Surah>;

  if (!Number.isInteger(s.number) || s.number! < 1 || s.number! > 114) {
    throw createDataValidationError(`Invalid surah number: ${s.number}`, surah);
  }

  if (typeof s.name !== 'string' || s.name.length === 0) {
    throw createDataValidationError('Surah name is required', surah);
  }

  if (typeof s.nameTransliterated !== 'string') {
    throw createDataValidationError(
      'Surah nameTransliterated is required',
      surah
    );
  }

  if (!Number.isInteger(s.numberOfAyahs) || s.numberOfAyahs! < 1) {
    throw createDataValidationError(
      'Surah numberOfAyahs must be a positive integer',
      surah
    );
  }

  if (s.revelationType !== 'meccan' && s.revelationType !== 'medinan') {
    throw createDataValidationError(
      "Surah revelationType must be 'meccan' or 'medinan'",
      surah
    );
  }

  if (!Array.isArray(s.ayahs)) {
    throw createDataValidationError('Surah ayahs must be an array', surah);
  }

  if (s.ayahs.length !== s.numberOfAyahs) {
    throw createDataValidationError(
      `Surah ayahs array length (${s.ayahs.length}) does not match numberOfAyahs (${s.numberOfAyahs})`,
      surah
    );
  }

  // Validate each ayah
  s.ayahs.forEach((ayah, index) => {
    validateAyah(ayah, s.number!, index + 1);
  });

  return true;
}

/**
 * Validates an ayah object structure
 */
export function validateAyah(
  ayah: unknown,
  surahNumber: number,
  expectedNumber: number
): ayah is Ayah {
  if (!ayah || typeof ayah !== 'object') {
    throw createDataValidationError('Ayah must be an object', ayah);
  }

  const a = ayah as Partial<Ayah>;

  if (!Number.isInteger(a.number) || a.number !== expectedNumber) {
    throw createDataValidationError(
      `Ayah number mismatch: expected ${expectedNumber}, got ${a.number}`,
      ayah
    );
  }

  if (typeof a.text !== 'string' || a.text.length === 0) {
    throw createDataValidationError('Ayah text is required', ayah);
  }

  return true;
}

/**
 * Validates a reciter object structure
 */
export function validateReciter(reciter: unknown): reciter is Reciter {
  if (!reciter || typeof reciter !== 'object') {
    throw createDataValidationError('Reciter must be an object', reciter);
  }

  const r = reciter as Partial<Reciter>;

  if (typeof r.id !== 'string' || r.id.length === 0) {
    throw createDataValidationError('Reciter id is required', reciter);
  }

  if (typeof r.name !== 'string' || r.name.length === 0) {
    throw createDataValidationError('Reciter name is required', reciter);
  }

  if (!['mp3', 'm4a', 'ogg'].includes(r.audioFormat || '')) {
    throw createDataValidationError(
      "Reciter audioFormat must be 'mp3', 'm4a', or 'ogg'",
      reciter
    );
  }

  if (typeof r.audioBaseUrl !== 'string' || r.audioBaseUrl.length === 0) {
    throw createDataValidationError(
      'Reciter audioBaseUrl is required',
      reciter
    );
  }

  if (!Array.isArray(r.surahs)) {
    throw createDataValidationError('Reciter surahs must be an array', reciter);
  }

  // Validate surah numbers in the array
  r.surahs.forEach((surahNum) => {
    if (!Number.isInteger(surahNum) || surahNum < 1 || surahNum > 114) {
      throw createDataValidationError(
        `Invalid surah number in reciter surahs array: ${surahNum}`,
        reciter
      );
    }
  });

  return true;
}
