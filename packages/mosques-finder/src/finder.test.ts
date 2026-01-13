import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { findMosques, findNearestMosque, getMosqueById, createMosqueFinder } from './finder';
import { DEFAULT_OVERPASS_ENDPOINT } from './overpass';
import { MosqueCache } from './cache';
import type { FindMosquesResult } from './types';

// Mock Overpass response with multiple mosques
const mockOverpassResponse = {
  version: 0.6,
  generator: 'Overpass API',
  elements: [
    {
      type: 'node' as const,
      id: 123456,
      lat: 51.5155,
      lon: -0.0723,
      tags: {
        name: 'East London Mosque',
        'name:ar': 'مسجد شرق لندن',
        amenity: 'place_of_worship',
        religion: 'muslim',
        phone: '+44 20 7650 3000',
        website: 'https://eastlondonmosque.org.uk',
        'addr:street': 'Whitechapel Road',
        'addr:city': 'London',
        'addr:postcode': 'E1 1JX',
        wheelchair: 'yes',
      },
    },
    {
      type: 'way' as const,
      id: 789012,
      center: { lat: 51.5473, lon: -0.1458 },
      tags: {
        name: 'London Central Mosque',
        'name:ar': 'المسجد المركزي في لندن',
        amenity: 'place_of_worship',
        religion: 'muslim',
        website: 'https://iccuk.org',
      },
    },
    {
      type: 'node' as const,
      id: 345678,
      lat: 51.52,
      lon: -0.08,
      tags: {
        name: 'Small Mosque',
        amenity: 'place_of_worship',
        religion: 'muslim',
      },
    },
  ],
};

