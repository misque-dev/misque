# @misque/core

Core utilities and shared types for the Misque Islamic library ecosystem.

## Installation

```bash
npm install @misque/core
# or
yarn add @misque/core
# or
pnpm add @misque/core
```

## Features

- Zero dependencies
- Full TypeScript support with comprehensive type definitions
- Tree-shakeable ESM and CommonJS builds
- Geographic coordinate utilities (distance, validation)
- Julian Day conversions for calendar calculations
- Angular math helpers (radians, degrees, normalization)
- Islamic constants (Kaaba coordinates, month names, prayer names)
- Result type for type-safe error handling

## Quick Start

```typescript
import {
  calculateDistance,
  toRadians,
  toDegrees,
  normalizeAngle,
  toJulianDay,
  fromJulianDay,
  KAABA_COORDINATES,
  ISLAMIC_MONTHS,
} from '@misque/core';

// Calculate distance between two locations (in kilometers)
const london = { latitude: 51.5074, longitude: -0.1278 };
const mecca = KAABA_COORDINATES;
const distance = calculateDistance(london, mecca);
console.log(`Distance to Mecca: ${distance.toFixed(0)} km`); // ~4,566 km

// Convert angles
const radians = toRadians(180); // 3.14159...
const degrees = toDegrees(Math.PI); // 180

// Normalize angle to 0-360 range
const normalized = normalizeAngle(-90); // 270
const normalized2 = normalizeAngle(450); // 90

// Julian Day conversions
const jd = toJulianDay(new Date('2024-01-01'));
const date = fromJulianDay(jd);
```

## API Reference

### Types

#### `Coordinates`

Geographic coordinates.

```typescript
interface Coordinates {
  latitude: number; // -90 to 90
  longitude: number; // -180 to 180
}
```

#### `Location`

Extended location with optional elevation and timezone.

```typescript
interface Location extends Coordinates {
  elevation?: number;
  timezone?: string;
}
```

#### `DateComponents`

Date components for calendar operations.

```typescript
interface DateComponents {
  year: number;
  month: number;
  day: number;
}
```

#### `TimeComponents`

Time components.

```typescript
interface TimeComponents {
  hours: number;
  minutes: number;
  seconds?: number;
}
```

#### `Result<T, E>`

Type-safe result wrapper for operations that can fail.

```typescript
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

// Usage
function divide(a: number, b: number): Result<number> {
  if (b === 0) {
    return { success: false, error: new Error('Division by zero') };
  }
  return { success: true, data: a / b };
}

const result = divide(10, 2);
if (result.success) {
  console.log(result.data); // 5
}
```

#### `LanguageCode`

Supported language codes.

```typescript
type LanguageCode = 'ar' | 'en' | 'fr' | 'id' | 'ms' | 'tr' | 'ur';
```

#### `TextDirection`

Text rendering direction.

```typescript
type TextDirection = 'ltr' | 'rtl';
```

### Utility Functions

#### `toRadians(degrees: number): number`

Convert degrees to radians.

```typescript
toRadians(180); // 3.141592653589793
toRadians(90); // 1.5707963267948966
```

#### `toDegrees(radians: number): number`

Convert radians to degrees.

```typescript
toDegrees(Math.PI); // 180
toDegrees(Math.PI / 2); // 90
```

#### `normalizeAngle(angle: number): number`

Normalize an angle to the 0-360 degree range.

```typescript
normalizeAngle(450); // 90
normalizeAngle(-90); // 270
normalizeAngle(360); // 0
```

#### `calculateDistance(from: Coordinates, to: Coordinates): number`

Calculate the distance between two coordinates using the Haversine formula. Returns distance in kilometers.

```typescript
const london = { latitude: 51.5074, longitude: -0.1278 };
const paris = { latitude: 48.8566, longitude: 2.3522 };
const distance = calculateDistance(london, paris);
console.log(`${distance.toFixed(1)} km`); // 343.5 km
```

#### `validateCoordinates(coords: Coordinates): Result<Coordinates>`

