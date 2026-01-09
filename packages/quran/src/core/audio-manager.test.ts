import { describe, it, expect } from 'vitest';
import { AudioManager } from './audio-manager';
import { QuranError, QuranErrorCode } from '../errors/errors';
import type { Reciter } from '../types';

describe('AudioManager', () => {
  const createLegacyReciter = (
    id: string,
    surahs: number[] = [1, 2, 3]
  ): Reciter => ({
    id,
    name: `Reciter ${id}`,
    audioFormat: 'mp3',
    audioBaseUrl: 'https://legacy.example.com/audio',
    surahs,
  });

  const createMp3QuranReciter = (
    id: string,
    surahs: number[] = [1, 2, 3]
  ): Reciter => ({
    id,
    name: `Reciter ${id}`,
    audioFormat: 'mp3',
    audioBaseUrl: 'https://www.mp3quran.net',
    language: 'eng',
    urlName: id,
    surahs,
  });

  describe('generateAudioUrl', () => {
    describe('legacy format (no language/urlName)', () => {
      it('generates correct URL for surah 1, ayah 1', () => {
        const reciter = createLegacyReciter('test', [1]);
        const url = AudioManager.generateAudioUrl(reciter, 1, 1);
        expect(url).toBe('https://legacy.example.com/audio/001001.mp3');
      });

      it('generates correct URL for surah 2, ayah 286', () => {
        const reciter = createLegacyReciter('test', [2]);
        const url = AudioManager.generateAudioUrl(reciter, 2, 286);
        expect(url).toBe('https://legacy.example.com/audio/002286.mp3');
      });

      it('pads surah number to 3 digits', () => {
        const reciter = createLegacyReciter('test', [1, 10, 100]);
        expect(AudioManager.generateAudioUrl(reciter, 1, 1)).toContain('/001');
        expect(AudioManager.generateAudioUrl(reciter, 10, 1)).toContain('/010');
        expect(AudioManager.generateAudioUrl(reciter, 100, 1)).toContain('/100');
      });

      it('pads ayah number to 3 digits', () => {
        const reciter = createLegacyReciter('test', [1, 2]);
        expect(AudioManager.generateAudioUrl(reciter, 1, 1)).toContain('001.mp3');
        expect(AudioManager.generateAudioUrl(reciter, 2, 10)).toContain('010.mp3');
        expect(AudioManager.generateAudioUrl(reciter, 2, 100)).toContain('100.mp3');
      });

      it('uses correct audio format extension', () => {
        const mp3Reciter: Reciter = {
          ...createLegacyReciter('mp3'),
          audioFormat: 'mp3',
          surahs: [1],
        };
        const m4aReciter: Reciter = {
          ...createLegacyReciter('m4a'),
          audioFormat: 'm4a',
          surahs: [1],
        };
        const oggReciter: Reciter = {
          ...createLegacyReciter('ogg'),
          audioFormat: 'ogg',
          surahs: [1],
        };

        expect(AudioManager.generateAudioUrl(mp3Reciter, 1, 1)).toMatch(/\.mp3$/);
        expect(AudioManager.generateAudioUrl(m4aReciter, 1, 1)).toMatch(/\.m4a$/);
        expect(AudioManager.generateAudioUrl(oggReciter, 1, 1)).toMatch(/\.ogg$/);
      });

      it('removes trailing slash from baseUrl', () => {
        const reciter: Reciter = {
          ...createLegacyReciter('test'),
          audioBaseUrl: 'https://example.com/audio/',
          surahs: [1],
        };
        const url = AudioManager.generateAudioUrl(reciter, 1, 1);
        expect(url).toBe('https://example.com/audio/001001.mp3');
        expect(url).not.toContain('//001');
      });
    });

    describe('mp3quran.net format (with language/urlName)', () => {
      it('generates correct URL for mp3quran.net format', () => {
        const reciter = createMp3QuranReciter('alzain', [1]);
        const url = AudioManager.generateAudioUrl(reciter, 1, 1);
        expect(url).toBe('https://www.mp3quran.net/eng/alzain/1');
      });

      it('uses surah number without padding in mp3quran format', () => {
        const reciter = createMp3QuranReciter('alzain', [1, 114]);
        expect(AudioManager.generateAudioUrl(reciter, 1, 1)).toContain('/1');
        expect(AudioManager.generateAudioUrl(reciter, 114, 1)).toContain('/114');
      });

      it('uses language and urlName from reciter', () => {
        const reciter: Reciter = {
          id: 'test',
          name: 'Test',
          audioFormat: 'mp3',
          audioBaseUrl: 'https://www.mp3quran.net',
          language: 'ar',
          urlName: 'custom_name',
          surahs: [1],
        };
        const url = AudioManager.generateAudioUrl(reciter, 1, 1);
        expect(url).toBe('https://www.mp3quran.net/ar/custom_name/1');
      });

      it('ignores ayah number in mp3quran format (surah-level audio)', () => {
        const reciter = createMp3QuranReciter('alzain', [1]);
        const url1 = AudioManager.generateAudioUrl(reciter, 1, 1);
        const url7 = AudioManager.generateAudioUrl(reciter, 1, 7);
        // Both should point to surah, not specific ayah
        expect(url1).toBe(url7);
      });

      it('removes trailing slash from baseUrl in mp3quran format', () => {
        const reciter: Reciter = {
          ...createMp3QuranReciter('test'),
          audioBaseUrl: 'https://www.mp3quran.net/',
          surahs: [1],
        };
        const url = AudioManager.generateAudioUrl(reciter, 1, 1);
        expect(url).not.toContain('net//eng');
      });
    });

    describe('validation and errors', () => {
      it('throws error for invalid surah number 0', () => {
        const reciter = createLegacyReciter('test', [1]);
        expect(() => AudioManager.generateAudioUrl(reciter, 0, 1)).toThrow(
          QuranError
        );
      });

      it('throws error for invalid surah number 115', () => {
        const reciter = createLegacyReciter('test', [1]);
        expect(() => AudioManager.generateAudioUrl(reciter, 115, 1)).toThrow(
          QuranError
        );
      });

      it('throws error with INVALID_SURAH_NUMBER code', () => {
        const reciter = createLegacyReciter('test', [1]);
        try {
          AudioManager.generateAudioUrl(reciter, 0, 1);
          expect.fail('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(QuranError);
          if (error instanceof QuranError) {
            expect(error.code).toBe(QuranErrorCode.INVALID_SURAH_NUMBER);
          }
        }
      });

      it('throws error when reciter does not have surah', () => {
        const reciter = createLegacyReciter('test', [1, 2]); // no surah 3
        expect(() => AudioManager.generateAudioUrl(reciter, 3, 1)).toThrow(
          QuranError
        );
      });

      it('throws error with AUDIO_URL_NOT_FOUND code for missing surah', () => {
        const reciter = createLegacyReciter('test', [1]);
        try {
          AudioManager.generateAudioUrl(reciter, 2, 1);
          expect.fail('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(QuranError);
          if (error instanceof QuranError) {
            expect(error.code).toBe(QuranErrorCode.AUDIO_URL_NOT_FOUND);
          }
        }
      });
    });

    describe('edge cases', () => {
      it('handles surah 114 (An-Nas)', () => {
        const reciter = createLegacyReciter('test', [114]);
        const url = AudioManager.generateAudioUrl(reciter, 114, 1);
        expect(url).toContain('/114001.mp3');
      });

      it('handles Al-Baqarah ayah 286 (longest surah)', () => {
        const reciter = createLegacyReciter('test', [2]);
        const url = AudioManager.generateAudioUrl(reciter, 2, 286);
        expect(url).toContain('/002286.mp3');
      });

      it('handles Al-Kawthar (shortest surah, 3 ayahs)', () => {
        const reciter = createLegacyReciter('test', [108]);
        const url1 = AudioManager.generateAudioUrl(reciter, 108, 1);
        const url3 = AudioManager.generateAudioUrl(reciter, 108, 3);
        expect(url1).toContain('/108001.mp3');
        expect(url3).toContain('/108003.mp3');
      });
    });
  });

  describe('generateSurahAudioUrls', () => {
    it('generates URLs for all ayahs in surah', () => {
      const reciter = createLegacyReciter('test', [1]);
      const urls = AudioManager.generateSurahAudioUrls(reciter, 1, 7);

      expect(urls).toHaveLength(7);
    });

    it('returns correct structure for each URL', () => {
      const reciter = createLegacyReciter('test', [1]);
      const urls = AudioManager.generateSurahAudioUrls(reciter, 1, 7);

      expect(urls[0]).toEqual({
        surahNumber: 1,
        ayahNumber: 1,
        url: 'https://legacy.example.com/audio/001001.mp3',
      });

      expect(urls[6]).toEqual({
        surahNumber: 1,
        ayahNumber: 7,
        url: 'https://legacy.example.com/audio/001007.mp3',
      });
    });

    it('generates URLs for Al-Baqarah (286 ayahs)', () => {
      const reciter = createLegacyReciter('test', [2]);
      const urls = AudioManager.generateSurahAudioUrls(reciter, 2, 286);

      expect(urls).toHaveLength(286);
      expect(urls[0]?.ayahNumber).toBe(1);
      expect(urls[285]?.ayahNumber).toBe(286);
    });

    it('generates URLs for Al-Kawthar (3 ayahs)', () => {
      const reciter = createLegacyReciter('test', [108]);
      const urls = AudioManager.generateSurahAudioUrls(reciter, 108, 3);

      expect(urls).toHaveLength(3);
    });

    it('generates URLs in sequential order', () => {
      const reciter = createLegacyReciter('test', [1]);
      const urls = AudioManager.generateSurahAudioUrls(reciter, 1, 7);

      for (let i = 0; i < urls.length; i++) {
        expect(urls[i]?.ayahNumber).toBe(i + 1);
      }
    });

    describe('validation and errors', () => {
      it('throws error for invalid surah number 0', () => {
        const reciter = createLegacyReciter('test', [1]);
        expect(() =>
          AudioManager.generateSurahAudioUrls(reciter, 0, 7)
        ).toThrow(QuranError);
      });

      it('throws error for invalid surah number 115', () => {
        const reciter = createLegacyReciter('test', [1]);
        expect(() =>
          AudioManager.generateSurahAudioUrls(reciter, 115, 7)
        ).toThrow(QuranError);
      });

      it('throws error when reciter does not have surah', () => {
        const reciter = createLegacyReciter('test', [1]);
        expect(() =>
          AudioManager.generateSurahAudioUrls(reciter, 2, 286)
        ).toThrow(QuranError);
      });

      it('throws error with AUDIO_URL_NOT_FOUND code', () => {
        const reciter = createLegacyReciter('test', [1]);
        try {
          AudioManager.generateSurahAudioUrls(reciter, 2, 286);
          expect.fail('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(QuranError);
          if (error instanceof QuranError) {
            expect(error.code).toBe(QuranErrorCode.AUDIO_URL_NOT_FOUND);
          }
        }
      });
    });

    it('works with mp3quran.net format', () => {
      const reciter = createMp3QuranReciter('alzain', [1]);
      const urls = AudioManager.generateSurahAudioUrls(reciter, 1, 7);

      expect(urls).toHaveLength(7);
      // All should point to same surah URL in mp3quran format
      urls.forEach((urlObj) => {
        expect(urlObj.url).toBe('https://www.mp3quran.net/eng/alzain/1');
      });
    });

    it('handles single ayah surah', () => {
      const reciter = createLegacyReciter('test', [1]);
      const urls = AudioManager.generateSurahAudioUrls(reciter, 1, 1);

      expect(urls).toHaveLength(1);
      expect(urls[0]?.ayahNumber).toBe(1);
    });
  });

  describe('getAudioUrlPattern', () => {
    describe('legacy format', () => {
      it('returns pattern with placeholders', () => {
        const reciter = createLegacyReciter('test', [1]);
        const pattern = AudioManager.getAudioUrlPattern(reciter);

        expect(pattern).toBe(
          'https://legacy.example.com/audio/{surahNumber:03d}{ayahNumber:03d}.mp3'
        );
      });

      it('includes correct audio format in pattern', () => {
        const m4aReciter: Reciter = {
          ...createLegacyReciter('m4a'),
          audioFormat: 'm4a',
        };
        const pattern = AudioManager.getAudioUrlPattern(m4aReciter);

        expect(pattern).toContain('.m4a');
      });

      it('uses baseUrl from reciter', () => {
        const reciter: Reciter = {
          ...createLegacyReciter('test'),
          audioBaseUrl: 'https://custom.example.com/audio',
        };
        const pattern = AudioManager.getAudioUrlPattern(reciter);

        expect(pattern).toContain('https://custom.example.com/audio');
      });
    });

    describe('mp3quran.net format', () => {
      it('returns pattern with language and urlName', () => {
        const reciter = createMp3QuranReciter('alzain', [1]);
        const pattern = AudioManager.getAudioUrlPattern(reciter);

        expect(pattern).toBe(
          'https://www.mp3quran.net/eng/alzain/{surahNumber}'
        );
      });

      it('uses reciter-specific language and urlName', () => {
        const reciter: Reciter = {
          id: 'custom',
          name: 'Custom',
          audioFormat: 'mp3',
          audioBaseUrl: 'https://www.mp3quran.net',
          language: 'ar',
          urlName: 'custom_reciter',
          surahs: [1],
        };
        const pattern = AudioManager.getAudioUrlPattern(reciter);

        expect(pattern).toBe(
          'https://www.mp3quran.net/ar/custom_reciter/{surahNumber}'
        );
      });
    });

    describe('pattern distinguishing', () => {
      it('legacy format includes ayahNumber placeholder', () => {
        const reciter = createLegacyReciter('test', [1]);
        const pattern = AudioManager.getAudioUrlPattern(reciter);

        expect(pattern).toContain('{ayahNumber:03d}');
      });

      it('mp3quran format does not include ayahNumber placeholder', () => {
        const reciter = createMp3QuranReciter('alzain', [1]);
        const pattern = AudioManager.getAudioUrlPattern(reciter);

        expect(pattern).not.toContain('ayahNumber');
        expect(pattern).toContain('{surahNumber}');
      });
    });
  });

  describe('static method behavior', () => {
    it('generateAudioUrl is a static method', () => {
      expect(typeof AudioManager.generateAudioUrl).toBe('function');
    });

    it('generateSurahAudioUrls is a static method', () => {
      expect(typeof AudioManager.generateSurahAudioUrls).toBe('function');
    });

    it('getAudioUrlPattern is a static method', () => {
      expect(typeof AudioManager.getAudioUrlPattern).toBe('function');
    });

    it('can be called without instantiation', () => {
      const reciter = createLegacyReciter('test', [1]);

      // These should work without `new AudioManager()`
      expect(() =>
        AudioManager.generateAudioUrl(reciter, 1, 1)
      ).not.toThrow();
      expect(() =>
        AudioManager.generateSurahAudioUrls(reciter, 1, 7)
      ).not.toThrow();
      expect(() => AudioManager.getAudioUrlPattern(reciter)).not.toThrow();
    });
  });

  describe('real-world reciter examples', () => {
    it('works with Alzain Mohammad Ahmad reciter', () => {
      const alzain: Reciter = {
        id: 'alzain',
        name: 'Alzain Mohammad Ahmad',
        nameArabic: 'الزين محمد أحمد',
        audioFormat: 'mp3',
        audioBaseUrl: 'https://www.mp3quran.net',
        language: 'eng',
        urlName: 'alzain',
        surahs: Array.from({ length: 114 }, (_, i) => i + 1),
      };

      const url = AudioManager.generateAudioUrl(alzain, 1, 1);
      expect(url).toBe('https://www.mp3quran.net/eng/alzain/1');

      const pattern = AudioManager.getAudioUrlPattern(alzain);
      expect(pattern).toBe('https://www.mp3quran.net/eng/alzain/{surahNumber}');
    });

    it('works with Mishary Alafasi reciter', () => {
      const afs: Reciter = {
        id: 'afs',
        name: 'Mishary Alafasi',
        nameArabic: 'مشاري العفاسي',
        audioFormat: 'mp3',
        audioBaseUrl: 'https://www.mp3quran.net',
        language: 'eng',
        urlName: 'afs',
        surahs: Array.from({ length: 114 }, (_, i) => i + 1),
      };

      const url = AudioManager.generateAudioUrl(afs, 114, 1);
      expect(url).toBe('https://www.mp3quran.net/eng/afs/114');
    });

    it('handles Saad Al-Ghamdi with underscore in urlName', () => {
      const sGmd: Reciter = {
        id: 's-gmd',
        name: 'Saad Al-Ghamdi',
        nameArabic: 'سعد الغامدي',
        audioFormat: 'mp3',
        audioBaseUrl: 'https://www.mp3quran.net',
        language: 'eng',
        urlName: 's_gmd',
        surahs: Array.from({ length: 114 }, (_, i) => i + 1),
      };

      const url = AudioManager.generateAudioUrl(sGmd, 1, 1);
      expect(url).toBe('https://www.mp3quran.net/eng/s_gmd/1');
    });
  });
});
