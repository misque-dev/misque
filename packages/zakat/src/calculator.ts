/**
 * Main zakat calculator functions and factory
 * @module @misque/zakat/calculator
 */

import type { AsyncResult } from '@misque/core';
import type {
  ZakatCalculationInput,
  ZakatCalculationResult,
  CalculateZakatOptions,
  ZakatCalculatorConfig,
  ZakatCalculatorInstance,
  ZakatError,
  AssetInput,
  AssetZakatBreakdown,
  LivestockZakatBreakdown,
  DeductibleDebt,
  MetalPricesResult,
  NisabThresholds,
  CurrencyCode,
  CacheStats,
  Madhab,
} from './types';
import { ZakatCache, generateCacheKey } from './cache';
import {
  fetchMetalPrices,
  createError,
  createMockMetalPrices,
  validateMetalPrices,
} from './api';
import {
  NISAB_GOLD_GRAMS,
  NISAB_SILVER_GRAMS,
  ZAKAT_RATE,
  DEFAULT_TIMEOUT,
  DEFAULT_CURRENCY,
  DEFAULT_MADHAB,
  getMadhabRules,
  isJewelryExempt,
  getDebtDeductionRules,
  validateMadhab,
  validateAsset,
  getAgriculturalRate,
  calculateMetalValue,
  calculateLivestockZakat,
  roundCurrency,
} from './utils';

/**
 * Calculate zakat for a single cash asset
 */
function calculateCashZakat(
  asset: AssetInput & { type: 'cash' },
  _madhab: Madhab
): AssetZakatBreakdown {
  const zakatDue = roundCurrency(asset.amount * ZAKAT_RATE);

  return {
    assetId: asset.id,
    assetType: 'cash',
    description: asset.description ?? 'Cash/Savings',
    originalValue: asset.amount,
    originalCurrency: asset.currency,
    valueInTargetCurrency: asset.amount, // Will be converted if needed
    zakatRate: ZAKAT_RATE,
    zakatDue,
    explanation: `2.5% of ${asset.amount} ${asset.currency}`,
    isExempt: false,
  };
}

/**
 * Calculate zakat for gold/silver asset
 */
function calculateMetalZakat(
  asset: AssetInput & { type: 'gold' | 'silver' },
  metalPrices: MetalPricesResult,
  madhab: Madhab
): AssetZakatBreakdown {
  const price =
    asset.type === 'gold'
      ? metalPrices.gold.pricePerGram
      : metalPrices.silver.pricePerGram;
  const currency = metalPrices.gold.currency;
  const purity = asset.purity ?? 1;

  // Check jewelry exemption
  if (asset.isWornJewelry && isJewelryExempt(madhab)) {
    return {
      assetId: asset.id,
      assetType: asset.type,
      description: asset.description ?? `${asset.type} jewelry`,
      originalValue: asset.weightGrams,
      originalCurrency: 'grams',
      valueInTargetCurrency: calculateMetalValue(asset.weightGrams, price, purity),
      zakatRate: 0,
      zakatDue: 0,
      explanation: `Worn jewelry exempt in ${madhab} madhab`,
      isExempt: true,
      exemptionReason: `${madhab} madhab exempts worn jewelry from zakat`,
      madhabRuleApplied: 'Worn jewelry exemption',
    };
  }

  const value = calculateMetalValue(asset.weightGrams, price, purity);
  const zakatDue = roundCurrency(value * ZAKAT_RATE);

  return {
    assetId: asset.id,
    assetType: asset.type,
    description:
      asset.description ?? `${asset.type} (${asset.weightGrams}g at ${purity * 100}% purity)`,
    originalValue: asset.weightGrams,
    originalCurrency: 'grams',
    valueInTargetCurrency: value,
    zakatRate: ZAKAT_RATE,
    zakatDue,
    explanation: `${asset.weightGrams}g × ${purity} purity × ${price}/g × 2.5% = ${zakatDue} ${currency}`,
    isExempt: false,
    madhabRuleApplied: asset.isWornJewelry
      ? 'Hanafi: zakat due on all gold/silver including worn jewelry'
      : undefined,
  };
}

