import type { Coordinates } from '@misque/core';

/**
 * Opening hours for a mosque (OpenStreetMap format)
 */
export interface OpeningHours {
  /** Raw opening_hours string from OSM */
  raw: string;
  /** Whether currently open (if parseable) */
  isOpen?: boolean;
  /** Human-readable description */
  description?: string;
}

/**
 * Prayer time information if available from OSM data
 */
export interface MosquePrayerTimes {
  fajr?: string;
  dhuhr?: string;
  asr?: string;
  maghrib?: string;
  isha?: string;
  jummah?: string;
}

/**
 * Address information for a mosque
 */
export interface MosqueAddress {
  street?: string;
  houseNumber?: string;
  city?: string;
  postcode?: string;
  country?: string;
  /** Full formatted address */
  formatted?: string;
}

/**
 * Mosque data returned from search
 */
export interface Mosque {
  /** OpenStreetMap node/way/relation ID */
  id: string;
  /** Mosque name (may be in local language) */
  name: string;
  /** Alternative name (e.g., English transliteration) */
  nameAlt?: string;
  /** Arabic name if available */
  nameAr?: string;
  /** Location coordinates */
  location: Coordinates;
  /** Distance from search origin in kilometers */
  distance: number;
  /** Address information */
  address?: MosqueAddress;
  /** Contact phone number */
  phone?: string;
  /** Website URL */
  website?: string;
  /** Email address */
  email?: string;
  /** Opening hours */
  openingHours?: OpeningHours;
  /** Prayer times if available */
  prayerTimes?: MosquePrayerTimes;
  /** Wheelchair accessibility */
  wheelchair?: 'yes' | 'no' | 'limited' | 'unknown';
  /** Additional OSM tags for extended data */
  tags?: Record<string, string>;
}

/**
 * Options for finding mosques
 */
export interface FindMosquesOptions {
  /** Search radius in kilometers (default: 5, max: 50) */
  radius?: number;
  /** Maximum number of results (default: 20) */
  limit?: number;
  /** Request timeout in milliseconds (default: 10000) */
  timeout?: number;
  /** Whether to use cache (default: true) */
  useCache?: boolean;
  /** Custom Overpass API endpoint */
  overpassEndpoint?: string;
  /** Signal for request cancellation */
  signal?: AbortSignal;
}

/**
 * Search result with metadata
 */
export interface FindMosquesResult {
  /** List of mosques found, sorted by distance */
  mosques: Mosque[];
  /** Search origin coordinates */
  origin: Coordinates;
  /** Search radius used (km) */
  radius: number;
  /** Total count from API (before limit) */
  totalCount: number;
  /** Whether results came from cache */
  fromCache: boolean;
  /** Timestamp of the query */
  timestamp: Date;
}

/**
 * Error codes for mosque finder operations
 */
export type MosqueFinderErrorCode =
  | 'INVALID_COORDINATES'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'RATE_LIMITED'
  | 'PARSE_ERROR'
  | 'OVERPASS_ERROR'
  | 'ABORTED';

/**
 * Custom error for mosque finder operations
 */
export interface MosqueFinderError extends Error {
  code: MosqueFinderErrorCode;
  /** HTTP status code if applicable */
  statusCode?: number;
  /** Seconds to wait before retrying (for rate limiting) */
  retryAfter?: number;
}

/**
 * Cache options for mosque finder
 */
export interface CacheOptions {
  /** Time-to-live in milliseconds (default: 300000 = 5 minutes) */
  ttl?: number;
  /** Maximum cache entries (default: 100) */
  maxEntries?: number;
}

/**
 * Configuration for mosque finder instance
 */
export interface MosqueFinderConfig {
  /** Default search radius in km (default: 5) */
  defaultRadius?: number;
  /** Default result limit (default: 20) */
  defaultLimit?: number;
  /** Default timeout in ms (default: 10000) */
  defaultTimeout?: number;
  /** Cache configuration */
  cacheOptions?: CacheOptions;
  /** Custom Overpass endpoint */
  overpassEndpoint?: string;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  /** Number of entries in cache */
  size: number;
  /** Number of cache hits */
  hits: number;
  /** Number of cache misses */
  misses: number;
}

/**
 * Mosque finder instance with bound configuration
 */
export interface MosqueFinderInstance {
  /**
   * Find nearby mosques from a given location
   */
  find(
    location: Coordinates,
    options?: FindMosquesOptions
  ): Promise<
    | { success: true; data: FindMosquesResult }
    | { success: false; error: MosqueFinderError }
  >;

  /**
   * Find the nearest single mosque
   */
  findNearest(
    location: Coordinates,
    options?: Omit<FindMosquesOptions, 'limit'>
  ): Promise<
    | { success: true; data: Mosque | null }
    | { success: false; error: MosqueFinderError }
  >;

  /**
   * Get a mosque by its OpenStreetMap ID
   */
  getById(
    osmId: string,
    options?: Pick<FindMosquesOptions, 'timeout' | 'overpassEndpoint' | 'signal'>
  ): Promise<
    | { success: true; data: Mosque | null }
    | { success: false; error: MosqueFinderError }
  >;

  /**
   * Clear all cached results
   */
  clearCache(): void;

  /**
   * Get cache statistics
   */
  getCacheStats(): CacheStats;
}

/**
 * Overpass API query options (internal)
 */
export interface OverpassQueryOptions {
  endpoint?: string;
  timeout?: number;
  signal?: AbortSignal;
}

/**
 * Raw OSM element from Overpass API response (internal)
 */
export interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

/**
 * Overpass API response structure (internal)
 */
export interface OverpassResponse {
  version: number;
  generator: string;
  elements: OverpassElement[];
}
