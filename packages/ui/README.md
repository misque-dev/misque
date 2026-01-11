# @misque/ui

Shared UI components built with [shadcn/ui](https://ui.shadcn.com) for Misque applications.

## Installation

```bash
pnpm add @misque/ui
```

## Usage

Import components from the package:

```tsx
import { Button, Card, CardHeader, CardTitle, CardContent } from "@misque/ui";

export function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hello World</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  );
}
```

## CSS Setup

Import the global styles in your app's CSS file:

```css
@import "@misque/ui/globals.css";
```

Or import the utility function for custom styling:

```ts
import { cn } from "@misque/ui/lib/utils";
```

## Adding Components

Use the shadcn CLI from within this package directory:

```bash
cd packages/ui
pnpm ui:add button
pnpm ui:add card
# etc.
```

## Available Components

- `Button` - Button with variants (default, destructive, outline, secondary, ghost, link)
- `Badge` - Badge/tag component
- `Card` - Card container with Header, Title, Description, Content, Footer
- `Input` - Form input
- `Label` - Form label

## Theming

The package uses CSS custom properties for theming. Override the variables in your app's CSS:

```css
:root {
  --primary: oklch(0.216 0.006 56.043);
  --primary-foreground: oklch(0.985 0.001 106.423);
  /* ... other variables */
}
```

## License

MIT
