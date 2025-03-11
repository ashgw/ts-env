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
- **your own library:** If you've already created one, it probably sucks; this one doesn't.
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
  NEXT_PUBLIC_WWW_URL: [ 'Invalid url' ],
  NEXT_PUBLIC_WWW_GOOGLE_ANALYTICS_ID: [
    'String must contain at least 7 character(s)',
    'Invalid input: must start with "G-"'
  ],
  NEXT_PUBLIC_BLOG_GOOGLE_ANALYTICS_ID: [
    'String must contain at least 7 character(s)',
    'Invalid input: must start with "G-"'
  ],
  NEXT_PUBLIC_BLOG_URL: [ 'Invalid url' ]
}
```
Here's an an example in [action.](https://github.com/ashgw/ashgw.me/actions/runs/12863495726/job/35860182081#step:5:25)

<details>
<summary><strong>Example with IntelliSense</strong></summary>

![Image](https://github.com/user-attachments/assets/10a49170-4aac-4c78-98d2-63c61a461392)
</details>


## Presets

To simplify the management of environment variables for specific platforms, you can use presets provided by the library. For example, if you're deploying on Vercel, you can easily include all the relevant environment variables by importing and using the dedicated Vercel preset.

### Example with Vercel Preset

![image](https://github.com/user-attachments/assets/92acc69b-a5fe-4c54-9de4-90fba356bcc1)
#### Supported presets
- Vercel
- Netlify
- Fly
- Railway

## License

[MIT](./LICENSE)
