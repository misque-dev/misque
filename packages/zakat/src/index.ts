/**
 * Comprehensive Islamic zakat calculator with multi-madhab support
 * @module @misque/zakat
 */

// ============================================================================
// TYPES
// ============================================================================

export type {
  // Core types
  Madhab,
  AssetCategory,
  IrrigationMethod,
  LivestockType,
  MetalType,
  CurrencyCode,
  DebtType,

  // Error types
  ZakatErrorCode,
  ZakatError,

  // Metal prices
  MetalPrice,
  MetalPricesResult,
  MetalPriceQueryOptions,

  // Nisab
  NisabThresholds,

  // Asset inputs
  AssetInput,
  BaseAssetInput,
  CashAssetInput,
  GoldAssetInput,
  SilverAssetInput,
  BusinessAssetInput,
  StockAssetInput,
  CryptoAssetInput,
  AgriculturalAssetInput,
  LivestockAssetInput,

  // Debts
  DeductibleDebt,

  // Calculation input/output
  ZakatCalculationInput,
  ZakatCalculationResult,
  AssetZakatBreakdown,
  LivestockZakatBreakdown,

  // Cache
  CacheOptions,
  CacheStats,

  // Config
  ZakatCalculatorConfig,
  CalculateZakatOptions,
  ZakatCalculatorInstance,

  // Madhab rules
  MadhabRules,
} from './types';

// ============================================================================
// MAIN API FUNCTIONS
// ============================================================================

export {
  calculateZakat,
  calculateSingleAsset,
  getNisabThresholds,
  createZakatCalculator,
} from './calculator';

// ============================================================================
// CONSTANTS
// ============================================================================

export {
  // Nisab thresholds
  NISAB_GOLD_GRAMS,
  NISAB_SILVER_GRAMS,

  // Zakat rates
  ZAKAT_RATE,
  AGRICULTURAL_RATE_NATURAL,
  AGRICULTURAL_RATE_ARTIFICIAL,
  AGRICULTURAL_RATE_MIXED,

  // Defaults
  DEFAULT_TIMEOUT,
  DEFAULT_CURRENCY,
  DEFAULT_MADHAB,
} from './utils';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export {
  // Madhab rules
  getMadhabRules,
  isJewelryExempt,
  getDebtDeductionRules,

  // Validation
  validateMadhab,
  validateAsset,

  // Calculation helpers
  getAgriculturalRate,
  calculateLivestockZakat,
} from './utils';

// ============================================================================
// API HELPERS
// ============================================================================

export {
  // API endpoints
  METAL_PRICE_ENDPOINTS,
  DEFAULT_METAL_PRICE_ENDPOINT,

  // Error creation
  createError,

  // Mock data for testing
  createMockMetalPrices,

  // Validation
  validateMetalPrices,
} from './api';

// ============================================================================
// CACHE
// ============================================================================

export { ZakatCache, generateCacheKey } from './cache';
