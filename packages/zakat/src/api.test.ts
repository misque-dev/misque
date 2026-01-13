import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  fetchMetalPrices,
  createError,
  createMockMetalPrices,
  validateMetalPrices,
  DEFAULT_METAL_PRICE_ENDPOINT,
} from './api';

// Mock GoldAPI responses
const mockGoldResponse = {
  timestamp: 1704067200,
  metal: 'XAU',
  currency: 'USD',
  exchange: 'FOREXCOM',
  symbol: 'FOREXCOM:XAUUSD',
  price: 2062.5,
  price_gram_24k: 66.31,
  price_gram_22k: 60.78,
  price_gram_21k: 58.02,
  price_gram_18k: 49.73,
  ask: 2063.0,
  bid: 2062.0,
};

const mockSilverResponse = {
  timestamp: 1704067200,
  metal: 'XAG',
  currency: 'USD',
  exchange: 'FOREXCOM',
  symbol: 'FOREXCOM:XAGUSD',
  price: 23.89,
  price_gram_24k: 0.768,
  price_gram_22k: 0.704,
  price_gram_21k: 0.672,
  price_gram_18k: 0.576,
  ask: 23.90,
  bid: 23.88,
};

// Setup MSW server
const server = setupServer(
  http.get(`${DEFAULT_METAL_PRICE_ENDPOINT}/XAU/USD`, () => {
    return HttpResponse.json(mockGoldResponse);
  }),
  http.get(`${DEFAULT_METAL_PRICE_ENDPOINT}/XAG/USD`, () => {
    return HttpResponse.json(mockSilverResponse);
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('fetchMetalPrices', () => {
  it('returns error when no API key provided', async () => {
    const result = await fetchMetalPrices('USD');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('API_ERROR');
      expect(result.error.message).toContain('API key is required');
    }
  });

  it('fetches gold and silver prices successfully', async () => {
    const result = await fetchMetalPrices('USD', { apiKey: 'test-key' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.gold.metal).toBe('gold');
      expect(result.data.gold.pricePerGram).toBe(66.31);
      expect(result.data.gold.currency).toBe('USD');
      expect(result.data.silver.metal).toBe('silver');
      expect(result.data.silver.pricePerGram).toBe(0.768);
    }
  });

  it('handles rate limiting (429)', async () => {
    server.use(
      http.get(`${DEFAULT_METAL_PRICE_ENDPOINT}/XAU/USD`, () => {
        return new HttpResponse(null, {
          status: 429,
          headers: { 'Retry-After': '60' },
        });
      })
    );

    const result = await fetchMetalPrices('USD', { apiKey: 'test-key' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('RATE_LIMITED');
      expect(result.error.statusCode).toBe(429);
      expect(result.error.retryAfter).toBe(60);
    }
  });

  it('handles unauthorized (401)', async () => {
    server.use(
      http.get(`${DEFAULT_METAL_PRICE_ENDPOINT}/XAU/USD`, () => {
        return new HttpResponse(null, { status: 401 });
      })
    );

    const result = await fetchMetalPrices('USD', { apiKey: 'invalid-key' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('API_ERROR');
      expect(result.error.statusCode).toBe(401);
    }
  });

  it('handles server errors (500)', async () => {
    server.use(
      http.get(`${DEFAULT_METAL_PRICE_ENDPOINT}/XAU/USD`, () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const result = await fetchMetalPrices('USD', { apiKey: 'test-key' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('API_ERROR');
      expect(result.error.statusCode).toBe(500);
    }
  });

  it('handles invalid JSON response', async () => {
    server.use(
      http.get(`${DEFAULT_METAL_PRICE_ENDPOINT}/XAU/USD`, () => {
        return new HttpResponse('not json', {
          headers: { 'Content-Type': 'text/plain' },
        });
      })
    );

    const result = await fetchMetalPrices('USD', { apiKey: 'test-key' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('PARSE_ERROR');
    }
  });

  it('handles missing price data', async () => {
    server.use(
      http.get(`${DEFAULT_METAL_PRICE_ENDPOINT}/XAU/USD`, () => {
        return HttpResponse.json({ timestamp: 123 }); // Missing price_gram_24k
      })
    );

    const result = await fetchMetalPrices('USD', { apiKey: 'test-key' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('PARSE_ERROR');
    }
  });

  it('handles network errors', async () => {
    server.use(
      http.get(`${DEFAULT_METAL_PRICE_ENDPOINT}/XAU/USD`, () => {
        return HttpResponse.error();
      })
    );

    const result = await fetchMetalPrices('USD', { apiKey: 'test-key' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('NETWORK_ERROR');
    }
  });

  it('handles timeout', async () => {
    server.use(
      http.get(`${DEFAULT_METAL_PRICE_ENDPOINT}/XAU/USD`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        return HttpResponse.json(mockGoldResponse);
      })
    );

    const result = await fetchMetalPrices('USD', {
      apiKey: 'test-key',
      timeout: 100,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('TIMEOUT');
    }
  });

  it('handles abort signal', async () => {
    // Set up a delayed response
    server.use(
      http.get(`${DEFAULT_METAL_PRICE_ENDPOINT}/XAU/USD`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return HttpResponse.json(mockGoldResponse);
      }),
      http.get(`${DEFAULT_METAL_PRICE_ENDPOINT}/XAG/USD`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return HttpResponse.json(mockSilverResponse);
      })
    );

    const controller = new AbortController();

    // Abort after a short delay
    setTimeout(() => controller.abort(), 50);

    const result = await fetchMetalPrices('USD', {
      apiKey: 'test-key',
      signal: controller.signal,
      timeout: 5000,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('ABORTED');
    }
  });
});

describe('createError', () => {
  it('creates error with code', () => {
    const error = createError('INVALID_AMOUNT', 'Amount is invalid');
    expect(error.code).toBe('INVALID_AMOUNT');
    expect(error.message).toBe('Amount is invalid');
    expect(error.name).toBe('ZakatError');
  });

  it('includes statusCode', () => {
    const error = createError('API_ERROR', 'API error', 500);
    expect(error.statusCode).toBe(500);
  });

  it('includes retryAfter', () => {
    const error = createError('RATE_LIMITED', 'Rate limited', 429, 60);
    expect(error.retryAfter).toBe(60);
  });
});

describe('createMockMetalPrices', () => {
  it('creates mock prices with defaults', () => {
    const prices = createMockMetalPrices();
    expect(prices.gold.metal).toBe('gold');
    expect(prices.gold.pricePerGram).toBe(62.0);
    expect(prices.gold.currency).toBe('USD');
    expect(prices.gold.source).toBe('mock');
    expect(prices.silver.metal).toBe('silver');
    expect(prices.silver.pricePerGram).toBe(0.75);
  });

  it('creates mock prices with custom base USD values', () => {
    // Base USD prices get converted: EUR rate is ~0.92
    const prices = createMockMetalPrices('EUR', 70, 0.85);
    expect(prices.gold.pricePerGram).toBeCloseTo(70 * 0.92, 1); // ~64.4 EUR
    expect(prices.gold.currency).toBe('EUR');
    expect(prices.silver.pricePerGram).toBeCloseTo(0.85 * 0.92, 2); // ~0.78 EUR
  });

  it('converts prices correctly for different currencies', () => {
    // SAR rate is 3.75
    const sarPrices = createMockMetalPrices('SAR');
    expect(sarPrices.gold.pricePerGram).toBeCloseTo(62.0 * 3.75, 1); // ~232.5 SAR
    expect(sarPrices.gold.currency).toBe('SAR');

    // GBP rate is 0.79
    const gbpPrices = createMockMetalPrices('GBP');
    expect(gbpPrices.gold.pricePerGram).toBeCloseTo(62.0 * 0.79, 1); // ~48.98 GBP
  });

  it('includes timestamp', () => {
    const prices = createMockMetalPrices();
    expect(prices.gold.timestamp).toBeInstanceOf(Date);
    expect(prices.silver.timestamp).toBeInstanceOf(Date);
  });
});

describe('validateMetalPrices', () => {
  it('accepts valid prices', () => {
    const prices = createMockMetalPrices();
    const result = validateMetalPrices(prices);
    expect(result.success).toBe(true);
  });

  it('rejects missing gold', () => {
    const prices = { silver: createMockMetalPrices().silver } as any;
    const result = validateMetalPrices(prices);
    expect(result.success).toBe(false);
  });

  it('rejects missing silver', () => {
    const prices = { gold: createMockMetalPrices().gold } as any;
    const result = validateMetalPrices(prices);
    expect(result.success).toBe(false);
  });

  it('rejects zero gold price', () => {
    const prices = createMockMetalPrices('USD', 0, 0.75);
    const result = validateMetalPrices(prices);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('INVALID_AMOUNT');
    }
  });

  it('rejects zero silver price', () => {
    const prices = createMockMetalPrices('USD', 62, 0);
    const result = validateMetalPrices(prices);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('INVALID_AMOUNT');
    }
  });

  it('rejects gold cheaper than silver', () => {
    const prices = createMockMetalPrices('USD', 0.5, 1.0);
    const result = validateMetalPrices(prices);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('PARSE_ERROR');
    }
  });
});
