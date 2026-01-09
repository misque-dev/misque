import type { Reciter } from '../types';
import { createReciterNotFoundError } from '../errors/errors';
import { validateSurahNumber } from '../utils/validation';

/**
 * Manages reciter data and operations
 */
export class ReciterManager {
  private reciters: Map<string, Reciter> = new Map();
  private recitersBySurah: Map<number, Set<string>> = new Map();

  /**
   * Initialize the reciter manager with reciter data
   */
  constructor(reciters: Reciter[] = []) {
    this.loadReciters(reciters);
  }

  /**
   * Load reciters into the manager
   */
  private loadReciters(reciters: Reciter[]): void {
    this.reciters.clear();
    this.recitersBySurah.clear();

    reciters.forEach((reciter) => {
      this.reciters.set(reciter.id, reciter);

      // Build index of reciters by surah
      reciter.surahs.forEach((surahNumber) => {
        if (!this.recitersBySurah.has(surahNumber)) {
          this.recitersBySurah.set(surahNumber, new Set());
        }
        this.recitersBySurah.get(surahNumber)!.add(reciter.id);
      });
    });
  }

  /**
   * Get all reciters
   */
  getAllReciters(): Reciter[] {
    return Array.from(this.reciters.values());
  }

  /**
   * Get a reciter by ID
   */
  getReciter(reciterId: string): Reciter | null {
    return this.reciters.get(reciterId) || null;
  }

  /**
   * Check if a reciter exists
   */
  hasReciter(reciterId: string): boolean {
    return this.reciters.has(reciterId);
  }

  /**
   * Get all reciters that have recorded a specific surah
   */
  getRecitersBySurah(surahNumber: number): Reciter[] {
    validateSurahNumber(surahNumber);

    const reciterIds = this.recitersBySurah.get(surahNumber);
    if (!reciterIds || reciterIds.size === 0) {
      return [];
    }

    return Array.from(reciterIds)
      .map((id) => this.reciters.get(id))
      .filter((reciter): reciter is Reciter => reciter !== undefined);
  }

  /**
   * Check if a reciter has recorded a specific surah
   */
  hasSurah(reciterId: string, surahNumber: number): boolean {
    validateSurahNumber(surahNumber);

    const reciter = this.reciters.get(reciterId);
    if (!reciter) {
      return false;
    }

    return reciter.surahs.includes(surahNumber);
  }

  /**
   * Get surah numbers available for a specific reciter
   */
  getSurahNumbers(reciterId: string): number[] {
    const reciter = this.reciters.get(reciterId);
    if (!reciter) {
      throw createReciterNotFoundError(reciterId);
    }

    return [...reciter.surahs].sort((a, b) => a - b);
  }

  /**
   * Update reciters (useful for dynamic loading)
   */
  updateReciters(reciters: Reciter[]): void {
    this.loadReciters(reciters);
  }
}
