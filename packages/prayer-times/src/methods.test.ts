import { describe, it, expect } from 'vitest';
import {
  CALCULATION_METHODS,
  getMethod,
  createCustomMethod,
  getAvailableMethods,
  getMethodDescription,
  getRegionalMethods,
} from './methods';
import type { CalculationMethodName } from './types';

describe('CALCULATION_METHODS', () => {
  describe('method count and completeness', () => {
    it('contains exactly 14 calculation methods', () => {
      const methods = Object.keys(CALCULATION_METHODS);
      expect(methods).toHaveLength(14);
    });

    it('contains all expected method names', () => {
      const expectedMethods: CalculationMethodName[] = [
        'MWL',
        'ISNA',
        'Egypt',
        'Makkah',
        'Karachi',
        'Tehran',
        'Jafari',
        'Dubai',
        'Qatar',
        'Kuwait',
        'Singapore',
        'Turkey',
        'MoonsightingCommittee',
        'Custom',
      ];

      expectedMethods.forEach((method) => {
        expect(CALCULATION_METHODS).toHaveProperty(method);
      });
    });
  });

  describe('MWL (Muslim World League)', () => {
    const method = CALCULATION_METHODS.MWL;

    it('has correct name', () => {
      expect(method.name).toBe('MWL');
    });

    it('has fajrAngle of 18 degrees', () => {
      expect(method.fajrAngle).toBe(18);
    });

    it('has ishaAngle of 17 degrees', () => {
      expect(method.ishaAngle).toBe(17);
    });

    it('has dhuhr adjustment of 1 minute', () => {
      expect(method.methodAdjustments).toBeDefined();
      expect(method.methodAdjustments?.dhuhr).toBe(1);
    });

    it('does not have ishaInterval', () => {
      expect(method.ishaInterval).toBeUndefined();
    });

    it('does not have maghribAngle', () => {
      expect(method.maghribAngle).toBeUndefined();
    });
  });

  describe('ISNA (Islamic Society of North America)', () => {
    const method = CALCULATION_METHODS.ISNA;

    it('has correct name', () => {
      expect(method.name).toBe('ISNA');
    });

    it('has fajrAngle of 15 degrees', () => {
      expect(method.fajrAngle).toBe(15);
    });

    it('has ishaAngle of 15 degrees', () => {
      expect(method.ishaAngle).toBe(15);
    });

    it('has dhuhr adjustment of 1 minute', () => {
      expect(method.methodAdjustments?.dhuhr).toBe(1);
    });
  });

  describe('Egypt (Egyptian General Authority of Survey)', () => {
    const method = CALCULATION_METHODS.Egypt;

    it('has correct name', () => {
      expect(method.name).toBe('Egypt');
    });

    it('has fajrAngle of 19.5 degrees', () => {
      expect(method.fajrAngle).toBe(19.5);
    });

    it('has ishaAngle of 17.5 degrees', () => {
      expect(method.ishaAngle).toBe(17.5);
    });

    it('has dhuhr adjustment of 1 minute', () => {
      expect(method.methodAdjustments?.dhuhr).toBe(1);
    });
  });

  describe('Makkah (Umm al-Qura University)', () => {
    const method = CALCULATION_METHODS.Makkah;

    it('has correct name', () => {
      expect(method.name).toBe('Makkah');
    });

    it('has fajrAngle of 18.5 degrees', () => {
      expect(method.fajrAngle).toBe(18.5);
    });

    it('has ishaAngle of 0 (uses interval instead)', () => {
      expect(method.ishaAngle).toBe(0);
    });

    it('has ishaInterval of 90 minutes', () => {
      expect(method.ishaInterval).toBe(90);
    });

    it('does not have methodAdjustments', () => {
      expect(method.methodAdjustments).toBeUndefined();
    });
  });

  describe('Karachi (University of Islamic Sciences)', () => {
    const method = CALCULATION_METHODS.Karachi;

    it('has correct name', () => {
      expect(method.name).toBe('Karachi');
    });

    it('has fajrAngle of 18 degrees', () => {
      expect(method.fajrAngle).toBe(18);
    });

    it('has ishaAngle of 18 degrees', () => {
      expect(method.ishaAngle).toBe(18);
    });

    it('has dhuhr adjustment of 1 minute', () => {
      expect(method.methodAdjustments?.dhuhr).toBe(1);
    });
  });

  describe('Tehran (Institute of Geophysics)', () => {
    const method = CALCULATION_METHODS.Tehran;

    it('has correct name', () => {
      expect(method.name).toBe('Tehran');
    });

    it('has fajrAngle of 17.7 degrees', () => {
      expect(method.fajrAngle).toBe(17.7);
    });

    it('has ishaAngle of 14 degrees', () => {
      expect(method.ishaAngle).toBe(14);
    });

    it('has maghribAngle of 4.5 degrees', () => {
      expect(method.maghribAngle).toBe(4.5);
    });

    it('uses Jafari midnight calculation', () => {
      expect(method.midnight).toBe('Jafari');
    });

    it('does not have ishaInterval', () => {
      expect(method.ishaInterval).toBeUndefined();
    });
  });

  describe('Jafari (Shia Ithna Ashari)', () => {
    const method = CALCULATION_METHODS.Jafari;

    it('has correct name', () => {
      expect(method.name).toBe('Jafari');
    });

    it('has fajrAngle of 16 degrees', () => {
      expect(method.fajrAngle).toBe(16);
    });

    it('has ishaAngle of 14 degrees', () => {
      expect(method.ishaAngle).toBe(14);
    });

    it('has maghribAngle of 4 degrees', () => {
      expect(method.maghribAngle).toBe(4);
    });

    it('uses Jafari midnight calculation', () => {
      expect(method.midnight).toBe('Jafari');
    });
  });

  describe('Dubai', () => {
    const method = CALCULATION_METHODS.Dubai;

    it('has correct name', () => {
      expect(method.name).toBe('Dubai');
    });

    it('has fajrAngle of 18.2 degrees', () => {
      expect(method.fajrAngle).toBe(18.2);
    });

    it('has ishaAngle of 18.2 degrees', () => {
      expect(method.ishaAngle).toBe(18.2);
    });

    it('has methodAdjustments for multiple prayers', () => {
      expect(method.methodAdjustments).toBeDefined();
      expect(method.methodAdjustments?.sunrise).toBe(-3);
      expect(method.methodAdjustments?.dhuhr).toBe(3);
      expect(method.methodAdjustments?.asr).toBe(3);
      expect(method.methodAdjustments?.maghrib).toBe(3);
    });

    it('does not have fajr or isha adjustments', () => {
      expect(method.methodAdjustments?.fajr).toBeUndefined();
      expect(method.methodAdjustments?.isha).toBeUndefined();
    });
  });

  describe('Qatar', () => {
    const method = CALCULATION_METHODS.Qatar;

    it('has correct name', () => {
      expect(method.name).toBe('Qatar');
    });

    it('has fajrAngle of 18 degrees', () => {
      expect(method.fajrAngle).toBe(18);
    });

    it('has ishaAngle of 0 (uses interval instead)', () => {
      expect(method.ishaAngle).toBe(0);
    });

    it('has ishaInterval of 90 minutes', () => {
      expect(method.ishaInterval).toBe(90);
    });

    it('uses same ishaInterval as Makkah method', () => {
      expect(method.ishaInterval).toBe(CALCULATION_METHODS.Makkah.ishaInterval);
    });
  });

  describe('Kuwait', () => {
    const method = CALCULATION_METHODS.Kuwait;

    it('has correct name', () => {
      expect(method.name).toBe('Kuwait');
    });

    it('has fajrAngle of 18 degrees', () => {
      expect(method.fajrAngle).toBe(18);
    });

    it('has ishaAngle of 17.5 degrees', () => {
      expect(method.ishaAngle).toBe(17.5);
    });

    it('does not have methodAdjustments', () => {
      expect(method.methodAdjustments).toBeUndefined();
    });

    it('does not have ishaInterval', () => {
      expect(method.ishaInterval).toBeUndefined();
    });
  });

  describe('Singapore (Majlis Ugama Islam Singapura)', () => {
    const method = CALCULATION_METHODS.Singapore;

    it('has correct name', () => {
      expect(method.name).toBe('Singapore');
    });

    it('has fajrAngle of 20 degrees', () => {
      expect(method.fajrAngle).toBe(20);
    });

    it('has ishaAngle of 18 degrees', () => {
      expect(method.ishaAngle).toBe(18);
    });

    it('has dhuhr adjustment of 1 minute', () => {
      expect(method.methodAdjustments?.dhuhr).toBe(1);
    });

    it('has rounding mode set to up', () => {
      expect(method.rounding).toBe('up');
    });
  });

  describe('Turkey (Diyanet Isleri Baskanligi)', () => {
    const method = CALCULATION_METHODS.Turkey;

    it('has correct name', () => {
      expect(method.name).toBe('Turkey');
    });

    it('has fajrAngle of 18 degrees', () => {
      expect(method.fajrAngle).toBe(18);
    });

    it('has ishaAngle of 17 degrees', () => {
      expect(method.ishaAngle).toBe(17);
    });

    it('has methodAdjustments for multiple prayers', () => {
      expect(method.methodAdjustments).toBeDefined();
      expect(method.methodAdjustments?.sunrise).toBe(-7);
      expect(method.methodAdjustments?.dhuhr).toBe(5);
      expect(method.methodAdjustments?.asr).toBe(4);
      expect(method.methodAdjustments?.maghrib).toBe(7);
    });
  });

  describe('MoonsightingCommittee', () => {
    const method = CALCULATION_METHODS.MoonsightingCommittee;

    it('has correct name', () => {
      expect(method.name).toBe('MoonsightingCommittee');
    });

    it('has fajrAngle of 18 degrees', () => {
      expect(method.fajrAngle).toBe(18);
    });

    it('has ishaAngle of 18 degrees', () => {
      expect(method.ishaAngle).toBe(18);
    });

    it('has shafaq set to general', () => {
      expect(method.shafaq).toBe('general');
    });

    it('has methodAdjustments for dhuhr and maghrib', () => {
      expect(method.methodAdjustments).toBeDefined();
      expect(method.methodAdjustments?.dhuhr).toBe(5);
      expect(method.methodAdjustments?.maghrib).toBe(3);
    });
  });

  describe('Custom', () => {
    const method = CALCULATION_METHODS.Custom;

    it('has correct name', () => {
      expect(method.name).toBe('Custom');
    });

    it('has default fajrAngle of 18 degrees', () => {
      expect(method.fajrAngle).toBe(18);
    });

    it('has default ishaAngle of 17 degrees', () => {
      expect(method.ishaAngle).toBe(17);
    });

    it('does not have any special properties', () => {
      expect(method.ishaInterval).toBeUndefined();
      expect(method.maghribAngle).toBeUndefined();
      expect(method.midnight).toBeUndefined();
      expect(method.methodAdjustments).toBeUndefined();
      expect(method.rounding).toBeUndefined();
      expect(method.shafaq).toBeUndefined();
    });
  });

  describe('methods with special properties', () => {
    it('only Makkah and Qatar use ishaInterval', () => {
      const methodsWithInterval = Object.values(CALCULATION_METHODS).filter(
        (m) => m.ishaInterval !== undefined
      );
      expect(methodsWithInterval).toHaveLength(2);
      expect(methodsWithInterval.map((m) => m.name).sort()).toEqual(['Makkah', 'Qatar']);
    });

    it('only Tehran and Jafari have maghribAngle', () => {
      const methodsWithMaghribAngle = Object.values(CALCULATION_METHODS).filter(
        (m) => m.maghribAngle !== undefined
      );
      expect(methodsWithMaghribAngle).toHaveLength(2);
      expect(methodsWithMaghribAngle.map((m) => m.name).sort()).toEqual(['Jafari', 'Tehran']);
    });

    it('only Tehran and Jafari use Jafari midnight', () => {
      const methodsWithJafariMidnight = Object.values(CALCULATION_METHODS).filter(
        (m) => m.midnight === 'Jafari'
      );
      expect(methodsWithJafariMidnight).toHaveLength(2);
      expect(methodsWithJafariMidnight.map((m) => m.name).sort()).toEqual(['Jafari', 'Tehran']);
    });

    it('only Singapore has rounding mode', () => {
      const methodsWithRounding = Object.values(CALCULATION_METHODS).filter(
        (m) => m.rounding !== undefined
      );
      expect(methodsWithRounding).toHaveLength(1);
      expect(methodsWithRounding[0].name).toBe('Singapore');
    });

    it('only MoonsightingCommittee has shafaq property', () => {
      const methodsWithShafaq = Object.values(CALCULATION_METHODS).filter(
        (m) => m.shafaq !== undefined
      );
      expect(methodsWithShafaq).toHaveLength(1);
      expect(methodsWithShafaq[0].name).toBe('MoonsightingCommittee');
    });
  });

  describe('angle value ranges', () => {
    it('all fajrAngle values are between 14 and 21 degrees', () => {
      Object.values(CALCULATION_METHODS).forEach((method) => {
        expect(method.fajrAngle).toBeGreaterThanOrEqual(14);
        expect(method.fajrAngle).toBeLessThanOrEqual(21);
      });
    });

    it('all non-zero ishaAngle values are between 14 and 19 degrees', () => {
      Object.values(CALCULATION_METHODS)
        .filter((m) => m.ishaAngle > 0)
        .forEach((method) => {
          expect(method.ishaAngle).toBeGreaterThanOrEqual(14);
          expect(method.ishaAngle).toBeLessThanOrEqual(19);
        });
    });

    it('methods with ishaAngle of 0 have ishaInterval defined', () => {
      Object.values(CALCULATION_METHODS)
        .filter((m) => m.ishaAngle === 0)
        .forEach((method) => {
          expect(method.ishaInterval).toBeDefined();
          expect(method.ishaInterval).toBeGreaterThan(0);
        });
    });
  });
});

