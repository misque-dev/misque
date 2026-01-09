import type {
  Surah,
  Ayah,
  Reciter,
  AudioUrl,
  SearchOptions,
  SearchResult,
  FilterOptions,
  PaginationOptions,
  PaginatedResult,
  QuranMetadata,
} from '../types';
import {
  createInvalidSurahNumberError,
  createReciterNotFoundError,
  createAudioUrlNotFoundError,
} from '../errors/errors';
import { validateSurahNumber, validateAyahNumber } from '../utils/validation';
import { ReciterManager } from './reciter-manager';
import { AudioManager } from './audio-manager';
import type { QuranSession } from './quran-session';

/**
 * Main Quran class providing access to Quran text and audio data
 */
export class Quran {
  private surahs: Map<number, Surah> = new Map();
  private reciterManager: ReciterManager;
  private filteredSurahsCache: Map<string, Surah[]> = new Map();
  private allSurahsCache: Surah[] | null = null;
  private preferredReciterId: string | null = null;

  /**
   * Create a new Quran instance
   * @param surahs - Array of surahs to load
   * @param reciters - Array of reciters to load
   * @param preferredReciterId - Optional preferred reciter ID to set on initialization
   */
  constructor(
    surahs: Surah[] = [],
    reciters: Reciter[] = [],
    preferredReciterId?: string
  ) {
    this.loadSurahs(surahs);
    this.reciterManager = new ReciterManager(reciters);
    if (preferredReciterId) {
      this.setPreferredReciter(preferredReciterId);
    }
  }

  private loadSurahs(surahs: Surah[]): void {
    this.surahs.clear();
    this.filteredSurahsCache.clear();
    this.allSurahsCache = null;
    surahs.forEach((surah) => {
      this.surahs.set(surah.number, surah);
    });
  }

  /**
   * Get all surahs
   * Results are cached for performance
   */
  getAllSurahs(): Surah[] {
    if (this.allSurahsCache) {
      return this.allSurahsCache;
    }

    const sorted = Array.from(this.surahs.values()).sort(
      (a, b) => a.number - b.number
    );
    this.allSurahsCache = sorted;
    return sorted;
  }

  private getFilterCacheKey(filters?: FilterOptions): string {
    if (!filters) {
      return 'all';
    }
    return JSON.stringify(filters);
  }

  /**
   * Get surahs with optional filters
   */
  getSurahs(filters?: FilterOptions): Surah[] {
    const cacheKey = this.getFilterCacheKey(filters);
    const cached = this.filteredSurahsCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    let surahs = this.getAllSurahs();

    if (!filters) {
      this.filteredSurahsCache.set(cacheKey, surahs);
      return surahs;
    }

    if (filters.revelationType) {
      surahs = surahs.filter((s) => s.revelationType === filters.revelationType);
    }

    if (filters.minSurahNumber !== undefined) {
      surahs = surahs.filter((s) => s.number >= filters.minSurahNumber!);
    }
    if (filters.maxSurahNumber !== undefined) {
      surahs = surahs.filter((s) => s.number <= filters.maxSurahNumber!);
    }

    if (filters.minAyahs !== undefined) {
      surahs = surahs.filter((s) => s.numberOfAyahs >= filters.minAyahs!);
    }
    if (filters.maxAyahs !== undefined) {
      surahs = surahs.filter((s) => s.numberOfAyahs <= filters.maxAyahs!);
    }

    this.filteredSurahsCache.set(cacheKey, surahs);
    return surahs;
  }

