# @misque/quran

A comprehensive JavaScript/TypeScript library for accessing Quran text, audio, and reciter data. Built for modern applications with support for Node.js, browsers, React, React Native, and Edge runtimes.

## Installation

```bash
npm install @misque/quran
# or
yarn add @misque/quran
# or
pnpm add @misque/quran
```

## Features

- Complete Quran text with Arabic script and translations
- Audio URL generation for multiple reciters
- Search functionality across Arabic text and translations
- Pagination support for all list operations
- Filter surahs by revelation type (Meccan/Medinan)
- Session-based API for simplified reciter workflows
- Full TypeScript support
- Zero external runtime dependencies (only depends on @misque/core)
- Tree-shakeable ESM and CommonJS builds

## Quick Start

```typescript
import { createQuran, createQuranSession } from '@misque/quran';

// Create a Quran instance
const quran = createQuran();

// Get all 114 surahs
const surahs = quran.getAllSurahs();
console.log(`Total surahs: ${surahs.length}`); // 114

// Get a specific surah
const fatiha = quran.getSurah(1);
console.log(fatiha?.name); // "الفاتحة"
console.log(fatiha?.nameTransliterated); // "Al-Fatihah"

// Get a specific ayah
const ayah = quran.getAyah(1, 1);
console.log(ayah?.text); // "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"

// Search the Quran
const results = quran.search('mercy', { limit: 10 });
results.forEach((result) => {
  console.log(`${result.surah.nameTransliterated} ${result.ayah.number}: ${result.snippet}`);
});
```

### Working with Reciters

```typescript
import { createQuranSession, createQuranWithReciter } from '@misque/quran';

// Option 1: Use a session for simplified workflow
const session = createQuranSession('alzain');
const surahs = session.surahs; // All surahs available for this reciter
const audioUrl = session.getAudioUrl(1); // Audio URL for Surah Al-Fatihah

// Get everything needed to play a surah
const { audioUrl, fullText, surah } = session.getPlayerData(1);

// Option 2: Use Quran instance with preferred reciter
const quran = createQuranWithReciter('alzain');
const url = quran.getSurahAudioUrl(1); // Uses preferred reciter
```

## API Reference

### Factory Functions

#### `createQuran(): Quran`

Create a Quran instance with bundled data.

```typescript
const quran = createQuran();
```

#### `createQuranWithReciter(reciterId: string): Quran`

Create a Quran instance with a preferred reciter pre-set.

```typescript
const quran = createQuranWithReciter('alzain');
const surahs = quran.getPreferredReciterSurahs();
```

#### `createQuranSession(reciterId: string): QuranSession`

Create a simplified session for working with a specific reciter. This is the recommended approach for audio player applications.

```typescript
const session = createQuranSession('alzain');
const { audioUrl, fullText, surah } = session.getPlayerData(1);
```

#### `createQuranWithData(surahs: Surah[], reciters?: Reciter[], preferredReciterId?: string): Quran`

Create a Quran instance with custom data. Useful for testing or loading data from external sources.

```typescript
const quran = createQuranWithData(customSurahs, customReciters);
```

### Quran Class

The main class for accessing Quran data.

#### Surah Methods

```typescript
// Get all surahs
getAllSurahs(): Surah[]

// Get surahs with filters
getSurahs(filters?: FilterOptions): Surah[]

// Get paginated surahs
getSurahsPaginated(pagination?: PaginationOptions, filters?: FilterOptions): PaginatedResult<Surah>

// Get a specific surah by number (1-114)
getSurah(surahNumber: number): Surah | null

// Get surah count
getSurahCount(): number

// Get full text of a surah
getSurahFullText(surahNumber: number): string | null
```

#### Ayah Methods

```typescript
// Get a specific ayah
getAyah(surahNumber: number, ayahNumber: number): Ayah | null

// Get ayah count for a surah
getAyahCount(surahNumber: number): number
```

#### Reciter Methods

```typescript
// Get all reciters
getAllReciters(): Reciter[]

// Get a specific reciter
getReciter(reciterId: string): Reciter | null

// Get surahs available for a reciter
getSurahsByReciter(reciterId: string): Surah[]

// Set/get/clear preferred reciter
setPreferredReciter(reciterId: string): void
getPreferredReciter(): Reciter | null
getPreferredReciterId(): string | null
clearPreferredReciter(): void
getPreferredReciterSurahs(): Surah[]
```

#### Audio Methods

```typescript
// Get audio URL for a specific ayah
getAudioUrl(reciterId: string, surahNumber: number, ayahNumber: number): string | null

// Get all audio URLs for a surah
getSurahAudioUrls(reciterId: string, surahNumber: number): AudioUrl[]

// Get surah audio URL using preferred reciter
getSurahAudioUrl(surahNumber: number): string | null

// Get surah audio URL for a specific reciter
getSurahAudioUrlForReciter(reciterId: string, surahNumber: number): string | null
```

#### Search Methods

```typescript
// Search the Quran
search(query: string, options?: SearchOptions): SearchResult[]

// Paginated search
searchPaginated(query: string, pagination?: PaginationOptions, options?: SearchOptions): PaginatedResult<SearchResult>
```

#### Utility Methods

```typescript
// Get Quran metadata
getMetadata(): QuranMetadata

// Update surahs dynamically
updateSurahs(surahs: Surah[]): void

// Update reciters dynamically
updateReciters(reciters: Reciter[]): void

// Create a session for a specific reciter
withReciter(reciterId: string): QuranSession
```

