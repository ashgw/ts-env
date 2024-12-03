# @ashgw/ts-env

A lightweight TypeScript utility for managing and validating environment variables with [`zod`](https://github.com/colinhacks/zod).

## Features

- **Schema-Based Validation**: Validate environment variables against a schema using `zod`.
- **Prefix Support**: Handle variables with prefixes (e.g., `NEXT_PUBLIC_`).
- **Disable Prefix for Specific Variables**: Disable the prefix for certain variables when needed.
- **Type-Safe Environment Variables**: Provide type-safe access to environment variables.
- **Skip Validation Option**: Optionally skip validation if needed.

## Installation

```bash
npm install @ashgw/ts-env zod
```

or with `pnpm`:

```bash
pnpm add @ashgw/ts-env zod
```

## Usage

### Basic Example

```typescript
import { z } from 'zod';
import { createEnv } from '@ashgw/ts-env';

const env = createEnv({
  vars: {
    API_URL: z.string().url(),
    PORT: z.string().regex(/^\d+$/, 'PORT must be a number'),
  },
});

console.log(env.API_URL); // e.g., "https://example.com"
console.log(env.PORT);    // e.g., "3000"
```

### With Prefixes

If your environment variables have a common prefix, you can specify it:

```typescript
import { z } from 'zod';
import { createEnv } from '@ashgw/ts-env';

const env = createEnv({
  vars: {
    API_URL: z.string().url(),
    PORT: z.string().regex(/^\d+$/, 'PORT must be a number'),
  },
  prefix: 'NEXT_PUBLIC',
});

console.log(env.NEXT_PUBLIC_API_URL); // e.g., "https://example.com"
console.log(env.NEXT_PUBLIC_PORT);    // e.g., "3000"
```

### Disabling Prefix for Specific Variables

Disable the prefix for specific variables using the `disablePrefix` option:

```typescript
import { z } from 'zod';
import { createEnv } from '@ashgw/ts-env';

const env = createEnv({
  vars: {
    API_URL: z.string().url(),
    NODE_ENV: z.string().min(1),
    PORT: z.string().regex(/^\d+$/, 'PORT must be a number'),
  },
  prefix: 'NEXT_PUBLIC',
  disablePrefix: ['NODE_ENV'] as const,
});

console.log(env.NEXT_PUBLIC_API_URL); // e.g., "https://example.com"
console.log(env.NEXT_PUBLIC_PORT);    // e.g., "3000"
console.log(env.NODE_ENV);            // e.g., "development"
```

### Skipping Validation

To skip validation, set `skipValidation` to `true`:

```typescript
import { z } from 'zod';
import { createEnv } from '@ashgw/ts-env';

const env = createEnv({
  vars: {
    API_URL: z.string(),
    PORT: z.string(),
  },
  skipValidation: true,
});

console.log(env.API_URL);
console.log(env.PORT);
```

## API

### `createEnv`

#### Parameters

- `vars`: A record of variable names and their `zod` schemas.
- `prefix` (optional): A prefix to apply to variables (e.g., `'NEXT_PUBLIC'`).
- `disablePrefix` (optional): An array of variable names to exclude from the prefix.
- `skipValidation` (optional): If `true`, skips validation.

#### Returns

A type-safe object containing your environment variables.

## Error Handling

When validation fails, `createEnv` throws an error with details:

```bash
❌ Invalid environment variables: {
  NEXT_PUBLIC_API_URL: [ 'Invalid url' ],
  NEXT_PUBLIC_PORT: [ 'PORT must be a number' ],
  NODE_ENV: [ 'String must contain at least 1 character(s)' ]
}
Error: Invalid environment variables
    at createEnv (.../index.ts:XX:XX)
    ...
```

## License

[MIT](./LICENSE)