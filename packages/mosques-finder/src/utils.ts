import type { Coordinates } from '@misque/core';
import { calculateDistance } from '@misque/core';
import type { Mosque, MosqueAddress, OpeningHours, MosquePrayerTimes, OverpassElement } from './types';

/**
 * Default radius in km
 */
export const DEFAULT_RADIUS = 5;

/**
 * Default result limit
 */
export const DEFAULT_LIMIT = 20;

/**
 * Default timeout in ms
 */
export const DEFAULT_TIMEOUT = 10000;

/**
 * Maximum search radius in km
 */
export const MAX_RADIUS = 50;

/**
 * Convert km to meters
 */
export function kmToMeters(km: number): number {
  return km * 1000;
}

/**
 * Get coordinates from an Overpass element
 */
export function getElementCoordinates(element: OverpassElement): Coordinates | null {
  // Node has direct lat/lon
  if (element.lat !== undefined && element.lon !== undefined) {
    return { latitude: element.lat, longitude: element.lon };
  }

  // Way/relation has center
  if (element.center) {
    return { latitude: element.center.lat, longitude: element.center.lon };
  }

  return null;
}

/**
 * Extract address from OSM tags
 */
export function extractAddress(tags: Record<string, string>): MosqueAddress | undefined {
  const address: MosqueAddress = {};

  if (tags['addr:street']) address.street = tags['addr:street'];
  if (tags['addr:housenumber']) address.houseNumber = tags['addr:housenumber'];
  if (tags['addr:city']) address.city = tags['addr:city'];
  if (tags['addr:postcode']) address.postcode = tags['addr:postcode'];
  if (tags['addr:country']) address.country = tags['addr:country'];

  // Build formatted address
  const parts: string[] = [];
  if (address.houseNumber && address.street) {
    parts.push(`${address.houseNumber} ${address.street}`);
  } else if (address.street) {
    parts.push(address.street);
  }
  if (address.city) parts.push(address.city);
  if (address.postcode) parts.push(address.postcode);
  if (address.country) parts.push(address.country);

  if (parts.length > 0) {
    address.formatted = parts.join(', ');
  }

  // Return undefined if no address data
  if (Object.keys(address).length === 0) {
    return undefined;
  }

  return address;
}

/**
 * Extract opening hours from OSM tags
 */
export function extractOpeningHours(tags: Record<string, string>): OpeningHours | undefined {
  const raw = tags['opening_hours'];
  if (!raw) return undefined;

  return {
    raw,
    description: raw, // Could be enhanced with a parser
  };
}

/**
 * Extract prayer times from OSM tags
 */
export function extractPrayerTimes(tags: Record<string, string>): MosquePrayerTimes | undefined {
  const prayerTimes: MosquePrayerTimes = {};

  // Some mosques tag their prayer times
  if (tags['prayer_times:fajr']) prayerTimes.fajr = tags['prayer_times:fajr'];
  if (tags['prayer_times:dhuhr']) prayerTimes.dhuhr = tags['prayer_times:dhuhr'];
  if (tags['prayer_times:asr']) prayerTimes.asr = tags['prayer_times:asr'];
  if (tags['prayer_times:maghrib']) prayerTimes.maghrib = tags['prayer_times:maghrib'];
  if (tags['prayer_times:isha']) prayerTimes.isha = tags['prayer_times:isha'];
  if (tags['prayer_times:jummah'] || tags['service_times:friday'])
    prayerTimes.jummah = tags['prayer_times:jummah'] ?? tags['service_times:friday'];

  if (Object.keys(prayerTimes).length === 0) {
    return undefined;
  }

  return prayerTimes;
}

/**
 * Transform an Overpass element into a Mosque object
 */
export function transformElement(
  element: OverpassElement,
  origin: Coordinates
): Mosque | null {
  const location = getElementCoordinates(element);
  if (!location) return null;

  const tags = element.tags ?? {};
  const name = tags['name'] ?? tags['name:en'] ?? 'Unnamed Mosque';

  const distance = calculateDistance(origin, location);

  const mosque: Mosque = {
    id: `${element.type}/${element.id}`,
    name,
    location,
    distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
  };

  // Optional fields
  if (tags['name:ar']) mosque.nameAr = tags['name:ar'];
  if (tags['alt_name'] || tags['name:en']) {
    mosque.nameAlt = tags['alt_name'] ?? tags['name:en'];
  }
  if (tags['phone'] || tags['contact:phone']) {
    mosque.phone = tags['phone'] ?? tags['contact:phone'];
  }
  if (tags['website'] || tags['contact:website']) {
    mosque.website = tags['website'] ?? tags['contact:website'];
  }
  if (tags['email'] || tags['contact:email']) {
    mosque.email = tags['email'] ?? tags['contact:email'];
  }
  if (tags['wheelchair']) {
    const value = tags['wheelchair'];
    if (value === 'yes' || value === 'no' || value === 'limited') {
      mosque.wheelchair = value;
    } else {
      mosque.wheelchair = 'unknown';
    }
  }

  const address = extractAddress(tags);
  if (address) mosque.address = address;

  const openingHours = extractOpeningHours(tags);
  if (openingHours) mosque.openingHours = openingHours;

  const prayerTimes = extractPrayerTimes(tags);
  if (prayerTimes) mosque.prayerTimes = prayerTimes;

  // Include all tags for extended access
  mosque.tags = tags;

  return mosque;
}

/**
 * Deduplicate mosques by proximity
 * When same mosque is tagged as both node and way, keep the one with more data
 */
export function deduplicateMosques(mosques: Mosque[]): Mosque[] {
  const seen = new Map<string, Mosque>();

  for (const mosque of mosques) {
    // Create a key based on rounded location
    const key = `${Math.round(mosque.location.latitude * 1000)}:${Math.round(mosque.location.longitude * 1000)}`;

    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, mosque);
    } else {
      // Keep the one with more tags (more data)
      const existingTagCount = Object.keys(existing.tags ?? {}).length;
      const newTagCount = Object.keys(mosque.tags ?? {}).length;
      if (newTagCount > existingTagCount) {
        seen.set(key, mosque);
      }
    }
  }

  return Array.from(seen.values());
}
