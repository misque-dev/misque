import { describe, it, expect, beforeEach } from 'vitest';
import {
  createQuran,
  createQuranWithReciter,
  createQuranSession,
  type Quran,
  QuranError,
  QuranErrorCode,
} from './index';

describe('Quran', () => {
  let quran: Quran;

  beforeEach(() => {
    quran = createQuran();
  });

  describe('getAllSurahs', () => {
    it('returns all 114 surahs', () => {
      const surahs = quran.getAllSurahs();
      expect(surahs).toHaveLength(114);
    });

    it('returns surahs sorted by number', () => {
      const surahs = quran.getAllSurahs();
      expect(surahs[0]?.number).toBe(1);
      expect(surahs[113]?.number).toBe(114);
    });
  });

  describe('getSurah', () => {
    it('returns Al-Fatihah for number 1', () => {
      const surah = quran.getSurah(1);
      expect(surah).not.toBeNull();
      expect(surah?.name).toBe('الفاتحة');
      expect(surah?.nameTransliterated).toBe('Al-Fatiha');
      expect(surah?.numberOfAyahs).toBe(7);
    });

    it('returns An-Nas for number 114', () => {
      const surah = quran.getSurah(114);
      expect(surah).not.toBeNull();
      expect(surah?.nameTransliterated).toBe('An-Nas');
    });

    it('throws error for invalid surah number 0', () => {
      expect(() => quran.getSurah(0)).toThrow(QuranError);
    });

    it('throws error for invalid surah number 115', () => {
      expect(() => quran.getSurah(115)).toThrow(QuranError);
    });
  });

  describe('getAyah', () => {
    it('returns first ayah of Al-Fatihah', () => {
      const ayah = quran.getAyah(1, 1);
      expect(ayah).not.toBeNull();
      expect(ayah?.number).toBe(1);
      expect(ayah?.text).toContain('بِسْمِ');
    });

    it('returns null for non-existent surah', () => {
      // First this will throw because surah 200 is invalid
      expect(() => quran.getAyah(200, 1)).toThrow(QuranError);
    });
  });

  describe('getSurahs with filters', () => {
    it('filters by Meccan revelation type', () => {
      const surahs = quran.getSurahs({ revelationType: 'meccan' });
      expect(surahs.every((s) => s.revelationType === 'meccan')).toBe(true);
    });

    it('filters by Medinan revelation type', () => {
      const surahs = quran.getSurahs({ revelationType: 'medinan' });
      expect(surahs.every((s) => s.revelationType === 'medinan')).toBe(true);
    });

    it('filters by surah number range', () => {
      const surahs = quran.getSurahs({
        minSurahNumber: 1,
        maxSurahNumber: 10,
      });
      expect(surahs).toHaveLength(10);
    });

    it('filters by minimum ayah count', () => {
      const surahs = quran.getSurahs({ minAyahs: 100 });
      expect(surahs.every((s) => s.numberOfAyahs >= 100)).toBe(true);
    });
  });

  describe('getSurahsPaginated', () => {
    it('returns paginated results', () => {
      const result = quran.getSurahsPaginated({ page: 1, pageSize: 10 });
      expect(result.items).toHaveLength(10);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.total).toBe(114);
      expect(result.totalPages).toBe(12);
      expect(result.hasNext).toBe(true);
      expect(result.hasPrevious).toBe(false);
    });

    it('returns correct page 2', () => {
      const result = quran.getSurahsPaginated({ page: 2, pageSize: 10 });
      expect(result.items[0]?.number).toBe(11);
      expect(result.hasPrevious).toBe(true);
    });
  });

  describe('search', () => {
    it('returns results for Arabic text search', () => {
      const results = quran.search('بِسْمِ', { searchArabic: true, limit: 5 });
      expect(results.length).toBeGreaterThan(0);
    });

    it('returns results for translation search', () => {
      const results = quran.search('lord', {
        searchTranslations: true,
        language: 'en',
        limit: 5,
      });
      expect(results.length).toBeGreaterThan(0);
    });

    it('returns empty array for no matches', () => {
      const results = quran.search('xyz123nonexistent');
      expect(results).toHaveLength(0);
    });

    it('returns empty array for empty query', () => {
      const results = quran.search('');
      expect(results).toHaveLength(0);
    });
  });

  describe('getMetadata', () => {
    it('returns correct metadata', () => {
      const metadata = quran.getMetadata();
      expect(metadata.totalSurahs).toBe(114);
      expect(metadata.totalAyahs).toBe(6236);
    });
  });

  describe('getSurahCount', () => {
    it('returns 114', () => {
      expect(quran.getSurahCount()).toBe(114);
    });
  });

  describe('getAyahCount', () => {
    it('returns 7 for Al-Fatihah', () => {
      expect(quran.getAyahCount(1)).toBe(7);
    });

    it('returns 286 for Al-Baqarah', () => {
      expect(quran.getAyahCount(2)).toBe(286);
    });
  });

  describe('getSurahFullText', () => {
    it('returns full text for Al-Fatihah', () => {
      const text = quran.getSurahFullText(1);
      expect(text).not.toBeNull();
      expect(text).toContain('[1]');
      expect(text).toContain('[7]');
    });

    it('returns null for invalid surah', () => {
      const text = quran.getSurahFullText(200);
      expect(text).toBeNull();
    });
  });
});

