import type { CalculationMethod, CalculationMethodName } from './types';

/**
 * Predefined calculation methods
 * Based on widely-used Islamic prayer time calculation standards
 */
export const CALCULATION_METHODS: Record<CalculationMethodName, CalculationMethod> = {
  // Muslim World League - Used in Europe, Far East, parts of USA
  MWL: {
    name: 'MWL',
    fajrAngle: 18,
    ishaAngle: 17,
    methodAdjustments: { dhuhr: 1 },
  },

  // Islamic Society of North America
  ISNA: {
    name: 'ISNA',
    fajrAngle: 15,
    ishaAngle: 15,
    methodAdjustments: { dhuhr: 1 },
  },

  // Egyptian General Authority of Survey
  Egypt: {
    name: 'Egypt',
    fajrAngle: 19.5,
    ishaAngle: 17.5,
    methodAdjustments: { dhuhr: 1 },
  },

  // Umm al-Qura University, Makkah - Used in Arabian Peninsula
  Makkah: {
    name: 'Makkah',
    fajrAngle: 18.5,
    ishaAngle: 0,
    ishaInterval: 90, // 90 minutes after Maghrib
  },

  // University of Islamic Sciences, Karachi
  Karachi: {
    name: 'Karachi',
    fajrAngle: 18,
    ishaAngle: 18,
    methodAdjustments: { dhuhr: 1 },
  },

  // Institute of Geophysics, University of Tehran - Shia Jafari method
  Tehran: {
    name: 'Tehran',
    fajrAngle: 17.7,
    ishaAngle: 14,
    maghribAngle: 4.5,
    midnight: 'Jafari',
  },

  // Shia Ithna Ashari, Leva Research Institute, Qum
  Jafari: {
    name: 'Jafari',
    fajrAngle: 16,
    ishaAngle: 14,
    maghribAngle: 4,
    midnight: 'Jafari',
  },

  // Dubai - United Arab Emirates
  Dubai: {
    name: 'Dubai',
    fajrAngle: 18.2,
    ishaAngle: 18.2,
    methodAdjustments: {
      sunrise: -3,
      dhuhr: 3,
      asr: 3,
      maghrib: 3,
    },
  },

  // Qatar
  Qatar: {
    name: 'Qatar',
    fajrAngle: 18,
    ishaAngle: 0,
    ishaInterval: 90, // 90 minutes after Maghrib (same as Makkah)
  },

  // Kuwait
  Kuwait: {
    name: 'Kuwait',
    fajrAngle: 18,
    ishaAngle: 17.5,
  },

  // Singapore - Majlis Ugama Islam Singapura
  Singapore: {
    name: 'Singapore',
    fajrAngle: 20,
    ishaAngle: 18,
    methodAdjustments: { dhuhr: 1 },
    rounding: 'up',
  },

  // Turkey - Diyanet Isleri Baskanligi
  Turkey: {
    name: 'Turkey',
    fajrAngle: 18,
    ishaAngle: 17,
    methodAdjustments: {
      sunrise: -7,
      dhuhr: 5,
      asr: 4,
      maghrib: 7,
    },
  },

  // Moonsighting Committee Worldwide
  // Special handling for latitudes above 55 degrees
  MoonsightingCommittee: {
    name: 'MoonsightingCommittee',
    fajrAngle: 18,
    ishaAngle: 18,
    shafaq: 'general',
    methodAdjustments: {
      dhuhr: 5,
      maghrib: 3,
    },
  },

  // Custom - User-defined parameters
  Custom: {
    name: 'Custom',
    fajrAngle: 18,
    ishaAngle: 17,
  },
};

/**
 * Get calculation method by name
 */
export function getMethod(name: CalculationMethodName): CalculationMethod {
  return { ...CALCULATION_METHODS[name] };
}

/**
 * Create custom calculation method
 */
export function createCustomMethod(
  fajrAngle: number,
  ishaAngle: number,
  options: Partial<CalculationMethod> = {}
): CalculationMethod {
  return {
    name: 'Custom',
    fajrAngle,
    ishaAngle,
    ...options,
  };
}

/**
 * Get all available method names
 */
export function getAvailableMethods(): CalculationMethodName[] {
  return Object.keys(CALCULATION_METHODS) as CalculationMethodName[];
}

/**
 * Get method description
 */
export function getMethodDescription(name: CalculationMethodName): string {
  const descriptions: Record<CalculationMethodName, string> = {
    MWL: 'Muslim World League - Used in Europe, Far East, and parts of USA',
    ISNA: 'Islamic Society of North America - Used in North America',
    Egypt: 'Egyptian General Authority of Survey - Used in Africa, Syria, Lebanon',
    Makkah: 'Umm al-Qura University, Makkah - Used in Arabian Peninsula',
    Karachi: 'University of Islamic Sciences, Karachi - Used in Pakistan, Afghanistan',
    Tehran: 'Institute of Geophysics, University of Tehran - Used in Iran',
    Jafari: 'Shia Ithna Ashari, Leva Research Institute, Qum',
    Dubai: 'Dubai - United Arab Emirates',
    Qatar: 'Qatar - Gulf region',
    Kuwait: 'Kuwait - Gulf region',
    Singapore: 'Majlis Ugama Islam Singapura - Used in Singapore, Brunei',
    Turkey: 'Diyanet Isleri Baskanligi - Used in Turkey, Turkic republics',
    MoonsightingCommittee: 'Moonsighting Committee Worldwide - Uses physical sighting criteria',
    Custom: 'Custom calculation parameters',
  };
  return descriptions[name];
}

/**
 * Get regional methods
 */
export function getRegionalMethods(): {
  middleEast: CalculationMethodName[];
  asia: CalculationMethodName[];
  northAmerica: CalculationMethodName[];
  europe: CalculationMethodName[];
} {
  return {
    middleEast: ['Makkah', 'Egypt', 'Dubai', 'Qatar', 'Kuwait'],
    asia: ['Karachi', 'Singapore', 'Turkey'],
    northAmerica: ['ISNA', 'MoonsightingCommittee'],
    europe: ['MWL', 'MoonsightingCommittee'],
  };
}
