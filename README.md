# @ashgw/ts-env

  

A lightweight TypeScript utility for managing and validating environment variables with [`zod`](https://github.com/colinhacks/zod).


## What It Does


- **Schema Validation**: Validate environment variables with a `zod` schema.

- **Prefix Handling**: Support prefixes like `NEXT_PUBLIC_` for variables.

- **Flexible Prefix Control**: Exclude prefixes for specific variables as needed.

- **Type Safety**: Access environment variables with full type safety.

- **Optional Validation**: Skip validation when required.


## Why Not Use Other Options?

- **t3-oss/t3-env**: forces you to repeat yourself with runtime, server & client options. And I personally don't repeat myself. So I added a prefix option e.g: `prefix: 'NEXT_PUBLIC'`, you add it once and that's it.

- **envalid**: it doesn't use  `zod`, which means additional overhead for importing and learning a new schema validation lib. You already know zod, so might as well use it.

- **envsafe**: too many options, can lead to mental overhead, and I don't like mental overhead, you probably don't too, plus, last commit was like 2 years ago.
- **your own library:** If you created one cool, but if you didn't, here's one.
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
  disablePrefix: ['NODE_ENV'],
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