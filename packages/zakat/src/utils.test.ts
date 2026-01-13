import { describe, it, expect } from 'vitest';
import {
  NISAB_GOLD_GRAMS,
  NISAB_SILVER_GRAMS,
  ZAKAT_RATE,
  AGRICULTURAL_RATE_NATURAL,
  AGRICULTURAL_RATE_ARTIFICIAL,
  AGRICULTURAL_RATE_MIXED,
  getMadhabRules,
  isJewelryExempt,
  getDebtDeductionRules,
  validateMadhab,
  validateAsset,
  getAgriculturalRate,
  calculatePureWeight,
  calculateMetalValue,
  calculateLivestockZakat,
  roundCurrency,
  formatCurrency,
} from './utils';
import type { AssetInput } from './types';

describe('Constants', () => {
  it('has correct nisab thresholds', () => {
    expect(NISAB_GOLD_GRAMS).toBe(85);
    expect(NISAB_SILVER_GRAMS).toBe(595);
  });

  it('has correct zakat rates', () => {
    expect(ZAKAT_RATE).toBe(0.025);
    expect(AGRICULTURAL_RATE_NATURAL).toBe(0.10);
    expect(AGRICULTURAL_RATE_ARTIFICIAL).toBe(0.05);
    expect(AGRICULTURAL_RATE_MIXED).toBe(0.075);
  });
});

describe('getMadhabRules', () => {
  it('returns correct rules for Hanafi', () => {
    const rules = getMadhabRules('hanafi');
    expect(rules.madhab).toBe('hanafi');
    expect(rules.jewelryExempt).toBe(false);
    expect(rules.debtDeduction).toBe('all');
    expect(rules.receivablesTiming).toBe('when_received');
  });

  it('returns correct rules for Shafii', () => {
    const rules = getMadhabRules('shafii');
    expect(rules.madhab).toBe('shafii');
    expect(rules.jewelryExempt).toBe(true);
    expect(rules.debtDeduction).toBe('immediate');
    expect(rules.receivablesTiming).toBe('now');
  });

  it('returns correct rules for Maliki', () => {
    const rules = getMadhabRules('maliki');
    expect(rules.madhab).toBe('maliki');
    expect(rules.jewelryExempt).toBe(true);
    expect(rules.debtDeduction).toBe('diminishing');
    expect(rules.receivablesTiming).toBe('when_received');
  });

  it('returns correct rules for Hanbali', () => {
    const rules = getMadhabRules('hanbali');
    expect(rules.madhab).toBe('hanbali');
    expect(rules.jewelryExempt).toBe(true);
    expect(rules.debtDeduction).toBe('diminishing');
    expect(rules.receivablesTiming).toBe('now');
  });
});

describe('isJewelryExempt', () => {
  it('returns false for Hanafi', () => {
    expect(isJewelryExempt('hanafi')).toBe(false);
  });

  it('returns true for Shafii', () => {
    expect(isJewelryExempt('shafii')).toBe(true);
  });

  it('returns true for Maliki', () => {
    expect(isJewelryExempt('maliki')).toBe(true);
  });

  it('returns true for Hanbali', () => {
    expect(isJewelryExempt('hanbali')).toBe(true);
  });
});

describe('getDebtDeductionRules', () => {
  it('returns all for Hanafi', () => {
    expect(getDebtDeductionRules('hanafi')).toBe('all');
  });

  it('returns immediate for Shafii', () => {
    expect(getDebtDeductionRules('shafii')).toBe('immediate');
  });

  it('returns diminishing for Maliki', () => {
    expect(getDebtDeductionRules('maliki')).toBe('diminishing');
  });

  it('returns diminishing for Hanbali', () => {
    expect(getDebtDeductionRules('hanbali')).toBe('diminishing');
  });
});

describe('validateMadhab', () => {
  it('accepts valid madhabs', () => {
    expect(validateMadhab('hanafi').success).toBe(true);
    expect(validateMadhab('shafii').success).toBe(true);
    expect(validateMadhab('maliki').success).toBe(true);
    expect(validateMadhab('hanbali').success).toBe(true);
  });

  it('rejects invalid madhabs', () => {
    const result = validateMadhab('invalid');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('INVALID_MADHAB');
    }
  });
});

