/**
 * Represents a single verse (ayah) of the Quran
 */
export interface Ayah {
  /** Ayah number within the surah (1-based) */
  number: number;
  /** Arabic text of the ayah */
  text: string;
  /** Simplified Arabic text (optional) */
  textSimple?: string;
  /** Romanized transliteration (optional) */
  transliteration?: string;
  /** Translations in various languages */
  translations?: {
    [language: string]: string;
  };
}

/**
 * Represents a chapter (surah) of the Quran
 */
export interface Surah {
  /** Surah number (1-114) */
  number: number;
  /** Arabic name of the surah */
  name: string;
  /** Romanized name of the surah */
  nameTransliterated: string;
  /** Translated names in various languages */
  nameTranslated?: {
    [language: string]: string;
  };
  /** Total number of ayahs in this surah */
  numberOfAyahs: number;
  /** Type of revelation */
  revelationType: 'meccan' | 'medinan';
  /** Array of all ayahs in this surah */
  ayahs: Ayah[];
  /** Full surah text with ayah numbers separated (e.g., "text [1] text [2]") */
  fullText?: string;
}

/**
 * Metadata about a Quran reciter
 */
export interface Reciter {
  /** Unique identifier for the reciter */
  id: string;
  /** Display name of the reciter */
  name: string;
  /** Arabic name of the reciter (optional) */
  nameArabic?: string;
  /** Description of the reciter (optional) */
  description?: string;
  /** Audio format used by this reciter */
  audioFormat: 'mp3' | 'm4a' | 'ogg';
  /** Base URL for audio files */
  audioBaseUrl: string;
  /** Language code for audio URLs (e.g., 'eng', 'ar', 'ur') */
  language?: string;
  /** Reciter name used in URL (e.g., 'alzain' for mp3quran.net) */
  urlName?: string;
  /** Array of surah numbers this reciter has recorded */
  surahs: number[];
}

/**
 * Audio URL information for a specific ayah
 */
export interface AudioUrl {
  /** Surah number */
  surahNumber: number;
  /** Ayah number */
  ayahNumber: number;
  /** Full URL to the audio file */
  url: string;
  /** Duration in seconds (optional) */
  duration?: number;
}

/**
 * Filter options for querying the Quran
 */
export interface FilterOptions {
  /** Filter by revelation type */
  revelationType?: 'meccan' | 'medinan';
  /** Filter by minimum surah number */
  minSurahNumber?: number;
  /** Filter by maximum surah number */
  maxSurahNumber?: number;
  /** Filter by minimum number of ayahs */
  minAyahs?: number;
  /** Filter by maximum number of ayahs */
  maxAyahs?: number;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  /** Page number (1-based, default: 1) */
  page?: number;
  /** Number of items per page (default: 10) */
  pageSize?: number;
}

/**
 * Paginated result
 */
export interface PaginatedResult<T> {
  /** The items for the current page */
  items: T[];
  /** Current page number */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Total number of items */
  total: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there is a next page */
  hasNext: boolean;
  /** Whether there is a previous page */
  hasPrevious: boolean;
}

/**
 * Search options for querying the Quran
 */
export interface SearchOptions {
  /** Language to search in (default: 'en') */
  language?: string;
  /** Maximum number of results to return */
  limit?: number;
  /** Whether to search in Arabic text */
  searchArabic?: boolean;
  /** Whether to search in translations */
  searchTranslations?: boolean;
  /** Additional filters to apply to search results */
  filters?: FilterOptions;
}

/**
 * Search result containing matched ayah and context
 */
export interface SearchResult {
  /** The matched ayah */
  ayah: Ayah;
  /** Surah information */
  surah: Surah;
  /** Matched text snippet */
  snippet: string;
  /** Relevance score (higher is more relevant) */
  score: number;
}

/**
 * Metadata about the Quran dataset
 */
export interface QuranMetadata {
  /** Version of the data */
  version: string;
  /** Last update date */
  lastUpdated: string;
  /** Total number of surahs */
  totalSurahs: number;
  /** Total number of ayahs */
  totalAyahs: number;
}

/**
 * Reference to a specific verse
 */
export interface VerseReference {
  surah: number;
  ayah: number;
}

/**
 * Range of verses
 */
export interface VerseRange {
  start: VerseReference;
  end: VerseReference;
}

/**
 * Juz (part) information
 */
export interface Juz {
  number: number;
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
}

/**
 * Player data for a surah - everything needed to play audio
 */
export interface PlayerData {
  audioUrl: string | null;
  fullText: string | null;
  surah: Surah | null;
}

/**
 * Structure of the Quran data file
 */
export interface QuranDataFile {
  metadata: QuranMetadata;
  surahs: Surah[];
}

/**
 * Structure of the reciters data file
 */
export interface RecitersDataFile {
  reciters: Reciter[];
}
