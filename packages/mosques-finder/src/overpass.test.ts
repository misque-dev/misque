import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  buildMosqueQuery,
  buildIdQuery,
  executeQuery,
  queryMosques,
  queryById,
  DEFAULT_OVERPASS_ENDPOINT,
  createError,
} from './overpass';

// Mock Overpass response
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
      },
    },
    {
      type: 'way' as const,
      id: 789012,
      center: { lat: 51.52, lon: -0.08 },
      tags: {
        name: 'London Central Mosque',
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

describe('buildMosqueQuery', () => {
  it('generates valid Overpass QL query', () => {
    const query = buildMosqueQuery(51.5074, -0.1278, 5000);

    expect(query).toContain('[out:json]');
    expect(query).toContain('[timeout:25]');
    expect(query).toContain('out center body');
  });

  it('includes correct coordinates and radius', () => {
    const query = buildMosqueQuery(51.5074, -0.1278, 5000);

    expect(query).toContain('around:5000,51.5074,-0.1278');
  });

  it('queries for place_of_worship with religion=muslim', () => {
    const query = buildMosqueQuery(51.5074, -0.1278, 5000);

    expect(query).toContain('["amenity"="place_of_worship"]["religion"="muslim"]');
  });

  it('queries for building=mosque as alternative', () => {
    const query = buildMosqueQuery(51.5074, -0.1278, 5000);

    expect(query).toContain('["building"="mosque"]');
  });

  it('queries nodes, ways, and relations', () => {
    const query = buildMosqueQuery(51.5074, -0.1278, 5000);

    expect(query).toContain('node[');
    expect(query).toContain('way[');
    expect(query).toContain('relation[');
  });
});

describe('buildIdQuery', () => {
  it('builds query for node ID', () => {
    const query = buildIdQuery('node/123456');

    expect(query).toContain('node(123456)');
    expect(query).toContain('out center body');
  });

  it('builds query for way ID', () => {
    const query = buildIdQuery('way/789012');

    expect(query).toContain('way(789012)');
  });

  it('builds query for relation ID', () => {
    const query = buildIdQuery('relation/345');

    expect(query).toContain('relation(345)');
  });

  it('throws error for invalid format', () => {
    expect(() => buildIdQuery('invalid')).toThrow();
    expect(() => buildIdQuery('123456')).toThrow();
    expect(() => buildIdQuery('foo/123')).toThrow();
  });
});

describe('createError', () => {
  it('creates error with code', () => {
    const error = createError('NETWORK_ERROR', 'Network failed');

    expect(error.code).toBe('NETWORK_ERROR');
    expect(error.message).toBe('Network failed');
    expect(error.name).toBe('MosqueFinderError');
  });

  it('includes optional statusCode', () => {
    const error = createError('RATE_LIMITED', 'Too many requests', 429);

    expect(error.statusCode).toBe(429);
  });

  it('includes optional retryAfter', () => {
    const error = createError('RATE_LIMITED', 'Too many requests', 429, 60);

    expect(error.retryAfter).toBe(60);
  });
});

describe('executeQuery', () => {
  it('returns parsed response on success', async () => {
    const result = await executeQuery('[out:json];node(1);out;');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.elements).toHaveLength(2);
    }
  });

  it('returns error on rate limiting (429)', async () => {
    server.use(
      http.post(DEFAULT_OVERPASS_ENDPOINT, () => {
        return new HttpResponse(null, {
          status: 429,
          headers: { 'Retry-After': '30' },
        });
      })
    );

    const result = await executeQuery('[out:json];node(1);out;');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('RATE_LIMITED');
      expect(result.error.statusCode).toBe(429);
      expect(result.error.retryAfter).toBe(30);
    }
  });

  it('returns error on server error (500)', async () => {
    server.use(
      http.post(DEFAULT_OVERPASS_ENDPOINT, () => {
        return new HttpResponse(null, { status: 500, statusText: 'Internal Server Error' });
      })
    );

    const result = await executeQuery('[out:json];node(1);out;');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('OVERPASS_ERROR');
      expect(result.error.statusCode).toBe(500);
    }
  });

  it('returns error on invalid JSON response', async () => {
    server.use(
      http.post(DEFAULT_OVERPASS_ENDPOINT, () => {
        return new HttpResponse('not json', { status: 200 });
      })
    );

    const result = await executeQuery('[out:json];node(1);out;');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('PARSE_ERROR');
    }
  });

  it('returns error on missing elements array', async () => {
    server.use(
      http.post(DEFAULT_OVERPASS_ENDPOINT, () => {
        return HttpResponse.json({ version: 0.6 });
      })
    );

    const result = await executeQuery('[out:json];node(1);out;');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('PARSE_ERROR');
    }
  });

  it('returns error on timeout', async () => {
    server.use(
      http.post(DEFAULT_OVERPASS_ENDPOINT, async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return HttpResponse.json(mockOverpassResponse);
      })
    );

    const result = await executeQuery('[out:json];node(1);out;', {
      timeout: 50,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('TIMEOUT');
    }
  });

  it('returns error on abort signal', async () => {
    const controller = new AbortController();

    server.use(
      http.post(DEFAULT_OVERPASS_ENDPOINT, async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json(mockOverpassResponse);
      })
    );

    // Abort immediately
    setTimeout(() => controller.abort(), 10);

    const result = await executeQuery('[out:json];node(1);out;', {
      signal: controller.signal,
      timeout: 5000,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('ABORTED');
    }
  });

  it('uses custom endpoint when provided', async () => {
    const customEndpoint = 'https://custom.overpass.test/api/interpreter';
    let requestedUrl = '';

    server.use(
      http.post(customEndpoint, ({ request }) => {
        requestedUrl = request.url;
        return HttpResponse.json(mockOverpassResponse);
      })
    );

    await executeQuery('[out:json];node(1);out;', {
      endpoint: customEndpoint,
    });

    expect(requestedUrl).toBe(customEndpoint);
  });
});

describe('queryMosques', () => {
  it('returns mosques near location', async () => {
    const result = await queryMosques(
      { latitude: 51.5074, longitude: -0.1278 },
      5000
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(2);
      expect(result.data[0]?.id).toBe(123456);
    }
  });

  it('passes options to executeQuery', async () => {
    const customEndpoint = 'https://custom.overpass.test/api/interpreter';

    server.use(
      http.post(customEndpoint, () => {
        return HttpResponse.json(mockOverpassResponse);
      })
    );

    const result = await queryMosques(
      { latitude: 51.5074, longitude: -0.1278 },
      5000,
      { endpoint: customEndpoint }
    );

    expect(result.success).toBe(true);
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

    const result = await queryMosques(
      { latitude: 0, longitude: 0 },
      1000
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(0);
    }
  });
});

describe('queryById', () => {
  it('returns single element by ID', async () => {
    server.use(
      http.post(DEFAULT_OVERPASS_ENDPOINT, () => {
        return HttpResponse.json({
          version: 0.6,
          generator: 'Overpass API',
          elements: [mockOverpassResponse.elements[0]],
        });
      })
    );

    const result = await queryById('node/123456');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data?.id).toBe(123456);
    }
  });

  it('returns null when element not found', async () => {
    server.use(
      http.post(DEFAULT_OVERPASS_ENDPOINT, () => {
        return HttpResponse.json({
          version: 0.6,
          generator: 'Overpass API',
          elements: [],
        });
      })
    );

    const result = await queryById('node/999999');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBeNull();
    }
  });

  it('returns error for invalid ID format', async () => {
    const result = await queryById('invalid-id');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('PARSE_ERROR');
    }
  });
});
