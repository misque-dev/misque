/**
 * Utility functions, constants, and madhab rules for zakat calculation
 * @module @misque/zakat/utils
 */

import type { Result } from '@misque/core';
import type {
  Madhab,
  MadhabRules,
  AssetInput,
  LivestockType,
  IrrigationMethod,
  ZakatError,
} from './types';
import { createError } from './api';

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Nisab threshold for gold in grams
 * Equivalent to 7.5 tola or approximately 3 oz
 */
export const NISAB_GOLD_GRAMS = 85;

/**
 * Nisab threshold for silver in grams
 * Equivalent to 52.5 tola or approximately 21 oz
 */
export const NISAB_SILVER_GRAMS = 595;

/**
 * Standard zakat rate for monetary assets (2.5%)
 */
export const ZAKAT_RATE = 0.025;

/**
 * Zakat rate for rain-fed/naturally irrigated crops (10%)
 */
export const AGRICULTURAL_RATE_NATURAL = 0.10;

/**
 * Zakat rate for artificially irrigated crops (5%)
 */
export const AGRICULTURAL_RATE_ARTIFICIAL = 0.05;

/**
 * Zakat rate for mixed irrigation (7.5%)
 */
export const AGRICULTURAL_RATE_MIXED = 0.075;

/**
 * Default timeout for API requests in milliseconds
 */
export const DEFAULT_TIMEOUT = 10000;

/**
 * Default currency code
 */
export const DEFAULT_CURRENCY = 'USD';

/**
 * Default madhab
 */
export const DEFAULT_MADHAB: Madhab = 'hanafi';

// ============================================================================
// MADHAB RULES
// ============================================================================

/**
 * Madhab-specific rules for zakat calculation
 */
export const MADHAB_RULES: Record<Madhab, MadhabRules> = {
  hanafi: {
    madhab: 'hanafi',
    jewelryExempt: false, // Zakat due on ALL gold/silver including worn jewelry
    debtDeduction: 'all', // Deduct all debts from zakatable assets
    receivablesTiming: 'when_received', // Zakat on receivables only when collected
    notes: [
      'Zakat is due on all gold and silver, including worn jewelry',
      'All debts can be deducted from zakatable assets',
      'Receivables are only zakatable when received',
    ],
  },
  shafii: {
    madhab: 'shafii',
    jewelryExempt: true, // Worn jewelry for personal use is exempt
    debtDeduction: 'immediate', // Only deduct debts due immediately or within the year
    receivablesTiming: 'now', // Include receivables in current calculation
    notes: [
      'Worn jewelry for personal use is exempt from zakat',
      'Only deduct debts due within the lunar year',
      'Receivables should be included in current calculation',
    ],
  },
  maliki: {
    madhab: 'maliki',
    jewelryExempt: true, // Worn jewelry is exempt (within normal amounts)
    debtDeduction: 'diminishing', // Deduct debts only from non-apparent wealth
    receivablesTiming: 'when_received', // Zakat on receivables when received
    notes: [
      'Worn jewelry is exempt if within customary amounts',
      'Debts only deducted from non-apparent wealth (cash, gold)',
      'Receivables are zakatable when received',
    ],
  },
  hanbali: {
    madhab: 'hanbali',
    jewelryExempt: true, // Worn jewelry is exempt
    debtDeduction: 'diminishing', // Deduct debts that diminish nisab
    receivablesTiming: 'now', // Include receivables if likely to be collected
    notes: [
      'Worn jewelry is exempt from zakat',
      'Deduct debts that would reduce wealth below nisab',
      'Include receivables if likely to be collected',
    ],
  },
};

/**
 * Get madhab rules by name
 */
export function getMadhabRules(madhab: Madhab): MadhabRules {
  return MADHAB_RULES[madhab];
}

/**
 * Check if jewelry is exempt for a given madhab
 */
export function isJewelryExempt(madhab: Madhab): boolean {
  return MADHAB_RULES[madhab].jewelryExempt;
}

/**
 * Get debt deduction rules for a madhab
 */
export function getDebtDeductionRules(
  madhab: Madhab
): 'all' | 'immediate' | 'diminishing' {
  return MADHAB_RULES[madhab].debtDeduction;
}

// ============================================================================
// LIVESTOCK NISAB TABLES
// ============================================================================

/**
 * Camel zakat table (from hadith)
 * Format: [minCount, maxCount, zakatDue]
 */
