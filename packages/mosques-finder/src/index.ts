/**
 * Find nearby mosques using OpenStreetMap data
 * @module @misque/mosques-finder
 */

// Types
export type {
  Mosque,
  MosqueAddress,
  MosquePrayerTimes,
  OpeningHours,
  FindMosquesOptions,
  FindMosquesResult,
  MosqueFinderError,
  MosqueFinderErrorCode,
  MosqueFinderConfig,
  MosqueFinderInstance,
  CacheOptions,
  CacheStats,
} from './types';

// Main API functions
export {
  findMosques,
  findNearestMosque,
  getMosqueById,
  createMosqueFinder,
} from './finder';

// Constants
export { DEFAULT_OVERPASS_ENDPOINT, OVERPASS_ENDPOINTS } from './overpass';
export { DEFAULT_RADIUS, DEFAULT_LIMIT, DEFAULT_TIMEOUT, MAX_RADIUS } from './utils';
