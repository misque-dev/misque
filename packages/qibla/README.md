# @misque/qibla

Calculate the Qibla direction (direction of the Kaaba in Mecca) from any location on Earth. Includes support for device orientation sensors for compass applications.

## Installation

```bash
npm install @misque/qibla
# or
yarn add @misque/qibla
# or
pnpm add @misque/qibla
```

## Features

- Accurate Qibla direction calculation using the great circle formula
- Distance to Kaaba calculation using the Haversine formula
- Compass direction labels (N, NE, E, SE, S, SW, W, NW, and 16-point variants)
- Device orientation support for mobile compass applications
- Magnetic declination adjustment support
- Alignment detection and turn direction guidance
- Full TypeScript support
- Zero external runtime dependencies
- Tree-shakeable ESM and CommonJS builds
- Works in Node.js, browsers, React, React Native, and Edge runtimes

## Quick Start

```typescript
import { calculateQibla, formatQiblaBearing } from '@misque/qibla';

// Calculate Qibla from New York City
const result = calculateQibla({
  latitude: 40.7128,
  longitude: -74.006,
});

if (result.success) {
  console.log(`Qibla bearing: ${result.data.bearing}°`);
  // "Qibla bearing: 58.48°"

  console.log(`Direction: ${result.data.compassDirection}`);
  // "Direction: ENE"

  console.log(`Distance to Kaaba: ${result.data.distance} km`);
  // "Distance to Kaaba: 9513.2 km"

  console.log(formatQiblaBearing(result.data.bearing));
  // "58° (ENE)"
}
```

### Using the Compass Class

```typescript
import { QiblaCompass } from '@misque/qibla';

// Create a compass for a location
const compass = new QiblaCompass({
  latitude: 51.5074,
  longitude: -0.1278,
});

// Get the Qibla bearing
console.log(`Qibla: ${compass.getBearingFormatted()}`);
// "Qibla: 118.9°"

console.log(`Direction: ${compass.getCardinalDirection()}`);
// "Direction: SE"

console.log(`Distance: ${compass.getDistance()} km`);
// "Distance: 4566.2 km"
```

## API Reference

### Core Functions

#### `calculateQibla(location: Coordinates, options?: QiblaOptions): Result<QiblaDirection>`

Calculate the Qibla direction from a given location.

```typescript
import { calculateQibla } from '@misque/qibla';

const result = calculateQibla({
  latitude: 40.7128,
  longitude: -74.006,
});

if (result.success) {
  const { bearing, distance, compassDirection } = result.data;
  console.log(`Face ${bearing}° (${compassDirection}), ${distance} km to Mecca`);
}
```

With magnetic declination adjustment:

```typescript
const result = calculateQibla(
  { latitude: 40.7128, longitude: -74.006 },
  { magneticDeclination: -13 } // New York's approximate declination
);
```

#### `bearingToCompassDirection(bearing: number): CompassDirection`

Convert a bearing angle to a 16-point compass direction.

```typescript
import { bearingToCompassDirection } from '@misque/qibla';

bearingToCompassDirection(0); // 'N'
bearingToCompassDirection(45); // 'NE'
bearingToCompassDirection(90); // 'E'
bearingToCompassDirection(135); // 'SE'
bearingToCompassDirection(180); // 'S'
bearingToCompassDirection(225); // 'SW'
bearingToCompassDirection(270); // 'W'
bearingToCompassDirection(315); // 'NW'
bearingToCompassDirection(22.5); // 'NNE'
bearingToCompassDirection(67.5); // 'ENE'
```

#### `getKaabaCoordinates(): Coordinates`

Get the geographic coordinates of the Kaaba.

```typescript
import { getKaabaCoordinates } from '@misque/qibla';

const kaaba = getKaabaCoordinates();
// { latitude: 21.4225, longitude: 39.8262 }
```

#### `isAtKaaba(location: Coordinates, thresholdKm?: number): boolean`

Check if a location is at or very near the Kaaba.

```typescript
import { isAtKaaba } from '@misque/qibla';

isAtKaaba({ latitude: 21.4225, longitude: 39.8262 }); // true
isAtKaaba({ latitude: 21.4225, longitude: 39.8262 }, 0.01); // true (10m threshold)
isAtKaaba({ latitude: 21.43, longitude: 39.83 }); // true (within 100m default)
isAtKaaba({ latitude: 40.7128, longitude: -74.006 }); // false
```

#### `formatQiblaBearing(bearing: number, includeDirection?: boolean): string`

Format a bearing angle as a human-readable string.