Validate that coordinates are within valid ranges.

```typescript
const valid = validateCoordinates({ latitude: 51.5, longitude: -0.1 });
// { success: true, data: { latitude: 51.5, longitude: -0.1 } }

const invalid = validateCoordinates({ latitude: 100, longitude: 0 });
// { success: false, error: Error('Latitude must be between -90 and 90 degrees') }
```

#### `formatTime(hours: number, minutes: number): string`

Format time as HH:MM string.

```typescript
formatTime(14, 30); // "14:30"
formatTime(9, 5); // "09:05"
```

#### `toJulianDay(date: Date): number`

Convert a JavaScript Date to Julian Day Number.

```typescript
toJulianDay(new Date('2024-01-01')); // 2460310
```

#### `fromJulianDay(jd: number): Date`

Convert a Julian Day Number to JavaScript Date.

```typescript
fromJulianDay(2460310); // Date for 2024-01-01
```

### Constants

#### `KAABA_COORDINATES`

The geographic coordinates of the Kaaba in Mecca, Saudi Arabia.

```typescript
const KAABA_COORDINATES: Coordinates = {
  latitude: 21.4225,
  longitude: 39.8262,
};
```

#### `ISLAMIC_MONTHS`

Names of the 12 Islamic (Hijri) months in English.

```typescript
const ISLAMIC_MONTHS = [
  'Muharram',
  'Safar',
  'Rabi al-Awwal',
  'Rabi al-Thani',
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  'Shaban',
  'Ramadan',
  'Shawwal',
  'Dhul Qadah',
  'Dhul Hijjah',
] as const;
```

#### `ISLAMIC_MONTHS_AR`

Names of the 12 Islamic months in Arabic.

```typescript
const ISLAMIC_MONTHS_AR = [
  'محرم',
  'صفر',
  'ربيع الأول',
  'ربيع الثاني',
  'جمادى الأولى',
  'جمادى الآخرة',
  'رجب',
  'شعبان',
  'رمضان',
  'شوال',
  'ذو القعدة',
  'ذو الحجة',
] as const;
```

#### `PRAYER_NAMES`

Names of the five daily prayers plus sunrise.

```typescript
const PRAYER_NAMES = [
  'Fajr',
  'Sunrise',
  'Dhuhr',
  'Asr',
  'Maghrib',
  'Isha',
] as const;
```

#### `PRAYER_NAMES_AR`

Prayer names in Arabic.

```typescript
const PRAYER_NAMES_AR = [
  'الفجر',
  'الشروق',
  'الظهر',
  'العصر',
  'المغرب',
  'العشاء',
] as const;
```

#### `DAYS_OF_WEEK_AR`

Days of the week in Arabic (starting with Sunday).

```typescript
const DAYS_OF_WEEK_AR = [
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
] as const;
```

### Type Aliases

#### `IslamicMonth`

Type for Islamic month names.

```typescript
type IslamicMonth = (typeof ISLAMIC_MONTHS)[number];
// 'Muharram' | 'Safar' | 'Rabi al-Awwal' | ...
```

#### `PrayerName`

Type for prayer names.

```typescript
type PrayerName = (typeof PRAYER_NAMES)[number];
// 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha'
```

## TypeScript Support

This package is written in TypeScript and includes complete type definitions. All exports are fully typed.

```typescript
import type {
  Coordinates,
  Location,
  DateComponents,
  TimeComponents,
  Result,
  AsyncResult,
  LanguageCode,
  TextDirection,
  IslamicMonth,
  PrayerName,
} from '@misque/core';
```

## Related Packages

- [@misque/quran](https://www.npmjs.com/package/@misque/quran) - Quran text and audio APIs
- [@misque/prayer-times](https://www.npmjs.com/package/@misque/prayer-times) - Prayer time calculations
- [@misque/hijri](https://www.npmjs.com/package/@misque/hijri) - Hijri calendar conversion
- [@misque/qibla](https://www.npmjs.com/package/@misque/qibla) - Qibla direction calculator

## License

MIT