/**
 * Calculate zakat for business assets
 */
function calculateBusinessZakat(
  asset: AssetInput & { type: 'business' },
  madhab: Madhab
): AssetZakatBreakdown {
  const rules = getMadhabRules(madhab);

  // Calculate total business value
  let totalValue = asset.inventoryValue + (asset.cash ?? 0);

  // Handle receivables based on madhab
  if (asset.receivables) {
    if (rules.receivablesTiming === 'now') {
      totalValue += asset.receivables;
    }
  }

  const zakatDue = roundCurrency(totalValue * ZAKAT_RATE);

  let explanation = `Inventory (${asset.inventoryValue})`;
  if (asset.cash) explanation += ` + Cash (${asset.cash})`;
  if (asset.receivables && rules.receivablesTiming === 'now') {
    explanation += ` + Receivables (${asset.receivables})`;
  }
  explanation += ` × 2.5%`;

  return {
    assetId: asset.id,
    assetType: 'business',
    description: asset.description ?? 'Business Assets',
    originalValue: totalValue,
    originalCurrency: asset.currency,
    valueInTargetCurrency: totalValue,
    zakatRate: ZAKAT_RATE,
    zakatDue,
    explanation,
    isExempt: false,
    madhabRuleApplied:
      asset.receivables && rules.receivablesTiming === 'when_received'
        ? `${madhab}: receivables zakatable when received (not included)`
        : undefined,
  };
}

/**
 * Calculate zakat for stocks
 */
function calculateStockZakat(
  asset: AssetInput & { type: 'stocks' },
  _madhab: Madhab
): AssetZakatBreakdown {
  const zakatDue = roundCurrency(asset.marketValue * ZAKAT_RATE);

  return {
    assetId: asset.id,
    assetType: 'stocks',
    description: asset.description ?? 'Stock/Investment Holdings',
    originalValue: asset.marketValue,
    originalCurrency: asset.currency,
    valueInTargetCurrency: asset.marketValue,
    zakatRate: ZAKAT_RATE,
    zakatDue,
    explanation: `2.5% of market value (${asset.marketValue} ${asset.currency})`,
    isExempt: false,
  };
}

/**
 * Calculate zakat for cryptocurrency
 */
function calculateCryptoZakat(
  asset: AssetInput & { type: 'crypto' },
  _madhab: Madhab
): AssetZakatBreakdown {
  const zakatDue = roundCurrency(asset.marketValue * ZAKAT_RATE);

  return {
    assetId: asset.id,
    assetType: 'crypto',
    description: asset.description ?? `Cryptocurrency${asset.symbol ? ` (${asset.symbol})` : ''}`,
    originalValue: asset.marketValue,
    originalCurrency: asset.currency,
    valueInTargetCurrency: asset.marketValue,
    zakatRate: ZAKAT_RATE,
    zakatDue,
    explanation: `2.5% of market value (${asset.marketValue} ${asset.currency})`,
    isExempt: false,
  };
}

/**
 * Calculate zakat for agricultural produce
 */
function calculateAgriculturalZakat(
  asset: AssetInput & { type: 'agricultural' },
  _madhab: Madhab
): AssetZakatBreakdown {
  const rate = getAgriculturalRate(asset.irrigationMethod);
  const zakatDue = roundCurrency(asset.harvestValue * rate);

  const ratePercentage = (rate * 100).toFixed(1);
  let irrigationNote = '';
  switch (asset.irrigationMethod) {
    case 'natural':
      irrigationNote = '10% (rain-fed/natural irrigation)';
      break;
    case 'artificial':
      irrigationNote = '5% (artificial irrigation)';
      break;
    case 'mixed':
      irrigationNote = '7.5% (mixed irrigation)';
      break;
  }

  return {
    assetId: asset.id,
    assetType: 'agricultural',
    description: asset.description ?? `Agricultural produce (${asset.produceType})`,
    originalValue: asset.harvestValue,
    originalCurrency: asset.currency,
    valueInTargetCurrency: asset.harvestValue,
    zakatRate: rate,
    zakatDue,
    explanation: `${ratePercentage}% of harvest value - ${irrigationNote}`,
    isExempt: false,
  };
}

