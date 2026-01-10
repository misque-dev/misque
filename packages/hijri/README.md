# @misque/hijri

A lightweight and accurate Hijri (Islamic) calendar conversion library for JavaScript and TypeScript. Convert between Gregorian and Hijri dates with ease.

## Installation

```bash
npm install @misque/hijri
# or
yarn add @misque/hijri
# or
pnpm add @misque/hijri
```

## Features

- Accurate Gregorian to Hijri conversion using the Kuwaiti algorithm
- Accurate Hijri to Gregorian conversion
- Date arithmetic (add days, months, years)
- Date comparison and difference calculation
- Formatting with multiple styles and languages (English/Arabic)
- Leap year detection
- Month and year length utilities
- Special date helpers (Ramadan, Dhul Hijjah detection)
- Full TypeScript support
- Zero external runtime dependencies
- Tree-shakeable ESM and CommonJS builds

## Quick Start

```typescript
import {
  toHijri,
  toGregorian,
  formatHijri,
  getHijriToday,
  isRamadan,
} from '@misque/hijri';

// Convert today's date to Hijri
const result = toHijri(new Date());
if (result.success) {
  console.log(result.data);
  // { year: 1446, month: 6, day: 9 }
}

// Format a Hijri date
const formatted = formatHijri({ year: 1446, month: 9, day: 1 });
console.log(formatted); // "1 Ramadan 1446"

// Convert Hijri to Gregorian
const gregorianResult = toGregorian({ year: 1446, month: 9, day: 1 });
if (gregorianResult.success) {
  console.log(gregorianResult.data); // Date object
}

// Get today's Hijri date directly
const today = getHijriToday();
console.log(`Today is ${today.day}/${today.month}/${today.year} AH`);

// Check if we're in Ramadan
if (isRamadan(today)) {
  console.log('Ramadan Mubarak!');
}
```

## API Reference

### Conversion Functions

#### `toHijri(date: Date): Result<HijriDate>`

Convert a Gregorian date to Hijri.

```typescript
import { toHijri } from '@misque/hijri';

const result = toHijri(new Date('2024-01-01'));
if (result.success) {
  console.log(result.data);
  // { year: 1445, month: 6, day: 19 }
}
```

#### `toGregorian(hijri: HijriDate): Result<Date>`

Convert a Hijri date to Gregorian.

```typescript
import { toGregorian } from '@misque/hijri';

const result = toGregorian({ year: 1445, month: 6, day: 19 });
if (result.success) {
  console.log(result.data); // Date for 2024-01-01
}
```

#### `gregorianToHijri(year: number, month: number, day: number): Result<HijriDate>`

Convert Gregorian date components to Hijri.

```typescript
import { gregorianToHijri } from '@misque/hijri';

const result = gregorianToHijri(2024, 1, 1);
if (result.success) {
  console.log(result.data); // { year: 1445, month: 6, day: 19 }
}
```

#### `hijriToGregorian(year: number, month: number, day: number): Result<GregorianDate>`

Convert Hijri date components to Gregorian components.

```typescript
import { hijriToGregorian } from '@misque/hijri';

const result = hijriToGregorian(1445, 6, 19);
if (result.success) {
  console.log(result.data); // { year: 2024, month: 1, day: 1 }
}
```

#### `convert(date: Date | HijriDate): Result<ConversionResult>`

Get full conversion result with both dates and Julian Day.

```typescript
import { convert } from '@misque/hijri';

// From Gregorian
const result1 = convert(new Date('2024-03-11'));
if (result1.success) {
  console.log(result1.data);
  // {
  //   hijri: { year: 1445, month: 9, day: 1 },
  //   gregorian: { year: 2024, month: 3, day: 11 },
  //   julianDay: 2460380
  // }
}

// From Hijri
const result2 = convert({ year: 1445, month: 9, day: 1 });
if (result2.success) {
  console.log(result2.data.gregorian); // { year: 2024, month: 3, day: 11 }
}
```

### Calendar Information

#### `getMonthLength(year: number, month: number): number`

Get the number of days in a Hijri month.

```typescript
import { getMonthLength } from '@misque/hijri';

getMonthLength(1445, 1); // 30 (Muharram - odd months have 30 days)
getMonthLength(1445, 2); // 29 (Safar - even months have 29 days)
getMonthLength(1445, 12); // 30 (Dhul Hijjah in leap year)
```

#### `isHijriLeapYear(year: number): boolean`

Check if a Hijri year is a leap year.

```typescript
import { isHijriLeapYear } from '@misque/hijri';

isHijriLeapYear(1445); // true
isHijriLeapYear(1446); // false
```

#### `getYearLength(year: number): number`

Get the number of days in a Hijri year.

```typescript
import { getYearLength } from '@misque/hijri';

getYearLength(1445); // 355 (leap year)
getYearLength(1446); // 354 (common year)
```

#### `getYearMonths(year: number): HijriMonthInfo[]`

