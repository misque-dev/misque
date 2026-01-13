import { describe, it, expect } from 'vitest';
import {
  kmToMeters,
  getElementCoordinates,
  extractAddress,
  extractOpeningHours,
  extractPrayerTimes,
  transformElement,
  deduplicateMosques,
} from './utils';
import type { OverpassElement, Mosque } from './types';

describe('kmToMeters', () => {
  it('converts kilometers to meters', () => {
    expect(kmToMeters(1)).toBe(1000);
    expect(kmToMeters(5)).toBe(5000);
    expect(kmToMeters(0.5)).toBe(500);
  });
});

describe('getElementCoordinates', () => {
  it('returns coordinates from node element', () => {
    const element: OverpassElement = {
      type: 'node',
      id: 123,
      lat: 51.5,
      lon: -0.1,
    };

    const coords = getElementCoordinates(element);
    expect(coords).toEqual({ latitude: 51.5, longitude: -0.1 });
  });

  it('returns coordinates from way/relation center', () => {
    const element: OverpassElement = {
      type: 'way',
      id: 456,
      center: { lat: 51.5, lon: -0.1 },
    };

    const coords = getElementCoordinates(element);
    expect(coords).toEqual({ latitude: 51.5, longitude: -0.1 });
  });

  it('returns null when no coordinates available', () => {
    const element: OverpassElement = {
      type: 'relation',
      id: 789,
    };

    const coords = getElementCoordinates(element);
    expect(coords).toBeNull();
  });
});

describe('extractAddress', () => {
  it('extracts full address', () => {
    const tags = {
      'addr:street': 'Main Street',
      'addr:housenumber': '123',
      'addr:city': 'London',
      'addr:postcode': 'SW1A 1AA',
      'addr:country': 'UK',
    };

    const address = extractAddress(tags);
    expect(address).toEqual({
      street: 'Main Street',
      houseNumber: '123',
      city: 'London',
      postcode: 'SW1A 1AA',
      country: 'UK',
      formatted: '123 Main Street, London, SW1A 1AA, UK',
    });
  });

  it('formats address without house number', () => {
    const tags = {
      'addr:street': 'Main Street',
      'addr:city': 'London',
    };

    const address = extractAddress(tags);
    expect(address?.formatted).toBe('Main Street, London');
  });

  it('returns undefined for empty tags', () => {
    const address = extractAddress({});
    expect(address).toBeUndefined();
  });
});

describe('extractOpeningHours', () => {
  it('extracts opening hours', () => {
    const tags = { opening_hours: 'Mo-Fr 09:00-17:00' };
    const hours = extractOpeningHours(tags);

    expect(hours).toEqual({
      raw: 'Mo-Fr 09:00-17:00',
      description: 'Mo-Fr 09:00-17:00',
    });
  });

  it('returns undefined when no opening hours', () => {
    const hours = extractOpeningHours({});
    expect(hours).toBeUndefined();
  });
});

describe('extractPrayerTimes', () => {
  it('extracts prayer times', () => {
    const tags = {
      'prayer_times:fajr': '05:30',
      'prayer_times:dhuhr': '13:00',
      'prayer_times:asr': '16:30',
      'prayer_times:maghrib': '19:00',
      'prayer_times:isha': '21:00',
      'prayer_times:jummah': '13:30',
    };

    const times = extractPrayerTimes(tags);
    expect(times).toEqual({
      fajr: '05:30',
      dhuhr: '13:00',
      asr: '16:30',
      maghrib: '19:00',
      isha: '21:00',
      jummah: '13:30',
    });
  });

  it('extracts jummah from service_times:friday', () => {
    const tags = { 'service_times:friday': '13:00' };
    const times = extractPrayerTimes(tags);

    expect(times?.jummah).toBe('13:00');
  });

  it('returns undefined when no prayer times', () => {
    const times = extractPrayerTimes({});
    expect(times).toBeUndefined();
  });
});