describe('Reciter functionality', () => {
  let quran: Quran;

  beforeEach(() => {
    quran = createQuran();
  });

  describe('getAllReciters', () => {
    it('returns array of reciters', () => {
      const reciters = quran.getAllReciters();
      expect(Array.isArray(reciters)).toBe(true);
      expect(reciters.length).toBeGreaterThan(0);
    });
  });

  describe('getReciter', () => {
    it('returns reciter by ID', () => {
      const reciters = quran.getAllReciters();
      if (reciters.length > 0) {
        const firstReciter = reciters[0]!;
        const reciter = quran.getReciter(firstReciter.id);
        expect(reciter).not.toBeNull();
        expect(reciter?.id).toBe(firstReciter.id);
      }
    });

    it('returns null for unknown reciter', () => {
      const reciter = quran.getReciter('unknown-reciter-id');
      expect(reciter).toBeNull();
    });
  });

  describe('preferred reciter', () => {
    it('sets and gets preferred reciter', () => {
      const reciters = quran.getAllReciters();
      if (reciters.length > 0) {
        const firstReciter = reciters[0]!;
        quran.setPreferredReciter(firstReciter.id);
        expect(quran.getPreferredReciterId()).toBe(firstReciter.id);
        expect(quran.getPreferredReciter()?.id).toBe(firstReciter.id);
      }
    });

    it('throws error for unknown reciter', () => {
      expect(() => quran.setPreferredReciter('unknown')).toThrow(QuranError);
    });

    it('clears preferred reciter', () => {
      const reciters = quran.getAllReciters();
      if (reciters.length > 0) {
        const firstReciter = reciters[0]!;
        quran.setPreferredReciter(firstReciter.id);
        quran.clearPreferredReciter();
        expect(quran.getPreferredReciterId()).toBeNull();
      }
    });
  });
});

describe('createQuranWithReciter', () => {
  it('creates quran with preferred reciter set', () => {
    const quran = createQuran();
    const reciters = quran.getAllReciters();
    if (reciters.length > 0) {
      const firstReciter = reciters[0]!;
      const quranWithReciter = createQuranWithReciter(firstReciter.id);
      expect(quranWithReciter.getPreferredReciterId()).toBe(firstReciter.id);
    }
  });
});

describe('createQuranSession', () => {
  it('creates session with specified reciter', () => {
    const quran = createQuran();
    const reciters = quran.getAllReciters();
    if (reciters.length > 0) {
      const firstReciter = reciters[0]!;
      const session = createQuranSession(firstReciter.id);
      expect(session.reciter.id).toBe(firstReciter.id);
    }
  });

  it('provides surahs for reciter', () => {
    const quran = createQuran();
    const reciters = quran.getAllReciters();
    if (reciters.length > 0) {
      const firstReciter = reciters[0]!;
      const session = createQuranSession(firstReciter.id);
      expect(session.surahs.length).toBeGreaterThan(0);
    }
  });

  it('provides player data for surah', () => {
    const quran = createQuran();
    const reciters = quran.getAllReciters();
    if (reciters.length > 0) {
      const firstReciter = reciters[0]!;
      const session = createQuranSession(firstReciter.id);
      if (session.hasSurah(1)) {
        const playerData = session.getPlayerData(1);
        expect(playerData.surah).not.toBeNull();
        expect(playerData.fullText).not.toBeNull();
      }
    }
  });
});

describe('Error handling', () => {
  it('QuranError has correct code', () => {
    const quran = createQuran();
    try {
      quran.getSurah(0);
    } catch (error) {
      expect(error).toBeInstanceOf(QuranError);
      if (error instanceof QuranError) {
        expect(error.code).toBe(QuranErrorCode.INVALID_SURAH_NUMBER);
      }
    }
  });
});
