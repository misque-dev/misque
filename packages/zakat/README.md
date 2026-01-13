# @misque/zakat

Comprehensive Islamic zakat calculator with multi-madhab support.

## Features

- Calculate zakat on multiple asset types (cash, gold, silver, stocks, crypto, business, agricultural, livestock)
- Support for all four major madhabs (Hanafi, Shafii, Maliki, Hanbali)
- Real-time nisab calculation using live gold/silver prices
- Detailed breakdown by asset with explanations
- TypeScript support with full type definitions

## Installation

```bash
npm install @misque/zakat
# or
pnpm add @misque/zakat
# or
yarn add @misque/zakat
```

## Quick Start

```typescript
import { calculateZakat } from '@misque/zakat';

const result = await calculateZakat({
  assets: [
    { type: 'cash', amount: 50000, currency: 'USD' },
    { type: 'gold', weightGrams: 100, purity: 0.916 }
  ],
  madhab: 'hanafi'
});

if (result.success) {
  console.log(`Total zakat due: ${result.data.totalZakatDue}`);
}
```

## Documentation

For full documentation, visit [misque.dev/docs/packages/zakat](https://misque.dev/docs/packages/zakat)

## License

MIT
