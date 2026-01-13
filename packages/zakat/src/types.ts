/**
 * Type definitions for @misque/zakat
 * @module @misque/zakat/types
 */

// ============================================================================
// ENUMS AND LITERALS
// ============================================================================

/**
 * Islamic schools of jurisprudence (madhahib)
 */
export type Madhab = 'hanafi' | 'shafii' | 'maliki' | 'hanbali';

/**
 * Asset categories for zakat calculation
 */
export type AssetCategory =
  | 'cash'
  | 'gold'
  | 'silver'
  | 'business'
  | 'stocks'
  | 'crypto'
  | 'agricultural'
  | 'livestock';

/**
 * Irrigation method for agricultural zakat (affects rate)
 */
export type IrrigationMethod = 'natural' | 'artificial' | 'mixed';

/**
 * Livestock types for zakat
 */
export type LivestockType = 'camels' | 'cattle' | 'sheep_goats';

/**
 * Metal types for nisab calculation
 */
export type MetalType = 'gold' | 'silver';

/**
 * Common currency codes (ISO 4217)
 */
export type CurrencyCode =
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'SAR'
  | 'AED'
  | 'MYR'
  | 'PKR'
  | 'IDR'
  | 'INR'
  | 'BDT'
  | 'EGP'
  | 'TRY'
  | string;

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Error codes for zakat operations
 */
export type ZakatErrorCode =
  | 'INVALID_AMOUNT'
  | 'INVALID_WEIGHT'
  | 'INVALID_CURRENCY'
  | 'INVALID_MADHAB'
  | 'INVALID_ASSET_TYPE'
  | 'INVALID_PURITY'
  | 'INVALID_COUNT'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'RATE_LIMITED'
  | 'PARSE_ERROR'
  | 'API_ERROR'
  | 'ABORTED'
  | 'NISAB_NOT_MET'
  | 'NO_ASSETS';

/**
 * Custom error for zakat operations
 */
export interface ZakatError extends Error {
  code: ZakatErrorCode;
  statusCode?: number;
  retryAfter?: number;
}

// ============================================================================
// METAL PRICES API
// ============================================================================

/**
 * Metal price data from API
 */
export interface MetalPrice {
  metal: MetalType;
  pricePerGram: number;
  currency: CurrencyCode;
  timestamp: Date;
  source: string;
}

/**
 * Metal prices response containing both gold and silver
 */
export interface MetalPricesResult {
  gold: MetalPrice;
  silver: MetalPrice;
}

/**
 * Options for metal price API queries
 */
export interface MetalPriceQueryOptions {
  endpoint?: string;
  apiKey?: string;
  timeout?: number;
  signal?: AbortSignal;
}

// ============================================================================
// NISAB
// ============================================================================

/**
 * Nisab thresholds for zakat eligibility
 */
export interface NisabThresholds {
  /** Gold nisab in grams (standard: 85g) */
  goldGrams: number;
  /** Silver nisab in grams (standard: 595g) */
  silverGrams: number;
  /** Gold nisab value in currency */
  goldValue: number;
  /** Silver nisab value in currency */
  silverValue: number;
  /** Currency used for values */
  currency: CurrencyCode;
  /** Recommended nisab to use (silver is lower, benefits more recipients) */
  recommendedNisab: 'gold' | 'silver';
  /** Timestamp of price fetch */
  timestamp: Date;
}

// ============================================================================
// ASSET INPUTS
// ============================================================================

/**
 * Base asset input with common properties
 */
export interface BaseAssetInput {
  /** Optional unique identifier for tracking */
  id?: string;
  /** Optional description/label */
  description?: string;
}

/**
 * Cash/monetary asset input
 */
export interface CashAssetInput extends BaseAssetInput {
  type: 'cash';
  /** Amount in specified currency */
  amount: number;
  /** Currency code */
  currency: CurrencyCode;
}

/**
 * Gold asset input
 */
export interface GoldAssetInput extends BaseAssetInput {
  type: 'gold';
  /** Weight in grams */
  weightGrams: number;
  /** Purity (0-1): 0.999 for 24k, 0.916 for 22k, 0.750 for 18k */
  purity?: number;
  /** Whether this is worn jewelry (exempt in non-Hanafi madhabs) */
  isWornJewelry?: boolean;
}

/**
 * Silver asset input
 */
export interface SilverAssetInput extends BaseAssetInput {
  type: 'silver';
  /** Weight in grams */
  weightGrams: number;
  /** Purity (0-1) */
  purity?: number;
  /** Whether this is worn jewelry */
  isWornJewelry?: boolean;
}

/**
 * Business inventory and assets input
 */
