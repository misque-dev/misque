/**
 * In-memory cache with TTL and LRU eviction for metal prices
 * @module @misque/zakat/cache
 */

import type { CacheOptions, CacheStats } from './types';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * Default cache options
 * Metal prices are cached longer than location data since they change less frequently
 */
const DEFAULT_TTL = 60 * 60 * 1000; // 1 hour
const DEFAULT_MAX_ENTRIES = 50;

/**
 * Simple in-memory cache with TTL support and LRU eviction
 * Used primarily for caching metal price API responses
 */
export class ZakatCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private readonly ttl: number;
  private readonly maxEntries: number;
  private hits = 0;
  private misses = 0;

  constructor(options?: CacheOptions) {
    this.cache = new Map();
    this.ttl = options?.ttl ?? DEFAULT_TTL;
    this.maxEntries = options?.maxEntries ?? DEFAULT_MAX_ENTRIES;
  }

  /**
   * Get a value from the cache
   * Returns undefined if not found or expired
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return undefined;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return undefined;
    }

    this.hits++;
    // Move to end for LRU behavior (most recently accessed)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  /**
   * Set a value in the cache
   */
  set(key: string, value: T): void {
    // Remove if exists (for LRU ordering)
    this.cache.delete(key);

    // Evict oldest entries if at capacity
    while (this.cache.size >= this.maxEntries) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.ttl,
    });
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a key from the cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all entries from the cache
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get the number of entries in the cache
   */
  get size(): number {
    // Clean up expired entries first
    this.cleanup();
    return this.cache.size;
  }

  /**
   * Get cache statistics
   */
  get stats(): CacheStats {
    return {
      size: this.size,
      hits: this.hits,
      misses: this.misses,
    };
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Generate a cache key for metal prices
 * Keys are based on currency since metal prices vary by currency
 *
 * @param currency - Currency code for the metal price
 */
export function generateCacheKey(currency: string): string {
  return `metal-prices:${currency.toUpperCase()}`;
}