describe('validateAsset', () => {
  describe('cash assets', () => {
    it('accepts valid cash asset', () => {
      const asset: AssetInput = { type: 'cash', amount: 1000, currency: 'USD' };
      const result = validateAsset(asset);
      expect(result.success).toBe(true);
    });

    it('rejects negative amount', () => {
      const asset: AssetInput = { type: 'cash', amount: -100, currency: 'USD' };
      const result = validateAsset(asset);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_AMOUNT');
      }
    });

    it('rejects missing currency', () => {
      const asset = { type: 'cash', amount: 1000 } as AssetInput;
      const result = validateAsset(asset);
      expect(result.success).toBe(false);
    });
  });

  describe('gold/silver assets', () => {
    it('accepts valid gold asset', () => {
      const asset: AssetInput = { type: 'gold', weightGrams: 100 };
      const result = validateAsset(asset);
      expect(result.success).toBe(true);
    });

    it('accepts gold with purity', () => {
      const asset: AssetInput = { type: 'gold', weightGrams: 100, purity: 0.916 };
      const result = validateAsset(asset);
      expect(result.success).toBe(true);
    });

    it('rejects invalid purity (>1)', () => {
      const asset: AssetInput = { type: 'gold', weightGrams: 100, purity: 1.5 };
      const result = validateAsset(asset);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_PURITY');
      }
    });

    it('rejects invalid purity (<0)', () => {
      const asset: AssetInput = { type: 'silver', weightGrams: 100, purity: -0.5 };
      const result = validateAsset(asset);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_PURITY');
      }
    });

    it('rejects negative weight', () => {
      const asset: AssetInput = { type: 'gold', weightGrams: -50 };
      const result = validateAsset(asset);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_WEIGHT');
      }
    });
  });

  describe('business assets', () => {
    it('accepts valid business asset', () => {
      const asset: AssetInput = { type: 'business', inventoryValue: 50000, currency: 'USD' };
      const result = validateAsset(asset);
      expect(result.success).toBe(true);
    });

    it('rejects negative inventory value', () => {
      const asset: AssetInput = { type: 'business', inventoryValue: -1000, currency: 'USD' };
      const result = validateAsset(asset);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_AMOUNT');
      }
    });
  });

  describe('stock assets', () => {
    it('accepts valid stock asset', () => {
      const asset: AssetInput = { type: 'stocks', marketValue: 25000, currency: 'USD' };
      const result = validateAsset(asset);
      expect(result.success).toBe(true);
    });
  });

  describe('crypto assets', () => {
    it('accepts valid crypto asset', () => {
      const asset: AssetInput = { type: 'crypto', marketValue: 10000, currency: 'USD', symbol: 'BTC' };
      const result = validateAsset(asset);
      expect(result.success).toBe(true);
    });
  });

  describe('agricultural assets', () => {
    it('accepts valid agricultural asset', () => {
      const asset: AssetInput = {
        type: 'agricultural',
        produceType: 'wheat',
        harvestValue: 5000,
        currency: 'USD',
        irrigationMethod: 'natural',
      };
      const result = validateAsset(asset);
      expect(result.success).toBe(true);
    });

    it('rejects negative harvest value', () => {
      const asset: AssetInput = {
        type: 'agricultural',
        produceType: 'wheat',
        harvestValue: -100,
        currency: 'USD',
        irrigationMethod: 'natural',
      };
      const result = validateAsset(asset);
      expect(result.success).toBe(false);
    });
  });

  describe('livestock assets', () => {
    it('accepts valid livestock asset', () => {
      const asset: AssetInput = {
        type: 'livestock',
        livestockType: 'sheep_goats',
        count: 50,
        isFreeGrazing: true,
      };
      const result = validateAsset(asset);
      expect(result.success).toBe(true);
    });

    it('rejects negative count', () => {
      const asset: AssetInput = {
        type: 'livestock',
        livestockType: 'sheep_goats',
        count: -5,
        isFreeGrazing: true,
      };
      const result = validateAsset(asset);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_COUNT');
      }
    });

    it('rejects non-integer count', () => {
      const asset: AssetInput = {
        type: 'livestock',
        livestockType: 'cattle',
        count: 35.5,
        isFreeGrazing: true,
      };
      const result = validateAsset(asset);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_COUNT');
      }
    });
  });
});

describe('getAgriculturalRate', () => {
  it('returns 10% for natural irrigation', () => {
    expect(getAgriculturalRate('natural')).toBe(0.10);
  });

  it('returns 5% for artificial irrigation', () => {
    expect(getAgriculturalRate('artificial')).toBe(0.05);
  });

  it('returns 7.5% for mixed irrigation', () => {
    expect(getAgriculturalRate('mixed')).toBe(0.075);
  });
});