const server = setupServer(
  http.post(DEFAULT_OVERPASS_ENDPOINT, () => {
    return HttpResponse.json(mockOverpassResponse);
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('findMosques', () => {
  it('returns mosques sorted by distance', async () => {
    const result = await findMosques({ latitude: 51.5074, longitude: -0.1278 });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mosques.length).toBeGreaterThan(0);
      // Verify sorted by distance
      const distances = result.data.mosques.map((m) => m.distance);
      expect(distances).toEqual([...distances].sort((a, b) => a - b));
    }
  });

  it('returns correct mosque data', async () => {
    const result = await findMosques({ latitude: 51.5074, longitude: -0.1278 });

    expect(result.success).toBe(true);
    if (result.success) {
      const mosque = result.data.mosques.find((m) => m.name === 'East London Mosque');
      expect(mosque).toBeDefined();
      expect(mosque?.nameAr).toBe('مسجد شرق لندن');
      expect(mosque?.phone).toBe('+44 20 7650 3000');
      expect(mosque?.website).toBe('https://eastlondonmosque.org.uk');
      expect(mosque?.address?.street).toBe('Whitechapel Road');
      expect(mosque?.wheelchair).toBe('yes');
    }
  });

  it('respects radius option', async () => {
    const result = await findMosques(
      { latitude: 51.5074, longitude: -0.1278 },
      { radius: 2 }
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.radius).toBe(2);
    }
  });

  it('respects limit option', async () => {
    const result = await findMosques(
      { latitude: 51.5074, longitude: -0.1278 },
      { limit: 1 }
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mosques).toHaveLength(1);
      expect(result.data.totalCount).toBeGreaterThanOrEqual(1);
    }
  });

  it('caps radius at maximum', async () => {
    const result = await findMosques(
      { latitude: 51.5074, longitude: -0.1278 },
      { radius: 100 }
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.radius).toBe(50); // MAX_RADIUS
    }
  });

  it('returns error for invalid coordinates', async () => {
    const result = await findMosques({ latitude: 91, longitude: 0 });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('INVALID_COORDINATES');
    }
  });

  it('returns error for invalid longitude', async () => {
    const result = await findMosques({ latitude: 0, longitude: 181 });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('INVALID_COORDINATES');
    }
  });

  it('returns empty array when no mosques found', async () => {
    server.use(
      http.post(DEFAULT_OVERPASS_ENDPOINT, () => {
        return HttpResponse.json({
          version: 0.6,
          generator: 'Overpass API',
          elements: [],
        });
      })
    );

    const result = await findMosques({ latitude: 0, longitude: 0 });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mosques).toHaveLength(0);
      expect(result.data.totalCount).toBe(0);
    }
  });

  it('uses cache when enabled', async () => {
    const cache = new MosqueCache<FindMosquesResult>();
    let requestCount = 0;

    server.use(
      http.post(DEFAULT_OVERPASS_ENDPOINT, () => {
        requestCount++;
        return HttpResponse.json(mockOverpassResponse);
      })
    );

    // First request
    await findMosques(
      { latitude: 51.5074, longitude: -0.1278 },
      { useCache: true },
      cache
    );

    // Second request (should use cache)
    const result = await findMosques(
      { latitude: 51.5074, longitude: -0.1278 },
      { useCache: true },
      cache
    );

    expect(requestCount).toBe(1);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.fromCache).toBe(true);
    }
  });

  it('bypasses cache when disabled', async () => {
    const cache = new MosqueCache<FindMosquesResult>();
    let requestCount = 0;

    server.use(
      http.post(DEFAULT_OVERPASS_ENDPOINT, () => {
        requestCount++;
        return HttpResponse.json(mockOverpassResponse);
      })
    );

    await findMosques(
      { latitude: 51.5074, longitude: -0.1278 },
      { useCache: false },
      cache
    );

    await findMosques(
      { latitude: 51.5074, longitude: -0.1278 },
      { useCache: false },
      cache
    );

    expect(requestCount).toBe(2);
  });

  it('handles timeout gracefully', async () => {
    server.use(
      http.post(DEFAULT_OVERPASS_ENDPOINT, async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return HttpResponse.json(mockOverpassResponse);
      })
    );

    const result = await findMosques(
      { latitude: 51.5074, longitude: -0.1278 },
      { timeout: 50 }
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('TIMEOUT');
    }
  });

  it('handles abort signal', async () => {
    const controller = new AbortController();

    server.use(
      http.post(DEFAULT_OVERPASS_ENDPOINT, async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json(mockOverpassResponse);
      })
    );

    setTimeout(() => controller.abort(), 10);

    const result = await findMosques(
      { latitude: 51.5074, longitude: -0.1278 },
      { signal: controller.signal, timeout: 5000 }
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('ABORTED');
    }
  });

  it('includes result metadata', async () => {
    const result = await findMosques(
      { latitude: 51.5074, longitude: -0.1278 },
      { radius: 5 }
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.origin).toEqual({ latitude: 51.5074, longitude: -0.1278 });
      expect(result.data.radius).toBe(5);
      expect(result.data.timestamp).toBeInstanceOf(Date);
      expect(typeof result.data.totalCount).toBe('number');
    }
  });
});

describe('findNearestMosque', () => {
  it('returns single nearest mosque', async () => {
    const result = await findNearestMosque({ latitude: 51.5074, longitude: -0.1278 });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toBeNull();
      expect(result.data?.name).toBeDefined();
      expect(typeof result.data?.distance).toBe('number');
    }
  });

  it('returns null when no mosques found', async () => {
    server.use(
      http.post(DEFAULT_OVERPASS_ENDPOINT, () => {
        return HttpResponse.json({
          version: 0.6,
          generator: 'Overpass API',
          elements: [],
        });
      })
    );

    const result = await findNearestMosque({ latitude: 0, longitude: 0 });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBeNull();
    }
  });

  it('returns error for invalid coordinates', async () => {
    const result = await findNearestMosque({ latitude: 91, longitude: 0 });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('INVALID_COORDINATES');
    }
  });
});

