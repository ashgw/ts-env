
<div align="center">

# ts-env

A lightweight TypeScript utility for managing and validating environment variables with `zod`.

[![CI](https://github.com/AshGw/ts-env/actions/workflows/ci.yml/badge.svg)](https://github.com/AshGw/ts-env/actions/workflows/ci.yml)
[![@latest](https://img.shields.io/npm/v/@ashgw/ts-env.svg)](https://www.npmjs.com/package/ts-env)
[![npm downloads](https://img.shields.io/npm/dm/@ashgw/ts-env.svg)](https://www.npmjs.com/package/@ashgw/ts-env)
[![Socket Badge](https://socket.dev/api/badge/npm/package/@ashgw/ts-env/1.0.1)](https://socket.dev/npm/package/ts-env/overview/1.40.0)
<hr/>
</div>


## What It Does

- Validate environment variables with a schema.
- Support for variable prefixes (e.g., `NEXT_PUBLIC_`).
- Converts environment variables to fully type-safe objects.
- Handles empty strings as `undefined` (optional).

## Installation

```bash
npm install ts-env zod
```

or with `pnpm`:

```bash
pnpm add ts-env zod
```

## Usage

### Basic Example

```typescript
import { z } from 'zod';
import { createEnv } from 'ts-env';

const env = createEnv({
  vars: {
    API_URL: z.string().url(),
    PORT: z.string().regex(/^\d+$/, 'PORT must be a number'),
  },
});

console.log(env.API_URL); // e.g., "https://example.com"
console.log(env.PORT); // e.g., "3000"
```

### With Prefixes

If your environment variables have a prefix, you can specify it:

```typescript
import { z } from 'zod';
import { createEnv } from 'ts-env';

const env = createEnv({
  vars: {
    API_URL: z.string().url(),
    PORT: z.string().regex(/^\d+$/, 'PORT must be a number'),
  },
  prefix: 'NEXT_PUBLIC',
});

console.log(env.NEXT_PUBLIC_API_URL); // e.g., "https://example.com"
console.log(env.NEXT_PUBLIC_PORT); // e.g., "3000"
```

### Example `.env`

For local development, load variables using `dotenv`:

```bash
NEXT_PUBLIC_API_URL=https://example.com
NEXT_PUBLIC_PORT=3000
```

```typescript
import dotenv from 'dotenv';
import { z } from 'zod';
import { createEnv } from 'ts-env';

dotenv.config();

const env = createEnv({
  vars: {
    API_URL: z.string().url(),
    PORT: z.string().regex(/^\d+$/, 'PORT must be a number'),
  },
  prefix: 'NEXT_PUBLIC',
});

console.log(env.NEXT_PUBLIC_API_URL);
console.log(env.NEXT_PUBLIC_PORT);
```

## API

### `createEnv`

#### Parameters

- `vars`: A record of variable names and their `zod` schemas.
- `prefix` (optional): A prefix to apply to variables (e.g., `NEXT_PUBLIC`).
- `skipValidation` (optional): If `true`, skips validation.
- `emptyStringAsUndefined` (optional): If `true`, converts empty strings to `undefined`.

#### Returns

A fully validated, type-safe object containing your environment variables.

## Error Handling

When validation fails, `createEnv` throws an error:

```bash
❌ Invalid environment variables:
{
  API_URL: [ 'Required' ],
  PORT: [ 'PORT must be a number' ]
}
```

## License

[MIT](./LICENSE)
