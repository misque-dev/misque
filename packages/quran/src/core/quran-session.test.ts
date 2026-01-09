import { describe, it, expect, beforeEach } from 'vitest';
import { QuranSession } from './quran-session';
import { Quran } from './quran';
import type { Surah, Reciter, PlayerData } from '../types';

describe('QuranSession', () => {
  const createMockSurah = (number: number, ayahCount: number = 5): Surah => ({
    number,
    name: `سورة ${number}`,
    nameTransliterated: `Surah ${number}`,
    numberOfAyahs: ayahCount,
    revelationType: number <= 57 ? 'meccan' : 'medinan',
    ayahs: Array.from({ length: ayahCount }, (_, i) => ({
      number: i + 1,
      text: `Ayah ${i + 1} of surah ${number}`,
    })),
  });

  const createMockReciter = (
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

  describe('constructor', () => {
    it('creates session with valid reciter', () => {
      const surahs = [createMockSurah(1), createMockSurah(2)];
      const reciters = [createMockReciter('r1', [1, 2])];
      const quran = new Quran(surahs, reciters);

      const session = new QuranSession(quran, 'r1');
      expect(session).toBeInstanceOf(QuranSession);
    });

    it('throws error for non-existent reciter', () => {
      const surahs = [createMockSurah(1)];
      const reciters = [createMockReciter('r1', [1])];
      const quran = new Quran(surahs, reciters);

      expect(() => new QuranSession(quran, 'unknown')).toThrow();
    });

    it('throws error with descriptive message', () => {
      const surahs = [createMockSurah(1)];
      const reciters = [createMockReciter('r1', [1])];
      const quran = new Quran(surahs, reciters);

      expect(() => new QuranSession(quran, 'unknown')).toThrow(
        'Reciter "unknown" not found'
      );
    });

    it('throws error for empty reciter ID', () => {
      const surahs = [createMockSurah(1)];
      const reciters = [createMockReciter('r1', [1])];
      const quran = new Quran(surahs, reciters);

      expect(() => new QuranSession(quran, '')).toThrow();
    });
  });

  describe('reciter getter', () => {
    let session: QuranSession;
    let reciter: Reciter;

    beforeEach(() => {
      const surahs = [createMockSurah(1), createMockSurah(2)];
      reciter = createMockReciter('test-reciter', [1, 2]);
      const quran = new Quran(surahs, [reciter]);
      session = new QuranSession(quran, 'test-reciter');
    });

    it('returns the reciter object', () => {
      expect(session.reciter).toBeDefined();
      expect(session.reciter.id).toBe('test-reciter');
    });

    it('returns reciter with correct properties', () => {
      expect(session.reciter.name).toBe('Reciter test-reciter');
      expect(session.reciter.audioFormat).toBe('mp3');
      expect(session.reciter.surahs).toEqual([1, 2]);
    });

    it('returns consistent reciter on multiple calls', () => {
      const reciter1 = session.reciter;
      const reciter2 = session.reciter;
      expect(reciter1.id).toBe(reciter2.id);
    });
  });

  describe('surahs getter', () => {
    it('returns surahs available for the reciter', () => {
      const surahs = [
        createMockSurah(1, 7),
        createMockSurah(2, 286),
        createMockSurah(3, 200),
      ];
      const reciters = [createMockReciter('r1', [1, 3])]; // Only has 1 and 3
      const quran = new Quran(surahs, reciters);
      const session = new QuranSession(quran, 'r1');

      expect(session.surahs).toHaveLength(2);
      expect(session.surahs.map((s) => s.number)).toEqual([1, 3]);
    });

    it('returns empty array when reciter has no matching surahs', () => {
      const surahs = [createMockSurah(1), createMockSurah(2)];
      const reciters = [createMockReciter('r1', [100, 101])]; // Surahs that don't exist
      const quran = new Quran(surahs, reciters);
      const session = new QuranSession(quran, 'r1');

      expect(session.surahs).toHaveLength(0);
    });

    it('returns surahs sorted by number', () => {
      const surahs = [
        createMockSurah(3),
        createMockSurah(1),
        createMockSurah(2),
      ];
      const reciters = [createMockReciter('r1', [3, 1, 2])];
      const quran = new Quran(surahs, reciters);
      const session = new QuranSession(quran, 'r1');

      expect(session.surahs.map((s) => s.number)).toEqual([1, 2, 3]);
    });

    it('returns complete surah objects', () => {
      const surahs = [createMockSurah(1, 7)];
      const reciters = [createMockReciter('r1', [1])];
      const quran = new Quran(surahs, reciters);
      const session = new QuranSession(quran, 'r1');

      const surah = session.surahs[0];
      expect(surah?.number).toBe(1);
      expect(surah?.name).toBe('سورة 1');
      expect(surah?.numberOfAyahs).toBe(7);
      expect(surah?.ayahs).toHaveLength(7);
    });
  });

  describe('getSurah', () => {
    let session: QuranSession;

    beforeEach(() => {
      const surahs = [
        createMockSurah(1, 7),
        createMockSurah(2, 286),
        createMockSurah(3, 200),
      ];
      const reciters = [createMockReciter('r1', [1, 2])]; // Has 1 and 2, not 3
      const quran = new Quran(surahs, reciters);
      session = new QuranSession(quran, 'r1');
    });

    it('returns surah when reciter has it', () => {
      const surah = session.getSurah(1);
      expect(surah).not.toBeNull();
      expect(surah?.number).toBe(1);
    });

    it('returns null when reciter does not have surah', () => {
      const surah = session.getSurah(3); // Reciter doesn't have surah 3
      expect(surah).toBeNull();
    });

    it('returns null for surah not covered by reciter', () => {
      // Surah 100 is in valid range but reciter doesn't have it
      // Since the underlying quran.getSurah validates range,
      // and the surah exists in mock data range but not in reciter's list
      // The session returns null because reciter doesn't cover it
      // Note: With mock data that only has surahs 1-3, surah 100 will throw
      // because validateSurahNumber passes but surah is not in data

      // Surah 3 exists in data but reciter r1 only has [1, 2]
      const surah = session.getSurah(3);
      expect(surah).toBeNull();
    });

    it('returns complete surah object', () => {
      const surah = session.getSurah(1);
      expect(surah?.name).toBe('سورة 1');
      expect(surah?.nameTransliterated).toBe('Surah 1');
      expect(surah?.numberOfAyahs).toBe(7);
      expect(surah?.revelationType).toBe('meccan');
    });
  });

  describe('getAudioUrl', () => {
    let session: QuranSession;

    beforeEach(() => {
      const surahs = [createMockSurah(1, 7), createMockSurah(2, 286)];
      const reciters = [createMockReciter('alzain', [1])]; // Only has surah 1
      const quran = new Quran(surahs, reciters);
      session = new QuranSession(quran, 'alzain');
    });

    it('returns audio URL for available surah', () => {
      const url = session.getAudioUrl(1);
      expect(url).not.toBeNull();
      expect(url).toBe('https://www.mp3quran.net/eng/alzain/1');
    });

    it('returns null for surah reciter does not have', () => {
      const url = session.getAudioUrl(2); // Reciter doesn't have surah 2
      expect(url).toBeNull();
    });

    it('returns correct URL format for mp3quran.net', () => {
      const url = session.getAudioUrl(1);
      expect(url).toContain('mp3quran.net');
      expect(url).toContain('alzain');
    });
  });

  describe('getFullText', () => {
    let session: QuranSession;

    beforeEach(() => {
      const surahs = [createMockSurah(1, 7), createMockSurah(2, 286)];
      const reciters = [createMockReciter('r1', [1])]; // Only has surah 1
      const quran = new Quran(surahs, reciters);
      session = new QuranSession(quran, 'r1');
    });

    it('returns full text for available surah', () => {
      const text = session.getFullText(1);
      expect(text).not.toBeNull();
      expect(typeof text).toBe('string');
    });

    it('returns null for surah reciter does not have', () => {
      const text = session.getFullText(2);
      expect(text).toBeNull();
    });

    it('includes all ayahs in text', () => {
      const text = session.getFullText(1);
      expect(text).toContain('[1]');
      expect(text).toContain('[7]');
    });

    it('includes ayah text content', () => {
      const text = session.getFullText(1);
      expect(text).toContain('Ayah 1');
      expect(text).toContain('Ayah 7');
    });
  });

  describe('getPlayerData', () => {
    let session: QuranSession;

    beforeEach(() => {
      const surahs = [createMockSurah(1, 7), createMockSurah(2, 286)];
      const reciters = [createMockReciter('alzain', [1])];
      const quran = new Quran(surahs, reciters);
      session = new QuranSession(quran, 'alzain');
    });

    it('returns PlayerData object', () => {
      const playerData = session.getPlayerData(1);
      expect(playerData).toBeDefined();
      expect(playerData).toHaveProperty('audioUrl');
      expect(playerData).toHaveProperty('fullText');
      expect(playerData).toHaveProperty('surah');
    });

    it('returns complete data for available surah', () => {
      const playerData = session.getPlayerData(1);
      expect(playerData.audioUrl).not.toBeNull();
      expect(playerData.fullText).not.toBeNull();
      expect(playerData.surah).not.toBeNull();
    });

    it('returns null values for unavailable surah', () => {
      const playerData = session.getPlayerData(2);
      expect(playerData.audioUrl).toBeNull();
      expect(playerData.fullText).toBeNull();
      expect(playerData.surah).toBeNull();
    });

    it('returns correct surah in player data', () => {
      const playerData = session.getPlayerData(1);
      expect(playerData.surah?.number).toBe(1);
      expect(playerData.surah?.numberOfAyahs).toBe(7);
    });

    it('returns correct audio URL in player data', () => {
      const playerData = session.getPlayerData(1);
      expect(playerData.audioUrl).toBe(
        'https://www.mp3quran.net/eng/alzain/1'
      );
    });

    it('returns full text with ayah markers in player data', () => {
      const playerData = session.getPlayerData(1);
      expect(playerData.fullText).toContain('[1]');
    });

    it('returns consistent data type', () => {
      const playerData: PlayerData = session.getPlayerData(1);
      expect(typeof playerData.audioUrl === 'string' || playerData.audioUrl === null).toBe(true);
      expect(typeof playerData.fullText === 'string' || playerData.fullText === null).toBe(true);
    });
  });

  describe('hasSurah', () => {
    let session: QuranSession;

    beforeEach(() => {
      const surahs = [
        createMockSurah(1),
        createMockSurah(2),
        createMockSurah(3),
      ];
      const reciters = [createMockReciter('r1', [1, 3])]; // Has 1 and 3
      const quran = new Quran(surahs, reciters);
      session = new QuranSession(quran, 'r1');
    });

    it('returns true for surah reciter has', () => {
      expect(session.hasSurah(1)).toBe(true);
      expect(session.hasSurah(3)).toBe(true);
    });

    it('returns false for surah reciter does not have', () => {
      expect(session.hasSurah(2)).toBe(false);
    });

    it('returns false for non-existent surah number', () => {
      expect(session.hasSurah(100)).toBe(false);
    });

    it('returns boolean type', () => {
      expect(typeof session.hasSurah(1)).toBe('boolean');
    });
  });

  describe('surahCount getter', () => {
    it('returns correct count of available surahs', () => {
      const surahs = [
        createMockSurah(1),
        createMockSurah(2),
        createMockSurah(3),
      ];
      const reciters = [createMockReciter('r1', [1, 2, 3])];
      const quran = new Quran(surahs, reciters);
      const session = new QuranSession(quran, 'r1');

      expect(session.surahCount).toBe(3);
    });

    it('returns 0 when reciter has no matching surahs', () => {
      const surahs = [createMockSurah(1), createMockSurah(2)];
      const reciters = [createMockReciter('r1', [100])]; // No matching surahs
      const quran = new Quran(surahs, reciters);
      const session = new QuranSession(quran, 'r1');

      expect(session.surahCount).toBe(0);
    });

    it('equals length of surahs array', () => {
      const surahs = [
        createMockSurah(1),
        createMockSurah(2),
        createMockSurah(3),
        createMockSurah(4),
        createMockSurah(5),
      ];
      const reciters = [createMockReciter('r1', [1, 3, 5])];
      const quran = new Quran(surahs, reciters);
      const session = new QuranSession(quran, 'r1');

      expect(session.surahCount).toBe(session.surahs.length);
    });

    it('returns number type', () => {
      const surahs = [createMockSurah(1)];
      const reciters = [createMockReciter('r1', [1])];
      const quran = new Quran(surahs, reciters);
      const session = new QuranSession(quran, 'r1');

      expect(typeof session.surahCount).toBe('number');
    });
  });

  describe('integration with real-like data', () => {
    let session: QuranSession;

    beforeEach(() => {
      // Create Al-Fatihah with 7 ayahs
      const alFatihah: Surah = {
        number: 1,
        name: 'الفاتحة',
        nameTransliterated: 'Al-Fatiha',
        numberOfAyahs: 7,
        revelationType: 'meccan',
        ayahs: [
          { number: 1, text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' },
          { number: 2, text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ' },
          { number: 3, text: 'الرَّحْمَٰنِ الرَّحِيمِ' },
          { number: 4, text: 'مَالِكِ يَوْمِ الدِّينِ' },
          { number: 5, text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ' },
          { number: 6, text: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ' },
          {
            number: 7,
            text: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
          },
        ],
      };

      // Create An-Nas (last surah)
      const anNas: Surah = {
        number: 114,
        name: 'الناس',
        nameTransliterated: 'An-Nas',
        numberOfAyahs: 6,
        revelationType: 'meccan',
        ayahs: Array.from({ length: 6 }, (_, i) => ({
          number: i + 1,
          text: `An-Nas ayah ${i + 1}`,
        })),
      };

      const alzain: Reciter = {
        id: 'alzain',
        name: 'Alzain Mohammad Ahmad',
        nameArabic: 'الزين محمد أحمد',
        audioFormat: 'mp3',
        audioBaseUrl: 'https://www.mp3quran.net',
        language: 'eng',
        urlName: 'alzain',
        surahs: [1, 114],
      };

      const quran = new Quran([alFatihah, anNas], [alzain]);
      session = new QuranSession(quran, 'alzain');
    });

    it('provides Al-Fatihah data correctly', () => {
      const surah = session.getSurah(1);
      expect(surah?.name).toBe('الفاتحة');
      expect(surah?.nameTransliterated).toBe('Al-Fatiha');
      expect(surah?.numberOfAyahs).toBe(7);
    });

    it('provides An-Nas data correctly', () => {
      const surah = session.getSurah(114);
      expect(surah?.name).toBe('الناس');
      expect(surah?.nameTransliterated).toBe('An-Nas');
    });

    it('provides full text with Arabic content', () => {
      const text = session.getFullText(1);
      expect(text).toContain('بِسْمِ اللَّهِ');
      expect(text).toContain('[1]');
    });

    it('provides player data with all components', () => {
      const playerData = session.getPlayerData(1);

      expect(playerData.surah?.name).toBe('الفاتحة');
      expect(playerData.audioUrl).toBe(
        'https://www.mp3quran.net/eng/alzain/1'
      );
      expect(playerData.fullText).toContain('بِسْمِ');
    });

    it('reciter info is correct', () => {
      expect(session.reciter.id).toBe('alzain');
      expect(session.reciter.name).toBe('Alzain Mohammad Ahmad');
      expect(session.reciter.nameArabic).toBe('الزين محمد أحمد');
    });

    it('surah count matches available surahs', () => {
      expect(session.surahCount).toBe(2);
      expect(session.surahs.map((s) => s.number)).toEqual([1, 114]);
    });
  });

  describe('edge cases', () => {
    it('handles session with single surah', () => {
      const surahs = [createMockSurah(108, 3)]; // Al-Kawthar
      const reciters = [createMockReciter('r1', [108])];
      const quran = new Quran(surahs, reciters);
      const session = new QuranSession(quran, 'r1');

      expect(session.surahCount).toBe(1);
      expect(session.hasSurah(108)).toBe(true);
      expect(session.getSurah(108)?.numberOfAyahs).toBe(3);
    });

    it('handles session with all 114 surahs', () => {
      const surahs = Array.from({ length: 114 }, (_, i) =>
        createMockSurah(i + 1)
      );
      const allSurahNumbers = Array.from({ length: 114 }, (_, i) => i + 1);
      const reciters = [createMockReciter('complete', allSurahNumbers)];
      const quran = new Quran(surahs, reciters);
      const session = new QuranSession(quran, 'complete');

      expect(session.surahCount).toBe(114);
      expect(session.hasSurah(1)).toBe(true);
      expect(session.hasSurah(114)).toBe(true);
    });

    it('handles reciter with partial surah coverage', () => {
      const surahs = Array.from({ length: 10 }, (_, i) => createMockSurah(i + 1));
      const reciters = [createMockReciter('partial', [1, 5, 10])];
      const quran = new Quran(surahs, reciters);
      const session = new QuranSession(quran, 'partial');

      expect(session.surahCount).toBe(3);
      expect(session.hasSurah(1)).toBe(true);
      expect(session.hasSurah(2)).toBe(false);
      expect(session.hasSurah(5)).toBe(true);
    });
  });
});