/**
 * Calculate zakat for livestock
 */
function calculateLivestockZakatBreakdown(
  asset: AssetInput & { type: 'livestock' },
  _madhab: Madhab
): LivestockZakatBreakdown {
  const zakatResult = calculateLivestockZakat(
    asset.livestockType,
    asset.count,
    asset.isFreeGrazing
  );

  if (!zakatResult) {
    // Below nisab or not free-grazing
    const reason = !asset.isFreeGrazing
      ? 'Only free-grazing (sa\'imah) livestock is zakatable'
      : `Below nisab threshold for ${asset.livestockType}`;

    return {
      assetId: asset.id,
      assetType: 'livestock',
      description: asset.description ?? `${asset.count} ${asset.livestockType}`,
      originalValue: asset.count,
      originalCurrency: 'head',
      valueInTargetCurrency: 0,
      zakatRate: 0,
      zakatDue: 0,
      explanation: reason,
      isExempt: true,
      exemptionReason: reason,
      animalsDue: [],
    };
  }

  return {
    assetId: asset.id,
    assetType: 'livestock',
    description: asset.description ?? `${asset.count} ${asset.livestockType}`,
    originalValue: asset.count,
    originalCurrency: 'head',
    valueInTargetCurrency: 0, // Livestock zakat is paid in kind
    zakatRate: 0, // Rate varies by count
    zakatDue: 0, // Paid in animals, not currency
    explanation: `${asset.count} ${asset.livestockType}: ${zakatResult.description}`,
    isExempt: false,
    animalsDue: [
      {
        type: asset.livestockType,
        count: 1,
        description: zakatResult.due,
      },
    ],
  };
}

/**
 * Calculate zakat for a single asset
 */
function calculateSingleAssetZakat(
  asset: AssetInput,
  metalPrices: MetalPricesResult,
  madhab: Madhab
): AssetZakatBreakdown | LivestockZakatBreakdown {
  switch (asset.type) {
    case 'cash':
      return calculateCashZakat(asset, madhab);
    case 'gold':
    case 'silver':
      return calculateMetalZakat(asset, metalPrices, madhab);
    case 'business':
      return calculateBusinessZakat(asset, madhab);
    case 'stocks':
      return calculateStockZakat(asset, madhab);
    case 'crypto':
      return calculateCryptoZakat(asset, madhab);
    case 'agricultural':
      return calculateAgriculturalZakat(asset, madhab);
    case 'livestock':
      return calculateLivestockZakatBreakdown(asset, madhab);
  }
}

/**
 * Calculate total deductible debts based on madhab rules
 */
function calculateDeductibleDebts(
  debts: DeductibleDebt[],
  madhab: Madhab
): { total: number; deducted: DeductibleDebt[] } {
  const deductionRule = getDebtDeductionRules(madhab);
  const deducted: DeductibleDebt[] = [];
  let total = 0;

  for (const debt of debts) {
    let shouldDeduct = false;

    switch (deductionRule) {
      case 'all':
        // Hanafi: deduct all debts
        shouldDeduct = true;
        break;
      case 'immediate':
        // Shafii: only debts due within the year
        shouldDeduct = debt.dueWithinYear !== false;
        break;
      case 'diminishing':
        // Maliki/Hanbali: debts that diminish wealth
        shouldDeduct = debt.dueWithinYear !== false;
        break;
    }

    if (shouldDeduct) {
      total += debt.amount;
      deducted.push(debt);
    }
  }

  return { total: roundCurrency(total), deducted };
}

