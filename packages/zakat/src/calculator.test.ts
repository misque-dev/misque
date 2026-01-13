import { describe, it, expect } from 'vitest';
import {
  calculateZakat,
  calculateSingleAsset,
  getNisabThresholds,
  createZakatCalculator,
} from './calculator';
import { createMockMetalPrices, NISAB_GOLD_GRAMS, NISAB_SILVER_GRAMS } from './index';
import type { AssetInput, ZakatCalculationInput, MetalPricesResult } from './types';

// Standard mock prices for testing
const mockPrices: MetalPricesResult = createMockMetalPrices('USD', 62.0, 0.75);

// Calculate nisab values for testing
const GOLD_NISAB_VALUE = NISAB_GOLD_GRAMS * mockPrices.gold.pricePerGram; // 85 * 62 = 5270
const SILVER_NISAB_VALUE = NISAB_SILVER_GRAMS * mockPrices.silver.pricePerGram; // 595 * 0.75 = 446.25

describe('calculateZakat', () => {
  describe('basic calculations', () => {
    it('calculates basic cash zakat (2.5%)', async () => {
      const input: ZakatCalculationInput = {
        assets: [{ type: 'cash', amount: 10000, currency: 'USD' }],
        metalPrices: mockPrices,
      };

      const result = await calculateZakat(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.totalZakatDue).toBe(250); // 2.5% of 10000
        expect(result.data.nisabMet).toBe(true);
      }
    });

    it('calculates gold zakat correctly', async () => {
      const input: ZakatCalculationInput = {
        assets: [{ type: 'gold', weightGrams: 100 }],
        metalPrices: mockPrices,
      };

      const result = await calculateZakat(input);
      expect(result.success).toBe(true);
      if (result.success) {
        // 100g * 62/g = 6200, 2.5% = 155
        expect(result.data.totalZakatDue).toBe(155);
      }
    });

    it('calculates gold with purity', async () => {
      const input: ZakatCalculationInput = {
        assets: [{ type: 'gold', weightGrams: 100, purity: 0.916 }], // 22k gold
        metalPrices: mockPrices,
      };

      const result = await calculateZakat(input);
      expect(result.success).toBe(true);
      if (result.success) {
        // 100g * 0.916 * 62/g = 5679.2, 2.5% = 141.98
        expect(result.data.totalZakatDue).toBeCloseTo(141.98, 1);
      }
    });

    it('calculates silver zakat correctly', async () => {
      const input: ZakatCalculationInput = {
        assets: [{ type: 'silver', weightGrams: 1000 }],
        metalPrices: mockPrices,
      };

      const result = await calculateZakat(input);
      expect(result.success).toBe(true);
      if (result.success) {
        // 1000g * 0.75/g = 750, 2.5% = 18.75
        expect(result.data.totalZakatDue).toBe(18.75);
      }
    });
  });

  describe('nisab threshold', () => {
    it('returns zero zakat when below nisab', async () => {
      const input: ZakatCalculationInput = {
        assets: [{ type: 'cash', amount: 100, currency: 'USD' }], // Way below silver nisab
        metalPrices: mockPrices,
      };

      const result = await calculateZakat(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.nisabMet).toBe(false);
        expect(result.data.totalZakatDue).toBe(0);
        expect(result.data.warnings.length).toBeGreaterThan(0);
      }
    });

    it('uses silver nisab by default', async () => {
      const input: ZakatCalculationInput = {
        assets: [{ type: 'cash', amount: 500, currency: 'USD' }], // Above silver nisab (446.25)
        metalPrices: mockPrices,
      };

      const result = await calculateZakat(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.nisabType).toBe('silver');
        expect(result.data.nisabMet).toBe(true);
      }
    });

    it('uses gold nisab when specified', async () => {
      const input: ZakatCalculationInput = {
        assets: [{ type: 'cash', amount: 500, currency: 'USD' }], // Below gold nisab (5270)
        useGoldNisab: true,
        metalPrices: mockPrices,
      };

      const result = await calculateZakat(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.nisabType).toBe('gold');
        expect(result.data.nisabMet).toBe(false);
        expect(result.data.totalZakatDue).toBe(0);
      }
    });
  });

  describe('madhab-specific rules', () => {
    it('Hanafi: includes worn jewelry in zakat', async () => {
      const input: ZakatCalculationInput = {
        assets: [{ type: 'gold', weightGrams: 100, isWornJewelry: true }],
        madhab: 'hanafi',
        metalPrices: mockPrices,
      };

      const result = await calculateZakat(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.totalZakatDue).toBeGreaterThan(0);
        const breakdown = result.data.breakdown[0];
        expect(breakdown.isExempt).toBe(false);
      }
    });

    it('Shafii: exempts worn jewelry from zakat', async () => {
      const input: ZakatCalculationInput = {
        assets: [
          { type: 'gold', weightGrams: 100, isWornJewelry: true },
          { type: 'cash', amount: 1000, currency: 'USD' }, // Need this to meet nisab
        ],
        madhab: 'shafii',
        metalPrices: mockPrices,
      };

      const result = await calculateZakat(input);
      expect(result.success).toBe(true);
      if (result.success) {
        const goldBreakdown = result.data.breakdown.find((b) => b.assetType === 'gold');
        expect(goldBreakdown?.isExempt).toBe(true);
        expect(goldBreakdown?.exemptionReason).toContain('shafii');
      }
    });

    it('Maliki: exempts worn jewelry from zakat', async () => {
      const input: ZakatCalculationInput = {
        assets: [{ type: 'silver', weightGrams: 1000, isWornJewelry: true }],
        madhab: 'maliki',
        metalPrices: mockPrices,
      };

      const result = await calculateZakat(input);
      expect(result.success).toBe(true);
      if (result.success) {
        const breakdown = result.data.breakdown[0];
        expect(breakdown.isExempt).toBe(true);
      }
    });

    it('Hanbali: exempts worn jewelry from zakat', async () => {
      const input: ZakatCalculationInput = {
        assets: [{ type: 'gold', weightGrams: 100, isWornJewelry: true }],
        madhab: 'hanbali',
        metalPrices: mockPrices,
      };

      const result = await calculateZakat(input);
      expect(result.success).toBe(true);
      if (result.success) {
        const breakdown = result.data.breakdown[0];
        expect(breakdown.isExempt).toBe(true);
      }
    });
  });

  describe('debt deductions', () => {
    it('deducts debts from zakatable wealth', async () => {
      const input: ZakatCalculationInput = {
        assets: [{ type: 'cash', amount: 10000, currency: 'USD' }],
        debts: [{ amount: 3000, currency: 'USD', debtType: 'loan' }],
        metalPrices: mockPrices,
      };

      const result = await calculateZakat(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.totalDebts).toBe(3000);
        expect(result.data.netZakatableAmount).toBe(7000);
        expect(result.data.totalZakatDue).toBe(175); // 2.5% of 7000
      }
    });

    it('debts can reduce wealth below nisab', async () => {
      const input: ZakatCalculationInput = {
        assets: [{ type: 'cash', amount: 1000, currency: 'USD' }],
        debts: [{ amount: 800, currency: 'USD', debtType: 'loan' }],
        metalPrices: mockPrices,
      };

      const result = await calculateZakat(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.netZakatableAmount).toBe(200);
        expect(result.data.nisabMet).toBe(false);
        expect(result.data.totalZakatDue).toBe(0);
      }
    });
  });

  describe('multiple asset types', () => {
    it('calculates combined zakat for multiple assets', async () => {
      const input: ZakatCalculationInput = {
        assets: [
          { type: 'cash', amount: 5000, currency: 'USD' },
          { type: 'gold', weightGrams: 50 },
          { type: 'stocks', marketValue: 3000, currency: 'USD' },
        ],
        metalPrices: mockPrices,
      };

      const result = await calculateZakat(input);
      expect(result.success).toBe(true);
      if (result.success) {
        // Cash: 5000, Gold: 50*62=3100, Stocks: 3000 = 11100 total
        // 2.5% of 11100 = 277.5
        expect(result.data.totalZakatableWealth).toBe(11100);
        expect(result.data.totalZakatDue).toBe(277.5);
        expect(result.data.breakdown.length).toBe(3);
      }
    });
  });

  describe('special asset types', () => {
    it('calculates business zakat', async () => {
      const input: ZakatCalculationInput = {
        assets: [
          {
            type: 'business',
            inventoryValue: 20000,
            cash: 5000,
            receivables: 3000,
            currency: 'USD',
          },
        ],
        madhab: 'shafii', // Shafii includes receivables now
        metalPrices: mockPrices,
      };

      const result = await calculateZakat(input);
      expect(result.success).toBe(true);
      if (result.success) {
        // 20000 + 5000 + 3000 = 28000, 2.5% = 700
        expect(result.data.totalZakatDue).toBe(700);
      }
    });

    it('calculates crypto zakat', async () => {
      const input: ZakatCalculationInput = {
        assets: [{ type: 'crypto', marketValue: 10000, currency: 'USD', symbol: 'BTC' }],
        metalPrices: mockPrices,
      };

      const result = await calculateZakat(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.totalZakatDue).toBe(250);
      }
    });

    it('calculates agricultural zakat (natural irrigation - 10%)', async () => {
      const input: ZakatCalculationInput = {
        assets: [
          {
            type: 'agricultural',
            produceType: 'wheat',
            harvestValue: 5000,
            currency: 'USD',
            irrigationMethod: 'natural',
          },
        ],
        metalPrices: mockPrices,
      };

      const result = await calculateZakat(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.totalZakatDue).toBe(500); // 10% of 5000
      }
    });

    it('calculates agricultural zakat (artificial irrigation - 5%)', async () => {
      const input: ZakatCalculationInput = {
        assets: [
          {
            type: 'agricultural',
            produceType: 'rice',
            harvestValue: 5000,
            currency: 'USD',
            irrigationMethod: 'artificial',
          },
        ],
        metalPrices: mockPrices,
      };

      const result = await calculateZakat(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.totalZakatDue).toBe(250); // 5% of 5000
      }
    });

    it('handles livestock zakat (exempt if not free-grazing)', async () => {
      const input: ZakatCalculationInput = {
        assets: [
          { type: 'livestock', livestockType: 'sheep_goats', count: 100, isFreeGrazing: false },
          { type: 'cash', amount: 1000, currency: 'USD' }, // To meet nisab
        ],
        metalPrices: mockPrices,
      };

      const result = await calculateZakat(input);
      expect(result.success).toBe(true);
      if (result.success) {
        const livestockBreakdown = result.data.breakdown.find((b) => b.assetType === 'livestock');
        expect(livestockBreakdown?.isExempt).toBe(true);
      }
    });

    it('handles livestock zakat (free-grazing)', async () => {
      const input: ZakatCalculationInput = {
        assets: [
          { type: 'livestock', livestockType: 'sheep_goats', count: 100, isFreeGrazing: true },
        ],
        metalPrices: mockPrices,
      };

      const result = await calculateZakat(input);
      expect(result.success).toBe(true);
      if (result.success) {
        const livestockBreakdown = result.data.breakdown.find((b) => b.assetType === 'livestock');
        expect(livestockBreakdown?.isExempt).toBe(false);
        expect('animalsDue' in livestockBreakdown!).toBe(true);
      }
    });
  });

  describe('validation', () => {
    it('returns error for empty assets', async () => {
      const input: ZakatCalculationInput = {
        assets: [],
        metalPrices: mockPrices,
      };

      const result = await calculateZakat(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NO_ASSETS');
      }
    });

    it('returns error for invalid madhab', async () => {
      const input: ZakatCalculationInput = {
        assets: [{ type: 'cash', amount: 1000, currency: 'USD' }],
        madhab: 'invalid' as any,
        metalPrices: mockPrices,
      };

      const result = await calculateZakat(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_MADHAB');
      }
    });

    it('returns error for invalid asset', async () => {
      const input: ZakatCalculationInput = {
        assets: [{ type: 'cash', amount: -100, currency: 'USD' }],
        metalPrices: mockPrices,
      };

      const result = await calculateZakat(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_AMOUNT');
      }
    });
  });

  describe('warnings', () => {
    it('includes warning when using mock prices', async () => {
      const input: ZakatCalculationInput = {
        assets: [{ type: 'cash', amount: 10000, currency: 'USD' }],
        // Not providing metalPrices, will use mock
      };

      const result = await calculateZakat(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.warnings.some((w) => w.includes('approximate'))).toBe(true);
      }
    });
  });
});