describe('transformElement', () => {
  const origin = { latitude: 51.5, longitude: -0.1 };

  it('transforms node element to mosque', () => {
    const element: OverpassElement = {
      type: 'node',
      id: 123,
      lat: 51.51,
      lon: -0.11,
      tags: {
        name: 'Test Mosque',
        'name:ar': 'مسجد اختبار',
      },
    };

    const mosque = transformElement(element, origin);

    expect(mosque).not.toBeNull();
    expect(mosque?.id).toBe('node/123');
    expect(mosque?.name).toBe('Test Mosque');
    expect(mosque?.nameAr).toBe('مسجد اختبار');
  });

  it('uses name:en as fallback name', () => {
    const element: OverpassElement = {
      type: 'node',
      id: 123,
      lat: 51.51,
      lon: -0.11,
      tags: {
        'name:en': 'English Name',
      },
    };

    const mosque = transformElement(element, origin);
    expect(mosque?.name).toBe('English Name');
  });

  it('uses Unnamed Mosque as fallback', () => {
    const element: OverpassElement = {
      type: 'node',
      id: 123,
      lat: 51.51,
      lon: -0.11,
      tags: {},
    };

    const mosque = transformElement(element, origin);
    expect(mosque?.name).toBe('Unnamed Mosque');
  });

  it('extracts nameAlt from alt_name', () => {
    const element: OverpassElement = {
      type: 'node',
      id: 123,
      lat: 51.51,
      lon: -0.11,
      tags: {
        name: 'Primary Name',
        alt_name: 'Alternative Name',
      },
    };

    const mosque = transformElement(element, origin);
    expect(mosque?.nameAlt).toBe('Alternative Name');
  });

  it('extracts nameAlt from name:en when alt_name missing', () => {
    const element: OverpassElement = {
      type: 'node',
      id: 123,
      lat: 51.51,
      lon: -0.11,
      tags: {
        name: 'مسجد العربي',
        'name:en': 'Arabic Mosque',
      },
    };

    const mosque = transformElement(element, origin);
    expect(mosque?.nameAlt).toBe('Arabic Mosque');
  });

  it('extracts phone from contact:phone', () => {
    const element: OverpassElement = {
      type: 'node',
      id: 123,
      lat: 51.51,
      lon: -0.11,
      tags: {
        name: 'Test',
        'contact:phone': '+44 123 456 789',
      },
    };

    const mosque = transformElement(element, origin);
    expect(mosque?.phone).toBe('+44 123 456 789');
  });

  it('extracts website from contact:website', () => {
    const element: OverpassElement = {
      type: 'node',
      id: 123,
      lat: 51.51,
      lon: -0.11,
      tags: {
        name: 'Test',
        'contact:website': 'https://example.com',
      },
    };

    const mosque = transformElement(element, origin);
    expect(mosque?.website).toBe('https://example.com');
  });

  it('extracts email from contact:email', () => {
    const element: OverpassElement = {
      type: 'node',
      id: 123,
      lat: 51.51,
      lon: -0.11,
      tags: {
        name: 'Test',
        'contact:email': 'test@example.com',
      },
    };

    const mosque = transformElement(element, origin);
    expect(mosque?.email).toBe('test@example.com');
  });

  it('extracts valid wheelchair values', () => {
    const values = ['yes', 'no', 'limited'] as const;

    for (const value of values) {
      const element: OverpassElement = {
        type: 'node',
        id: 123,
        lat: 51.51,
        lon: -0.11,
        tags: { name: 'Test', wheelchair: value },
      };

      const mosque = transformElement(element, origin);
      expect(mosque?.wheelchair).toBe(value);
    }
  });

  it('sets wheelchair to unknown for invalid values', () => {
    const element: OverpassElement = {
      type: 'node',
      id: 123,
      lat: 51.51,
      lon: -0.11,
      tags: {
        name: 'Test',
        wheelchair: 'partial', // Not a valid value
      },
    };

    const mosque = transformElement(element, origin);
    expect(mosque?.wheelchair).toBe('unknown');
  });

  it('returns null for element without coordinates', () => {
    const element: OverpassElement = {
      type: 'relation',
      id: 123,
      tags: { name: 'Test' },
    };

    const mosque = transformElement(element, origin);
    expect(mosque).toBeNull();
  });

  it('handles element without tags', () => {
    const element: OverpassElement = {
      type: 'node',
      id: 123,
      lat: 51.51,
      lon: -0.11,
    };

    const mosque = transformElement(element, origin);
    expect(mosque).not.toBeNull();
    expect(mosque?.name).toBe('Unnamed Mosque');
  });
});

describe('deduplicateMosques', () => {
  it('removes duplicates at same location', () => {
    const mosques: Mosque[] = [
      {
        id: 'node/1',
        name: 'Mosque 1',
        location: { latitude: 51.5, longitude: -0.1 },
        distance: 1,
        tags: { name: 'Mosque 1' },
      },
      {
        id: 'way/2',
        name: 'Mosque 1',
        location: { latitude: 51.5, longitude: -0.1 },
        distance: 1,
        tags: { name: 'Mosque 1' },
      },
    ];

    const result = deduplicateMosques(mosques);
    expect(result).toHaveLength(1);
  });

  it('keeps mosque with more tags', () => {
    const mosques: Mosque[] = [
      {
        id: 'node/1',
        name: 'Mosque 1',
        location: { latitude: 51.5, longitude: -0.1 },
        distance: 1,
        tags: { name: 'Mosque 1' },
      },
      {
        id: 'way/2',
        name: 'Mosque 1 Full',
        location: { latitude: 51.5, longitude: -0.1 },
        distance: 1,
        tags: {
          name: 'Mosque 1 Full',
          phone: '+44 123',
          website: 'https://example.com',
        },
      },
    ];

    const result = deduplicateMosques(mosques);
    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe('Mosque 1 Full');
  });

  it('keeps first mosque when tag count is equal', () => {
    const mosques: Mosque[] = [
      {
        id: 'node/1',
        name: 'First',
        location: { latitude: 51.5, longitude: -0.1 },
        distance: 1,
        tags: { name: 'First' },
      },
      {
        id: 'way/2',
        name: 'Second',
        location: { latitude: 51.5, longitude: -0.1 },
        distance: 1,
        tags: { name: 'Second' },
      },
    ];

    const result = deduplicateMosques(mosques);
    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe('First');
  });

  it('keeps mosques at different locations', () => {
    const mosques: Mosque[] = [
      {
        id: 'node/1',
        name: 'Mosque 1',
        location: { latitude: 51.5, longitude: -0.1 },
        distance: 1,
      },
      {
        id: 'node/2',
        name: 'Mosque 2',
        location: { latitude: 51.6, longitude: -0.2 },
        distance: 2,
      },
    ];

    const result = deduplicateMosques(mosques);
    expect(result).toHaveLength(2);
  });

  it('handles mosques without tags', () => {
    const mosques: Mosque[] = [
      {
        id: 'node/1',
        name: 'Mosque 1',
        location: { latitude: 51.5, longitude: -0.1 },
        distance: 1,
      },
      {
        id: 'way/2',
        name: 'Mosque 2',
        location: { latitude: 51.5, longitude: -0.1 },
        distance: 1,
        tags: { name: 'Mosque 2' },
      },
    ];

    const result = deduplicateMosques(mosques);
    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe('Mosque 2'); // Has more tags
  });
});