/**
 * Get current nisab thresholds
 *
 * @example
 * ```ts
 * const result = await getNisabThresholds('USD', { metalPrices });
 * if (result.success) {
 *   console.log(`Gold nisab: ${result.data.goldValue} USD`);
 * }
 * ```
 */
export async function getNisabThresholds(
  currency: CurrencyCode = DEFAULT_CURRENCY,
  options?: {
    metalPrices?: MetalPricesResult;
    timeout?: number;
    signal?: AbortSignal;
    apiKey?: string;
  }
): AsyncResult<NisabThresholds, ZakatError> {
  // Get metal prices
  let metalPrices: MetalPricesResult;

  if (options?.metalPrices) {
    const validation = validateMetalPrices(options.metalPrices);
    if (!validation.success) {
      return validation;
    }
    metalPrices = options.metalPrices;
  } else if (options?.apiKey) {
    const pricesResult = await fetchMetalPrices(currency, {
      timeout: options.timeout ?? DEFAULT_TIMEOUT,
      signal: options.signal,
      apiKey: options.apiKey,
    });

    if (!pricesResult.success) {
      return pricesResult;
    }
    metalPrices = pricesResult.data;
  } else {
    // Use mock prices as fallback (with warning)
    metalPrices = createMockMetalPrices(currency);
  }

  const goldValue = roundCurrency(NISAB_GOLD_GRAMS * metalPrices.gold.pricePerGram);
  const silverValue = roundCurrency(NISAB_SILVER_GRAMS * metalPrices.silver.pricePerGram);

  return {
    success: true,
    data: {
      goldGrams: NISAB_GOLD_GRAMS,
      silverGrams: NISAB_SILVER_GRAMS,
      goldValue,
      silverValue,
      currency,
      recommendedNisab: 'silver', // Silver nisab is lower, more people qualify
      timestamp: new Date(),
    },
  };
}

/**
 * Calculate zakat for given assets and debts
 *
 * @example
 * ```ts
 * const result = await calculateZakat({
 *   assets: [
 *     { type: 'cash', amount: 50000, currency: 'USD' },
 *     { type: 'gold', weightGrams: 100, purity: 0.916 }
 *   ],
 *   madhab: 'hanafi',
 *   metalPrices: { gold: {...}, silver: {...} }
 * });
 *
 * if (result.success) {
 *   console.log(`Total zakat due: ${result.data.totalZakatDue}`);
 * }
 * ```
 */
