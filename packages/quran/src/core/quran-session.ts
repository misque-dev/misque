import { type Quran } from './quran';
import type { Surah, Reciter, PlayerData } from '../types';

/**
 * A simplified session API for working with a specific reciter
 * This provides an intuitive, developer-friendly interface for the common workflow:
 * 1. User picks a reciter
 * 2. Get surahs for that reciter
 * 3. Play surah audio and read full text
 */
export class QuranSession {
  constructor(
    private quran: Quran,
    private reciterId: string
  ) {
    // Validate reciter exists
    const reciter = quran.getReciter(reciterId);
    if (!reciter) {
      throw new Error(`Reciter "${reciterId}" not found`);
    }
  }

  /**
   * Get the reciter for this session
   */
  get reciter(): Reciter {
    const reciter = this.quran.getReciter(this.reciterId);
    if (!reciter) {
      throw new Error(`Reciter "${this.reciterId}" not found`);
    }
    return reciter;
  }

  /**
   * Get all surahs available for this reciter
   * This is the main list users will see
   */
  get surahs(): Surah[] {
    return this.quran.getSurahsByReciter(this.reciterId);
  }

  /**
   * Get a specific surah by number
   */
  getSurah(surahNumber: number): Surah | null {
    const surah = this.quran.getSurah(surahNumber);
    if (!surah) {
      return null;
    }
    // Check if this reciter has this surah
    if (!this.quran.getReciter(this.reciterId)?.surahs.includes(surahNumber)) {
      return null;
    }
    return surah;
  }

  /**
   * Get audio URL for a surah
   * Perfect for mp3 players
   */
  getAudioUrl(surahNumber: number): string | null {
    return this.quran.getSurahAudioUrlForReciter(this.reciterId, surahNumber);
  }

  /**
   * Get full text of a surah
   * Perfect for displaying while audio plays
   */
  getFullText(surahNumber: number): string | null {
    if (!this.hasSurah(surahNumber)) {
      return null;
    }
    return this.quran.getSurahFullText(surahNumber);
  }

  /**
   * Get everything needed to play a surah
   * Returns audio URL and full text in one call
   */
  getPlayerData(surahNumber: number): PlayerData {
    return {
      audioUrl: this.getAudioUrl(surahNumber),
      fullText: this.getFullText(surahNumber),
      surah: this.getSurah(surahNumber),
    };
  }

  /**
   * Check if a surah is available for this reciter
   */
  hasSurah(surahNumber: number): boolean {
    const reciter = this.quran.getReciter(this.reciterId);
    return reciter?.surahs.includes(surahNumber) ?? false;
  }

  /**
   * Get the number of surahs available for this reciter
   */
  get surahCount(): number {
    return this.surahs.length;
  }
}
