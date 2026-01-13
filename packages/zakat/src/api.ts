/**
 * Metal prices API integration
 * @module @misque/zakat/api
 */

import type { AsyncResult, Result } from '@misque/core';
import type {
  MetalPricesResult,
  MetalPriceQueryOptions,
  ZakatError,
  ZakatErrorCode,
  CurrencyCode,
} from './types';

/**
 * Available metal price API endpoints
 * Users should configure their own API key for production use
 */
export const METAL_PRICE_ENDPOINTS = {
  /** GoldAPI.io - popular choice with free tier */
  goldapi: 'https://www.goldapi.io/api',
  /** Metals-API - another option */
  metalsapi: 'https://metals-api.com/api',
} as const;

/**
 * Default metal price API endpoint
 */
export const DEFAULT_METAL_PRICE_ENDPOINT = METAL_PRICE_ENDPOINTS.goldapi;

/**
 * Default timeout in milliseconds
 */
export const DEFAULT_TIMEOUT = 10000;

/**
 * Create a ZakatError
 */
export function createError(
  code: ZakatErrorCode,
  message: string,
  statusCode?: number,
  retryAfter?: number
): ZakatError {
  const error = new Error(message) as ZakatError;
  error.code = code;
  error.name = 'ZakatError';
  if (statusCode !== undefined) error.statusCode = statusCode;
  if (retryAfter !== undefined) error.retryAfter = retryAfter;
  return error;
}

/**
 * Response structure from GoldAPI.io
 */
interface GoldAPIResponse {
  timestamp: number;
  metal: string;
  currency: string;
  exchange: string;
  symbol: string;
  price: number;
  price_gram_24k: number;
  price_gram_22k: number;
  price_gram_21k: number;
  price_gram_18k: number;
  ask: number;
  bid: number;
}

/**
 * Fetch a single metal price from GoldAPI
 */
