# @misque/prayer-times

Accurate Islamic prayer time calculations for any location worldwide. Supports multiple calculation methods used by different Islamic organizations and handles high latitude adjustments.

## Installation

```bash
npm install @misque/prayer-times
# or
yarn add @misque/prayer-times
# or
pnpm add @misque/prayer-times
```

## Features

- Accurate prayer time calculations based on astronomical algorithms
- Support for 14 calculation methods (MWL, ISNA, Egypt, Makkah, and more)
- High latitude adjustment methods (Night Middle, One-Seventh, Angle-Based)
- Hanafi and Standard Asr calculation
- Sunnah times calculation (Middle of Night, Last Third of Night)
- Manual adjustments for fine-tuning
- Current prayer and time-until-next utilities
- Full TypeScript support
- Zero external runtime dependencies
- Tree-shakeable ESM and CommonJS builds

## Quick Start

```typescript
import {
  calculatePrayerTimes,
  getDefaultParams,
  getMethod,
  formatPrayerTimes,
  getCurrentPrayer,
} from '@misque/prayer-times';

// Define your location
const location = {
  latitude: 51.5074,
  longitude: -0.1278,
  timezone: 'Europe/London',
};

// Get default calculation parameters
const params = getDefaultParams();

// Calculate prayer times for today
const result = calculatePrayerTimes(new Date(), location, params);

if (result.success) {
  const times = result.data;

  // Get formatted times
  const formatted = formatPrayerTimes(times);
  console.log(`Fajr: ${formatted.fajr}`); // "05:30"
  console.log(`Dhuhr: ${formatted.dhuhr}`); // "12:15"
  console.log(`Asr: ${formatted.asr}`); // "15:45"
  console.log(`Maghrib: ${formatted.maghrib}`); // "18:30"
  console.log(`Isha: ${formatted.isha}`); // "20:00"

  // Get current prayer info
  const current = getCurrentPrayer(times);
  console.log(`Current prayer: ${current.current}`);
  console.log(`Next prayer: ${current.next}`);
  console.log(`Time until next: ${current.timeUntilNext} minutes`);
}
```

## API Reference

### Core Functions

#### `calculatePrayerTimes(date: Date, location: PrayerLocation, params: CalculationParams): Result<PrayerTimes>`

Calculate prayer times for a specific date and location.

```typescript
import { calculatePrayerTimes, getDefaultParams } from '@misque/prayer-times';

const location = {
  latitude: 40.7128,
  longitude: -74.006,
  timezone: 'America/New_York',
  elevation: 10, // optional, in meters
};

const params = getDefaultParams();
const result = calculatePrayerTimes(new Date(), location, params);

if (result.success) {
  console.log(result.data.fajr); // Date object
  console.log(result.data.sunrise); // Date object
  console.log(result.data.dhuhr); // Date object
  console.log(result.data.asr); // Date object
  console.log(result.data.maghrib); // Date object
  console.log(result.data.isha); // Date object
}
```

#### `getDefaultParams(): CalculationParams`

Get default calculation parameters (MWL method, Standard Asr, NightMiddle high latitude adjustment).

```typescript
const params = getDefaultParams();
// {
//   method: { name: 'MWL', fajrAngle: 18, ishaAngle: 17 },
//   asrMethod: 'Standard',
//   highLatitudeMethod: 'NightMiddle'
// }
```

#### `formatPrayerTimes(times: PrayerTimes, use24Hour?: boolean): PrayerTimesFormatted`

Format prayer times as strings.

```typescript
const formatted = formatPrayerTimes(times, true); // 24-hour format
console.log(formatted.fajr); // "05:30"

const formatted12 = formatPrayerTimes(times, false); // 12-hour format
console.log(formatted12.fajr); // "5:30 AM"
```

#### `getCurrentPrayer(times: PrayerTimes, now?: Date): CurrentPrayer`

Get the current and next prayer based on the current time.

```typescript
const current = getCurrentPrayer(times);
console.log(current.current); // 'dhuhr'
console.log(current.next); // 'asr'
console.log(current.timeUntilNext); // 45 (minutes)
```

#### `getTimeUntilNextPrayer(times: PrayerTimes, now?: Date): number`

Get minutes until the next prayer.

```typescript
const minutes = getTimeUntilNextPrayer(times);
console.log(`Next prayer in ${minutes} minutes`);
```

### Calculation Methods

#### `getMethod(name: CalculationMethodName): CalculationMethod`

Get a predefined calculation method.

```typescript
import { getMethod, calculatePrayerTimes } from '@misque/prayer-times';

const method = getMethod('ISNA'); // Islamic Society of North America
const params = {
  method,
  asrMethod: 'Standard' as const,
  highLatitudeMethod: 'NightMiddle' as const,
};
```

#### `createCustomMethod(fajrAngle: number, ishaAngle: number, options?: Partial<CalculationMethod>): CalculationMethod`

Create a custom calculation method.

```typescript
import { createCustomMethod } from '@misque/prayer-times';

const customMethod = createCustomMethod(18, 17, {
  ishaInterval: 90, // 90 minutes after Maghrib
  maghribAngle: 4,
});
```

