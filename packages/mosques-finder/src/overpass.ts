import type { AsyncResult, Coordinates } from '@misque/core';
import type {
  OverpassElement,
  OverpassResponse,
  OverpassQueryOptions,
  MosqueFinderError,
  MosqueFinderErrorCode,
} from './types';

/**
 * Available Overpass API endpoints (fallbacks)
 */
export const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
] as const;

/**
 * Default Overpass API endpoint
 */
export const DEFAULT_OVERPASS_ENDPOINT = OVERPASS_ENDPOINTS[0];

/**
 * Default timeout in milliseconds
 */
export const DEFAULT_TIMEOUT = 10000;

/**
 * Create a MosqueFinderError
 */
export function createError(
  code: MosqueFinderErrorCode,
  message: string,
  statusCode?: number,
  retryAfter?: number
): MosqueFinderError {
  const error = new Error(message) as MosqueFinderError;
  error.code = code;
  error.name = 'MosqueFinderError';
  if (statusCode !== undefined) error.statusCode = statusCode;
  if (retryAfter !== undefined) error.retryAfter = retryAfter;
  return error;
}

/**
 * Build Overpass QL query for mosque search
 *
 * @param lat - Latitude of search center
 * @param lon - Longitude of search center
 * @param radiusMeters - Search radius in meters
 * @returns Overpass QL query string
 */
export function buildMosqueQuery(
  lat: number,
  lon: number,
  radiusMeters: number
): string {
  // Query for amenity=place_of_worship + religion=muslim
  // Also includes building=mosque as an alternative tag
  return `
[out:json][timeout:25];
(
  node["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${lat},${lon});
  way["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${lat},${lon});
  relation["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${lat},${lon});
  node["building"="mosque"](around:${radiusMeters},${lat},${lon});
  way["building"="mosque"](around:${radiusMeters},${lat},${lon});
);
out center body;
`.trim();
}

/**
 * Build Overpass QL query for a specific OSM element by ID
 *
 * @param osmId - OSM ID in format "node/123", "way/456", or "relation/789"
 * @returns Overpass QL query string
 */
export function buildIdQuery(osmId: string): string {
  const [type, id] = osmId.split('/');

  if (!type || !id || !['node', 'way', 'relation'].includes(type)) {
    throw createError(
      'PARSE_ERROR',
      `Invalid OSM ID format: ${osmId}. Expected format: node/123, way/456, or relation/789`
    );
  }

  return `
[out:json][timeout:10];
${type}(${id});
out center body;
`.trim();
}

/**
 * Execute an Overpass API query
 *
 * @param query - Overpass QL query string
 * @param options - Query options
 * @returns Promise with parsed response or error
 */
export async function executeQuery(
  query: string,
  options?: OverpassQueryOptions
): AsyncResult<OverpassResponse, MosqueFinderError> {
  const endpoint = options?.endpoint ?? DEFAULT_OVERPASS_ENDPOINT;
  const timeout = options?.timeout ?? DEFAULT_TIMEOUT;

  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Combine with user-provided signal if present
  const signal = options?.signal;
  if (signal) {
    signal.addEventListener('abort', () => controller.abort());
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`,
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
            'Overpass API rate limit exceeded. Please try again later.',
            429,
            retryAfter ? parseInt(retryAfter, 10) : 60
          ),
        };
      }

      // Server errors
      if (response.status >= 500) {
        return {
          success: false,
          error: createError(
            'OVERPASS_ERROR',
            `Overpass API server error: ${response.status} ${response.statusText}`,
            response.status
          ),
        };
      }

      // Other errors
      return {
        success: false,
        error: createError(
          'OVERPASS_ERROR',
          `Overpass API error: ${response.status} ${response.statusText}`,
          response.status
        ),
      };
    }

    // Parse JSON response
    let data: OverpassResponse;
    try {
      data = (await response.json()) as OverpassResponse;
    } catch {
      return {
        success: false,
        error: createError(
          'PARSE_ERROR',
          'Failed to parse Overpass API response as JSON'
        ),
      };
    }

    // Validate response structure
    if (!data.elements || !Array.isArray(data.elements)) {
      return {
        success: false,
        error: createError(
          'PARSE_ERROR',
          'Invalid Overpass API response: missing elements array'
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
 * Query mosques within a radius of a location
 *
 * @param location - Center coordinates for search
 * @param radiusMeters - Search radius in meters
 * @param options - Query options
 * @returns Promise with array of OSM elements or error
 */
export async function queryMosques(
  location: Coordinates,
  radiusMeters: number,
  options?: OverpassQueryOptions
): AsyncResult<OverpassElement[], MosqueFinderError> {
  const query = buildMosqueQuery(location.latitude, location.longitude, radiusMeters);
  const result = await executeQuery(query, options);

  if (!result.success) {
    return result;
  }

  return { success: true, data: result.data.elements };
}

/**
 * Query a specific OSM element by ID
 *
 * @param osmId - OSM ID in format "node/123", "way/456", or "relation/789"
 * @param options - Query options
 * @returns Promise with OSM element or null if not found
 */
export async function queryById(
  osmId: string,
  options?: OverpassQueryOptions
): AsyncResult<OverpassElement | null, MosqueFinderError> {
  let query: string;
  try {
    query = buildIdQuery(osmId);
  } catch (err) {
    if (err instanceof Error && 'code' in err) {
      return { success: false, error: err as MosqueFinderError };
    }
    return {
      success: false,
      error: createError('PARSE_ERROR', 'Invalid OSM ID format'),
    };
  }

  const result = await executeQuery(query, options);

  if (!result.success) {
    return result;
  }

  const element = result.data.elements[0] ?? null;
  return { success: true, data: element };
}