describe('calculatePureWeight', () => {
  it('calculates with default purity (100%)', () => {
    expect(calculatePureWeight(100)).toBe(100);
  });

  it('calculates with custom purity', () => {
    expect(calculatePureWeight(100, 0.916)).toBeCloseTo(91.6);
  });

  it('calculates 18k gold (75% purity)', () => {
    expect(calculatePureWeight(100, 0.750)).toBe(75);
  });
});

describe('calculateMetalValue', () => {
  it('calculates value with default purity', () => {
    const value = calculateMetalValue(100, 62); // 100g at $62/g
    expect(value).toBe(6200);
  });

  it('calculates value with custom purity', () => {
    const value = calculateMetalValue(100, 62, 0.916); // 100g at $62/g, 22k
    expect(value).toBeCloseTo(5679.2);
  });
});

describe('calculateLivestockZakat', () => {
  describe('camels', () => {
    it('returns null below nisab (< 5)', () => {
      expect(calculateLivestockZakat('camels', 4, true)).toBeNull();
    });

    it('returns 1 sheep for 5-9 camels', () => {
      const result = calculateLivestockZakat('camels', 5, true);
      expect(result?.due).toBe('1 sheep');
    });

    it('returns 2 sheep for 10-14 camels', () => {
      const result = calculateLivestockZakat('camels', 12, true);
      expect(result?.due).toBe('2 sheep');
    });

    it('returns 1 bint makhad for 25-35 camels', () => {
      const result = calculateLivestockZakat('camels', 30, true);
      expect(result?.due).toBe('1 bint makhad');
    });

    it('handles count above 120', () => {
      const result = calculateLivestockZakat('camels', 150, true);
      expect(result).not.toBeNull();
      expect(result?.due).toContain('hiqqah');
    });
  });

  describe('cattle', () => {
    it('returns null below nisab (< 30)', () => {
      expect(calculateLivestockZakat('cattle', 29, true)).toBeNull();
    });

    it("returns 1 tabi' for 30-39 cattle", () => {
      const result = calculateLivestockZakat('cattle', 35, true);
      expect(result?.due).toBe("1 tabi'");
    });

    it('returns 1 musinnah for 40-59 cattle', () => {
      const result = calculateLivestockZakat('cattle', 50, true);
      expect(result?.due).toBe('1 musinnah');
    });

    it('handles count above 129', () => {
      const result = calculateLivestockZakat('cattle', 150, true);
      expect(result).not.toBeNull();
    });
  });

  describe('sheep/goats', () => {
    it('returns null below nisab (< 40)', () => {
      expect(calculateLivestockZakat('sheep_goats', 39, true)).toBeNull();
    });

    it('returns 1 sheep for 40-120 sheep', () => {
      const result = calculateLivestockZakat('sheep_goats', 80, true);
      expect(result?.due).toBe('1 sheep');
    });

    it('returns 2 sheep for 121-200 sheep', () => {
      const result = calculateLivestockZakat('sheep_goats', 150, true);
      expect(result?.due).toBe('2 sheep');
    });

    it('returns 3 sheep for 201-399 sheep', () => {
      const result = calculateLivestockZakat('sheep_goats', 300, true);
      expect(result?.due).toBe('3 sheep');
    });

    it('returns 1 per 100 for 400+ sheep', () => {
      const result = calculateLivestockZakat('sheep_goats', 500, true);
      expect(result?.due).toBe('5 sheep');
    });
  });

  describe('free-grazing requirement', () => {
    it('returns null if not free-grazing', () => {
      expect(calculateLivestockZakat('sheep_goats', 100, false)).toBeNull();
      expect(calculateLivestockZakat('camels', 50, false)).toBeNull();
      expect(calculateLivestockZakat('cattle', 50, false)).toBeNull();
    });
  });
});

describe('roundCurrency', () => {
  it('rounds to 2 decimal places', () => {
    expect(roundCurrency(123.456)).toBe(123.46);
    expect(roundCurrency(123.454)).toBe(123.45);
    expect(roundCurrency(100)).toBe(100);
  });
});

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    const formatted = formatCurrency(1234.56, 'USD');
    expect(formatted).toContain('1,234.56');
    expect(formatted).toContain('$');
  });

  it('formats EUR correctly', () => {
    const formatted = formatCurrency(1234.56, 'EUR');
    expect(formatted).toContain('1,234.56');
  });
});