```typescript
import { formatQiblaBearing } from '@misque/qibla';

formatQiblaBearing(118.5); // "119° (ESE)"
formatQiblaBearing(118.5, false); // "119°"
formatQiblaBearing(45); // "45° (NE)"
```

### QiblaCompass Class

A class for compass applications with device orientation support.

#### Constructor

```typescript
import { QiblaCompass } from '@misque/qibla';

const compass = new QiblaCompass(
  { latitude: 40.7128, longitude: -74.006 },
  {
    useTrueNorth: false, // Use magnetic north by default
    alignmentThreshold: 5, // Degrees tolerance for alignment
    onOrientationChange: (viz) => {
      // Called when device orientation changes
      console.log(viz.turnDirection);
    },
  }
);
```

#### Methods

```typescript
// Get the Qibla bearing in degrees (0-360)
compass.getBearing(): number

// Get the bearing as a formatted string
compass.getBearingFormatted(precision?: number): string

// Get the cardinal direction (N, NE, E, SE, S, SW, W, NW)
compass.getCardinalDirection(): string

// Get compass visualization data
compass.getVisualization(deviceHeading?: number | null): CompassVisualization

// Get distance to Kaaba in kilometers
compass.getDistance(): number

// Update the location
compass.updateCoordinates(coordinates: Coordinates): void

// Get current device orientation (if tracking)
compass.getCurrentOrientation(): DeviceOrientation | null
```

#### Device Orientation Methods (Browser Only)

```typescript
// Check if device orientation is supported
QiblaCompass.isOrientationSupported(): boolean

// Request permission for device orientation (iOS 13+)
await QiblaCompass.requestOrientationPermission(): Promise<PermissionState>

// Start tracking device orientation
await compass.startOrientationTracking(options?: QiblaCompassOptions): Promise<void>

// Stop tracking
compass.stopOrientationTracking(): void

// Get helper text for UI
QiblaCompass.getHelperText(visualization: CompassVisualization): string

// Calculate angle difference between two bearings
QiblaCompass.calculateAngleDifference(bearing1: number, bearing2: number): number
```

#### Factory Function

```typescript
import { createQiblaCompass } from '@misque/qibla';

const compass = createQiblaCompass(
  { latitude: 40.7128, longitude: -74.006 },
  { alignmentThreshold: 3 }
);
```

### Types

#### `Coordinates`

```typescript
interface Coordinates {
  latitude: number; // -90 to 90
  longitude: number; // -180 to 180
}
```

#### `QiblaDirection`

```typescript
interface QiblaDirection {
  bearing: number; // 0-360 degrees from true north
  distance: number; // Kilometers to Kaaba
  compassDirection: CompassDirection;
}
```

#### `CompassDirection`

16-point compass directions.

```typescript
type CompassDirection =
  | 'N'
  | 'NNE'
  | 'NE'
  | 'ENE'
  | 'E'
  | 'ESE'
  | 'SE'
  | 'SSE'
  | 'S'
  | 'SSW'
  | 'SW'
  | 'WSW'
  | 'W'
  | 'WNW'
  | 'NW'
  | 'NNW';
```

#### `QiblaOptions`

```typescript
interface QiblaOptions {
  magneticDeclination?: number; // Degrees to adjust for magnetic north
}
```

#### `CompassVisualization`

```typescript
interface CompassVisualization {
  qiblaBearing: number; // Qibla bearing from North (0-360)
  deviceHeading: number | null; // Current device heading
  angleDifference: number | null; // Difference between heading and Qibla
  turnDirection: 'left' | 'right' | 'aligned' | null;
  alignmentDistance: number | null; // Degrees to turn (0-180)
}
```

#### `DeviceOrientation`

```typescript
interface DeviceOrientation {
  heading: number | null; // Degrees from magnetic north
  trueHeading: number | null; // Degrees from true north
  alpha: number | null; // Device rotation around z-axis
  beta: number | null; // Device rotation around x-axis
  gamma: number | null; // Device rotation around y-axis
}
```

#### `QiblaCompassOptions`

```typescript
interface QiblaCompassOptions {
  useTrueNorth?: boolean; // Default: false
  onOrientationChange?: (visualization: CompassVisualization) => void;
  alignmentThreshold?: number; // Degrees tolerance (default: 5)
}
```

## Examples

### Simple Qibla Lookup

