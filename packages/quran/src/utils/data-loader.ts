import type { QuranDataFile, RecitersDataFile } from '../types';
import { createDataLoadError } from '../errors/errors';
import { validateSurah, validateReciter } from './validation';
import quranDataJson from '../data/quran.json';
import recitersDataJson from '../data/reciters.json';

/**
 * Loads and validates Quran data from JSON
 * Data is imported directly and bundled, making it work in all environments
 */
export async function loadQuranData(): Promise<QuranDataFile> {
  try {
    const data = quranDataJson as QuranDataFile;

    // Validate all surahs
    data.surahs.forEach((surah) => {
      validateSurah(surah);
    });

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw createDataLoadError('quran.json', error);
    }
    throw createDataLoadError('quran.json');
  }
}

/**
 * Loads and validates reciters data from JSON
 * Data is imported directly and bundled, making it work in all environments
 */
export async function loadRecitersData(): Promise<RecitersDataFile> {
  try {
    const data = recitersDataJson as RecitersDataFile;

    // Validate all reciters
    data.reciters.forEach((reciter) => {
      validateReciter(reciter);
    });

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw createDataLoadError('reciters.json', error);
    }
    throw createDataLoadError('reciters.json');
  }
}

/**
 * Synchronous version of loadQuranData for cases where data is already loaded
 * Data is imported directly and bundled, making it work in all environments
 */
export function loadQuranDataSync(): QuranDataFile {
  try {
    const data = quranDataJson as QuranDataFile;

    // Validate all surahs
    data.surahs.forEach((surah) => {
      validateSurah(surah);
    });

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw createDataLoadError('quran.json', error);
    }
    throw createDataLoadError('quran.json');
  }
}

/**
 * Synchronous version of loadRecitersData for cases where data is already loaded
 * Data is imported directly and bundled, making it work in all environments
 */
export function loadRecitersDataSync(): RecitersDataFile {
  try {
    const data = recitersDataJson as RecitersDataFile;

    // Validate all reciters
    data.reciters.forEach((reciter) => {
      validateReciter(reciter);
    });

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw createDataLoadError('reciters.json', error);
    }
    throw createDataLoadError('reciters.json');
  }
}
