import { describe, it, expect } from 'vitest';
import {
  loadQuranData,
  loadRecitersData,
  loadQuranDataSync,
  loadRecitersDataSync,
} from './data-loader';
import type { QuranDataFile, RecitersDataFile } from '../types';

describe('Data Loader Utilities', () => {
  describe('loadQuranData (async)', () => {
    it('loads quran data successfully', async () => {
      const data = await loadQuranData();
      expect(data).toBeDefined();
      expect(data.surahs).toBeDefined();
      expect(Array.isArray(data.surahs)).toBe(true);
    });

    it('returns data with 114 surahs', async () => {
      const data = await loadQuranData();
      expect(data.surahs).toHaveLength(114);
    });

    it('returns data with metadata', async () => {
      const data = await loadQuranData();
      expect(data.metadata).toBeDefined();
      expect(data.metadata.totalSurahs).toBe(114);
      expect(data.metadata.totalAyahs).toBe(6236);
    });

    it('returns surahs with valid structure', async () => {
      const data = await loadQuranData();
      const firstSurah = data.surahs[0];

      expect(firstSurah).toBeDefined();
      expect(firstSurah?.number).toBe(1);
      expect(firstSurah?.name).toBeDefined();
      expect(firstSurah?.nameTransliterated).toBeDefined();
      expect(firstSurah?.numberOfAyahs).toBeDefined();
      expect(firstSurah?.revelationType).toBeDefined();
      expect(firstSurah?.ayahs).toBeDefined();
    });

    it('returns Al-Fatihah with correct data', async () => {
      const data = await loadQuranData();
      const alFatihah = data.surahs.find((s) => s.number === 1);

      expect(alFatihah).toBeDefined();
      expect(alFatihah?.nameTransliterated).toBe('Al-Fatiha');
      expect(alFatihah?.numberOfAyahs).toBe(7);
      expect(alFatihah?.ayahs).toHaveLength(7);
    });

    it('returns Al-Baqarah with 286 ayahs', async () => {
      const data = await loadQuranData();
      const alBaqarah = data.surahs.find((s) => s.number === 2);

      expect(alBaqarah).toBeDefined();
      expect(alBaqarah?.numberOfAyahs).toBe(286);
      expect(alBaqarah?.ayahs).toHaveLength(286);
    });

    it('returns Al-Kawthar with 3 ayahs (shortest)', async () => {
      const data = await loadQuranData();
      const alKawthar = data.surahs.find((s) => s.number === 108);

      expect(alKawthar).toBeDefined();
      expect(alKawthar?.numberOfAyahs).toBe(3);
      expect(alKawthar?.ayahs).toHaveLength(3);
    });

    it('returns An-Nas as last surah', async () => {
      const data = await loadQuranData();
      const anNas = data.surahs.find((s) => s.number === 114);

      expect(anNas).toBeDefined();
      expect(anNas?.nameTransliterated).toBe('An-Nas');
    });

    it('returns surahs sorted by number', async () => {
      const data = await loadQuranData();

      for (let i = 0; i < data.surahs.length - 1; i++) {
        expect(data.surahs[i]?.number).toBeLessThan(
          data.surahs[i + 1]?.number ?? 0
        );
      }
    });

    it('all ayahs have valid structure', async () => {
      const data = await loadQuranData();

      for (const surah of data.surahs) {
        for (const ayah of surah.ayahs) {
          expect(ayah.number).toBeGreaterThan(0);
          expect(typeof ayah.text).toBe('string');
          expect(ayah.text.length).toBeGreaterThan(0);
        }
      }
    });

    it('ayah numbers are sequential within each surah', async () => {
      const data = await loadQuranData();

      for (const surah of data.surahs) {
        for (let i = 0; i < surah.ayahs.length; i++) {
          expect(surah.ayahs[i]?.number).toBe(i + 1);
        }
      }
    });

    it('returns correct revelation types', async () => {
      const data = await loadQuranData();

      for (const surah of data.surahs) {
        expect(['meccan', 'medinan']).toContain(surah.revelationType);
      }
    });

    it('counts total ayahs correctly', async () => {
      const data = await loadQuranData();
      const totalAyahs = data.surahs.reduce(
        (sum, surah) => sum + surah.ayahs.length,
        0
      );

      expect(totalAyahs).toBe(6236);
    });

    it('returns Promise that resolves to QuranDataFile', async () => {
      const promise = loadQuranData();
      expect(promise).toBeInstanceOf(Promise);

      const data = await promise;
      expect(data).toHaveProperty('surahs');
      expect(data).toHaveProperty('metadata');
    });
  });

  describe('loadRecitersData (async)', () => {
    it('loads reciters data successfully', async () => {
      const data = await loadRecitersData();
      expect(data).toBeDefined();
      expect(data.reciters).toBeDefined();
      expect(Array.isArray(data.reciters)).toBe(true);
    });

    it('returns at least one reciter', async () => {
      const data = await loadRecitersData();
      expect(data.reciters.length).toBeGreaterThan(0);
    });

    it('returns reciters with valid structure', async () => {
      const data = await loadRecitersData();
      const firstReciter = data.reciters[0];

      expect(firstReciter).toBeDefined();
      expect(firstReciter?.id).toBeDefined();
      expect(firstReciter?.name).toBeDefined();
      expect(firstReciter?.audioFormat).toBeDefined();
      expect(firstReciter?.audioBaseUrl).toBeDefined();
      expect(firstReciter?.surahs).toBeDefined();
    });

    it('returns reciters with valid audio formats', async () => {
      const data = await loadRecitersData();

      for (const reciter of data.reciters) {
        expect(['mp3', 'm4a', 'ogg']).toContain(reciter.audioFormat);
      }
    });

    it('returns reciters with valid surah arrays', async () => {
      const data = await loadRecitersData();

      for (const reciter of data.reciters) {
        expect(Array.isArray(reciter.surahs)).toBe(true);
        for (const surahNum of reciter.surahs) {
          expect(surahNum).toBeGreaterThanOrEqual(1);
          expect(surahNum).toBeLessThanOrEqual(114);
        }
      }
    });

    it('returns reciters with non-empty audioBaseUrl', async () => {
      const data = await loadRecitersData();

      for (const reciter of data.reciters) {
        expect(reciter.audioBaseUrl.length).toBeGreaterThan(0);
      }
    });

    it('returns reciters with unique IDs', async () => {
      const data = await loadRecitersData();
      const ids = data.reciters.map((r) => r.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it('includes known reciter alzain', async () => {
      const data = await loadRecitersData();
      const alzain = data.reciters.find((r) => r.id === 'alzain');

      expect(alzain).toBeDefined();
      expect(alzain?.name).toBe('Alzain Mohammad Ahmad');
    });

    it('includes known reciter afs (Alafasi)', async () => {
      const data = await loadRecitersData();
      const afs = data.reciters.find((r) => r.id === 'afs');

      expect(afs).toBeDefined();
      expect(afs?.name).toBe('Mishary Alafasi');
    });

    it('returns Promise that resolves to RecitersDataFile', async () => {
      const promise = loadRecitersData();
      expect(promise).toBeInstanceOf(Promise);

      const data = await promise;
      expect(data).toHaveProperty('reciters');
    });
  });

  describe('loadQuranDataSync', () => {
    it('loads quran data synchronously', () => {
      const data = loadQuranDataSync();
      expect(data).toBeDefined();
      expect(data.surahs).toBeDefined();
    });

    it('returns data with 114 surahs', () => {
      const data = loadQuranDataSync();
      expect(data.surahs).toHaveLength(114);
    });

    it('returns data with metadata', () => {
      const data = loadQuranDataSync();
      expect(data.metadata).toBeDefined();
      expect(data.metadata.totalSurahs).toBe(114);
      expect(data.metadata.totalAyahs).toBe(6236);
    });

    it('returns Al-Fatihah with 7 ayahs', () => {
      const data = loadQuranDataSync();
      const alFatihah = data.surahs.find((s) => s.number === 1);

      expect(alFatihah?.numberOfAyahs).toBe(7);
    });

    it('returns Al-Baqarah with 286 ayahs', () => {
      const data = loadQuranDataSync();
      const alBaqarah = data.surahs.find((s) => s.number === 2);

      expect(alBaqarah?.numberOfAyahs).toBe(286);
    });

    it('returns same data as async version', async () => {
      const syncData = loadQuranDataSync();
      const asyncData = await loadQuranData();

      expect(syncData.surahs.length).toBe(asyncData.surahs.length);
      expect(syncData.metadata.totalAyahs).toBe(asyncData.metadata.totalAyahs);
    });

    it('returns QuranDataFile type', () => {
      const data: QuranDataFile = loadQuranDataSync();
      expect(data.surahs).toBeDefined();
      expect(data.metadata).toBeDefined();
    });

    it('validates all surahs on load', () => {
      // This should not throw because all data is valid
      expect(() => loadQuranDataSync()).not.toThrow();
    });
  });

  describe('loadRecitersDataSync', () => {
    it('loads reciters data synchronously', () => {
      const data = loadRecitersDataSync();
      expect(data).toBeDefined();
      expect(data.reciters).toBeDefined();
    });

    it('returns at least one reciter', () => {
      const data = loadRecitersDataSync();
      expect(data.reciters.length).toBeGreaterThan(0);
    });

    it('returns reciters with valid structure', () => {
      const data = loadRecitersDataSync();
      const firstReciter = data.reciters[0];

      expect(firstReciter?.id).toBeDefined();
      expect(firstReciter?.name).toBeDefined();
      expect(firstReciter?.audioFormat).toBeDefined();
      expect(firstReciter?.audioBaseUrl).toBeDefined();
    });

    it('returns same data as async version', async () => {
      const syncData = loadRecitersDataSync();
      const asyncData = await loadRecitersData();

      expect(syncData.reciters.length).toBe(asyncData.reciters.length);
      expect(syncData.reciters.map((r) => r.id).sort()).toEqual(
        asyncData.reciters.map((r) => r.id).sort()
      );
    });

    it('returns RecitersDataFile type', () => {
      const data: RecitersDataFile = loadRecitersDataSync();
      expect(data.reciters).toBeDefined();
    });

    it('validates all reciters on load', () => {
      // This should not throw because all data is valid
      expect(() => loadRecitersDataSync()).not.toThrow();
    });

    it('includes reciter with language and urlName', () => {
      const data = loadRecitersDataSync();
      const reciterWithLanguage = data.reciters.find(
        (r) => r.language && r.urlName
      );

      expect(reciterWithLanguage).toBeDefined();
      expect(reciterWithLanguage?.language).toBeDefined();
      expect(reciterWithLanguage?.urlName).toBeDefined();
    });
  });

  describe('data consistency between sync and async', () => {
    it('quran data is identical', async () => {
      const syncData = loadQuranDataSync();
      const asyncData = await loadQuranData();

      // Check first surah
      expect(syncData.surahs[0]?.name).toBe(asyncData.surahs[0]?.name);
      expect(syncData.surahs[0]?.ayahs.length).toBe(
        asyncData.surahs[0]?.ayahs.length
      );

      // Check last surah
      expect(syncData.surahs[113]?.name).toBe(asyncData.surahs[113]?.name);
    });

    it('reciters data is identical', async () => {
      const syncData = loadRecitersDataSync();
      const asyncData = await loadRecitersData();

      // Check first reciter
      expect(syncData.reciters[0]?.id).toBe(asyncData.reciters[0]?.id);
      expect(syncData.reciters[0]?.name).toBe(asyncData.reciters[0]?.name);
    });
  });

  describe('performance characteristics', () => {
    it('sync load completes quickly', () => {
      const start = performance.now();
      loadQuranDataSync();
      const end = performance.now();

      // Should complete in under 1 second (generous for CI environments)
      expect(end - start).toBeLessThan(1000);
    });

    it('async load completes quickly', async () => {
      const start = performance.now();
      await loadQuranData();
      const end = performance.now();

      // Should complete in under 1 second
      expect(end - start).toBeLessThan(1000);
    });

    it('multiple sync loads are fast (data is bundled)', () => {
      const start = performance.now();
      for (let i = 0; i < 10; i++) {
        loadQuranDataSync();
      }
      const end = performance.now();

      // 10 loads should still be fast
      expect(end - start).toBeLessThan(2000);
    });
  });
});