export interface BusinessAssetInput extends BaseAssetInput {
  type: 'business';
  /** Market value of inventory */
  inventoryValue: number;
  /** Accounts receivable (money owed to you) */
  receivables?: number;
  /** Cash held in business */
  cash?: number;
  /** Currency */
  currency: CurrencyCode;
}

/**
 * Stock/investment asset input
 */
export interface StockAssetInput extends BaseAssetInput {
  type: 'stocks';
  /** Current market value */
  marketValue: number;
  /** Currency */
  currency: CurrencyCode;
  /** Whether held for trading (vs long-term investment) */
  isForTrading?: boolean;
}

/**
 * Cryptocurrency asset input
 */
export interface CryptoAssetInput extends BaseAssetInput {
  type: 'crypto';
  /** Current market value (converted to fiat) */
  marketValue: number;
  /** Currency of the market value */
  currency: CurrencyCode;
  /** Optional: cryptocurrency symbol (BTC, ETH, etc.) */
  symbol?: string;
}

/**
 * Agricultural asset input
 */
export interface AgriculturalAssetInput extends BaseAssetInput {
  type: 'agricultural';
  /** Type of produce (wheat, rice, dates, etc.) */
  produceType: string;
  /** Harvest value in currency */
  harvestValue: number;
  /** Currency */
  currency: CurrencyCode;
  /** Irrigation method affects zakat rate */
  irrigationMethod: IrrigationMethod;
}

/**
 * Livestock asset input
 */
export interface LivestockAssetInput extends BaseAssetInput {
  type: 'livestock';
  /** Type of livestock */
  livestockType: LivestockType;
  /** Number of animals */
  count: number;
  /** Whether animals graze freely (sa'imah) - required for zakat */
  isFreeGrazing: boolean;
}

/**
 * Union of all asset input types
 */
export type AssetInput =
  | CashAssetInput
  | GoldAssetInput
  | SilverAssetInput
  | BusinessAssetInput
  | StockAssetInput
  | CryptoAssetInput
  | AgriculturalAssetInput
  | LivestockAssetInput;

// ============================================================================
// DEDUCTIBLE LIABILITIES
// ============================================================================

/**
 * Debt type for deduction
 */
export type DebtType =
  | 'loan'
  | 'mortgage'
  | 'credit_card'
  | 'bills_due'
  | 'business_debt'
  | 'other';

/**
 * Deductible debt/liability
 */
export interface DeductibleDebt {
  /** Description of the debt */
  description?: string;
  /** Amount owed */
  amount: number;
  /** Currency */
  currency: CurrencyCode;
  /** Type of debt */
  debtType: DebtType;
  /** Due within one lunar year (affects deductibility in some madhabs) */
  dueWithinYear?: boolean;
}

// ============================================================================
// CALCULATION INPUT/OUTPUT
// ============================================================================

/**
 * Complete zakat calculation input
 */
export interface ZakatCalculationInput {
  /** All zakatable assets */
  assets: AssetInput[];
  /** Deductible debts/liabilities (optional) */
  debts?: DeductibleDebt[];
  /** Islamic school of jurisprudence (default: hanafi) */
  madhab?: Madhab;
  /** Target currency for calculation (default: USD) */
  currency?: CurrencyCode;
  /** Use gold nisab (true) or silver nisab (false) - default: false (silver) */
  useGoldNisab?: boolean;
  /** Custom metal prices to skip API call */
  metalPrices?: MetalPricesResult;
}

/**
 * Breakdown of zakat for a single asset
 */
export interface AssetZakatBreakdown {
  /** Asset identifier if provided */
  assetId?: string;
  /** Asset type */
  assetType: AssetCategory;
  /** Asset description */
  description?: string;
  /** Original value/amount in source currency */
  originalValue: number;
  /** Original currency */
  originalCurrency: CurrencyCode;
  /** Value converted to target currency */
  valueInTargetCurrency: number;
  /** Zakat rate applied (e.g., 0.025 for 2.5%) */
  zakatRate: number;
  /** Zakat due for this asset */
  zakatDue: number;
  /** Human-readable explanation */
  explanation: string;
  /** Madhab-specific rule applied, if any */
  madhabRuleApplied?: string;
  /** Whether this asset was exempt */
  isExempt: boolean;
  /** Reason for exemption, if applicable */
  exemptionReason?: string;
}

/**
 * Livestock-specific zakat breakdown
 */
export interface LivestockZakatBreakdown extends AssetZakatBreakdown {
  /** Animals due as zakat */
  animalsDue: {
    type: string;
    count: number;
    description: string;
  }[];
}

/**
 * Complete zakat calculation result
 */