```typescript
import { calculateQibla } from '@misque/qibla';

const cities = [
  { name: 'London', lat: 51.5074, lon: -0.1278 },
  { name: 'New York', lat: 40.7128, lon: -74.006 },
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
  { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
];

cities.forEach(({ name, lat, lon }) => {
  const result = calculateQibla({ latitude: lat, longitude: lon });
  if (result.success) {
    console.log(
      `${name}: ${result.data.bearing.toFixed(1)}° (${result.data.compassDirection})`
    );
  }
});

// London: 118.99° (ESE)
// New York: 58.48° (ENE)
// Tokyo: 293.02° (WNW)
// Sydney: 277.50° (W)
```

### Building a Mobile Compass App

```typescript
import { QiblaCompass } from '@misque/qibla';

async function initQiblaCompass() {
  // Get user's location
  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });

  const compass = new QiblaCompass({
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  });

  // Check if device orientation is supported
  if (!QiblaCompass.isOrientationSupported()) {
    // Fallback: just show the bearing
    console.log(`Qibla is ${compass.getBearingFormatted()} from North`);
    return;
  }

  // Start tracking orientation
  try {
    await compass.startOrientationTracking({
      alignmentThreshold: 3,
      onOrientationChange: (viz) => {
        const helperText = QiblaCompass.getHelperText(viz);
        updateUI(helperText, viz);
      },
    });
  } catch (error) {
    console.error('Failed to start orientation tracking:', error);
  }
}

function updateUI(text: string, viz: CompassVisualization) {
  document.getElementById('helper-text')!.textContent = text;
  document.getElementById('compass')!.style.transform = `rotate(${viz.qiblaBearing - (viz.deviceHeading ?? 0)}deg)`;

  if (viz.turnDirection === 'aligned') {
    document.body.classList.add('aligned');
    // Maybe vibrate to indicate alignment
    navigator.vibrate?.(200);
  } else {
    document.body.classList.remove('aligned');
  }
}
```

### React Component Example

```typescript
import { useState, useEffect } from 'react';
import { QiblaCompass, type CompassVisualization } from '@misque/qibla';

function QiblaCompassComponent({ latitude, longitude }: { latitude: number; longitude: number }) {
  const [compass] = useState(() => new QiblaCompass({ latitude, longitude }));
  const [visualization, setVisualization] = useState<CompassVisualization | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    compass.updateCoordinates({ latitude, longitude });
  }, [compass, latitude, longitude]);

  useEffect(() => {
    if (!QiblaCompass.isOrientationSupported()) {
      setError('Device orientation not supported');
      return;
    }

    compass
      .startOrientationTracking({
        onOrientationChange: setVisualization,
      })
      .catch((err) => setError(err.message));

    return () => compass.stopOrientationTracking();
  }, [compass]);

  if (error) {
    return (
      <div>
        <p>{error}</p>
        <p>Qibla is {compass.getBearingFormatted()} from North</p>
      </div>
    );
  }

  if (!visualization) {
    return <p>Loading compass...</p>;
  }

  return (
    <div>
      <div
        style={{
          transform: `rotate(${visualization.qiblaBearing - (visualization.deviceHeading ?? 0)}deg)`,
        }}
      >
        {/* Compass arrow pointing to Qibla */}
        <span role="img" aria-label="arrow">
          ^
        </span>
      </div>
      <p>{QiblaCompass.getHelperText(visualization)}</p>
      <p>Distance: {compass.getDistance().toFixed(0)} km</p>
    </div>
  );
}
```

### Using with Magnetic Declination

Magnetic declination (the difference between magnetic north and true north) varies by location. For precise compass readings, you may want to adjust for this:

```typescript
import { calculateQibla } from '@misque/qibla';

// Get declination from a service like NOAA's World Magnetic Model
const declination = -13; // Example: New York is about -13°

const result = calculateQibla(
  { latitude: 40.7128, longitude: -74.006 },
  { magneticDeclination: declination }
);

if (result.success) {
  console.log(`Magnetic bearing to Qibla: ${result.data.bearing}°`);
}
```

## TypeScript Support

This package is written in TypeScript and includes complete type definitions.

```typescript
import type {
  QiblaDirection,
  QiblaOptions,
  CompassDirection,
  LocationWithQibla,
  DeviceOrientation,
  CompassVisualization,
  QiblaCompassOptions,
} from '@misque/qibla';
```

## Related Packages

- [@misque/core](https://www.npmjs.com/package/@misque/core) - Core utilities and types
- [@misque/quran](https://www.npmjs.com/package/@misque/quran) - Quran text and audio APIs
- [@misque/prayer-times](https://www.npmjs.com/package/@misque/prayer-times) - Prayer time calculations
- [@misque/hijri](https://www.npmjs.com/package/@misque/hijri) - Hijri calendar conversion

## License

MIT