#### `getAvailableMethods(): CalculationMethodName[]`

Get all available calculation method names.

```typescript
const methods = getAvailableMethods();
// ['MWL', 'ISNA', 'Egypt', 'Makkah', 'Karachi', 'Tehran', 'Jafari', ...]
```

#### `getMethodDescription(name: CalculationMethodName): string`

Get a description of a calculation method.

```typescript
const desc = getMethodDescription('MWL');
// "Muslim World League - Used in Europe, Far East, and parts of USA"
```

#### `getRegionalMethods()`

Get methods grouped by region.

```typescript
const regional = getRegionalMethods();
// {
//   middleEast: ['Makkah', 'Egypt', 'Dubai', 'Qatar', 'Kuwait'],
//   asia: ['Karachi', 'Singapore', 'Turkey'],
//   northAmerica: ['ISNA', 'MoonsightingCommittee'],
//   europe: ['MWL', 'MoonsightingCommittee']
// }
```

### Available Calculation Methods

| Method                 | Fajr Angle | Isha Angle | Region/Use                                 |
| ---------------------- | ---------- | ---------- | ------------------------------------------ |
| `MWL`                  | 18         | 17         | Muslim World League - Europe, Far East     |
| `ISNA`                 | 15         | 15         | Islamic Society of North America           |
| `Egypt`                | 19.5       | 17.5       | Egyptian General Authority - Africa, Syria |
| `Makkah`               | 18.5       | 90 min\*   | Umm al-Qura - Arabian Peninsula            |
| `Karachi`              | 18         | 18         | University of Islamic Sciences, Karachi    |
| `Tehran`               | 17.7       | 14         | Institute of Geophysics, Tehran            |
| `Jafari`               | 16         | 14         | Shia Ithna Ashari                          |
| `Dubai`                | 18.2       | 18.2       | United Arab Emirates                       |
| `Qatar`                | 18         | 90 min\*   | Qatar                                      |
| `Kuwait`               | 18         | 17.5       | Kuwait                                     |
| `Singapore`            | 20         | 18         | Singapore, Brunei                          |
| `Turkey`               | 18         | 17         | Diyanet, Turkey                            |
| `MoonsightingCommittee`| 18         | 18         | Moonsighting Committee Worldwide           |

\*Uses interval after Maghrib instead of angle

### Sunnah Times

#### `calculateSunnahTimes(todayTimes: PrayerTimes, tomorrowFajr: Date): SunnahTimes`

Calculate Sunnah times for night prayers.

```typescript
import { calculatePrayerTimes, calculateSunnahTimes } from '@misque/prayer-times';

const today = calculatePrayerTimes(new Date(), location, params);
const tomorrow = calculatePrayerTimes(addDays(new Date(), 1), location, params);

if (today.success && tomorrow.success) {
  const sunnah = calculateSunnahTimes(today.data, tomorrow.data.fajr);
  console.log(`Middle of night: ${sunnah.middleOfTheNight}`);
  console.log(`Last third: ${sunnah.lastThirdOfTheNight}`);
}
```

#### `getNightDuration(maghrib: Date, fajr: Date): number`

Get the night duration in hours.

```typescript
const hours = getNightDuration(times.maghrib, tomorrowFajr);
console.log(`Night duration: ${hours.toFixed(1)} hours`);
```

#### `isLastThirdOfNight(time: Date, maghrib: Date, fajr: Date): boolean`

Check if a time is in the last third of the night (optimal for Tahajjud).

```typescript
if (isLastThirdOfNight(new Date(), times.maghrib, tomorrowFajr)) {
  console.log('This is the blessed time for night prayer');
}
```

#### `getQiyamTimeRange(maghrib: Date, fajr: Date)`

Get the recommended time range for Qiyam al-Layl (night prayers).

```typescript
const qiyam = getQiyamTimeRange(times.maghrib, tomorrowFajr);
console.log(`Qiyam starts: ${qiyam.start}`);
console.log(`Optimal time: ${qiyam.optimal}`);
console.log(`Ends at: ${qiyam.end}`);
```

### Adjustments

#### `createAdjustments(adjustments: Partial<PrayerAdjustments>): PrayerAdjustments`

Create a prayer adjustments object.

```typescript
import { createAdjustments } from '@misque/prayer-times';

const adjustments = createAdjustments({
  fajr: -5, // 5 minutes earlier
  dhuhr: 2, // 2 minutes later
});
```

#### `adjustPrayerTimes(times: PrayerTimes, adjustments: PrayerAdjustments): PrayerTimes`

Apply minute adjustments to prayer times.

```typescript
import { adjustPrayerTimes, createAdjustments } from '@misque/prayer-times';

const adjustments = createAdjustments({ fajr: -5, maghrib: 3 });
const adjustedTimes = adjustPrayerTimes(times, adjustments);
```

#### `getPreset(name: 'conservative' | 'standard' | 'withPreparation'): PrayerAdjustments`

Get a preset adjustment configuration.