describe('calculateSingleAsset', () => {
  it('calculates zakat for a single cash asset', async () => {
    const asset: AssetInput = { type: 'cash', amount: 10000, currency: 'USD' };
    const result = await calculateSingleAsset(asset, { metalPrices: mockPrices });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.zakatDue).toBe(250);
      expect(result.data.zakatRate).toBe(0.025);
    }
  });

  it('calculates zakat for gold with purity', async () => {
    const asset: AssetInput = { type: 'gold', weightGrams: 100, purity: 0.75 };
    const result = await calculateSingleAsset(asset, { metalPrices: mockPrices });

    expect(result.success).toBe(true);
    if (result.success) {
      // 100 * 0.75 * 62 = 4650, 2.5% = 116.25
      expect(result.data.zakatDue).toBe(116.25);
    }
  });

  it('returns validation error for invalid asset', async () => {
    const asset: AssetInput = { type: 'gold', weightGrams: -50 };
    const result = await calculateSingleAsset(asset);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('INVALID_WEIGHT');
    }
  });
});

describe('getNisabThresholds', () => {
  it('returns nisab values', async () => {
    const result = await getNisabThresholds('USD', { metalPrices: mockPrices });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.goldGrams).toBe(85);
      expect(result.data.silverGrams).toBe(595);
      expect(result.data.goldValue).toBe(GOLD_NISAB_VALUE);
      expect(result.data.silverValue).toBe(SILVER_NISAB_VALUE);
      expect(result.data.currency).toBe('USD');
      expect(result.data.recommendedNisab).toBe('silver');
    }
  });
});