describe('getMosqueById', () => {
  it('returns mosque by ID', async () => {
    server.use(
      http.post(DEFAULT_OVERPASS_ENDPOINT, () => {
        return HttpResponse.json({
          version: 0.6,
          generator: 'Overpass API',
          elements: [mockOverpassResponse.elements[0]],
        });
      })
    );

    const result = await getMosqueById('node/123456');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toBeNull();
      expect(result.data?.name).toBe('East London Mosque');
    }
  });

  it('returns null when not found', async () => {
    server.use(
      http.post(DEFAULT_OVERPASS_ENDPOINT, () => {
        return HttpResponse.json({
          version: 0.6,
          generator: 'Overpass API',
          elements: [],
        });
      })
    );

    const result = await getMosqueById('node/999999');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBeNull();
    }
  });

  it('returns error for invalid ID format', async () => {
    const result = await getMosqueById('invalid');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('PARSE_ERROR');
    }
  });
});

describe('createMosqueFinder', () => {
  it('creates instance with default config', async () => {
    const finder = createMosqueFinder();

    const result = await finder.find({ latitude: 51.5074, longitude: -0.1278 });

    expect(result.success).toBe(true);
  });

  it('uses custom default radius', async () => {
    const finder = createMosqueFinder({ defaultRadius: 10 });

    const result = await finder.find({ latitude: 51.5074, longitude: -0.1278 });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.radius).toBe(10);
    }
  });

  it('shares cache across calls', async () => {
    const finder = createMosqueFinder();
    let requestCount = 0;

    server.use(
      http.post(DEFAULT_OVERPASS_ENDPOINT, () => {
        requestCount++;
        return HttpResponse.json(mockOverpassResponse);
      })
    );

    await finder.find({ latitude: 51.5074, longitude: -0.1278 });
    await finder.find({ latitude: 51.5074, longitude: -0.1278 });

    expect(requestCount).toBe(1);
  });

  it('clearCache removes all entries', async () => {
    const finder = createMosqueFinder();
    let requestCount = 0;

    server.use(
      http.post(DEFAULT_OVERPASS_ENDPOINT, () => {
        requestCount++;
        return HttpResponse.json(mockOverpassResponse);
      })
    );

    await finder.find({ latitude: 51.5074, longitude: -0.1278 });
    finder.clearCache();
    await finder.find({ latitude: 51.5074, longitude: -0.1278 });

    expect(requestCount).toBe(2);
  });

  it('getCacheStats returns statistics', async () => {
    const finder = createMosqueFinder();

    await finder.find({ latitude: 51.5074, longitude: -0.1278 });
    await finder.find({ latitude: 51.5074, longitude: -0.1278 }); // cache hit

    const stats = finder.getCacheStats();

    expect(stats.size).toBe(1);
    expect(stats.hits).toBe(1);
  });

  it('findNearest uses shared cache', async () => {
    const finder = createMosqueFinder();
    let requestCount = 0;

    server.use(
      http.post(DEFAULT_OVERPASS_ENDPOINT, () => {
        requestCount++;
        return HttpResponse.json(mockOverpassResponse);
      })
    );

    await finder.find({ latitude: 51.5074, longitude: -0.1278 });
    await finder.findNearest({ latitude: 51.5074, longitude: -0.1278 });

    // Both should use same cache key
    expect(requestCount).toBe(1);
  });

  it('getById works through instance', async () => {
    server.use(
      http.post(DEFAULT_OVERPASS_ENDPOINT, () => {
        return HttpResponse.json({
          version: 0.6,
          generator: 'Overpass API',
          elements: [mockOverpassResponse.elements[0]],
        });
      })
    );

    const finder = createMosqueFinder();
    const result = await finder.getById('node/123456');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data?.name).toBe('East London Mosque');
    }
  });

  it('uses custom cache TTL', async () => {
    vi.useFakeTimers();

    const finder = createMosqueFinder({
      cacheOptions: { ttl: 1000 },
    });
    let requestCount = 0;

    server.use(
      http.post(DEFAULT_OVERPASS_ENDPOINT, () => {
        requestCount++;
        return HttpResponse.json(mockOverpassResponse);
      })
    );

    await finder.find({ latitude: 51.5074, longitude: -0.1278 });

    vi.advanceTimersByTime(1001);

    await finder.find({ latitude: 51.5074, longitude: -0.1278 });

    expect(requestCount).toBe(2);

    vi.useRealTimers();
  });
});