export async function calculateZakat(
  input: ZakatCalculationInput,
  options?: CalculateZakatOptions,
  cache?: ZakatCache<MetalPricesResult>
): AsyncResult<ZakatCalculationResult, ZakatError> {
  // Validate inputs
  if (!input.assets || input.assets.length === 0) {
    return {
      success: false,
      error: createError('NO_ASSETS', 'At least one asset is required for zakat calculation'),
    };
  }

  // Validate madhab
  const madhab = options?.madhab ?? input.madhab ?? DEFAULT_MADHAB;
  const madhabValidation = validateMadhab(madhab);
  if (!madhabValidation.success) {
    return madhabValidation;
  }

  // Validate each asset
  for (const asset of input.assets) {
    const assetValidation = validateAsset(asset);
    if (!assetValidation.success) {
      return assetValidation;
    }
  }

  const currency = options?.currency ?? input.currency ?? DEFAULT_CURRENCY;
  const useGoldNisab = options?.useGoldNisab ?? input.useGoldNisab ?? false;
  const useCache = options?.useCache ?? true;

  // Get metal prices
  let metalPrices: MetalPricesResult;

  if (options?.metalPrices) {
    const validation = validateMetalPrices(options.metalPrices);
    if (!validation.success) {
      return validation;
    }
    metalPrices = options.metalPrices;
  } else if (input.metalPrices) {
    const validation = validateMetalPrices(input.metalPrices);
    if (!validation.success) {
      return validation;
    }
    metalPrices = input.metalPrices;
  } else {
    // Check cache first
    const cacheKey = generateCacheKey(currency);
    if (useCache && cache) {
      const cached = cache.get(cacheKey);
      if (cached) {
        metalPrices = cached;
      }
    }

    // Fetch from API if not cached
    if (!metalPrices!) {
      // Use mock prices as fallback (no API key provided)
      metalPrices = createMockMetalPrices(currency);

      // Cache the prices
      if (useCache && cache) {
        cache.set(cacheKey, metalPrices);
      }
    }
  }

  // Calculate nisab threshold
  const nisabThreshold = useGoldNisab
    ? roundCurrency(NISAB_GOLD_GRAMS * metalPrices.gold.pricePerGram)
    : roundCurrency(NISAB_SILVER_GRAMS * metalPrices.silver.pricePerGram);

  // Calculate zakat for each asset
  const breakdown: (AssetZakatBreakdown | LivestockZakatBreakdown)[] = [];
  let totalZakatableWealth = 0;
  let totalMonetaryZakatDue = 0; // Zakat on monetary assets (before debt adjustment)
  let totalNonMonetaryZakatDue = 0; // Agricultural zakat (not affected by debts)
  const warnings: string[] = [];

  for (const asset of input.assets) {
    const assetZakat = calculateSingleAssetZakat(asset, metalPrices, madhab);
    breakdown.push(assetZakat);

    // Skip livestock from monetary total (paid in kind)
    if (asset.type !== 'livestock') {
      totalZakatableWealth += assetZakat.valueInTargetCurrency;
      if (!assetZakat.isExempt) {
        // Agricultural zakat is not affected by debts
        if (asset.type === 'agricultural') {
          totalNonMonetaryZakatDue += assetZakat.zakatDue;
        } else {
          totalMonetaryZakatDue += assetZakat.zakatDue;
        }
      }
    }
  }

  // Calculate deductible debts
  let totalDebts = 0;
  if (input.debts && input.debts.length > 0) {
    const debtResult = calculateDeductibleDebts(input.debts, madhab);
    totalDebts = debtResult.total;
  }

  // Calculate net zakatable amount (for monetary assets only)
  const netZakatableAmount = Math.max(0, totalZakatableWealth - totalDebts);

  // Check nisab
  const nisabMet = netZakatableAmount >= nisabThreshold;

  // Calculate final zakat due
  let totalZakatDue = 0;
  if (nisabMet) {
    // Recalculate monetary zakat based on net amount after debts
    // The ratio of net to gross determines the zakat reduction
    if (totalZakatableWealth > 0 && totalDebts > 0) {
      // Only reduce monetary zakat proportionally based on debts
      const monetaryWealth = totalZakatableWealth;
      const netMonetaryWealth = Math.max(0, monetaryWealth - totalDebts);
      totalZakatDue = roundCurrency(netMonetaryWealth * ZAKAT_RATE) + totalNonMonetaryZakatDue;
    } else {
      totalZakatDue = totalMonetaryZakatDue + totalNonMonetaryZakatDue;
    }
  } else {
    totalZakatDue = 0;
    warnings.push(
      `Net wealth (${netZakatableAmount} ${currency}) is below the ${useGoldNisab ? 'gold' : 'silver'} nisab threshold (${nisabThreshold} ${currency}). No zakat is due.`
    );
  }

  // Add warning about mock prices if used
  if (metalPrices.gold.source === 'mock') {
    warnings.push(
      'Using approximate metal prices. For accurate zakat calculation, provide current gold/silver prices or configure an API key.'
    );
  }

  return {
    success: true,
    data: {
      totalZakatableWealth: roundCurrency(totalZakatableWealth),
      totalDebts,
      netZakatableAmount: roundCurrency(netZakatableAmount),
      nisabThreshold,
      nisabMet,
      totalZakatDue: roundCurrency(totalZakatDue),
      breakdown,
      currency,
      madhab,
      nisabType: useGoldNisab ? 'gold' : 'silver',
      metalPrices,
      timestamp: new Date(),
      warnings,
    },
  };
}

