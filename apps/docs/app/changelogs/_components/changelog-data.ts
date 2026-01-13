export interface ChangelogRelease {
  id: string;
  version: string;
  date: string;
  packages: PackageUpdate[];
}

export interface PackageUpdate {
  name: string;
  version: string;
  type: 'major' | 'minor' | 'patch';
  changes: string[];
}

export const CHANGELOG_DATA: ChangelogRelease[] = [
  {
    id: 'v0.2.1',
    version: 'v0.2.1',
    date: 'January 2025',
    packages: [
      {
        name: '@misque/core',
        version: '0.2.1',
        type: 'patch',
        changes: [
          'Add comprehensive README documentation',
          'Installation instructions and quick start examples',
          'API reference overview with TypeScript type information',
        ],
      },
      {
        name: '@misque/quran',
        version: '0.2.1',
        type: 'patch',
        changes: [
          'Add comprehensive README documentation',
          'Installation instructions and quick start examples',
          'API reference overview with TypeScript type information',
          'Updated dependency: @misque/core@0.2.1',
        ],
      },
      {
        name: '@misque/prayer-times',
        version: '0.2.1',
        type: 'patch',
        changes: [
          'Add comprehensive README documentation',
          'Installation instructions and quick start examples',
          'API reference overview with TypeScript type information',
          'Updated dependency: @misque/core@0.2.1',
        ],
      },
      {
        name: '@misque/hijri',
        version: '0.2.1',
        type: 'patch',
        changes: [
          'Add comprehensive README documentation',
          'Installation instructions and quick start examples',
          'API reference overview with TypeScript type information',
          'Updated dependency: @misque/core@0.2.1',
        ],
      },
      {
        name: '@misque/qibla',
        version: '0.2.1',
        type: 'patch',
        changes: [
          'Add comprehensive README documentation',
          'Installation instructions and quick start examples',
          'API reference overview with TypeScript type information',
          'Updated dependency: @misque/core@0.2.1',
        ],
      },
    ],
  },
  {
    id: 'v0.2.0-new-packages',
    version: 'v0.2.0',
    date: 'January 2025',
    packages: [
      {
        name: '@misque/mosques-finder',
        version: '0.2.0',
        type: 'minor',
        changes: [
          'Initial release of @misque/mosques-finder',
          'Find nearby mosques using OpenStreetMap Overpass API',
          'Configurable search radius and result limits',
          'Built-in caching with LRU eviction strategy',
          'Rich mosque metadata (name, address, facilities, prayer times)',
          'Distance and bearing calculations from user location',
          'TypeScript support with full type definitions',
        ],
      },
      {
        name: '@misque/zakat',
        version: '0.2.0',
        type: 'minor',
        changes: [
          'Initial release of @misque/zakat',
          'Comprehensive zakat calculation for various asset types',
          'Support for all four major madhabs (Hanafi, Shafi\'i, Maliki, Hanbali)',
          'Real-time gold and silver price fetching for nisab calculation',
          'Agricultural zakat with different irrigation methods',
          'Business inventory and trade goods calculation',
          'Livestock zakat (camels, cattle, sheep/goats)',
          'Cash, savings, and investment calculations',
          'Built-in caching for price data',
          'TypeScript support with full type definitions',
        ],
      },
    ],
  },
  {
    id: 'v0.2.0-initial',
    version: 'v0.2.0',
    date: 'January 2025',
    packages: [
      {
        name: '@misque/core',
        version: '0.2.0',
        type: 'minor',
        changes: [
          'Initial release of Misque core utilities',
          'Result<T, E> type for type-safe error handling',
          'Coordinates and Location interfaces',
          'Math helpers: toRadians, toDegrees, normalizeAngle, calculateDistance',
          'Julian day conversion: toJulianDay, fromJulianDay',
        ],
      },
      {
        name: '@misque/quran',
        version: '0.2.0',
        type: 'minor',
        changes: [
          'Initial release of @misque/quran',
          'Quran data access with all 114 surahs',
          'Audio support with multiple reciters',
          'Reciter management and session handling',
          'Search functionality across the Quran',
        ],
      },
      {
        name: '@misque/prayer-times',
        version: '0.2.0',
        type: 'minor',
        changes: [
          'Initial release of @misque/prayer-times',
          '14+ calculation methods (MWL, ISNA, Egypt, Makkah, etc.)',
          'High latitude support with multiple adjustment methods',
          'Asr calculation variants (Standard and Hanafi)',
          'Formatting helpers and current prayer detection',
        ],
      },
      {
        name: '@misque/hijri',
        version: '0.2.0',
        type: 'minor',
        changes: [
          'Initial release of @misque/hijri',
          'Gregorian to Hijri date conversion',
          'Hijri to Gregorian date conversion',
          'Date arithmetic and comparison functions',
          'Formatting with month names and localization',
        ],
      },
      {
        name: '@misque/qibla',
        version: '0.2.0',
        type: 'minor',
        changes: [
          'Initial release of @misque/qibla',
          'Qibla direction calculation from any location',
          'Compass direction support (N, NE, E, etc.)',
          'Distance to Kaaba calculation',
          'Great circle bearing algorithm',
        ],
      },
    ],
  },
];