describe('getMethod', () => {
  it('returns a copy of the method, not the original', () => {
    const method = getMethod('MWL');
    method.fajrAngle = 999;

    expect(CALCULATION_METHODS.MWL.fajrAngle).toBe(18);
  });

  it('returns correct method for MWL', () => {
    const method = getMethod('MWL');

    expect(method.name).toBe('MWL');
    expect(method.fajrAngle).toBe(18);
    expect(method.ishaAngle).toBe(17);
  });

  it('returns correct method for ISNA', () => {
    const method = getMethod('ISNA');

    expect(method.name).toBe('ISNA');
    expect(method.fajrAngle).toBe(15);
    expect(method.ishaAngle).toBe(15);
  });

  it('returns correct method for Makkah with ishaInterval', () => {
    const method = getMethod('Makkah');

    expect(method.name).toBe('Makkah');
    expect(method.ishaInterval).toBe(90);
    expect(method.ishaAngle).toBe(0);
  });

  it('returns correct method for Tehran with maghribAngle', () => {
    const method = getMethod('Tehran');

    expect(method.name).toBe('Tehran');
    expect(method.maghribAngle).toBe(4.5);
    expect(method.midnight).toBe('Jafari');
  });

  it('returns correct method for Jafari', () => {
    const method = getMethod('Jafari');

    expect(method.name).toBe('Jafari');
    expect(method.maghribAngle).toBe(4);
    expect(method.midnight).toBe('Jafari');
  });

  it('returns all 14 methods correctly', () => {
    const methodNames: CalculationMethodName[] = [
      'MWL',
      'ISNA',
      'Egypt',
      'Makkah',
      'Karachi',
      'Tehran',
      'Jafari',
      'Dubai',
      'Qatar',
      'Kuwait',
      'Singapore',
      'Turkey',
      'MoonsightingCommittee',
      'Custom',
    ];

    methodNames.forEach((name) => {
      const method = getMethod(name);
      expect(method.name).toBe(name);
    });
  });
});