### QuranSession Class

A simplified API for working with a specific reciter.

```typescript
class QuranSession {
  // Get the reciter for this session
  get reciter(): Reciter;

  // Get all surahs available for this reciter
  get surahs(): Surah[];

  // Get the number of surahs available
  get surahCount(): number;

  // Get a specific surah
  getSurah(surahNumber: number): Surah | null;

  // Get audio URL for a surah
  getAudioUrl(surahNumber: number): string | null;

  // Get full text of a surah
  getFullText(surahNumber: number): string | null;

  // Get everything needed to play a surah
  getPlayerData(surahNumber: number): PlayerData;

  // Check if a surah is available
  hasSurah(surahNumber: number): boolean;
}
```

### Types

#### `Surah`

```typescript
interface Surah {
  number: number; // 1-114
  name: string; // Arabic name
  nameTransliterated: string; // Romanized name
  nameTranslated?: { [language: string]: string };
  numberOfAyahs: number;
  revelationType: 'meccan' | 'medinan';
  ayahs: Ayah[];
  fullText?: string; // Full surah text with ayah markers
}
```

#### `Ayah`

```typescript
interface Ayah {
  number: number; // Ayah number within surah
  text: string; // Arabic text
  textSimple?: string; // Simplified Arabic
  transliteration?: string;
  translations?: { [language: string]: string };
}
```

#### `Reciter`

```typescript
interface Reciter {
  id: string;
  name: string;
  nameArabic?: string;
  description?: string;
  audioFormat: 'mp3' | 'm4a' | 'ogg';
  audioBaseUrl: string;
  language?: string;
  urlName?: string;
  surahs: number[]; // Surah numbers this reciter has recorded
}
```

#### `FilterOptions`

```typescript
interface FilterOptions {
  revelationType?: 'meccan' | 'medinan';
  minSurahNumber?: number;
  maxSurahNumber?: number;
  minAyahs?: number;
  maxAyahs?: number;
}
```

#### `SearchOptions`

```typescript
interface SearchOptions {
  language?: string; // Default: 'en'
  limit?: number; // Maximum results (default: 100)
  searchArabic?: boolean; // Search Arabic text (default: true)
  searchTranslations?: boolean; // Search translations (default: true)
  filters?: FilterOptions;
}
```

#### `SearchResult`

```typescript
interface SearchResult {
  ayah: Ayah;
  surah: Surah;
  snippet: string;
  score: number;
}
```

#### `PaginationOptions`

```typescript
interface PaginationOptions {
  page?: number; // 1-based (default: 1)
  pageSize?: number; // Items per page (default: 10)
}
```

#### `PaginatedResult<T>`

```typescript
interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
```

#### `PlayerData`

```typescript
interface PlayerData {
  audioUrl: string | null;
  fullText: string | null;
  surah: Surah | null;
}
```

## Examples

### Filter Meccan Surahs

```typescript
const quran = createQuran();
const meccanSurahs = quran.getSurahs({ revelationType: 'meccan' });
console.log(`Meccan surahs: ${meccanSurahs.length}`); // 86
```

### Paginated Surah List

```typescript
const quran = createQuran();

// Get first page of 10 surahs
const page1 = quran.getSurahsPaginated({ page: 1, pageSize: 10 });
console.log(`Page ${page1.page} of ${page1.totalPages}`);
console.log(`Showing ${page1.items.length} of ${page1.total} surahs`);

// Check if there are more pages
if (page1.hasNext) {
  const page2 = quran.getSurahsPaginated({ page: 2, pageSize: 10 });
  // ...
}
```

### Search with Filters

```typescript
const quran = createQuran();

// Search only in Medinan surahs
const results = quran.search('believers', {
  filters: { revelationType: 'medinan' },
  searchArabic: false, // Only search translations
  limit: 20,
});
```

### Build an Audio Player

```typescript
const session = createQuranSession('alzain');

// Get list of surahs for the UI
const surahs = session.surahs;

// User selects a surah
function playSurah(surahNumber: number) {
  const { audioUrl, fullText, surah } = session.getPlayerData(surahNumber);

  if (audioUrl) {
    // Play audio
    const audio = new Audio(audioUrl);
    audio.play();
  }

  // Display text
  console.log(`Now playing: ${surah?.nameTransliterated}`);
  console.log(fullText);
}
```

## TypeScript Support

This package is written in TypeScript and includes complete type definitions. All types are exported for convenience.

```typescript
import type {
  Ayah,
  Surah,
  Reciter,
  AudioUrl,
  FilterOptions,
  PaginationOptions,
  PaginatedResult,
  SearchOptions,
  SearchResult,
  QuranMetadata,
  VerseReference,
  VerseRange,
  Juz,
  PlayerData,
} from '@misque/quran';
```

## Related Packages

- [@misque/core](https://www.npmjs.com/package/@misque/core) - Core utilities and types
- [@misque/prayer-times](https://www.npmjs.com/package/@misque/prayer-times) - Prayer time calculations
- [@misque/hijri](https://www.npmjs.com/package/@misque/hijri) - Hijri calendar conversion
- [@misque/qibla](https://www.npmjs.com/package/@misque/qibla) - Qibla direction calculator

## License

MIT