export const CAMEL_ZAKAT_TABLE: Array<{
  min: number;
  max: number;
  due: string;
  description: string;
}> = [
  { min: 5, max: 9, due: '1 sheep', description: 'One sheep' },
  { min: 10, max: 14, due: '2 sheep', description: 'Two sheep' },
  { min: 15, max: 19, due: '3 sheep', description: 'Three sheep' },
  { min: 20, max: 24, due: '4 sheep', description: 'Four sheep' },
  {
    min: 25,
    max: 35,
    due: '1 bint makhad',
    description: 'One she-camel in her second year',
  },
  {
    min: 36,
    max: 45,
    due: '1 bint labun',
    description: 'One she-camel in her third year',
  },
  {
    min: 46,
    max: 60,
    due: '1 hiqqah',
    description: 'One she-camel in her fourth year',
  },
  {
    min: 61,
    max: 75,
    due: "1 jadh'ah",
    description: 'One she-camel in her fifth year',
  },
  {
    min: 76,
    max: 90,
    due: '2 bint labun',
    description: 'Two she-camels in their third year',
  },
  {
    min: 91,
    max: 120,
    due: '2 hiqqah',
    description: 'Two she-camels in their fourth year',
  },
];

/**
 * Cattle zakat table
 */
export const CATTLE_ZAKAT_TABLE: Array<{
  min: number;
  max: number;
  due: string;
  description: string;
}> = [
  {
    min: 30,
    max: 39,
    due: "1 tabi'",
    description: 'One calf in its second year',
  },
  {
    min: 40,
    max: 59,
    due: '1 musinnah',
    description: 'One cow in its third year',
  },
  { min: 60, max: 69, due: "2 tabi'", description: 'Two calves' },
  {
    min: 70,
    max: 79,
    due: "1 tabi' + 1 musinnah",
    description: 'One calf and one cow',
  },
  { min: 80, max: 89, due: '2 musinnah', description: 'Two cows' },
  { min: 90, max: 99, due: "3 tabi'", description: 'Three calves' },
  {
    min: 100,
    max: 109,
    due: "2 tabi' + 1 musinnah",
    description: 'Two calves and one cow',
  },
  {
    min: 110,
    max: 119,
    due: "1 tabi' + 2 musinnah",
    description: 'One calf and two cows',
  },
  { min: 120, max: 129, due: '3 musinnah', description: 'Three cows' },
];

/**
 * Sheep/goat zakat table
 */
export const SHEEP_ZAKAT_TABLE: Array<{
  min: number;
  max: number;
  due: number;
  description: string;
}> = [
  { min: 40, max: 120, due: 1, description: 'One sheep' },
  { min: 121, max: 200, due: 2, description: 'Two sheep' },
  { min: 201, max: 399, due: 3, description: 'Three sheep' },
  // For 400+, it's 1 sheep per 100
];

/**
 * Calculate livestock zakat
 * Returns the zakat due description or null if below nisab
 */