describe('createCustomMethod', () => {
  it('creates a custom method with specified angles', () => {
    const method = createCustomMethod(19, 16);

    expect(method.name).toBe('Custom');
    expect(method.fajrAngle).toBe(19);
    expect(method.ishaAngle).toBe(16);
  });

  it('creates a custom method with ishaInterval', () => {
    const method = createCustomMethod(18, 0, { ishaInterval: 120 });

    expect(method.name).toBe('Custom');
    expect(method.fajrAngle).toBe(18);
    expect(method.ishaAngle).toBe(0);
    expect(method.ishaInterval).toBe(120);
  });

  it('creates a custom method with maghribAngle', () => {
    const method = createCustomMethod(17, 15, { maghribAngle: 5 });

    expect(method.name).toBe('Custom');
    expect(method.maghribAngle).toBe(5);
  });

  it('creates a custom method with Jafari midnight', () => {
    const method = createCustomMethod(16, 14, { midnight: 'Jafari' });

    expect(method.midnight).toBe('Jafari');
  });

  it('creates a custom method with methodAdjustments', () => {
    const method = createCustomMethod(18, 17, {
      methodAdjustments: {
        fajr: -2,
        dhuhr: 3,
        asr: 2,
      },
    });

    expect(method.methodAdjustments).toBeDefined();
    expect(method.methodAdjustments?.fajr).toBe(-2);
    expect(method.methodAdjustments?.dhuhr).toBe(3);
    expect(method.methodAdjustments?.asr).toBe(2);
  });

  it('creates a custom method with rounding mode', () => {
    const method = createCustomMethod(20, 18, { rounding: 'up' });

    expect(method.rounding).toBe('up');
  });

  it('creates a custom method with shafaq', () => {
    const method = createCustomMethod(18, 18, { shafaq: 'ahmer' });

    expect(method.shafaq).toBe('ahmer');
  });

  it('creates a custom method with all options', () => {
    const method = createCustomMethod(17.5, 14.5, {
      maghribAngle: 4.5,
      midnight: 'Jafari',
      methodAdjustments: { dhuhr: 2, maghrib: 3 },
      rounding: 'nearest',
    });

    expect(method.name).toBe('Custom');
    expect(method.fajrAngle).toBe(17.5);
    expect(method.ishaAngle).toBe(14.5);
    expect(method.maghribAngle).toBe(4.5);
    expect(method.midnight).toBe('Jafari');
    expect(method.methodAdjustments?.dhuhr).toBe(2);
    expect(method.rounding).toBe('nearest');
  });

  it('allows zero fajrAngle', () => {
    const method = createCustomMethod(0, 17);

    expect(method.fajrAngle).toBe(0);
  });

  it('allows negative angles (edge case)', () => {
    const method = createCustomMethod(-5, -3);

    expect(method.fajrAngle).toBe(-5);
    expect(method.ishaAngle).toBe(-3);
  });

  it('allows decimal angles', () => {
    const method = createCustomMethod(18.123, 17.456);

    expect(method.fajrAngle).toBe(18.123);
    expect(method.ishaAngle).toBe(17.456);
  });

  it('options override fajrAngle and ishaAngle if provided', () => {
    const method = createCustomMethod(18, 17, {
      fajrAngle: 20,
      ishaAngle: 19,
    });

    // Options are spread after the base, so they override
    expect(method.fajrAngle).toBe(20);
    expect(method.ishaAngle).toBe(19);
  });
});