async function fetchSingleMetalPrice(
  metal: 'XAU' | 'XAG',
  currency: CurrencyCode,
  options?: MetalPriceQueryOptions
): AsyncResult<GoldAPIResponse, ZakatError> {
  const endpoint = options?.endpoint ?? DEFAULT_METAL_PRICE_ENDPOINT;
  const timeout = options?.timeout ?? DEFAULT_TIMEOUT;
  const apiKey = options?.apiKey;

  if (!apiKey) {
    return {
      success: false,
      error: createError(
        'API_ERROR',
        'API key is required for metal prices. Please provide an API key in the options or calculator config.'
      ),
    };
  }

  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Combine with user-provided signal if present
  const signal = options?.signal;
  if (signal) {
    signal.addEventListener('abort', () => controller.abort());
  }

  try {
    const url = `${endpoint}/${metal}/${currency}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-access-token': apiKey,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle HTTP errors
    if (!response.ok) {
      // Rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        return {
          success: false,
          error: createError(
            'RATE_LIMITED',
            'Metal price API rate limit exceeded. Please try again later.',
            429,
            retryAfter ? parseInt(retryAfter, 10) : 60
          ),
        };
      }

      // Unauthorized - likely invalid API key
      if (response.status === 401 || response.status === 403) {
        return {
          success: false,
          error: createError(
            'API_ERROR',
            'Invalid or expired API key for metal prices API.',
            response.status
          ),
        };
      }

      // Server errors
      if (response.status >= 500) {
        return {
          success: false,
          error: createError(
            'API_ERROR',
            `Metal price API server error: ${response.status} ${response.statusText}`,
            response.status
          ),
        };
      }

      // Other errors
      return {
        success: false,
        error: createError(
          'API_ERROR',
          `Metal price API error: ${response.status} ${response.statusText}`,
          response.status
        ),
      };
    }

    // Parse JSON response
    let data: GoldAPIResponse;
    try {
      data = (await response.json()) as GoldAPIResponse;
    } catch {
      return {
        success: false,
        error: createError(
          'PARSE_ERROR',
          'Failed to parse metal price API response as JSON'
        ),
      };
    }

    // Validate response structure
    if (typeof data.price_gram_24k !== 'number') {
      return {
        success: false,
        error: createError(
          'PARSE_ERROR',
          'Invalid metal price API response: missing price data'
        ),
      };
    }

    return { success: true, data };
  } catch (err) {
    clearTimeout(timeoutId);

    // Handle abort
    if (err instanceof Error && err.name === 'AbortError') {
      // Check if it was user abort or timeout
      if (signal?.aborted) {
        return {
          success: false,
          error: createError('ABORTED', 'Request was aborted'),
        };
      }
      return {
        success: false,
        error: createError(
          'TIMEOUT',
          `Request timed out after ${timeout}ms`
        ),
      };
    }

    // Network errors
    return {
      success: false,
      error: createError(
        'NETWORK_ERROR',
        err instanceof Error ? err.message : 'Network request failed'
      ),
    };
  }
}

/**
 * Fetch current gold and silver prices from API
 *
 * @param currency - Currency code for prices (e.g., 'USD', 'EUR')
 * @param options - Query options including API key
 * @returns Promise with metal prices or error
 *
 * @example
 * ```typescript
 * const result = await fetchMetalPrices('USD', { apiKey: 'your-api-key' });
 * if (result.success) {
 *   console.log(result.data.gold.pricePerGram);
 * }
 * ```
 */
export async function fetchMetalPrices(
  currency: CurrencyCode,
  options?: MetalPriceQueryOptions
): AsyncResult<MetalPricesResult, ZakatError> {
  // Fetch gold and silver prices in parallel
  const [goldResult, silverResult] = await Promise.all([
    fetchSingleMetalPrice('XAU', currency, options),
    fetchSingleMetalPrice('XAG', currency, options),
  ]);

  // Check for errors
  if (!goldResult.success) {
    return goldResult;
  }
  if (!silverResult.success) {
    return silverResult;
  }

  const timestamp = new Date();

  return {
    success: true,
    data: {
      gold: {
        metal: 'gold',
        pricePerGram: goldResult.data.price_gram_24k,
        currency,
        timestamp,
        source: 'goldapi.io',
      },
      silver: {
        metal: 'silver',
        pricePerGram: silverResult.data.price_gram_24k,
        currency,
        timestamp,
        source: 'goldapi.io',
      },
    },
  };
}

/**
 * Approximate exchange rates from USD (for mock prices only)
 * In production, use real API with proper currency conversion
 */
const MOCK_EXCHANGE_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  SAR: 3.75,
  AED: 3.67,
  MYR: 4.47,
  IDR: 15800,
  PKR: 278,
  INR: 83.5,
  BDT: 110,
  EGP: 30.9,
  TRY: 32.5,
  CAD: 1.36,
  AUD: 1.53,
  SGD: 1.34,
  QAR: 3.64,
  KWD: 0.31,
  BHD: 0.38,
  OMR: 0.38,
};

/**
 * Create mock metal prices for testing or offline use
 * Prices are converted from USD base prices using approximate exchange rates
 *
 * @param currency - Currency code for prices
 * @param baseGoldPriceUSD - Gold price per gram in USD (default: ~$62)
 * @param baseSilverPriceUSD - Silver price per gram in USD (default: ~$0.75)
 */
export function createMockMetalPrices(
  currency: CurrencyCode = 'USD',
  baseGoldPriceUSD = 62.0,
  baseSilverPriceUSD = 0.75
): MetalPricesResult {
  const timestamp = new Date();
  const exchangeRate = MOCK_EXCHANGE_RATES[currency] ?? 1.0;

  // Convert USD prices to target currency
  const goldPricePerGram = baseGoldPriceUSD * exchangeRate;
  const silverPricePerGram = baseSilverPriceUSD * exchangeRate;

  return {
    gold: {
      metal: 'gold',
      pricePerGram: goldPricePerGram,
      currency,
      timestamp,
      source: 'mock',
    },
    silver: {
      metal: 'silver',
      pricePerGram: silverPricePerGram,
      currency,
      timestamp,
      source: 'mock',
    },
  };
}

/**
 * Validate that metal prices are present and reasonable
 */
export function validateMetalPrices(
  prices: MetalPricesResult
): Result<MetalPricesResult, ZakatError> {
  if (!prices.gold || !prices.silver) {
    return {
      success: false,
      error: createError(
        'PARSE_ERROR',
        'Metal prices must include both gold and silver'
      ),
    };
  }

  if (prices.gold.pricePerGram <= 0) {
    return {
      success: false,
      error: createError(
        'INVALID_AMOUNT',
        'Gold price must be greater than 0'
      ),
    };
  }

  if (prices.silver.pricePerGram <= 0) {
    return {
      success: false,
      error: createError(
        'INVALID_AMOUNT',
        'Silver price must be greater than 0'
      ),
    };
  }

  // Sanity check: gold should be significantly more expensive than silver
  if (prices.gold.pricePerGram < prices.silver.pricePerGram) {
    return {
      success: false,
      error: createError(
        'PARSE_ERROR',
        'Invalid metal prices: gold price should be higher than silver'
      ),
    };
  }

  return { success: true, data: prices };
}
