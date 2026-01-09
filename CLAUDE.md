# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Misque is a monorepo of Muslim/Islamic utility libraries for JavaScript/TypeScript applications. It provides packages for Quran data/audio, prayer time calculations, Hijri calendar conversion, and Qibla direction.

## Build & Development Commands

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run a single package's tests
pnpm --filter @misque/core test
pnpm --filter @misque/quran test

# Lint and fix
pnpm lint
pnpm lint:fix

# Type checking
pnpm typecheck

# Format code
pnpm format
```

## Architecture

### Monorepo Structure

- **pnpm workspaces** with Turborepo for task orchestration
- **Changesets** for versioning and publishing (`pnpm changeset`)
- All packages publish to npm under `@misque/` scope

### Package Dependency Graph

```
@misque/core (shared utilities - no dependencies)
    ↑
    ├── @misque/quran (Quran text, audio, reciters)
    ├── @misque/prayer-times (calculation algorithms)
    ├── @misque/hijri (calendar conversion)
    └── @misque/qibla (direction calculation)
```

### Tooling Packages (in `tooling/`)

- `@misque/typescript-config` - Shared tsconfig
- `@misque/vitest-config` - Shared vitest config with 80% coverage threshold
- `@misque/eslint-config` - Shared ESLint flat config

### Build Configuration

Each package uses:
- **tsup** for bundling (ESM + CJS dual output with `.d.ts`)
- **vitest** for testing
- Tests located in `src/**/*.test.ts`

### Core Package Patterns

**@misque/core** exports shared utilities:
- `Result<T, E>` type for error handling without exceptions
- `Coordinates`, `Location`, `DateComponents` interfaces
- Math helpers: `toRadians`, `toDegrees`, `normalizeAngle`, `calculateDistance`
- Julian day conversion: `toJulianDay`, `fromJulianDay`

**@misque/quran** uses factory functions:
- `createQuran()` - Main entry point
- `createQuranSession(reciterId)` - Simplified API for working with a specific reciter
- Data loaded synchronously from bundled JSON files

**@misque/prayer-times** uses pure functions:
- `calculatePrayerTimes(date, location, params)` returns `Result<PrayerTimes>`
- `getMethod(name)` for calculation methods (MWL, ISNA, etc.)
- `getCurrentPrayer(times)` for current/next prayer state

### Documentation Website (apps/docs)

- **Fumadocs** for documentation with MDX
- **Next.js 15** with App Router
- Homepage at `/`, docs at `/docs`
- MDX content in `apps/docs/content/docs/`

```bash
# Run docs site locally
pnpm --filter @misque/docs dev

# Build docs
pnpm --filter @misque/docs build
```

To add new documentation:
1. Create MDX file in `apps/docs/content/docs/`
2. Update `meta.json` to include in navigation

### Code Style

- TypeScript strict mode
- Use `type` imports: `import type { Foo } from './types'`
- Unused variables prefixed with `_`
- No explicit `any` without justification
