import type { Coordinates, AsyncResult } from '@misque/core';
import { validateCoordinates } from '@misque/core';
import type {
  Mosque,
  FindMosquesOptions,
  FindMosquesResult,
  MosqueFinderError,
  MosqueFinderConfig,
  MosqueFinderInstance,
  CacheStats,
} from './types';
import { MosqueCache, generateCacheKey } from './cache';
import { queryMosques, queryById, createError, DEFAULT_OVERPASS_ENDPOINT } from './overpass';
import {
  transformElement,
  deduplicateMosques,
  kmToMeters,
  DEFAULT_RADIUS,
  DEFAULT_LIMIT,
  DEFAULT_TIMEOUT,
  MAX_RADIUS,
} from './utils';

/**
 * Find nearby mosques from a given location
 *
 * @example
 * ```ts
 * const result = await findMosques({ latitude: 51.5074, longitude: -0.1278 });
 * if (result.success) {
 *   console.log(`Found ${result.data.mosques.length} mosques`);
 *   result.data.mosques.forEach(m => console.log(m.name, m.distance));
 * }
 * ```
 */
export async function findMosques(
  location: Coordinates,
  options?: FindMosquesOptions,
  cache?: MosqueCache<FindMosquesResult>
): AsyncResult<FindMosquesResult, MosqueFinderError> {
  // Validate coordinates
  const validation = validateCoordinates(location);
  if (!validation.success) {
    return {
      success: false,
      error: createError('INVALID_COORDINATES', validation.error.message),
    };
  }

  // Apply defaults and constraints
  const radius = Math.min(options?.radius ?? DEFAULT_RADIUS, MAX_RADIUS);
  const limit = options?.limit ?? DEFAULT_LIMIT;
  const timeout = options?.timeout ?? DEFAULT_TIMEOUT;
  const useCache = options?.useCache ?? true;
  const endpoint = options?.overpassEndpoint ?? DEFAULT_OVERPASS_ENDPOINT;

  // Check cache
  const cacheKey = generateCacheKey(location.latitude, location.longitude, radius);
  if (useCache && cache) {
    const cached = cache.get(cacheKey);
    if (cached) {
      // Return cached result with potentially different limit
      return {
        success: true,
        data: {
          ...cached,
          mosques: cached.mosques.slice(0, limit),
          fromCache: true,
        },
      };
    }
  }

  // Query Overpass API
  const radiusMeters = kmToMeters(radius);
  const result = await queryMosques(location, radiusMeters, {
    endpoint,
    timeout,
    signal: options?.signal,
  });

  if (!result.success) {
    return result;
  }

  // Transform elements to mosques
  const mosques: Mosque[] = [];
  for (const element of result.data) {
    const mosque = transformElement(element, location);
    if (mosque) {
      mosques.push(mosque);
    }
  }

  // Deduplicate and sort by distance
  const deduplicated = deduplicateMosques(mosques);
  deduplicated.sort((a, b) => a.distance - b.distance);

  // Build result
  const searchResult: FindMosquesResult = {
    mosques: deduplicated.slice(0, limit),
    origin: location,
    radius,
    totalCount: deduplicated.length,
    fromCache: false,
    timestamp: new Date(),
  };

  // Cache full result (before limit)
  if (useCache && cache) {
    cache.set(cacheKey, {
      ...searchResult,
      mosques: deduplicated, // Cache all results
    });
  }

  return { success: true, data: searchResult };
}

/**
 * Find the nearest single mosque
 *
 * @example
 * ```ts
 * const result = await findNearestMosque({ latitude: 40.7128, longitude: -74.006 });
 * if (result.success && result.data) {
 *   console.log(`Nearest: ${result.data.name} (${result.data.distance}km)`);
 * }
 * ```
 */
export async function findNearestMosque(
  location: Coordinates,
  options?: Omit<FindMosquesOptions, 'limit'>,
  cache?: MosqueCache<FindMosquesResult>
): AsyncResult<Mosque | null, MosqueFinderError> {
  const result = await findMosques(location, { ...options, limit: 1 }, cache);

  if (!result.success) {
    return result;
  }

  return {
    success: true,
    data: result.data.mosques[0] ?? null,
  };
}

/**
 * Get a mosque by its OpenStreetMap ID
 *
 * @param osmId - OSM ID in format "node/123", "way/456", or "relation/789"
 */
export async function getMosqueById(
  osmId: string,
  options?: Pick<FindMosquesOptions, 'timeout' | 'overpassEndpoint' | 'signal'>
): AsyncResult<Mosque | null, MosqueFinderError> {
  const result = await queryById(osmId, {
    endpoint: options?.overpassEndpoint,
    timeout: options?.timeout ?? DEFAULT_TIMEOUT,
    signal: options?.signal,
  });

  if (!result.success) {
    return result;
  }

  if (!result.data) {
    return { success: true, data: null };
  }

  // Transform with origin at 0,0 (distance will be meaningless)
  const mosque = transformElement(result.data, { latitude: 0, longitude: 0 });

  return { success: true, data: mosque };
}

/**
 * Create a mosque finder instance with persistent configuration
 *
 * @example
 * ```ts
 * const finder = createMosqueFinder({
 *   defaultRadius: 10,
 *   cacheOptions: { ttl: 600000 },
 * });
 *
 * const result = await finder.find({ latitude: 51.5074, longitude: -0.1278 });
 * console.log(finder.getCacheStats());
 * ```
 */
export function createMosqueFinder(config?: MosqueFinderConfig): MosqueFinderInstance {
  const cache = new MosqueCache<FindMosquesResult>(config?.cacheOptions);

  const defaultOptions: FindMosquesOptions = {
    radius: config?.defaultRadius ?? DEFAULT_RADIUS,
    limit: config?.defaultLimit ?? DEFAULT_LIMIT,
    timeout: config?.defaultTimeout ?? DEFAULT_TIMEOUT,
    overpassEndpoint: config?.overpassEndpoint,
  };

  return {
    find(
      location: Coordinates,
      options?: FindMosquesOptions
    ): AsyncResult<FindMosquesResult, MosqueFinderError> {
      return findMosques(location, { ...defaultOptions, ...options }, cache);
    },

    findNearest(
      location: Coordinates,
      options?: Omit<FindMosquesOptions, 'limit'>
    ): AsyncResult<Mosque | null, MosqueFinderError> {
      return findNearestMosque(location, { ...defaultOptions, ...options }, cache);
    },

    getById(
      osmId: string,
      options?: Pick<FindMosquesOptions, 'timeout' | 'overpassEndpoint' | 'signal'>
    ): AsyncResult<Mosque | null, MosqueFinderError> {
      return getMosqueById(osmId, { ...defaultOptions, ...options });
    },

    clearCache(): void {
      cache.clear();
    },

    getCacheStats(): CacheStats {
      return cache.stats;
    },
  };
}