/**
 * Calculate zakat for a single asset (convenience function)
 */
export async function calculateSingleAsset(
  asset: AssetInput,
  options?: CalculateZakatOptions
): AsyncResult<AssetZakatBreakdown | LivestockZakatBreakdown, ZakatError> {
  // Validate asset
  const validation = validateAsset(asset);
  if (!validation.success) {
    return validation;
  }

  const madhab = options?.madhab ?? DEFAULT_MADHAB;
  const madhabValidation = validateMadhab(madhab);
  if (!madhabValidation.success) {
    return madhabValidation;
  }

  const currency = options?.currency ?? DEFAULT_CURRENCY;

  // Get metal prices (only needed for gold/silver)
  let metalPrices: MetalPricesResult;
  if (options?.metalPrices) {
    metalPrices = options.metalPrices;
  } else {
    metalPrices = createMockMetalPrices(currency);
  }

  const result = calculateSingleAssetZakat(asset, metalPrices, madhab);

  return { success: true, data: result };
}

/**
 * Create a zakat calculator instance with persistent configuration and cache
 *
 * @example
 * ```ts
 * const calculator = createZakatCalculator({
 *   defaultMadhab: 'shafii',
 *   defaultCurrency: 'MYR',
 *   metalPriceApiKey: 'your-api-key',
 * });
 *
 * const result = await calculator.calculate({
 *   assets: [{ type: 'cash', amount: 100000, currency: 'MYR' }]
 * });
 * ```
 */
export function createZakatCalculator(
  config?: ZakatCalculatorConfig
): ZakatCalculatorInstance {
  const cache = new ZakatCache<MetalPricesResult>(config?.cacheOptions);

  const defaultOptions: CalculateZakatOptions = {
    madhab: config?.defaultMadhab ?? DEFAULT_MADHAB,
    currency: config?.defaultCurrency ?? DEFAULT_CURRENCY,
    useGoldNisab: config?.useGoldNisab ?? false,
    timeout: config?.defaultTimeout ?? DEFAULT_TIMEOUT,
    useCache: true,
  };

  return {
    async calculate(
      input: ZakatCalculationInput,
      options?: CalculateZakatOptions
    ) {
      return calculateZakat(input, { ...defaultOptions, ...options }, cache);
    },

    async getNisab(
      currency?: CurrencyCode,
      options?: Pick<CalculateZakatOptions, 'timeout' | 'signal' | 'useCache'>
    ) {
      const curr = currency ?? config?.defaultCurrency ?? DEFAULT_CURRENCY;

      // Check cache first
      if (options?.useCache !== false) {
        const cacheKey = generateCacheKey(curr);
        const cached = cache.get(cacheKey);
        if (cached) {
          const goldValue = roundCurrency(NISAB_GOLD_GRAMS * cached.gold.pricePerGram);
          const silverValue = roundCurrency(NISAB_SILVER_GRAMS * cached.silver.pricePerGram);

          return {
            success: true as const,
            data: {
              goldGrams: NISAB_GOLD_GRAMS,
              silverGrams: NISAB_SILVER_GRAMS,
              goldValue,
              silverValue,
              currency: curr,
              recommendedNisab: 'silver' as const,
              timestamp: new Date(),
            },
          };
        }
      }

      return getNisabThresholds(curr, {
        timeout: options?.timeout ?? config?.defaultTimeout,
        signal: options?.signal,
        apiKey: config?.metalPriceApiKey,
      });
    },

    async calculateSingleAsset(
      asset: AssetInput,
      options?: CalculateZakatOptions
    ) {
      return calculateSingleAsset(asset, { ...defaultOptions, ...options });
    },

    clearCache(): void {
      cache.clear();
    },

    getCacheStats(): CacheStats {
      return cache.stats;
    },
  };
}