describe('getAvailableMethods', () => {
  it('returns an array of 14 method names', () => {
    const methods = getAvailableMethods();

    expect(methods).toHaveLength(14);
  });

  it('returns all expected method names', () => {
    const methods = getAvailableMethods();
    const expectedMethods: CalculationMethodName[] = [
      'MWL',
      'ISNA',
      'Egypt',
      'Makkah',
      'Karachi',
      'Tehran',
      'Jafari',
      'Dubai',
      'Qatar',
      'Kuwait',
      'Singapore',
      'Turkey',
      'MoonsightingCommittee',
      'Custom',
    ];

    expectedMethods.forEach((name) => {
      expect(methods).toContain(name);
    });
  });

  it('returns an array where each element is a valid key in CALCULATION_METHODS', () => {
    const methods = getAvailableMethods();

    methods.forEach((name) => {
      expect(CALCULATION_METHODS[name]).toBeDefined();
    });
  });

  it('returns a new array each time (not a reference)', () => {
    const methods1 = getAvailableMethods();
    const methods2 = getAvailableMethods();

    expect(methods1).not.toBe(methods2);
    expect(methods1).toEqual(methods2);
  });
});

describe('getMethodDescription', () => {
  it('returns description for MWL', () => {
    const description = getMethodDescription('MWL');

    expect(description).toBe('Muslim World League - Used in Europe, Far East, and parts of USA');
  });

  it('returns description for ISNA', () => {
    const description = getMethodDescription('ISNA');

    expect(description).toBe('Islamic Society of North America - Used in North America');
  });

  it('returns description for Egypt', () => {
    const description = getMethodDescription('Egypt');

    expect(description).toBe('Egyptian General Authority of Survey - Used in Africa, Syria, Lebanon');
  });

  it('returns description for Makkah', () => {
    const description = getMethodDescription('Makkah');

    expect(description).toBe('Umm al-Qura University, Makkah - Used in Arabian Peninsula');
  });

  it('returns description for Karachi', () => {
    const description = getMethodDescription('Karachi');

    expect(description).toBe('University of Islamic Sciences, Karachi - Used in Pakistan, Afghanistan');
  });

  it('returns description for Tehran', () => {
    const description = getMethodDescription('Tehran');

    expect(description).toBe('Institute of Geophysics, University of Tehran - Used in Iran');
  });

  it('returns description for Jafari', () => {
    const description = getMethodDescription('Jafari');

    expect(description).toBe('Shia Ithna Ashari, Leva Research Institute, Qum');
  });

  it('returns description for Dubai', () => {
    const description = getMethodDescription('Dubai');

    expect(description).toBe('Dubai - United Arab Emirates');
  });

  it('returns description for Qatar', () => {
    const description = getMethodDescription('Qatar');

    expect(description).toBe('Qatar - Gulf region');
  });

  it('returns description for Kuwait', () => {
    const description = getMethodDescription('Kuwait');

    expect(description).toBe('Kuwait - Gulf region');
  });

  it('returns description for Singapore', () => {
    const description = getMethodDescription('Singapore');

    expect(description).toBe('Majlis Ugama Islam Singapura - Used in Singapore, Brunei');
  });

  it('returns description for Turkey', () => {
    const description = getMethodDescription('Turkey');

    expect(description).toBe('Diyanet Isleri Baskanligi - Used in Turkey, Turkic republics');
  });

  it('returns description for MoonsightingCommittee', () => {
    const description = getMethodDescription('MoonsightingCommittee');

    expect(description).toBe('Moonsighting Committee Worldwide - Uses physical sighting criteria');
  });

  it('returns description for Custom', () => {
    const description = getMethodDescription('Custom');

    expect(description).toBe('Custom calculation parameters');
  });

  it('all method descriptions are non-empty strings', () => {
    const methods = getAvailableMethods();

    methods.forEach((name) => {
      const description = getMethodDescription(name);
      expect(typeof description).toBe('string');
      expect(description.length).toBeGreaterThan(0);
    });
  });

  it('each method has a unique description', () => {
    const methods = getAvailableMethods();
    const descriptions = methods.map((name) => getMethodDescription(name));
    const uniqueDescriptions = new Set(descriptions);

    expect(uniqueDescriptions.size).toBe(descriptions.length);
  });
});