export function calculateLivestockZakat(
  type: LivestockType,
  count: number,
  isFreeGrazing: boolean
): { due: string; description: string } | null {
  // Livestock must be free-grazing (sa'imah) for zakat to apply
  if (!isFreeGrazing) {
    return null;
  }

  if (type === 'camels') {
    if (count < 5) return null;
    // Handle counts above 120
    if (count > 120) {
      const hiqqahs = Math.floor(count / 50);
      const bintLabuns = Math.floor((count % 50) / 40);
      return {
        due: `${hiqqahs} hiqqah + ${bintLabuns} bint labun`,
        description: `${hiqqahs} she-camels (4th year) + ${bintLabuns} she-camels (3rd year)`,
      };
    }
    const entry = CAMEL_ZAKAT_TABLE.find((e) => count >= e.min && count <= e.max);
    return entry ? { due: entry.due, description: entry.description } : null;
  }

  if (type === 'cattle') {
    if (count < 30) return null;
    // Handle counts above 120
    if (count > 129) {
      const cows = Math.floor(count / 40);
      const calves = Math.floor((count % 40) / 30);
      return {
        due: `${cows} musinnah + ${calves} tabi'`,
        description: `${cows} cows (3rd year) + ${calves} calves (2nd year)`,
      };
    }
    const entry = CATTLE_ZAKAT_TABLE.find((e) => count >= e.min && count <= e.max);
    return entry ? { due: entry.due, description: entry.description } : null;
  }

  if (type === 'sheep_goats') {
    if (count < 40) return null;
    // Handle counts 400+
    if (count >= 400) {
      const sheepDue = Math.floor(count / 100);
      return {
        due: `${sheepDue} sheep`,
        description: `${sheepDue} sheep (1 per 100)`,
      };
    }
    const entry = SHEEP_ZAKAT_TABLE.find((e) => count >= e.min && count <= e.max);
    return entry
      ? { due: `${entry.due} sheep`, description: entry.description }
      : null;
  }

  return null;
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate a madhab name
 */
export function validateMadhab(madhab: string): Result<Madhab, ZakatError> {
  const validMadhabs: Madhab[] = ['hanafi', 'shafii', 'maliki', 'hanbali'];
  if (!validMadhabs.includes(madhab as Madhab)) {
    return {
      success: false,
      error: createError(
        'INVALID_MADHAB',
        `Invalid madhab: ${madhab}. Must be one of: ${validMadhabs.join(', ')}`
      ),
    };
  }
  return { success: true, data: madhab as Madhab };
}

/**
 * Validate a single asset input
 */
export function validateAsset(asset: AssetInput): Result<AssetInput, ZakatError> {
  switch (asset.type) {
    case 'cash':
      if (typeof asset.amount !== 'number' || asset.amount < 0) {
        return {
          success: false,
          error: createError('INVALID_AMOUNT', 'Cash amount must be a non-negative number'),
        };
      }
      if (!asset.currency) {
        return {
          success: false,
          error: createError('INVALID_CURRENCY', 'Cash asset must have a currency'),
        };
      }
      break;

    case 'gold':
    case 'silver':
      if (typeof asset.weightGrams !== 'number' || asset.weightGrams < 0) {
        return {
          success: false,
          error: createError('INVALID_WEIGHT', `${asset.type} weight must be a non-negative number`),
        };
      }
      if (asset.purity !== undefined && (asset.purity < 0 || asset.purity > 1)) {
        return {
          success: false,
          error: createError('INVALID_PURITY', 'Purity must be between 0 and 1'),
        };
      }
      break;

    case 'business':
      if (typeof asset.inventoryValue !== 'number' || asset.inventoryValue < 0) {
        return {
          success: false,
          error: createError('INVALID_AMOUNT', 'Business inventory value must be non-negative'),
        };
      }
      break;

    case 'stocks':
    case 'crypto':
      if (typeof asset.marketValue !== 'number' || asset.marketValue < 0) {
        return {
          success: false,
          error: createError('INVALID_AMOUNT', 'Market value must be non-negative'),
        };
      }
      break;

    case 'agricultural':
      if (typeof asset.harvestValue !== 'number' || asset.harvestValue < 0) {
        return {
          success: false,
          error: createError('INVALID_AMOUNT', 'Harvest value must be non-negative'),
        };
      }
      break;

    case 'livestock':
      if (typeof asset.count !== 'number' || asset.count < 0 || !Number.isInteger(asset.count)) {
        return {
          success: false,
          error: createError('INVALID_COUNT', 'Livestock count must be a non-negative integer'),
        };
      }
      break;

    default:
      return {
        success: false,
        error: createError('INVALID_ASSET_TYPE', `Unknown asset type: ${(asset as AssetInput).type}`),
      };
  }

  return { success: true, data: asset };
}

// ============================================================================
// CALCULATION HELPERS
// ============================================================================

/**
 * Get the zakat rate for agricultural produce based on irrigation method
 */
export function getAgriculturalRate(method: IrrigationMethod): number {
  switch (method) {
    case 'natural':
      return AGRICULTURAL_RATE_NATURAL;
    case 'artificial':
      return AGRICULTURAL_RATE_ARTIFICIAL;
    case 'mixed':
      return AGRICULTURAL_RATE_MIXED;
  }
}

/**
 * Calculate pure metal weight from total weight and purity
 */
export function calculatePureWeight(weightGrams: number, purity = 1): number {
  return weightGrams * purity;
}

/**
 * Calculate metal value from weight and price per gram
 */
export function calculateMetalValue(
  weightGrams: number,
  pricePerGram: number,
  purity = 1
): number {
  const pureWeight = calculatePureWeight(weightGrams, purity);
  return pureWeight * pricePerGram;
}

/**
 * Round to 2 decimal places for currency
 */
export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Format currency value with symbol
 */
export function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value);
}