Get information about all months in a year.

```typescript
import { getYearMonths } from '@misque/hijri';

const months = getYearMonths(1445);
// [
//   { number: 1, name: 'Muharram', nameArabic: 'محرم', days: 30 },
//   { number: 2, name: 'Safar', nameArabic: 'صفر', days: 29 },
//   ...
// ]
```

### Formatting

#### `formatHijri(date: HijriDate, options?: HijriFormatOptions): string`

Format a Hijri date with various styles.

```typescript
import { formatHijri } from '@misque/hijri';

const date = { year: 1446, month: 9, day: 1 };

// Default (medium)
formatHijri(date);
// "1 Ramadan 1446"

// Short format
formatHijri(date, { style: 'short' });
// "1/9/1446"

// Long format
formatHijri(date, { style: 'long' });
// "1 Ramadan 1446 AH"

// Full format with day of week
formatHijri(date, { style: 'full', includeDayOfWeek: true });
// "Monday, 1 Ramadan 1446 AH"

// Arabic
formatHijri(date, { useArabic: true, style: 'long' });
// "1 رمضان 1446 AH"

// Without year
formatHijri(date, { includeYear: false });
// "1 Ramadan"
```

#### `formatHijriArabic(date: HijriDate): string`

Format a Hijri date in Arabic.

```typescript
import { formatHijriArabic } from '@misque/hijri';

formatHijriArabic({ year: 1446, month: 9, day: 1 });
// "1 رمضان 1446 AH"
```

#### `getMonthName(month: number, arabic?: boolean): string`

Get the name of a Hijri month.

```typescript
import { getMonthName } from '@misque/hijri';

getMonthName(9); // "Ramadan"
getMonthName(9, true); // "رمضان"
getMonthName(12); // "Dhul Hijjah"
```

#### `getHijriDateInfo(date: HijriDate): HijriDateInfo`

Get detailed information about a Hijri date.

```typescript
import { getHijriDateInfo } from '@misque/hijri';

const info = getHijriDateInfo({ year: 1446, month: 9, day: 1 });
// {
//   year: 1446,
//   month: 9,
//   day: 1,
//   monthName: 'Ramadan',
//   monthNameArabic: 'رمضان',
//   dayOfWeek: 1,
//   dayOfWeekName: 'Monday',
//   dayOfWeekNameArabic: 'الإثنين',
//   isLeapYear: false
// }
```

### Date Utilities

#### `getHijriToday(): HijriDate`

Get today's date in Hijri calendar.

```typescript
import { getHijriToday } from '@misque/hijri';

const today = getHijriToday();
console.log(`Today: ${today.day}/${today.month}/${today.year}`);
```

#### `addDays(date: HijriDate, days: number): HijriDate`

Add or subtract days from a Hijri date.

```typescript
import { addDays } from '@misque/hijri';

const date = { year: 1446, month: 9, day: 1 };
const later = addDays(date, 10);
// { year: 1446, month: 9, day: 11 }

const earlier = addDays(date, -5);
// { year: 1446, month: 8, day: 25 }
```

#### `addMonths(date: HijriDate, months: number): HijriDate`

Add or subtract months from a Hijri date.

```typescript
import { addMonths } from '@misque/hijri';

const date = { year: 1446, month: 9, day: 1 };
const later = addMonths(date, 3);
// { year: 1446, month: 12, day: 1 }

const earlier = addMonths(date, -10);
// { year: 1445, month: 11, day: 1 }
```

#### `addYears(date: HijriDate, years: number): HijriDate`

Add or subtract years from a Hijri date.

```typescript
import { addYears } from '@misque/hijri';

const date = { year: 1446, month: 9, day: 1 };
const later = addYears(date, 5);
// { year: 1451, month: 9, day: 1 }
```

#### `compareDates(a: HijriDate, b: HijriDate): number`

Compare two Hijri dates. Returns -1 if a < b, 0 if equal, 1 if a > b.

```typescript
import { compareDates } from '@misque/hijri';

const date1 = { year: 1446, month: 9, day: 1 };
const date2 = { year: 1446, month: 9, day: 15 };

compareDates(date1, date2); // -1 (date1 is earlier)
compareDates(date2, date1); // 1 (date2 is later)
compareDates(date1, date1); // 0 (equal)
```

#### `areDatesEqual(a: HijriDate, b: HijriDate): boolean`

Check if two Hijri dates are equal.

```typescript
import { areDatesEqual } from '@misque/hijri';

areDatesEqual(
  { year: 1446, month: 9, day: 1 },
  { year: 1446, month: 9, day: 1 }
); // true
```

#### `getDaysDifference(from: HijriDate, to: HijriDate): number`

Get the difference in days between two Hijri dates.

```typescript
import { getDaysDifference } from '@misque/hijri';

const start = { year: 1446, month: 9, day: 1 };
const end = { year: 1446, month: 9, day: 30 };

getDaysDifference(start, end); // 29
```