describe('getRegionalMethods', () => {
  it('returns an object with four regions', () => {
    const regions = getRegionalMethods();

    expect(Object.keys(regions)).toHaveLength(4);
    expect(regions).toHaveProperty('middleEast');
    expect(regions).toHaveProperty('asia');
    expect(regions).toHaveProperty('northAmerica');
    expect(regions).toHaveProperty('europe');
  });

  describe('middleEast region', () => {
    it('contains expected methods', () => {
      const regions = getRegionalMethods();

      expect(regions.middleEast).toContain('Makkah');
      expect(regions.middleEast).toContain('Egypt');
      expect(regions.middleEast).toContain('Dubai');
      expect(regions.middleEast).toContain('Qatar');
      expect(regions.middleEast).toContain('Kuwait');
    });

    it('contains exactly 5 methods', () => {
      const regions = getRegionalMethods();

      expect(regions.middleEast).toHaveLength(5);
    });
  });

  describe('asia region', () => {
    it('contains expected methods', () => {
      const regions = getRegionalMethods();

      expect(regions.asia).toContain('Karachi');
      expect(regions.asia).toContain('Singapore');
      expect(regions.asia).toContain('Turkey');
    });

    it('contains exactly 3 methods', () => {
      const regions = getRegionalMethods();

      expect(regions.asia).toHaveLength(3);
    });
  });

  describe('northAmerica region', () => {
    it('contains expected methods', () => {
      const regions = getRegionalMethods();

      expect(regions.northAmerica).toContain('ISNA');
      expect(regions.northAmerica).toContain('MoonsightingCommittee');
    });

    it('contains exactly 2 methods', () => {
      const regions = getRegionalMethods();

      expect(regions.northAmerica).toHaveLength(2);
    });
  });

  describe('europe region', () => {
    it('contains expected methods', () => {
      const regions = getRegionalMethods();

      expect(regions.europe).toContain('MWL');
      expect(regions.europe).toContain('MoonsightingCommittee');
    });

    it('contains exactly 2 methods', () => {
      const regions = getRegionalMethods();

      expect(regions.europe).toHaveLength(2);
    });
  });

  it('MoonsightingCommittee is available in both northAmerica and europe', () => {
    const regions = getRegionalMethods();

    expect(regions.northAmerica).toContain('MoonsightingCommittee');
    expect(regions.europe).toContain('MoonsightingCommittee');
  });

  it('all regional methods are valid CalculationMethodNames', () => {
    const regions = getRegionalMethods();
    const allMethods = getAvailableMethods();

    Object.values(regions)
      .flat()
      .forEach((method) => {
        expect(allMethods).toContain(method);
      });
  });

  it('returns a new object each time (not a reference)', () => {
    const regions1 = getRegionalMethods();
    const regions2 = getRegionalMethods();

    expect(regions1).not.toBe(regions2);
    expect(regions1.middleEast).not.toBe(regions2.middleEast);
  });

  it('does not include Tehran and Jafari (Shia methods) in any region', () => {
    const regions = getRegionalMethods();
    const allRegionalMethods = Object.values(regions).flat();

    expect(allRegionalMethods).not.toContain('Tehran');
    expect(allRegionalMethods).not.toContain('Jafari');
  });

  it('does not include Custom method in any region', () => {
    const regions = getRegionalMethods();
    const allRegionalMethods = Object.values(regions).flat();

    expect(allRegionalMethods).not.toContain('Custom');
  });
});
