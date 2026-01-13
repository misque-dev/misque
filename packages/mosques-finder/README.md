# @misque/mosques-finder

Find nearby mosques using OpenStreetMap data. Works in both browser and Node.js environments.

## Installation

```bash
npm install @misque/mosques-finder
# or
yarn add @misque/mosques-finder
# or
pnpm add @misque/mosques-finder
```

## Features

- Find mosques near any location using coordinates
- Returns extended data: name (including Arabic), address, phone, website, prayer times, accessibility
- Built-in caching to reduce API calls
- Configurable search radius and result limits
- Full TypeScript support
- Works in browser and Node.js (uses fetch API)
- Uses OpenStreetMap data via Overpass API (free, no API key required)

## Quick Start

```typescript
import { findMosques } from '@misque/mosques-finder';

// Find mosques near a location
const result = await findMosques({
  latitude: 51.5074,
  longitude: -0.1278,
});

if (result.success) {
  console.log(`Found ${result.data.mosques.length} mosques`);
  result.data.mosques.forEach((mosque) => {
    console.log(`${mosque.name} - ${mosque.distance}km away`);
  });
}
```

## API Reference

### `findMosques(location, options?)`

Find nearby mosques from a given location.

```typescript
import { findMosques } from '@misque/mosques-finder';

const result = await findMosques(
  { latitude: 51.5074, longitude: -0.1278 },
  {
    radius: 5,      // Search radius in km (default: 5, max: 50)
    limit: 20,      // Maximum results (default: 20)
    timeout: 10000, // Request timeout in ms (default: 10000)
    useCache: true, // Use caching (default: true)
  }
);

if (result.success) {
  const { mosques, origin, radius, totalCount, fromCache } = result.data;
}
```

### `findNearestMosque(location, options?)`

Find the single nearest mosque.

```typescript
import { findNearestMosque } from '@misque/mosques-finder';

const result = await findNearestMosque({
  latitude: 40.7128,
  longitude: -74.006,
});

if (result.success && result.data) {
  console.log(`Nearest mosque: ${result.data.name}`);
  console.log(`Distance: ${result.data.distance}km`);
}
```

### `getMosqueById(osmId, options?)`

Get a specific mosque by its OpenStreetMap ID.

```typescript
import { getMosqueById } from '@misque/mosques-finder';

const result = await getMosqueById('node/123456789');

if (result.success && result.data) {
  console.log(result.data.name);
}
```

### `createMosqueFinder(config?)`

Create a finder instance with persistent configuration and shared cache.

```typescript
import { createMosqueFinder } from '@misque/mosques-finder';

const finder = createMosqueFinder({
  defaultRadius: 10,
  defaultLimit: 50,
  cacheOptions: {
    ttl: 600000, // 10 minutes
    maxEntries: 200,
  },
});

// Use the instance
const result = await finder.find({ latitude: 51.5074, longitude: -0.1278 });
const nearest = await finder.findNearest({ latitude: 51.5074, longitude: -0.1278 });
const mosque = await finder.getById('node/123456789');

// Cache management
console.log(finder.getCacheStats()); // { size, hits, misses }
finder.clearCache();
```

## Types

### `Mosque`

```typescript
interface Mosque {
  id: string;                    // OSM ID (e.g., "node/123456")
  name: string;                  // Mosque name
  nameAr?: string;               // Arabic name
  nameAlt?: string;              // Alternative name
  location: Coordinates;         // { latitude, longitude }
  distance: number;              // Distance from search origin (km)
  address?: MosqueAddress;       // Address details
  phone?: string;                // Contact phone
  website?: string;              // Website URL
  email?: string;                // Email address
  openingHours?: OpeningHours;   // Opening hours
  prayerTimes?: MosquePrayerTimes; // Prayer times if available
  wheelchair?: 'yes' | 'no' | 'limited' | 'unknown';
  tags?: Record<string, string>; // All OSM tags
}
```

### `MosqueAddress`

```typescript
interface MosqueAddress {
  street?: string;
  houseNumber?: string;
  city?: string;
  postcode?: string;
  country?: string;
  formatted?: string; // Full formatted address
}
```

### `FindMosquesOptions`

```typescript
interface FindMosquesOptions {
  radius?: number;           // km (default: 5, max: 50)
  limit?: number;            // default: 20
  timeout?: number;          // ms (default: 10000)
  useCache?: boolean;        // default: true
  overpassEndpoint?: string; // custom Overpass API endpoint
  signal?: AbortSignal;      // for request cancellation
}
```

### `FindMosquesResult`

```typescript
interface FindMosquesResult {
  mosques: Mosque[];     // Found mosques, sorted by distance
  origin: Coordinates;   // Search origin
  radius: number;        // Search radius used
  totalCount: number;    // Total found (before limit)
  fromCache: boolean;    // Whether result was cached
  timestamp: Date;       // Query timestamp
}
```

## Error Handling

All functions return a `Result` type that must be checked:

```typescript
const result = await findMosques({ latitude: 91, longitude: 0 }); // Invalid!

if (!result.success) {
  console.error(result.error.code);    // 'INVALID_COORDINATES'
  console.error(result.error.message); // 'Latitude must be between -90 and 90'
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `INVALID_COORDINATES` | Invalid latitude or longitude |
| `NETWORK_ERROR` | Network request failed |
| `TIMEOUT` | Request timed out |
| `RATE_LIMITED` | API rate limit exceeded |
| `PARSE_ERROR` | Failed to parse response |
| `OVERPASS_ERROR` | Overpass API error |
| `ABORTED` | Request was cancelled |

## Request Cancellation

Cancel requests using `AbortController`:

```typescript
const controller = new AbortController();

// Cancel after 5 seconds
setTimeout(() => controller.abort(), 5000);

const result = await findMosques(
  { latitude: 51.5074, longitude: -0.1278 },
  { signal: controller.signal }
);

if (!result.success && result.error.code === 'ABORTED') {
  console.log('Request was cancelled');
}
```

## Data Source

This package uses [OpenStreetMap](https://www.openstreetmap.org/) data via the [Overpass API](https://overpass-api.de/). The data is contributed by volunteers worldwide and is free to use.

Mosques are identified by:
- `amenity=place_of_worship` + `religion=muslim`
- `building=mosque`

## Related Packages

- [@misque/core](https://www.npmjs.com/package/@misque/core) - Shared utilities
- [@misque/prayer-times](https://www.npmjs.com/package/@misque/prayer-times) - Prayer time calculations
- [@misque/qibla](https://www.npmjs.com/package/@misque/qibla) - Qibla direction
- [@misque/hijri](https://www.npmjs.com/package/@misque/hijri) - Hijri calendar

## License

MIT
