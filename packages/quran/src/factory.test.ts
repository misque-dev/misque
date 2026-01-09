import { describe, it, expect, beforeEach } from 'vitest';
import {
  createQuran,
  createQuranWithReciter,
  createQuranSession,
  createQuranWithData,
} from './factory';
import { Quran, QuranSession } from './core';
import { QuranError, QuranErrorCode } from './errors/errors';
import type { Surah, Reciter } from './types';

describe('Factory Functions', () => {
  describe('createQuran', () => {
    it('creates a Quran instance with default data', () => {
      const quran = createQuran();
      expect(quran).toBeInstanceOf(Quran);
    });

    it('returns instance with 114 surahs', () => {
      const quran = createQuran();
      expect(quran.getSurahCount()).toBe(114);
    });

    it('returns instance with all surahs accessible', () => {
      const quran = createQuran();
      const surahs = quran.getAllSurahs();
      expect(surahs).toHaveLength(114);
      expect(surahs[0]?.number).toBe(1);
      expect(surahs[113]?.number).toBe(114);
    });

    it('returns instance with Al-Fatihah having 7 ayahs', () => {
      const quran = createQuran();
      const surah = quran.getSurah(1);
      expect(surah?.numberOfAyahs).toBe(7);
      expect(surah?.nameTransliterated).toBe('Al-Fatiha');
    });

    it('returns instance with Al-Baqarah having 286 ayahs (longest)', () => {
      const quran = createQuran();
      const surah = quran.getSurah(2);
      expect(surah?.numberOfAyahs).toBe(286);
      expect(surah?.nameTransliterated).toBe('Al-Baqarah');
    });

    it('returns instance with Al-Kawthar having 3 ayahs (shortest)', () => {
      const quran = createQuran();
      const surah = quran.getSurah(108);
      expect(surah?.numberOfAyahs).toBe(3);
    });

    it('returns instance with An-Nas as last surah', () => {
      const quran = createQuran();
      const surah = quran.getSurah(114);
      expect(surah?.nameTransliterated).toBe('An-Nas');
    });

    it('returns instance with reciters loaded', () => {
      const quran = createQuran();
      const reciters = quran.getAllReciters();
      expect(reciters.length).toBeGreaterThan(0);
    });

    it('returns instance with no preferred reciter set', () => {
      const quran = createQuran();
      expect(quran.getPreferredReciterId()).toBeNull();
      expect(quran.getPreferredReciter()).toBeNull();
    });

    it('returns new instance on each call', () => {
      const quran1 = createQuran();
      const quran2 = createQuran();
      expect(quran1).not.toBe(quran2);
    });
  });

  describe('createQuranWithReciter', () => {
    let validReciterId: string;

    beforeEach(() => {
      const quran = createQuran();
      const reciters = quran.getAllReciters();
      validReciterId = reciters[0]?.id || 'alzain';
    });

    it('creates a Quran instance with preferred reciter set', () => {
      const quran = createQuranWithReciter(validReciterId);
      expect(quran).toBeInstanceOf(Quran);
      expect(quran.getPreferredReciterId()).toBe(validReciterId);
    });

    it('returns instance with correct preferred reciter object', () => {
      const quran = createQuranWithReciter(validReciterId);
      const reciter = quran.getPreferredReciter();
      expect(reciter).not.toBeNull();
      expect(reciter?.id).toBe(validReciterId);
    });

    it('returns instance with 114 surahs', () => {
      const quran = createQuranWithReciter(validReciterId);
      expect(quran.getSurahCount()).toBe(114);
    });

    it('allows getting preferred reciter surahs', () => {
      const quran = createQuranWithReciter(validReciterId);
      const surahs = quran.getPreferredReciterSurahs();
      expect(surahs.length).toBeGreaterThan(0);
    });

    it('throws QuranError for unknown reciter', () => {
      expect(() => createQuranWithReciter('unknown-reciter')).toThrow(
        QuranError
      );
    });

    it('throws error with RECITER_NOT_FOUND code for unknown reciter', () => {
      try {
        createQuranWithReciter('unknown-reciter');
        expect.fail('Should have thrown QuranError');
      } catch (error) {
        expect(error).toBeInstanceOf(QuranError);
        if (error instanceof QuranError) {
          expect(error.code).toBe(QuranErrorCode.RECITER_NOT_FOUND);
        }
      }
    });

    it('handles empty reciter ID gracefully', () => {
      // Empty string doesn't find a reciter so preferred remains null
      // The implementation doesn't throw for empty string since validation
      // only checks if reciter exists when setPreferredReciter is called
      const quran = createQuranWithReciter('');
      // Since '' doesn't match any reciter, it's ignored
      expect(quran.getPreferredReciterId()).toBeNull();
    });

    it('creates with alzain reciter', () => {
      const quran = createQuranWithReciter('alzain');
      expect(quran.getPreferredReciterId()).toBe('alzain');
      expect(quran.getPreferredReciter()?.name).toBe('Alzain Mohammad Ahmad');
    });

    it('creates with basit reciter', () => {
      const quran = createQuranWithReciter('basit');
      expect(quran.getPreferredReciterId()).toBe('basit');
    });

    it('creates with afs (Alafasi) reciter', () => {
      const quran = createQuranWithReciter('afs');
      expect(quran.getPreferredReciterId()).toBe('afs');
      expect(quran.getPreferredReciter()?.name).toBe('Mishary Alafasi');
    });
  });

  describe('createQuranSession', () => {
    let validReciterId: string;

    beforeEach(() => {
      const quran = createQuran();
      const reciters = quran.getAllReciters();
      validReciterId = reciters[0]?.id || 'alzain';
    });

    it('creates a QuranSession instance', () => {
      const session = createQuranSession(validReciterId);
      expect(session).toBeInstanceOf(QuranSession);
    });

    it('returns session with correct reciter', () => {
      const session = createQuranSession(validReciterId);
      expect(session.reciter.id).toBe(validReciterId);
    });

    it('returns session with surahs available', () => {
      const session = createQuranSession(validReciterId);
      expect(session.surahs.length).toBeGreaterThan(0);
    });

    it('returns session with correct surah count', () => {
      const session = createQuranSession(validReciterId);
      expect(session.surahCount).toBeGreaterThan(0);
      expect(session.surahCount).toBe(session.surahs.length);
    });

    it('allows getting surah by number', () => {
      const session = createQuranSession(validReciterId);
      const surah = session.getSurah(1);
      expect(surah).not.toBeNull();
      expect(surah?.number).toBe(1);
    });

    it('allows getting player data', () => {
      const session = createQuranSession(validReciterId);
      if (session.hasSurah(1)) {
        const playerData = session.getPlayerData(1);
        expect(playerData.surah).not.toBeNull();
        expect(playerData.fullText).not.toBeNull();
      }
    });

    it('throws error for unknown reciter', () => {
      expect(() => createQuranSession('unknown-reciter')).toThrow();
    });

    it('throws error with descriptive message for unknown reciter', () => {
      expect(() => createQuranSession('unknown-reciter')).toThrow(
        'Reciter "unknown-reciter" not found'
      );
    });

    it('throws error for empty reciter ID', () => {
      expect(() => createQuranSession('')).toThrow();
    });

    it('provides hasSurah method for checking availability', () => {
      const session = createQuranSession(validReciterId);
      // Most reciters have all 114 surahs
      expect(typeof session.hasSurah(1)).toBe('boolean');
    });

    it('provides getAudioUrl method', () => {
      const session = createQuranSession(validReciterId);
      if (session.hasSurah(1)) {
        const audioUrl = session.getAudioUrl(1);
        expect(audioUrl).not.toBeNull();
        expect(typeof audioUrl).toBe('string');
      }
    });

    it('provides getFullText method', () => {
      const session = createQuranSession(validReciterId);
      if (session.hasSurah(1)) {
        const fullText = session.getFullText(1);
        expect(fullText).not.toBeNull();
        expect(typeof fullText).toBe('string');
      }
    });
  });

  describe('createQuranWithData', () => {
    const createMockSurah = (number: number): Surah => ({
      number,
      name: `سورة ${number}`,
      nameTransliterated: `Surah ${number}`,
      numberOfAyahs: 5,
      revelationType: 'meccan',
      ayahs: Array.from({ length: 5 }, (_, i) => ({
        number: i + 1,
        text: `Ayah ${i + 1} text`,
      })),
    });

    const createMockReciter = (id: string): Reciter => ({
      id,
      name: `Reciter ${id}`,
      audioFormat: 'mp3',
      audioBaseUrl: 'https://example.com/audio',
      surahs: [1, 2, 3],
    });

    it('creates Quran instance with custom surahs', () => {
      const surahs = [createMockSurah(1), createMockSurah(2)];
      const quran = createQuranWithData(surahs);

      expect(quran).toBeInstanceOf(Quran);
      expect(quran.getSurahCount()).toBe(2);
    });

    it('creates Quran instance with empty surahs array', () => {
      const quran = createQuranWithData([]);
      expect(quran.getSurahCount()).toBe(0);
    });

    it('creates Quran instance with custom reciters', () => {
      const surahs = [createMockSurah(1)];
      const reciters = [createMockReciter('custom1'), createMockReciter('custom2')];
      const quran = createQuranWithData(surahs, reciters);

      expect(quran.getAllReciters()).toHaveLength(2);
      expect(quran.getReciter('custom1')).not.toBeNull();
      expect(quran.getReciter('custom2')).not.toBeNull();
    });

    it('creates Quran instance with no reciters by default', () => {
      const surahs = [createMockSurah(1)];
      const quran = createQuranWithData(surahs);

      expect(quran.getAllReciters()).toHaveLength(0);
    });

    it('creates Quran instance with preferred reciter', () => {
      const surahs = [createMockSurah(1)];
      const reciters = [createMockReciter('preferred')];
      const quran = createQuranWithData(surahs, reciters, 'preferred');

      expect(quran.getPreferredReciterId()).toBe('preferred');
      expect(quran.getPreferredReciter()?.id).toBe('preferred');
    });

    it('throws error when preferred reciter does not exist', () => {
      const surahs = [createMockSurah(1)];
      const reciters = [createMockReciter('other')];

      expect(() =>
        createQuranWithData(surahs, reciters, 'nonexistent')
      ).toThrow(QuranError);
    });

    it('allows accessing custom surah data', () => {
      const surahs = [createMockSurah(1)];
      const quran = createQuranWithData(surahs);

      const surah = quran.getSurah(1);
      expect(surah?.name).toBe('سورة 1');
      expect(surah?.nameTransliterated).toBe('Surah 1');
      expect(surah?.numberOfAyahs).toBe(5);
    });

    it('returns null for non-existent surah number within valid range', () => {
      const surahs = [createMockSurah(1)];
      const quran = createQuranWithData(surahs);

      // Surah 2 is in valid range (1-114) but not loaded in custom data
      // getSurah returns null for surah not in data, but validates range first
      const result = quran.getSurah(2);
      expect(result).toBeNull();
    });

    it('allows getting all surahs sorted by number', () => {
      const surahs = [createMockSurah(3), createMockSurah(1), createMockSurah(2)];
      const quran = createQuranWithData(surahs);

      const allSurahs = quran.getAllSurahs();
      expect(allSurahs[0]?.number).toBe(1);
      expect(allSurahs[1]?.number).toBe(2);
      expect(allSurahs[2]?.number).toBe(3);
    });

    it('works with single surah', () => {
      const surahs = [createMockSurah(114)];
      const quran = createQuranWithData(surahs);

      expect(quran.getSurahCount()).toBe(1);
      expect(quran.getSurah(114)).not.toBeNull();
    });

    it('works with single reciter having partial surahs', () => {
      const surahs = [createMockSurah(1), createMockSurah(2), createMockSurah(3)];
      const reciters: Reciter[] = [
        {
          id: 'partial',
          name: 'Partial Reciter',
          audioFormat: 'mp3',
          audioBaseUrl: 'https://example.com',
          surahs: [1, 3], // Only has surah 1 and 3
        },
      ];
      const quran = createQuranWithData(surahs, reciters, 'partial');

      const reciterSurahs = quran.getPreferredReciterSurahs();
      expect(reciterSurahs).toHaveLength(2);
      expect(reciterSurahs.map((s) => s.number)).toEqual([1, 3]);
    });
  });
});
