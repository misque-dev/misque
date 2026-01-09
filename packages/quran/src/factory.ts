import { Quran } from './core/quran';
import { QuranSession } from './core/quran-session';
import type { Surah, Reciter } from './types';
import { loadQuranDataSync, loadRecitersDataSync } from './utils/data-loader';

/**
 * Factory function to create a Quran instance
 * This is the recommended way to create a Quran instance
 *
 * @example
 * ```typescript
 * const quran = createQuran();
 * const surahs = quran.getAllSurahs();
 * console.log(`Total surahs: ${surahs.length}`); // 114
 * ```
 */
export function createQuran(): Quran {
  const quranData = loadQuranDataSync();
  const recitersData = loadRecitersDataSync();

  return new Quran(quranData.surahs, recitersData.reciters);
}

/**
 * Create a Quran instance with a preferred reciter
 * This is useful when you want to initialize with a user's preferred reciter
 *
 * @param reciterId - The ID of the preferred reciter
 * @returns Quran instance with preferred reciter set
 * @throws {QuranError} If reciter is not found
 *
 * @example
 * ```typescript
 * const quran = createQuranWithReciter('alzain');
 * const surahs = quran.getPreferredReciterSurahs();
 * const audioUrl = quran.getSurahAudioUrl(1);
 * ```
 */
export function createQuranWithReciter(reciterId: string): Quran {
  const quranData = loadQuranDataSync();
  const recitersData = loadRecitersDataSync();

  return new Quran(quranData.surahs, recitersData.reciters, reciterId);
}

/**
 * Create a simplified Quran session for a specific reciter
 * This is the easiest way to work with a reciter - perfect for the common workflow
 *
 * @param reciterId - The ID of the reciter
 * @returns QuranSession with simplified API
 * @throws {Error} If reciter is not found
 *
 * @example
 * ```typescript
 * // Simple workflow:
 * const session = createQuranSession('alzain');
 *
 * // Get all surahs for this reciter
 * const surahs = session.surahs;
 *
 * // Get everything needed to play a surah
 * const { audioUrl, fullText, surah } = session.getPlayerData(1);
 * ```
 */
export function createQuranSession(reciterId: string): QuranSession {
  const quranData = loadQuranDataSync();
  const recitersData = loadRecitersDataSync();
  const quran = new Quran(quranData.surahs, recitersData.reciters);

  return new QuranSession(quran, reciterId);
}

/**
 * Create a Quran instance with custom data
 * Useful for testing or when loading data from external sources
 *
 * @param surahs - Array of surahs to load
 * @param reciters - Array of reciters to load (optional)
 * @param preferredReciterId - Optional preferred reciter ID
 * @returns Quran instance with provided data
 *
 * @example
 * ```typescript
 * const customQuran = createQuranWithData(mySurahs, myReciters);
 * ```
 */
export function createQuranWithData(
  surahs: Surah[],
  reciters: Reciter[] = [],
  preferredReciterId?: string
): Quran {
  return new Quran(surahs, reciters, preferredReciterId);
}