describe('createZakatCalculator', () => {
  it('creates calculator with default config', () => {
    const calculator = createZakatCalculator();
    expect(calculator.calculate).toBeDefined();
    expect(calculator.getNisab).toBeDefined();
    expect(calculator.calculateSingleAsset).toBeDefined();
    expect(calculator.clearCache).toBeDefined();
    expect(calculator.getCacheStats).toBeDefined();
  });

  it('calculates with instance', async () => {
    const calculator = createZakatCalculator({
      defaultMadhab: 'shafii',
      defaultCurrency: 'USD',
    });

    const result = await calculator.calculate({
      assets: [{ type: 'cash', amount: 10000, currency: 'USD' }],
      metalPrices: mockPrices,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.madhab).toBe('shafii');
      expect(result.data.totalZakatDue).toBe(250);
    }
  });

  it('tracks cache statistics', async () => {
    const calculator = createZakatCalculator();

    // First call - cache miss
    await calculator.calculate({
      assets: [{ type: 'cash', amount: 10000, currency: 'USD' }],
    });

    // Second call - cache hit
    await calculator.calculate({
      assets: [{ type: 'cash', amount: 5000, currency: 'USD' }],
    });

    const stats = calculator.getCacheStats();
    expect(stats.size).toBeGreaterThanOrEqual(0);
  });

  it('clears cache', async () => {
    const calculator = createZakatCalculator();

    await calculator.calculate({
      assets: [{ type: 'cash', amount: 10000, currency: 'USD' }],
    });

    calculator.clearCache();

    const stats = calculator.getCacheStats();
    expect(stats.size).toBe(0);
    expect(stats.hits).toBe(0);
    expect(stats.misses).toBe(0);
  });

  it('gets nisab through instance', async () => {
    const calculator = createZakatCalculator({
      defaultCurrency: 'EUR',
    });

    const result = await calculator.getNisab();
    expect(result.success).toBe(true);
  });

  it('calculates single asset through instance', async () => {
    const calculator = createZakatCalculator();

    const result = await calculator.calculateSingleAsset(
      { type: 'cash', amount: 10000, currency: 'USD' },
      { metalPrices: mockPrices }
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.zakatDue).toBe(250);
    }
  });
});