export interface ZakatCalculationResult {
  /** Total value of all zakatable assets */
  totalZakatableWealth: number;
  /** Total deductible debts */
  totalDebts: number;
  /** Net zakatable amount (wealth - debts) */
  netZakatableAmount: number;
  /** Nisab threshold used */
  nisabThreshold: number;
  /** Whether nisab is met */
  nisabMet: boolean;
  /** Total zakat due (0 if nisab not met) */
  totalZakatDue: number;
  /** Breakdown by asset */
  breakdown: (AssetZakatBreakdown | LivestockZakatBreakdown)[];
  /** Currency of all monetary values */
  currency: CurrencyCode;
  /** Madhab used for calculation */
  madhab: Madhab;
  /** Nisab type used (gold/silver) */
  nisabType: 'gold' | 'silver';
  /** Metal prices used for calculation */
  metalPrices: MetalPricesResult;
  /** Calculation timestamp */
  timestamp: Date;
  /** Warnings or important notes */
  warnings: string[];
}

// ============================================================================
// CACHE
// ============================================================================

/**
 * Cache configuration options
 */
export interface CacheOptions {
  /** TTL in milliseconds (default: 3600000 = 1 hour for metal prices) */
  ttl?: number;
  /** Maximum entries before LRU eviction (default: 50) */
  maxEntries?: number;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  /** Number of entries in cache */
  size: number;
  /** Cache hits */
  hits: number;
  /** Cache misses */
  misses: number;
}

// ============================================================================
// CALCULATOR CONFIG
// ============================================================================

/**
 * Zakat calculator configuration
 */
export interface ZakatCalculatorConfig {
  /** Default madhab (default: hanafi) */
  defaultMadhab?: Madhab;
  /** Default currency (default: USD) */
  defaultCurrency?: CurrencyCode;
  /** Use gold nisab by default (default: false = silver) */
  useGoldNisab?: boolean;
  /** Cache options for metal prices */
  cacheOptions?: CacheOptions;
  /** Custom API endpoint for metal prices */
  metalPriceEndpoint?: string;
  /** API key for metal prices service */
  metalPriceApiKey?: string;
  /** Default request timeout in ms (default: 10000) */
  defaultTimeout?: number;
}

/**
 * Options for a single calculation
 */
export interface CalculateZakatOptions {
  /** Madhab to use for this calculation */
  madhab?: Madhab;
  /** Currency for output values */
  currency?: CurrencyCode;
  /** Use gold nisab instead of silver */
  useGoldNisab?: boolean;
  /** Custom metal prices (skips API call) */
  metalPrices?: MetalPricesResult;
  /** Request timeout in ms */
  timeout?: number;
  /** Abort signal for cancellation */
  signal?: AbortSignal;
  /** Use cached metal prices if available */
  useCache?: boolean;
}

// ============================================================================
// CALCULATOR INSTANCE
// ============================================================================

/**
 * Zakat calculator instance with persistent configuration and cache
 */
export interface ZakatCalculatorInstance {
  /**
   * Calculate zakat for given assets and debts
   */
  calculate(
    input: ZakatCalculationInput,
    options?: CalculateZakatOptions
  ): Promise<
    | { success: true; data: ZakatCalculationResult }
    | { success: false; error: ZakatError }
  >;

  /**
   * Get current nisab thresholds
   */
  getNisab(
    currency?: CurrencyCode,
    options?: Pick<CalculateZakatOptions, 'timeout' | 'signal' | 'useCache'>
  ): Promise<
    | { success: true; data: NisabThresholds }
    | { success: false; error: ZakatError }
  >;

  /**
   * Calculate zakat for a single asset
   */
  calculateSingleAsset(
    asset: AssetInput,
    options?: CalculateZakatOptions
  ): Promise<
    | { success: true; data: AssetZakatBreakdown }
    | { success: false; error: ZakatError }
  >;

  /**
   * Clear cached metal prices
   */
  clearCache(): void;

  /**
   * Get cache statistics
   */
  getCacheStats(): CacheStats;
}

// ============================================================================
// MADHAB RULES
// ============================================================================

/**
 * Madhab-specific rules configuration
 */
export interface MadhabRules {
  /** Madhab identifier */
  madhab: Madhab;
  /** Whether worn jewelry is exempt from zakat */
  jewelryExempt: boolean;
  /** How debts are deducted */
  debtDeduction: 'all' | 'immediate' | 'diminishing';
  /** When business receivables are zakatable */
  receivablesTiming: 'now' | 'when_received';
  /** Notes about specific rules */
  notes: string[];
}

// ============================================================================
// INTERNAL TYPES (not exported from index)
// ============================================================================

/**
 * Internal cache entry
 */
export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  expiresAt: number;
}
