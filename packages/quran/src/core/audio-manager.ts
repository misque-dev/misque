import type { AudioUrl, Reciter } from '../types';
import { createAudioUrlNotFoundError } from '../errors/errors';
import { validateSurahNumber } from '../utils/validation';

/**
 * Manages audio URL generation and retrieval
 */
export class AudioManager {
  /**
   * Generate audio URL for a specific ayah
   * For mp3quran.net format: baseurl/Language/reciter-name/surah-number
   * For legacy format: baseurl/{surahNumber:03d}{ayahNumber:03d}.{format}
   */
  static generateAudioUrl(
    reciter: Reciter,
    surahNumber: number,
    ayahNumber: number
  ): string {
    validateSurahNumber(surahNumber);

    if (!reciter.surahs.includes(surahNumber)) {
      throw createAudioUrlNotFoundError(reciter.id, surahNumber, ayahNumber);
    }

    // Check if reciter uses mp3quran.net format
    if (reciter.language && reciter.urlName) {
      // mp3quran.net format: baseurl/Language/reciter-name/surah-number
      const baseUrl = reciter.audioBaseUrl.replace(/\/$/, '');
      return `${baseUrl}/${reciter.language}/${reciter.urlName}/${surahNumber}`;
    }

    // Legacy format: {baseUrl}/{surahNumber:03d}{ayahNumber:03d}.{format}
    const surahPadded = String(surahNumber).padStart(3, '0');
    const ayahPadded = String(ayahNumber).padStart(3, '0');
    const filename = `${surahPadded}${ayahPadded}.${reciter.audioFormat}`;

    // Ensure baseUrl doesn't end with a slash
    const baseUrl = reciter.audioBaseUrl.replace(/\/$/, '');

    return `${baseUrl}/${filename}`;
  }

  /**
   * Generate all audio URLs for a surah
   */
  static generateSurahAudioUrls(
    reciter: Reciter,
    surahNumber: number,
    numberOfAyahs: number
  ): AudioUrl[] {
    validateSurahNumber(surahNumber);

    if (!reciter.surahs.includes(surahNumber)) {
      throw createAudioUrlNotFoundError(reciter.id, surahNumber);
    }

    const audioUrls: AudioUrl[] = [];

    for (let ayahNumber = 1; ayahNumber <= numberOfAyahs; ayahNumber++) {
      const url = this.generateAudioUrl(reciter, surahNumber, ayahNumber);
      audioUrls.push({
        surahNumber,
        ayahNumber,
        url,
      });
    }

    return audioUrls;
  }

  /**
   * Generate audio URL pattern for a reciter
   * Useful for understanding the URL structure
   */
  static getAudioUrlPattern(reciter: Reciter): string {
    if (reciter.language && reciter.urlName) {
      return `${reciter.audioBaseUrl}/${reciter.language}/${reciter.urlName}/{surahNumber}`;
    }
    return `${reciter.audioBaseUrl}/{surahNumber:03d}{ayahNumber:03d}.${reciter.audioFormat}`;
  }
}
