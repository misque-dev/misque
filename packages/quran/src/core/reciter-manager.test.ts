import { describe, it, expect, beforeEach } from 'vitest';
import { ReciterManager } from './reciter-manager';
import { QuranError, QuranErrorCode } from '../errors/errors';
import type { Reciter } from '../types';

describe('ReciterManager', () => {
  const createMockReciter = (
    id: string,
    surahs: number[] = [1, 2, 3]
  ): Reciter => ({
    id,
    name: `Reciter ${id}`,
    audioFormat: 'mp3',
    audioBaseUrl: `https://example.com/${id}`,
    surahs,
  });

  describe('constructor', () => {
    it('creates manager with empty reciters array', () => {
      const manager = new ReciterManager([]);
      expect(manager.getAllReciters()).toHaveLength(0);
    });

    it('creates manager with reciters', () => {
      const reciters = [createMockReciter('r1'), createMockReciter('r2')];
      const manager = new ReciterManager(reciters);
      expect(manager.getAllReciters()).toHaveLength(2);
    });

    it('creates manager with default empty array when no argument', () => {
      const manager = new ReciterManager();
      expect(manager.getAllReciters()).toHaveLength(0);
    });
  });

  describe('getAllReciters', () => {
    it('returns empty array when no reciters loaded', () => {
      const manager = new ReciterManager([]);
      expect(manager.getAllReciters()).toEqual([]);
    });

    it('returns all loaded reciters', () => {
      const reciters = [
        createMockReciter('r1'),
        createMockReciter('r2'),
        createMockReciter('r3'),
      ];
      const manager = new ReciterManager(reciters);

      const allReciters = manager.getAllReciters();
      expect(allReciters).toHaveLength(3);
    });

    it('returns reciters with correct structure', () => {
      const reciters = [createMockReciter('r1')];
      const manager = new ReciterManager(reciters);

      const allReciters = manager.getAllReciters();
      expect(allReciters[0]?.id).toBe('r1');
      expect(allReciters[0]?.name).toBe('Reciter r1');
      expect(allReciters[0]?.audioFormat).toBe('mp3');
    });

    it('returns new array on each call (not same reference)', () => {
      const reciters = [createMockReciter('r1')];
      const manager = new ReciterManager(reciters);

      const result1 = manager.getAllReciters();
      const result2 = manager.getAllReciters();
      expect(result1).not.toBe(result2);
      expect(result1).toEqual(result2);
    });
  });

  describe('getReciter', () => {
    let manager: ReciterManager;

    beforeEach(() => {
      const reciters = [
        createMockReciter('alzain'),
        createMockReciter('basit'),
        createMockReciter('afs'),
      ];
      manager = new ReciterManager(reciters);
    });

    it('returns reciter by ID', () => {
      const reciter = manager.getReciter('alzain');
      expect(reciter).not.toBeNull();
      expect(reciter?.id).toBe('alzain');
    });

    it('returns null for unknown reciter ID', () => {
      const reciter = manager.getReciter('unknown');
      expect(reciter).toBeNull();
    });

    it('returns null for empty string ID', () => {
      const reciter = manager.getReciter('');
      expect(reciter).toBeNull();
    });

    it('returns correct reciter for each ID', () => {
      expect(manager.getReciter('alzain')?.id).toBe('alzain');
      expect(manager.getReciter('basit')?.id).toBe('basit');
      expect(manager.getReciter('afs')?.id).toBe('afs');
    });

    it('returns reciter with all properties', () => {
      const reciter = manager.getReciter('alzain');
      expect(reciter?.id).toBe('alzain');
      expect(reciter?.name).toBe('Reciter alzain');
      expect(reciter?.audioFormat).toBe('mp3');
      expect(reciter?.audioBaseUrl).toBe('https://example.com/alzain');
      expect(reciter?.surahs).toEqual([1, 2, 3]);
    });
  });

  describe('hasReciter', () => {
    let manager: ReciterManager;

    beforeEach(() => {
      const reciters = [createMockReciter('r1'), createMockReciter('r2')];
      manager = new ReciterManager(reciters);
    });

    it('returns true for existing reciter', () => {
      expect(manager.hasReciter('r1')).toBe(true);
      expect(manager.hasReciter('r2')).toBe(true);
    });

    it('returns false for non-existing reciter', () => {
      expect(manager.hasReciter('r3')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(manager.hasReciter('')).toBe(false);
    });

    it('is case-sensitive', () => {
      expect(manager.hasReciter('R1')).toBe(false);
      expect(manager.hasReciter('r1')).toBe(true);
    });
  });

  describe('getRecitersBySurah', () => {
    let manager: ReciterManager;

    beforeEach(() => {
      const reciters = [
        createMockReciter('r1', [1, 2, 3]),
        createMockReciter('r2', [1, 3, 5]),
        createMockReciter('r3', [2, 4, 6]),
      ];
      manager = new ReciterManager(reciters);
    });

    it('returns reciters that have surah 1', () => {
      const reciters = manager.getRecitersBySurah(1);
      expect(reciters).toHaveLength(2);
      expect(reciters.map((r) => r.id).sort()).toEqual(['r1', 'r2']);
    });

    it('returns reciters that have surah 2', () => {
      const reciters = manager.getRecitersBySurah(2);
      expect(reciters).toHaveLength(2);
      expect(reciters.map((r) => r.id).sort()).toEqual(['r1', 'r3']);
    });

    it('returns reciters that have surah 5', () => {
      const reciters = manager.getRecitersBySurah(5);
      expect(reciters).toHaveLength(1);
      expect(reciters[0]?.id).toBe('r2');
    });

    it('returns empty array for surah with no reciters', () => {
      const reciters = manager.getRecitersBySurah(114);
      expect(reciters).toHaveLength(0);
    });

    it('throws error for invalid surah number 0', () => {
      expect(() => manager.getRecitersBySurah(0)).toThrow(QuranError);
    });

    it('throws error for invalid surah number 115', () => {
      expect(() => manager.getRecitersBySurah(115)).toThrow(QuranError);
    });

    it('throws error with INVALID_SURAH_NUMBER code', () => {
      try {
        manager.getRecitersBySurah(0);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(QuranError);
        if (error instanceof QuranError) {
          expect(error.code).toBe(QuranErrorCode.INVALID_SURAH_NUMBER);
        }
      }
    });

    it('returns all reciters when all have same surah', () => {
      const reciters = [
        createMockReciter('r1', [1]),
        createMockReciter('r2', [1]),
        createMockReciter('r3', [1]),
      ];
      const mgr = new ReciterManager(reciters);

      expect(mgr.getRecitersBySurah(1)).toHaveLength(3);
    });
  });

  describe('hasSurah', () => {
    let manager: ReciterManager;

    beforeEach(() => {
      const reciters = [
        createMockReciter('r1', [1, 2, 3, 4, 5]),
        createMockReciter('r2', [1, 114]),
      ];
      manager = new ReciterManager(reciters);
    });

    it('returns true when reciter has surah', () => {
      expect(manager.hasSurah('r1', 1)).toBe(true);
      expect(manager.hasSurah('r1', 5)).toBe(true);
      expect(manager.hasSurah('r2', 114)).toBe(true);
    });

    it('returns false when reciter does not have surah', () => {
      expect(manager.hasSurah('r1', 114)).toBe(false);
      expect(manager.hasSurah('r2', 50)).toBe(false);
    });

    it('returns false for non-existing reciter', () => {
      expect(manager.hasSurah('unknown', 1)).toBe(false);
    });

    it('throws error for invalid surah number 0', () => {
      expect(() => manager.hasSurah('r1', 0)).toThrow(QuranError);
    });

    it('throws error for invalid surah number 115', () => {
      expect(() => manager.hasSurah('r1', 115)).toThrow(QuranError);
    });

    it('checks boundary surahs correctly', () => {
      const reciters = [createMockReciter('full', [1, 114])];
      const mgr = new ReciterManager(reciters);

      expect(mgr.hasSurah('full', 1)).toBe(true);
      expect(mgr.hasSurah('full', 114)).toBe(true);
      expect(mgr.hasSurah('full', 57)).toBe(false);
    });
  });

  describe('getSurahNumbers', () => {
    let manager: ReciterManager;

    beforeEach(() => {
      const reciters = [
        createMockReciter('r1', [5, 1, 3, 2, 4]),
        createMockReciter('r2', [114, 1]),
      ];
      manager = new ReciterManager(reciters);
    });

    it('returns surah numbers for existing reciter', () => {
      const surahs = manager.getSurahNumbers('r1');
      expect(surahs).toEqual([1, 2, 3, 4, 5]); // sorted
    });

    it('returns sorted surah numbers', () => {
      const surahs = manager.getSurahNumbers('r2');
      expect(surahs).toEqual([1, 114]);
    });

    it('throws error for non-existing reciter', () => {
      expect(() => manager.getSurahNumbers('unknown')).toThrow(QuranError);
    });

    it('throws error with RECITER_NOT_FOUND code', () => {
      try {
        manager.getSurahNumbers('unknown');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(QuranError);
        if (error instanceof QuranError) {
          expect(error.code).toBe(QuranErrorCode.RECITER_NOT_FOUND);
        }
      }
    });

    it('returns new array (not same reference as internal)', () => {
      const surahs1 = manager.getSurahNumbers('r1');
      const surahs2 = manager.getSurahNumbers('r1');
      expect(surahs1).not.toBe(surahs2);
      expect(surahs1).toEqual(surahs2);
    });

    it('returns all 114 surahs for full reciter', () => {
      const allSurahs = Array.from({ length: 114 }, (_, i) => i + 1);
      const reciters = [createMockReciter('full', allSurahs)];
      const mgr = new ReciterManager(reciters);

      const result = mgr.getSurahNumbers('full');
      expect(result).toHaveLength(114);
      expect(result[0]).toBe(1);
      expect(result[113]).toBe(114);
    });

    it('handles reciter with single surah', () => {
      const reciters = [createMockReciter('single', [108])];
      const mgr = new ReciterManager(reciters);

      expect(mgr.getSurahNumbers('single')).toEqual([108]);
    });

    it('handles reciter with empty surahs array', () => {
      const reciters = [createMockReciter('empty', [])];
      const mgr = new ReciterManager(reciters);

      expect(mgr.getSurahNumbers('empty')).toEqual([]);
    });
  });

  describe('updateReciters', () => {
    it('replaces all reciters', () => {
      const manager = new ReciterManager([createMockReciter('old')]);
      expect(manager.hasReciter('old')).toBe(true);

      manager.updateReciters([createMockReciter('new')]);
      expect(manager.hasReciter('old')).toBe(false);
      expect(manager.hasReciter('new')).toBe(true);
    });

    it('clears reciters when updated with empty array', () => {
      const manager = new ReciterManager([
        createMockReciter('r1'),
        createMockReciter('r2'),
      ]);
      expect(manager.getAllReciters()).toHaveLength(2);

      manager.updateReciters([]);
      expect(manager.getAllReciters()).toHaveLength(0);
    });

    it('updates surah index correctly', () => {
      const manager = new ReciterManager([createMockReciter('r1', [1, 2])]);
      expect(manager.getRecitersBySurah(1)).toHaveLength(1);
      expect(manager.getRecitersBySurah(3)).toHaveLength(0);

      manager.updateReciters([createMockReciter('r2', [3, 4])]);
      expect(manager.getRecitersBySurah(1)).toHaveLength(0);
      expect(manager.getRecitersBySurah(3)).toHaveLength(1);
    });

    it('allows multiple updates', () => {
      const manager = new ReciterManager([]);

      manager.updateReciters([createMockReciter('r1')]);
      expect(manager.getAllReciters()).toHaveLength(1);

      manager.updateReciters([createMockReciter('r1'), createMockReciter('r2')]);
      expect(manager.getAllReciters()).toHaveLength(2);

      manager.updateReciters([createMockReciter('r3')]);
      expect(manager.getAllReciters()).toHaveLength(1);
      expect(manager.hasReciter('r3')).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('handles reciter with all 114 surahs', () => {
      const allSurahs = Array.from({ length: 114 }, (_, i) => i + 1);
      const reciters = [createMockReciter('complete', allSurahs)];
      const manager = new ReciterManager(reciters);

      expect(manager.hasSurah('complete', 1)).toBe(true);
      expect(manager.hasSurah('complete', 114)).toBe(true);
      expect(manager.hasSurah('complete', 57)).toBe(true);
      expect(manager.getSurahNumbers('complete')).toHaveLength(114);
    });

    it('handles duplicate surah numbers in reciter', () => {
      const reciters = [
        {
          id: 'dup',
          name: 'Duplicate',
          audioFormat: 'mp3' as const,
          audioBaseUrl: 'https://example.com',
          surahs: [1, 1, 2, 2, 3],
        },
      ];
      const manager = new ReciterManager(reciters);

      // hasSurah should still work
      expect(manager.hasSurah('dup', 1)).toBe(true);
    });

    it('handles reciter with non-sequential surahs', () => {
      const reciters = [createMockReciter('sparse', [1, 50, 100, 114])];
      const manager = new ReciterManager(reciters);

      expect(manager.hasSurah('sparse', 1)).toBe(true);
      expect(manager.hasSurah('sparse', 50)).toBe(true);
      expect(manager.hasSurah('sparse', 2)).toBe(false);
      expect(manager.getSurahNumbers('sparse')).toEqual([1, 50, 100, 114]);
    });

    it('handles many reciters with overlapping surahs', () => {
      const reciters = Array.from({ length: 50 }, (_, i) =>
        createMockReciter(`r${i}`, [1, 2, 3])
      );
      const manager = new ReciterManager(reciters);

      expect(manager.getRecitersBySurah(1)).toHaveLength(50);
      expect(manager.getAllReciters()).toHaveLength(50);
    });
  });

  describe('with real reciter data structure', () => {
    it('handles mp3quran.net format reciter', () => {
      const reciter: Reciter = {
        id: 'alzain',
        name: 'Alzain Mohammad Ahmad',
        nameArabic: 'الزين محمد أحمد',
        audioFormat: 'mp3',
        audioBaseUrl: 'https://www.mp3quran.net',
        language: 'eng',
        urlName: 'alzain',
        surahs: Array.from({ length: 114 }, (_, i) => i + 1),
      };

      const manager = new ReciterManager([reciter]);

      expect(manager.getReciter('alzain')).not.toBeNull();
      expect(manager.getReciter('alzain')?.language).toBe('eng');
      expect(manager.getReciter('alzain')?.urlName).toBe('alzain');
      expect(manager.getSurahNumbers('alzain')).toHaveLength(114);
    });

    it('handles legacy format reciter', () => {
      const reciter: Reciter = {
        id: 'legacy',
        name: 'Legacy Reciter',
        audioFormat: 'mp3',
        audioBaseUrl: 'https://legacy.example.com/audio',
        surahs: [1, 2, 3],
      };

      const manager = new ReciterManager([reciter]);

      expect(manager.getReciter('legacy')).not.toBeNull();
      expect(manager.getReciter('legacy')?.language).toBeUndefined();
      expect(manager.getReciter('legacy')?.urlName).toBeUndefined();
    });
  });
});