```typescript
import { getPreset, adjustPrayerTimes } from '@misque/prayer-times';

// Conservative: adds safety margin before Fajr
const conservative = getPreset('conservative');

// Standard: no adjustments
const standard = getPreset('standard');

// With preparation: adds margin for prayer preparation
const withPrep = getPreset('withPreparation');

const times = adjustPrayerTimes(calculatedTimes, conservative);
```

### Types

#### `PrayerTimes`

```typescript
interface PrayerTimes {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
}
```

#### `PrayerLocation`

```typescript
interface PrayerLocation {
  latitude: number;
  longitude: number;
  timezone: string;
  elevation?: number;
}
```

#### `CalculationParams`

```typescript
interface CalculationParams {
  method: CalculationMethod;
  asrMethod: 'Standard' | 'Hanafi';
  highLatitudeMethod: 'None' | 'NightMiddle' | 'OneSeventh' | 'AngleBased';
  adjustments?: PrayerAdjustments;
  polarCircleResolution?: 'AqrabYaum' | 'AqrabBalad' | 'Unresolved';
  shafaq?: 'general' | 'ahmer' | 'abyad';
}
```

#### `CalculationMethod`

```typescript
interface CalculationMethod {
  name: CalculationMethodName;
  fajrAngle: number;
  ishaAngle: number;
  ishaInterval?: number; // Minutes after Maghrib
  maghribAngle?: number;
  midnight?: 'Standard' | 'Jafari';
  methodAdjustments?: PrayerAdjustments;
  rounding?: 'nearest' | 'up' | 'none';
  shafaq?: 'general' | 'ahmer' | 'abyad';
}
```

#### `SunnahTimes`

```typescript
interface SunnahTimes {
  middleOfTheNight: Date;
  lastThirdOfTheNight: Date;
}
```

## Examples

### Using Different Calculation Methods

```typescript
import { calculatePrayerTimes, getMethod } from '@misque/prayer-times';

// For users in North America
const isnaParams = {
  method: getMethod('ISNA'),
  asrMethod: 'Standard' as const,
  highLatitudeMethod: 'NightMiddle' as const,
};

// For users in Saudi Arabia
const makkahParams = {
  method: getMethod('Makkah'),
  asrMethod: 'Standard' as const,
  highLatitudeMethod: 'None' as const,
};

// For Hanafi followers
const hanafiParams = {
  method: getMethod('MWL'),
  asrMethod: 'Hanafi' as const, // Later Asr time
  highLatitudeMethod: 'NightMiddle' as const,
};
```

### High Latitude Locations

```typescript
import { calculatePrayerTimes, getMethod } from '@misque/prayer-times';

// For locations above 48 degrees latitude
const location = {
  latitude: 59.3293, // Stockholm
  longitude: 18.0686,
  timezone: 'Europe/Stockholm',
};

const params = {
  method: getMethod('MoonsightingCommittee'),
  asrMethod: 'Standard' as const,
  highLatitudeMethod: 'AngleBased' as const, // Recommended for high latitudes
};

const result = calculatePrayerTimes(new Date(), location, params);
```

### Building a Prayer Time App

```typescript
import {
  calculatePrayerTimes,
  getDefaultParams,
  formatPrayerTimes,
  getCurrentPrayer,
  calculateSunnahTimes,
} from '@misque/prayer-times';

function getPrayerTimesForToday(location: PrayerLocation) {
  const params = getDefaultParams();
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayResult = calculatePrayerTimes(today, location, params);
  const tomorrowResult = calculatePrayerTimes(tomorrow, location, params);

  if (!todayResult.success || !tomorrowResult.success) {
    throw new Error('Failed to calculate prayer times');
  }

  const times = todayResult.data;
  const formatted = formatPrayerTimes(times);
  const current = getCurrentPrayer(times);
  const sunnah = calculateSunnahTimes(times, tomorrowResult.data.fajr);

  return {
    times: formatted,
    currentPrayer: current.current,
    nextPrayer: current.next,
    timeUntilNext: current.timeUntilNext,
    middleOfNight: sunnah.middleOfTheNight,
    lastThird: sunnah.lastThirdOfTheNight,
  };
}
```

## TypeScript Support

This package is written in TypeScript and includes complete type definitions.

```typescript
import type {
  PrayerTimes,
  PrayerTimesFormatted,
  CalculationMethod,
  CalculationMethodName,
  CalculationParams,
  PrayerLocation,
  PrayerAdjustments,
  CurrentPrayer,
  SunnahTimes,
  AsrMethod,
  HighLatitudeMethod,
  Shafaq,
  Rounding,
  PolarCircleResolution,
} from '@misque/prayer-times';
```

## Related Packages

- [@misque/core](https://www.npmjs.com/package/@misque/core) - Core utilities and types
- [@misque/quran](https://www.npmjs.com/package/@misque/quran) - Quran text and audio APIs
- [@misque/hijri](https://www.npmjs.com/package/@misque/hijri) - Hijri calendar conversion
- [@misque/qibla](https://www.npmjs.com/package/@misque/qibla) - Qibla direction calculator

## License

MIT