### Special Date Helpers

#### `isRamadan(date: HijriDate): boolean`

Check if a date is in Ramadan.

```typescript
import { isRamadan, getHijriToday } from '@misque/hijri';

if (isRamadan(getHijriToday())) {
  console.log('Ramadan Mubarak!');
}
```

#### `isDhulHijjah(date: HijriDate): boolean`

Check if a date is in Dhul Hijjah (the month of Hajj).

```typescript
import { isDhulHijjah, getHijriToday } from '@misque/hijri';

if (isDhulHijjah(getHijriToday())) {
  console.log('This is the month of Hajj');
}
```

#### `getFirstDayOfMonth(year: number, month: number): HijriDate`

Get the first day of a month.

```typescript
import { getFirstDayOfMonth } from '@misque/hijri';

getFirstDayOfMonth(1446, 9);
// { year: 1446, month: 9, day: 1 }
```

#### `getLastDayOfMonth(year: number, month: number): HijriDate`

Get the last day of a month.

```typescript
import { getLastDayOfMonth } from '@misque/hijri';

getLastDayOfMonth(1446, 9);
// { year: 1446, month: 9, day: 30 }
```

### Types

#### `HijriDate`

```typescript
interface HijriDate {
  year: number;
  month: number; // 1-12
  day: number;
}
```

#### `HijriDateInfo`

```typescript
interface HijriDateInfo extends HijriDate {
  monthName: string;
  monthNameArabic: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  dayOfWeekName: string;
  dayOfWeekNameArabic: string;
  isLeapYear: boolean;
}
```

#### `GregorianDate`

```typescript
interface GregorianDate {
  year: number;
  month: number; // 1-12
  day: number;
}
```

#### `ConversionResult`

```typescript
interface ConversionResult {
  hijri: HijriDate;
  gregorian: GregorianDate;
  julianDay: number;
}
```

#### `HijriFormatOptions`

```typescript
interface HijriFormatOptions {
  includeDayOfWeek?: boolean;
  useArabic?: boolean;
  style?: 'short' | 'medium' | 'long' | 'full';
  includeYear?: boolean;
}
```

#### `HijriMonthInfo`

```typescript
interface HijriMonthInfo {
  number: number;
  name: string;
  nameArabic: string;
  days: number;
}
```

## Examples

### Building a Hijri Calendar Widget

```typescript
import {
  getHijriToday,
  getYearMonths,
  getMonthLength,
  formatHijri,
  getHijriDateInfo,
} from '@misque/hijri';

function buildCalendarMonth(year: number, month: number) {
  const days = getMonthLength(year, month);
  const calendar = [];

  for (let day = 1; day <= days; day++) {
    const date = { year, month, day };
    const info = getHijriDateInfo(date);
    calendar.push({
      date,
      dayName: info.dayOfWeekName,
      formatted: formatHijri(date, { style: 'short', includeYear: false }),
    });
  }

  return calendar;
}

// Get current month's calendar
const today = getHijriToday();
const calendar = buildCalendarMonth(today.year, today.month);
```

### Counting Days Until Ramadan

```typescript
import { getHijriToday, getDaysDifference, isRamadan } from '@misque/hijri';

function daysUntilRamadan(): number {
  const today = getHijriToday();

  if (isRamadan(today)) {
    return 0; // Already Ramadan
  }

  // Find next Ramadan
  let ramadanYear = today.year;
  if (today.month > 9) {
    ramadanYear += 1;
  }

  const ramadanStart = { year: ramadanYear, month: 9, day: 1 };
  return getDaysDifference(today, ramadanStart);
}

console.log(`Days until Ramadan: ${daysUntilRamadan()}`);
```

### Displaying Dual Dates

```typescript
import { toHijri, formatHijri } from '@misque/hijri';

function formatDualDate(date: Date): string {
  const gregorian = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const hijriResult = toHijri(date);
  if (!hijriResult.success) {
    return gregorian;
  }

  const hijri = formatHijri(hijriResult.data, { style: 'long' });
  return `${gregorian} / ${hijri}`;
}

console.log(formatDualDate(new Date()));
// "January 9, 2026 / 10 Jumada al-Thani 1447 AH"
```

## TypeScript Support

This package is written in TypeScript and includes complete type definitions.

```typescript
import type {
  HijriDate,
  HijriDateInfo,
  GregorianDate,
  ConversionResult,
  HijriFormatOptions,
  HijriMonthInfo,
} from '@misque/hijri';
```

## Related Packages

- [@misque/core](https://www.npmjs.com/package/@misque/core) - Core utilities and types
- [@misque/quran](https://www.npmjs.com/package/@misque/quran) - Quran text and audio APIs
- [@misque/prayer-times](https://www.npmjs.com/package/@misque/prayer-times) - Prayer time calculations
- [@misque/qibla](https://www.npmjs.com/package/@misque/qibla) - Qibla direction calculator

## License

MIT
