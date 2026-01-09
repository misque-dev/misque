import { describe, it, expect } from 'vitest';
import {
  validateSurahNumber,
  validateAyahNumber,
  validateSurah,
  validateAyah,
  validateReciter,
} from './validation';
import { QuranError, QuranErrorCode } from '../errors/errors';
import type { Surah, Ayah, Reciter } from '../types';

describe('Validation Utilities', () => {
  describe('validateSurahNumber', () => {
    describe('valid surah numbers', () => {
      it('accepts surah number 1 (Al-Fatihah)', () => {
        expect(() => validateSurahNumber(1)).not.toThrow();
      });

      it('accepts surah number 114 (An-Nas)', () => {
        expect(() => validateSurahNumber(114)).not.toThrow();
      });

      it('accepts surah number 2 (Al-Baqarah)', () => {
        expect(() => validateSurahNumber(2)).not.toThrow();
      });

      it('accepts surah number 108 (Al-Kawthar)', () => {
        expect(() => validateSurahNumber(108)).not.toThrow();
      });

      it('accepts middle surah number 57', () => {
        expect(() => validateSurahNumber(57)).not.toThrow();
      });

      it('accepts all valid surah numbers 1-114', () => {
        for (let i = 1; i <= 114; i++) {
          expect(() => validateSurahNumber(i)).not.toThrow();
        }
      });
    });

    describe('invalid surah numbers', () => {
      it('throws error for surah number 0', () => {
        expect(() => validateSurahNumber(0)).toThrow(QuranError);
      });

      it('throws error for surah number 115', () => {
        expect(() => validateSurahNumber(115)).toThrow(QuranError);
      });

      it('throws error for negative number -1', () => {
        expect(() => validateSurahNumber(-1)).toThrow(QuranError);
      });

      it('throws error for large number 1000', () => {
        expect(() => validateSurahNumber(1000)).toThrow(QuranError);
      });

      it('throws error for decimal number 1.5', () => {
        expect(() => validateSurahNumber(1.5)).toThrow(QuranError);
      });

      it('throws error for NaN', () => {
        expect(() => validateSurahNumber(NaN)).toThrow(QuranError);
      });

      it('throws error for Infinity', () => {
        expect(() => validateSurahNumber(Infinity)).toThrow(QuranError);
      });

      it('throws error for -Infinity', () => {
        expect(() => validateSurahNumber(-Infinity)).toThrow(QuranError);
      });
    });

    describe('error code and message', () => {
      it('throws error with INVALID_SURAH_NUMBER code', () => {
        try {
          validateSurahNumber(0);
          expect.fail('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(QuranError);
          if (error instanceof QuranError) {
            expect(error.code).toBe(QuranErrorCode.INVALID_SURAH_NUMBER);
          }
        }
      });

      it('includes surah number in error message', () => {
        try {
          validateSurahNumber(999);
          expect.fail('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(QuranError);
          if (error instanceof QuranError) {
            expect(error.message).toContain('999');
          }
        }
      });

      it('includes surah number in error data', () => {
        try {
          validateSurahNumber(500);
          expect.fail('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(QuranError);
          if (error instanceof QuranError) {
            expect(error.data).toEqual({ surahNumber: 500 });
          }
        }
      });
    });
  });

  describe('validateAyahNumber', () => {
    describe('valid ayah numbers', () => {
      it('accepts ayah 1 of surah 1 (max 7)', () => {
        expect(() => validateAyahNumber(1, 1, 7)).not.toThrow();
      });

      it('accepts ayah 7 of surah 1 (max 7)', () => {
        expect(() => validateAyahNumber(1, 7, 7)).not.toThrow();
      });

      it('accepts ayah 1 of surah 2 (max 286)', () => {
        expect(() => validateAyahNumber(2, 1, 286)).not.toThrow();
      });

      it('accepts ayah 286 of surah 2 (max 286)', () => {
        expect(() => validateAyahNumber(2, 286, 286)).not.toThrow();
      });

      it('accepts middle ayah of surah', () => {
        expect(() => validateAyahNumber(2, 143, 286)).not.toThrow();
      });

      it('accepts ayah 3 of surah 108 (Al-Kawthar, max 3)', () => {
        expect(() => validateAyahNumber(108, 3, 3)).not.toThrow();
      });
    });

    describe('invalid ayah numbers', () => {
      it('throws error for ayah 0', () => {
        expect(() => validateAyahNumber(1, 0, 7)).toThrow(QuranError);
      });

      it('throws error for ayah exceeding max', () => {
        expect(() => validateAyahNumber(1, 8, 7)).toThrow(QuranError);
      });

      it('throws error for negative ayah number', () => {
        expect(() => validateAyahNumber(1, -1, 7)).toThrow(QuranError);
      });

      it('throws error for decimal ayah number', () => {
        expect(() => validateAyahNumber(1, 1.5, 7)).toThrow(QuranError);
      });

      it('throws error for NaN ayah number', () => {
        expect(() => validateAyahNumber(1, NaN, 7)).toThrow(QuranError);
      });
    });

    describe('also validates surah number', () => {
      it('throws error for invalid surah number 0', () => {
        expect(() => validateAyahNumber(0, 1, 7)).toThrow(QuranError);
      });

      it('throws error for invalid surah number 115', () => {
        expect(() => validateAyahNumber(115, 1, 7)).toThrow(QuranError);
      });

      it('validates surah before ayah', () => {
        try {
          validateAyahNumber(0, 1, 7);
          expect.fail('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(QuranError);
          if (error instanceof QuranError) {
            expect(error.code).toBe(QuranErrorCode.INVALID_SURAH_NUMBER);
          }
        }
      });
    });

    describe('error details', () => {
      it('throws error with INVALID_AYAH_NUMBER code', () => {
        try {
          validateAyahNumber(1, 10, 7);
          expect.fail('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(QuranError);
          if (error instanceof QuranError) {
            expect(error.code).toBe(QuranErrorCode.INVALID_AYAH_NUMBER);
          }
        }
      });

      it('includes ayah and surah numbers in error message', () => {
        try {
          validateAyahNumber(1, 10, 7);
          expect.fail('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(QuranError);
          if (error instanceof QuranError) {
            expect(error.message).toContain('10');
            expect(error.message).toContain('1');
            expect(error.message).toContain('7');
          }
        }
      });
    });
  });

  describe('validateSurah', () => {
    const createValidSurah = (overrides: Partial<Surah> = {}): Surah => ({
      number: 1,
      name: 'الفاتحة',
      nameTransliterated: 'Al-Fatiha',
      numberOfAyahs: 2,
      revelationType: 'meccan',
      ayahs: [
        { number: 1, text: 'بِسْمِ اللَّهِ' },
        { number: 2, text: 'الْحَمْدُ لِلَّهِ' },
      ],
      ...overrides,
    });

    describe('valid surah objects', () => {
      it('returns true for valid surah object', () => {
        const surah = createValidSurah();
        expect(validateSurah(surah)).toBe(true);
      });

      it('validates surah with meccan revelation type', () => {
        const surah = createValidSurah({ revelationType: 'meccan' });
        expect(validateSurah(surah)).toBe(true);
      });

      it('validates surah with medinan revelation type', () => {
        const surah = createValidSurah({ revelationType: 'medinan' });
        expect(validateSurah(surah)).toBe(true);
      });

      it('validates surah number 114', () => {
        const surah = createValidSurah({ number: 114 });
        expect(validateSurah(surah)).toBe(true);
      });
    });

    describe('invalid surah objects', () => {
      it('throws error for null', () => {
        expect(() => validateSurah(null)).toThrow(QuranError);
      });

      it('throws error for undefined', () => {
        expect(() => validateSurah(undefined)).toThrow(QuranError);
      });

      it('throws error for non-object', () => {
        expect(() => validateSurah('not an object')).toThrow(QuranError);
      });

      it('throws error for number', () => {
        expect(() => validateSurah(123)).toThrow(QuranError);
      });

      it('throws error for array', () => {
        expect(() => validateSurah([])).toThrow(QuranError);
      });
    });

    describe('invalid surah number', () => {
      it('throws error for surah number 0', () => {
        const surah = createValidSurah({ number: 0 });
        expect(() => validateSurah(surah)).toThrow(QuranError);
      });

      it('throws error for surah number 115', () => {
        const surah = createValidSurah({ number: 115 });
        expect(() => validateSurah(surah)).toThrow(QuranError);
      });

      it('throws error for negative surah number', () => {
        const surah = createValidSurah({ number: -1 });
        expect(() => validateSurah(surah)).toThrow(QuranError);
      });

      it('throws error for missing surah number', () => {
        const surah = { ...createValidSurah(), number: undefined } as unknown;
        expect(() => validateSurah(surah)).toThrow(QuranError);
      });
    });

    describe('invalid name', () => {
      it('throws error for empty name', () => {
        const surah = createValidSurah({ name: '' });
        expect(() => validateSurah(surah)).toThrow(QuranError);
      });

      it('throws error for missing name', () => {
        const surah = { ...createValidSurah(), name: undefined } as unknown;
        expect(() => validateSurah(surah)).toThrow(QuranError);
      });

      it('throws error for non-string name', () => {
        const surah = { ...createValidSurah(), name: 123 } as unknown;
        expect(() => validateSurah(surah)).toThrow(QuranError);
      });
    });

    describe('invalid nameTransliterated', () => {
      it('throws error for non-string nameTransliterated', () => {
        const surah = { ...createValidSurah(), nameTransliterated: 123 } as unknown;
        expect(() => validateSurah(surah)).toThrow(QuranError);
      });

      it('throws error for missing nameTransliterated', () => {
        const surah = {
          ...createValidSurah(),
          nameTransliterated: undefined,
        } as unknown;
        expect(() => validateSurah(surah)).toThrow(QuranError);
      });
    });

    describe('invalid numberOfAyahs', () => {
      it('throws error for zero numberOfAyahs', () => {
        const surah = createValidSurah({ numberOfAyahs: 0 });
        expect(() => validateSurah(surah)).toThrow(QuranError);
      });

      it('throws error for negative numberOfAyahs', () => {
        const surah = createValidSurah({ numberOfAyahs: -1 });
        expect(() => validateSurah(surah)).toThrow(QuranError);
      });

      it('throws error for non-integer numberOfAyahs', () => {
        const surah = createValidSurah({ numberOfAyahs: 1.5 });
        expect(() => validateSurah(surah)).toThrow(QuranError);
      });
    });

    describe('invalid revelationType', () => {
      it('throws error for invalid revelationType', () => {
        const surah = { ...createValidSurah(), revelationType: 'invalid' } as unknown;
        expect(() => validateSurah(surah)).toThrow(QuranError);
      });

      it('throws error for missing revelationType', () => {
        const surah = {
          ...createValidSurah(),
          revelationType: undefined,
        } as unknown;
        expect(() => validateSurah(surah)).toThrow(QuranError);
      });
    });

    describe('invalid ayahs array', () => {
      it('throws error for non-array ayahs', () => {
        const surah = { ...createValidSurah(), ayahs: 'not an array' } as unknown;
        expect(() => validateSurah(surah)).toThrow(QuranError);
      });

      it('throws error for missing ayahs', () => {
        const surah = { ...createValidSurah(), ayahs: undefined } as unknown;
        expect(() => validateSurah(surah)).toThrow(QuranError);
      });

      it('throws error when ayahs length does not match numberOfAyahs', () => {
        const surah = createValidSurah({ numberOfAyahs: 5 }); // but only 2 ayahs
        expect(() => validateSurah(surah)).toThrow(QuranError);
      });
    });

    describe('error codes', () => {
      it('throws error with DATA_VALIDATION_ERROR code', () => {
        try {
          validateSurah(null);
          expect.fail('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(QuranError);
          if (error instanceof QuranError) {
            expect(error.code).toBe(QuranErrorCode.DATA_VALIDATION_ERROR);
          }
        }
      });
    });
  });

  describe('validateAyah', () => {
    const createValidAyah = (overrides: Partial<Ayah> = {}): Ayah => ({
      number: 1,
      text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      ...overrides,
    });

    describe('valid ayah objects', () => {
      it('returns true for valid ayah object', () => {
        const ayah = createValidAyah();
        expect(validateAyah(ayah, 1, 1)).toBe(true);
      });

      it('validates ayah with translations', () => {
        const ayah = createValidAyah({
          translations: { en: 'In the name of God' },
        });
        expect(validateAyah(ayah, 1, 1)).toBe(true);
      });

      it('validates ayah with transliteration', () => {
        const ayah = createValidAyah({
          transliteration: 'Bismillahir rahmanir rahim',
        });
        expect(validateAyah(ayah, 1, 1)).toBe(true);
      });

      it('validates different ayah numbers', () => {
        expect(validateAyah(createValidAyah({ number: 5 }), 1, 5)).toBe(true);
        expect(validateAyah(createValidAyah({ number: 286 }), 2, 286)).toBe(true);
      });
    });

    describe('invalid ayah objects', () => {
      it('throws error for null', () => {
        expect(() => validateAyah(null, 1, 1)).toThrow(QuranError);
      });

      it('throws error for undefined', () => {
        expect(() => validateAyah(undefined, 1, 1)).toThrow(QuranError);
      });

      it('throws error for non-object', () => {
        expect(() => validateAyah('not an object', 1, 1)).toThrow(QuranError);
      });
    });

    describe('invalid ayah number', () => {
      it('throws error when number does not match expected', () => {
        const ayah = createValidAyah({ number: 2 });
        expect(() => validateAyah(ayah, 1, 1)).toThrow(QuranError);
      });

      it('throws error for missing number', () => {
        const ayah = { ...createValidAyah(), number: undefined } as unknown;
        expect(() => validateAyah(ayah, 1, 1)).toThrow(QuranError);
      });

      it('throws error for non-integer number', () => {
        const ayah = { ...createValidAyah(), number: 1.5 } as unknown;
        expect(() => validateAyah(ayah, 1, 1)).toThrow(QuranError);
      });
    });

    describe('invalid text', () => {
      it('throws error for empty text', () => {
        const ayah = createValidAyah({ text: '' });
        expect(() => validateAyah(ayah, 1, 1)).toThrow(QuranError);
      });

      it('throws error for missing text', () => {
        const ayah = { ...createValidAyah(), text: undefined } as unknown;
        expect(() => validateAyah(ayah, 1, 1)).toThrow(QuranError);
      });

      it('throws error for non-string text', () => {
        const ayah = { ...createValidAyah(), text: 123 } as unknown;
        expect(() => validateAyah(ayah, 1, 1)).toThrow(QuranError);
      });
    });

    describe('error messages', () => {
      it('includes expected number in mismatch error', () => {
        try {
          validateAyah(createValidAyah({ number: 5 }), 1, 1);
          expect.fail('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(QuranError);
          if (error instanceof QuranError) {
            expect(error.message).toContain('expected 1');
            expect(error.message).toContain('got 5');
          }
        }
      });
    });
  });

  describe('validateReciter', () => {
    const createValidReciter = (overrides: Partial<Reciter> = {}): Reciter => ({
      id: 'test-reciter',
      name: 'Test Reciter',
      audioFormat: 'mp3',
      audioBaseUrl: 'https://example.com/audio',
      surahs: [1, 2, 3],
      ...overrides,
    });

    describe('valid reciter objects', () => {
      it('returns true for valid reciter with mp3 format', () => {
        const reciter = createValidReciter({ audioFormat: 'mp3' });
        expect(validateReciter(reciter)).toBe(true);
      });

      it('returns true for valid reciter with m4a format', () => {
        const reciter = createValidReciter({ audioFormat: 'm4a' });
        expect(validateReciter(reciter)).toBe(true);
      });

      it('returns true for valid reciter with ogg format', () => {
        const reciter = createValidReciter({ audioFormat: 'ogg' });
        expect(validateReciter(reciter)).toBe(true);
      });

      it('validates reciter with optional nameArabic', () => {
        const reciter = createValidReciter({ nameArabic: 'القارئ' });
        expect(validateReciter(reciter)).toBe(true);
      });

      it('validates reciter with all 114 surahs', () => {
        const allSurahs = Array.from({ length: 114 }, (_, i) => i + 1);
        const reciter = createValidReciter({ surahs: allSurahs });
        expect(validateReciter(reciter)).toBe(true);
      });

      it('validates reciter with single surah', () => {
        const reciter = createValidReciter({ surahs: [1] });
        expect(validateReciter(reciter)).toBe(true);
      });

      it('validates reciter with empty surahs array', () => {
        const reciter = createValidReciter({ surahs: [] });
        expect(validateReciter(reciter)).toBe(true);
      });
    });

    describe('invalid reciter objects', () => {
      it('throws error for null', () => {
        expect(() => validateReciter(null)).toThrow(QuranError);
      });

      it('throws error for undefined', () => {
        expect(() => validateReciter(undefined)).toThrow(QuranError);
      });

      it('throws error for non-object', () => {
        expect(() => validateReciter('not an object')).toThrow(QuranError);
      });
    });

    describe('invalid id', () => {
      it('throws error for empty id', () => {
        const reciter = createValidReciter({ id: '' });
        expect(() => validateReciter(reciter)).toThrow(QuranError);
      });

      it('throws error for missing id', () => {
        const reciter = { ...createValidReciter(), id: undefined } as unknown;
        expect(() => validateReciter(reciter)).toThrow(QuranError);
      });

      it('throws error for non-string id', () => {
        const reciter = { ...createValidReciter(), id: 123 } as unknown;
        expect(() => validateReciter(reciter)).toThrow(QuranError);
      });
    });

    describe('invalid name', () => {
      it('throws error for empty name', () => {
        const reciter = createValidReciter({ name: '' });
        expect(() => validateReciter(reciter)).toThrow(QuranError);
      });

      it('throws error for missing name', () => {
        const reciter = { ...createValidReciter(), name: undefined } as unknown;
        expect(() => validateReciter(reciter)).toThrow(QuranError);
      });

      it('throws error for non-string name', () => {
        const reciter = { ...createValidReciter(), name: 123 } as unknown;
        expect(() => validateReciter(reciter)).toThrow(QuranError);
      });
    });

    describe('invalid audioFormat', () => {
      it('throws error for invalid format', () => {
        const reciter = { ...createValidReciter(), audioFormat: 'wav' } as unknown;
        expect(() => validateReciter(reciter)).toThrow(QuranError);
      });

      it('throws error for missing audioFormat', () => {
        const reciter = {
          ...createValidReciter(),
          audioFormat: undefined,
        } as unknown;
        expect(() => validateReciter(reciter)).toThrow(QuranError);
      });

      it('throws error for empty audioFormat', () => {
        const reciter = { ...createValidReciter(), audioFormat: '' } as unknown;
        expect(() => validateReciter(reciter)).toThrow(QuranError);
      });
    });

    describe('invalid audioBaseUrl', () => {
      it('throws error for empty audioBaseUrl', () => {
        const reciter = createValidReciter({ audioBaseUrl: '' });
        expect(() => validateReciter(reciter)).toThrow(QuranError);
      });

      it('throws error for missing audioBaseUrl', () => {
        const reciter = {
          ...createValidReciter(),
          audioBaseUrl: undefined,
        } as unknown;
        expect(() => validateReciter(reciter)).toThrow(QuranError);
      });

      it('throws error for non-string audioBaseUrl', () => {
        const reciter = {
          ...createValidReciter(),
          audioBaseUrl: 123,
        } as unknown;
        expect(() => validateReciter(reciter)).toThrow(QuranError);
      });
    });

    describe('invalid surahs array', () => {
      it('throws error for non-array surahs', () => {
        const reciter = {
          ...createValidReciter(),
          surahs: 'not an array',
        } as unknown;
        expect(() => validateReciter(reciter)).toThrow(QuranError);
      });

      it('throws error for missing surahs', () => {
        const reciter = {
          ...createValidReciter(),
          surahs: undefined,
        } as unknown;
        expect(() => validateReciter(reciter)).toThrow(QuranError);
      });

      it('throws error for invalid surah number 0 in array', () => {
        const reciter = createValidReciter({ surahs: [0, 1, 2] });
        expect(() => validateReciter(reciter)).toThrow(QuranError);
      });

      it('throws error for invalid surah number 115 in array', () => {
        const reciter = createValidReciter({ surahs: [1, 115] });
        expect(() => validateReciter(reciter)).toThrow(QuranError);
      });

      it('throws error for negative surah number in array', () => {
        const reciter = createValidReciter({ surahs: [-1, 1] });
        expect(() => validateReciter(reciter)).toThrow(QuranError);
      });

      it('throws error for non-integer surah number in array', () => {
        const reciter = createValidReciter({ surahs: [1.5, 2] });
        expect(() => validateReciter(reciter)).toThrow(QuranError);
      });
    });

    describe('error codes', () => {
      it('throws error with DATA_VALIDATION_ERROR code', () => {
        try {
          validateReciter(null);
          expect.fail('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(QuranError);
          if (error instanceof QuranError) {
            expect(error.code).toBe(QuranErrorCode.DATA_VALIDATION_ERROR);
          }
        }
      });
    });
  });
});