  /**
   * Get paginated surahs with optional filters
   */
  getSurahsPaginated(
    pagination?: PaginationOptions,
    filters?: FilterOptions
  ): PaginatedResult<Surah> {
    const page = pagination?.page || 1;
    const pageSize = pagination?.pageSize || 10;

    const allSurahs = this.getSurahs(filters);
    const total = allSurahs.length;
    const totalPages = Math.ceil(total / pageSize);

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const items = allSurahs.slice(startIndex, endIndex);

    return {
      items,
      page,
      pageSize,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  /**
   * Get paginated search results
   */
  searchPaginated(
    query: string,
    pagination?: PaginationOptions,
    options?: Omit<SearchOptions, 'limit'>
  ): PaginatedResult<SearchResult> {
    const page = pagination?.page || 1;
    const pageSize = pagination?.pageSize || 10;

    const allResults = this.search(query, {
      ...options,
      limit: undefined,
    });

    const total = allResults.length;
    const totalPages = Math.ceil(total / pageSize);

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const items = allResults.slice(startIndex, endIndex);

    return {
      items,
      page,
      pageSize,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  /**
   * Get a surah by number
   */
  getSurah(surahNumber: number): Surah | null {
    validateSurahNumber(surahNumber);
    return this.surahs.get(surahNumber) || null;
  }

  /**
   * Get an ayah by surah and ayah number
   */
  getAyah(surahNumber: number, ayahNumber: number): Ayah | null {
    const surah = this.getSurah(surahNumber);
    if (!surah) {
      return null;
    }

    validateAyahNumber(surahNumber, ayahNumber, surah.numberOfAyahs);

    return surah.ayahs.find((ayah) => ayah.number === ayahNumber) || null;
  }

  /**
   * Get all reciters
   */
  getAllReciters(): Reciter[] {
    return this.reciterManager.getAllReciters();
  }

  /**
   * Get a reciter by ID
   */
  getReciter(reciterId: string): Reciter | null {
    return this.reciterManager.getReciter(reciterId);
  }

  /**
   * Get surahs available for a specific reciter
   */
  getSurahsByReciter(reciterId: string): Surah[] {
    const reciter = this.reciterManager.getReciter(reciterId);
    if (!reciter) {
      throw createReciterNotFoundError(reciterId);
    }

    const surahNumbers = this.reciterManager.getSurahNumbers(reciterId);
    const surahs: Surah[] = [];

    surahNumbers.forEach((surahNumber) => {
      const surah = this.getSurah(surahNumber);
      if (surah) {
        surahs.push(surah);
      }
    });

    return surahs;
  }

  /**
   * Get audio URL for a specific ayah
   */
  getAudioUrl(
    reciterId: string,
    surahNumber: number,
    ayahNumber: number
  ): string | null {
    const reciter = this.reciterManager.getReciter(reciterId);
    if (!reciter) {
      throw createReciterNotFoundError(reciterId);
    }

    const surah = this.getSurah(surahNumber);
    if (!surah) {
      throw createInvalidSurahNumberError(surahNumber);
    }

    validateAyahNumber(surahNumber, ayahNumber, surah.numberOfAyahs);

    if (!this.reciterManager.hasSurah(reciterId, surahNumber)) {
      return null;
    }

    try {
      return AudioManager.generateAudioUrl(reciter, surahNumber, ayahNumber);
    } catch {
      return null;
    }
  }

  /**
   * Get all audio URLs for a surah
   */
  getSurahAudioUrls(reciterId: string, surahNumber: number): AudioUrl[] {
    const reciter = this.reciterManager.getReciter(reciterId);
    if (!reciter) {
      throw createReciterNotFoundError(reciterId);
    }

    const surah = this.getSurah(surahNumber);
    if (!surah) {
      throw createInvalidSurahNumberError(surahNumber);
    }

    if (!this.reciterManager.hasSurah(reciterId, surahNumber)) {
      throw createAudioUrlNotFoundError(reciterId, surahNumber);
    }

    return AudioManager.generateSurahAudioUrls(
      reciter,
      surahNumber,
      surah.numberOfAyahs
    );
  }

  /**
   * Search the Quran text
   */
  search(query: string, options: SearchOptions = {}): SearchResult[] {
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return [];
    }

    const normalizedQuery = query.toLowerCase().trim();
    const language = options.language || 'en';
    const limit = options.limit || 100;
    const searchArabic = options.searchArabic !== false;
    const searchTranslations = options.searchTranslations !== false;
    const filters = options.filters;

    const results: SearchResult[] = [];

    const surahsToSearch = filters
      ? this.getSurahs(filters)
      : this.getAllSurahs();

    surahsToSearch.forEach((surah) => {
      surah.ayahs.forEach((ayah) => {
        let score = 0;
        let snippet = '';
        let matched = false;

        // Search in Arabic text
        if (searchArabic && ayah.text) {
          const arabicLower = ayah.text.toLowerCase();
          if (arabicLower.includes(normalizedQuery)) {
            score += 10;
            snippet = ayah.text;
            matched = true;
          }
        }

        // Search in translations
        if (searchTranslations && ayah.translations) {
          const translation = ayah.translations[language];
          if (translation) {
            const translationLower = translation.toLowerCase();
            if (translationLower.includes(normalizedQuery)) {
              score += 5;
              if (!snippet) {
                snippet = translation;
              }
              matched = true;
            }
          }
        }

        // Search in transliteration
        if (ayah.transliteration) {
          const transliterationLower = ayah.transliteration.toLowerCase();
          if (transliterationLower.includes(normalizedQuery)) {
            score += 3;
            if (!snippet) {
              snippet = ayah.transliteration;
            }
            matched = true;
          }
        }

        if (matched) {
          results.push({
            ayah,
            surah,
            snippet,
            score,
          });
        }
      });
    });

    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  /**
   * Update surahs (useful for dynamic loading)
   */
  updateSurahs(surahs: Surah[]): void {
    this.loadSurahs(surahs);
  }

  /**
   * Update reciters (useful for dynamic loading)
   */
  updateReciters(reciters: Reciter[]): void {
    this.reciterManager.updateReciters(reciters);
  }

  /**
   * Get metadata about the Quran data
   */
  getMetadata(): QuranMetadata {
    const surahs = this.getAllSurahs();
    const totalAyahs = surahs.reduce(
      (sum, surah) => sum + surah.ayahs.length,
      0
    );

    return {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      totalSurahs: surahs.length,
      totalAyahs,
    };
  }

  /**
   * Get total number of surahs
   */
  getSurahCount(): number {
    return this.surahs.size;
  }

  /**
   * Get total number of ayahs in a surah
   */
  getAyahCount(surahNumber: number): number {
    const surah = this.surahs.get(surahNumber);
    return surah ? surah.numberOfAyahs : 0;
  }

  /**
   * Get total number of reciters
   */
  getReciterCount(): number {
    return this.reciterManager.getAllReciters().length;
  }

  /**
   * Set the preferred reciter
   */
  setPreferredReciter(reciterId: string): void {
    if (!this.reciterManager.hasReciter(reciterId)) {
      throw createReciterNotFoundError(reciterId);
    }
    this.preferredReciterId = reciterId;
  }

  /**
   * Get the preferred reciter
   */
  getPreferredReciter(): Reciter | null {
    if (!this.preferredReciterId) {
      return null;
    }
    return this.reciterManager.getReciter(this.preferredReciterId);
  }

  /**
   * Get the preferred reciter ID
   */
  getPreferredReciterId(): string | null {
    return this.preferredReciterId;
  }

  /**
   * Clear the preferred reciter
   */
  clearPreferredReciter(): void {
    this.preferredReciterId = null;
  }

  /**
   * Get surahs available for the preferred reciter
   */
  getPreferredReciterSurahs(): Surah[] {
    if (!this.preferredReciterId) {
      throw new Error(
        'No preferred reciter is set. Use setPreferredReciter() first.'
      );
    }
    return this.getSurahsByReciter(this.preferredReciterId);
  }

  /**
   * Get audio URL for a surah using the preferred reciter
   */
  getSurahAudioUrl(surahNumber: number): string | null {
    if (!this.preferredReciterId) {
      throw new Error(
        'No preferred reciter is set. Use setPreferredReciter() first.'
      );
    }
    return this.getSurahAudioUrlForReciter(
      this.preferredReciterId,
      surahNumber
    );
  }

  /**
   * Get audio URL for a surah for a specific reciter
   */
  getSurahAudioUrlForReciter(
    reciterId: string,
    surahNumber: number
  ): string | null {
    const reciter = this.reciterManager.getReciter(reciterId);
    if (!reciter) {
      throw createReciterNotFoundError(reciterId);
    }

    const surah = this.getSurah(surahNumber);
    if (!surah) {
      throw createInvalidSurahNumberError(surahNumber);
    }

    if (!this.reciterManager.hasSurah(reciterId, surahNumber)) {
      return null;
    }

    try {
      return AudioManager.generateAudioUrl(reciter, surahNumber, 1);
    } catch {
      return null;
    }
  }

  /**
   * Get full text of a surah
   */
  getSurahFullText(surahNumber: number): string | null {
    const surah = this.surahs.get(surahNumber);
    if (!surah) {
      return null;
    }

    if (surah.fullText) {
      return surah.fullText;
    }

    return surah.ayahs.map((ayah) => `${ayah.text} [${ayah.number}]`).join(' ');
  }

  /**
   * Create a simplified session for working with a specific reciter
   */
  withReciter(reciterId: string): QuranSession {
    // Dynamic import to avoid circular dependency
     
    const { QuranSession: QuranSessionClass } = require('./quran-session') as {
      QuranSession: typeof import('./quran-session').QuranSession;
    };
    return new QuranSessionClass(this, reciterId);
  }
}
