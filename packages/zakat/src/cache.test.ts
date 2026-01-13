import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ZakatCache, generateCacheKey } from './cache';

describe('ZakatCache', () => {
  let cache: ZakatCache<string>;

  beforeEach(() => {
    cache = new ZakatCache<string>();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('get/set', () => {
    it('stores and retrieves values', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('returns undefined for non-existent keys', () => {
      expect(cache.get('nonexistent')).toBeUndefined();
    });

    it('overwrites existing values', () => {
      cache.set('key1', 'value1');
      cache.set('key1', 'value2');
      expect(cache.get('key1')).toBe('value2');
    });
  });

  describe('TTL expiration', () => {
    it('expires entries after TTL', () => {
      const shortCache = new ZakatCache<string>({ ttl: 1000 });
      shortCache.set('key1', 'value1');

      expect(shortCache.get('key1')).toBe('value1');

      // Advance time past TTL
      vi.advanceTimersByTime(1001);

      expect(shortCache.get('key1')).toBeUndefined();
    });

    it('keeps entries before TTL expires', () => {
      const shortCache = new ZakatCache<string>({ ttl: 1000 });
      shortCache.set('key1', 'value1');

      vi.advanceTimersByTime(500);

      expect(shortCache.get('key1')).toBe('value1');
    });

    it('uses default TTL of 1 hour for metal prices', () => {
      cache.set('key1', 'value1');

      // 59 minutes - should still exist
      vi.advanceTimersByTime(59 * 60 * 1000);
      expect(cache.get('key1')).toBe('value1');

      // 1 hour + 1ms - should be expired
      vi.advanceTimersByTime(60 * 1000 + 1);
      expect(cache.get('key1')).toBeUndefined();
    });
  });

  describe('LRU eviction', () => {
    it('evicts oldest entries when max reached', () => {
      const smallCache = new ZakatCache<string>({ maxEntries: 3 });

      smallCache.set('key1', 'value1');
      smallCache.set('key2', 'value2');
      smallCache.set('key3', 'value3');

      // All three should exist
      expect(smallCache.get('key1')).toBe('value1');
      expect(smallCache.get('key2')).toBe('value2');
      expect(smallCache.get('key3')).toBe('value3');

      // Add fourth entry - key1 should be evicted (oldest)
      smallCache.set('key4', 'value4');

      expect(smallCache.get('key1')).toBeUndefined();
      expect(smallCache.get('key2')).toBe('value2');
      expect(smallCache.get('key3')).toBe('value3');
      expect(smallCache.get('key4')).toBe('value4');
    });

    it('moves accessed entries to end (LRU)', () => {
      const smallCache = new ZakatCache<string>({ maxEntries: 3 });

      smallCache.set('key1', 'value1');
      smallCache.set('key2', 'value2');
      smallCache.set('key3', 'value3');

      // Access key1 to make it most recently used
      smallCache.get('key1');

      // Add fourth entry - key2 should be evicted (oldest not accessed)
      smallCache.set('key4', 'value4');

      expect(smallCache.get('key1')).toBe('value1');
      expect(smallCache.get('key2')).toBeUndefined();
      expect(smallCache.get('key3')).toBe('value3');
      expect(smallCache.get('key4')).toBe('value4');
    });

    it('uses default max entries of 50', () => {
      for (let i = 0; i < 50; i++) {
        cache.set(`key${i}`, `value${i}`);
      }

      expect(cache.size).toBe(50);

      // Add one more
      cache.set('key50', 'value50');

      expect(cache.size).toBe(50);
      expect(cache.get('key0')).toBeUndefined(); // Oldest evicted
      expect(cache.get('key50')).toBe('value50');
    });
  });

  describe('has', () => {
    it('returns true for existing keys', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
    });

    it('returns false for non-existent keys', () => {
      expect(cache.has('nonexistent')).toBe(false);
    });

    it('returns false for expired keys', () => {
      const shortCache = new ZakatCache<string>({ ttl: 1000 });
      shortCache.set('key1', 'value1');

      vi.advanceTimersByTime(1001);

      expect(shortCache.has('key1')).toBe(false);
    });
  });

  describe('delete', () => {
    it('removes existing keys', () => {
      cache.set('key1', 'value1');
      expect(cache.delete('key1')).toBe(true);
      expect(cache.get('key1')).toBeUndefined();
    });

    it('returns false for non-existent keys', () => {
      expect(cache.delete('nonexistent')).toBe(false);
    });
  });

  describe('clear', () => {
    it('removes all entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      cache.clear();

      expect(cache.size).toBe(0);
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBeUndefined();
    });

    it('resets statistics', () => {
      cache.set('key1', 'value1');
      cache.get('key1'); // hit
      cache.get('nonexistent'); // miss

      expect(cache.stats.hits).toBe(1);
      expect(cache.stats.misses).toBe(1);

      cache.clear();

      expect(cache.stats.hits).toBe(0);
      expect(cache.stats.misses).toBe(0);
    });
  });

  describe('size', () => {
    it('returns correct count', () => {
      expect(cache.size).toBe(0);

      cache.set('key1', 'value1');
      expect(cache.size).toBe(1);

      cache.set('key2', 'value2');
      expect(cache.size).toBe(2);
    });

    it('excludes expired entries', () => {
      const shortCache = new ZakatCache<string>({ ttl: 1000 });
      shortCache.set('key1', 'value1');
      shortCache.set('key2', 'value2');

      expect(shortCache.size).toBe(2);

      vi.advanceTimersByTime(1001);

      expect(shortCache.size).toBe(0);
    });
  });

  describe('stats', () => {
    it('tracks hits correctly', () => {
      cache.set('key1', 'value1');

      cache.get('key1');
      cache.get('key1');
      cache.get('key1');

      expect(cache.stats.hits).toBe(3);
    });

    it('tracks misses correctly', () => {
      cache.get('nonexistent1');
      cache.get('nonexistent2');

      expect(cache.stats.misses).toBe(2);
    });

    it('tracks miss on expired entry', () => {
      const shortCache = new ZakatCache<string>({ ttl: 1000 });
      shortCache.set('key1', 'value1');

      shortCache.get('key1'); // hit
      vi.advanceTimersByTime(1001);
      shortCache.get('key1'); // miss (expired)

      expect(shortCache.stats.hits).toBe(1);
      expect(shortCache.stats.misses).toBe(1);
    });
  });
});

describe('generateCacheKey', () => {
  it('generates consistent keys for same currency', () => {
    const key1 = generateCacheKey('USD');
    const key2 = generateCacheKey('USD');

    expect(key1).toBe(key2);
  });

  it('generates different keys for different currencies', () => {
    const key1 = generateCacheKey('USD');
    const key2 = generateCacheKey('EUR');

    expect(key1).not.toBe(key2);
  });

  it('normalizes currency to uppercase', () => {
    const key1 = generateCacheKey('usd');
    const key2 = generateCacheKey('USD');

    expect(key1).toBe(key2);
  });

  it('formats key correctly', () => {
    const key = generateCacheKey('USD');

    expect(key).toBe('metal-prices:USD');
  });
});
