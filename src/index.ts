import { z, ZodType, ZodError } from 'zod';

import type { Maybe, UniqueArray } from './helper-types';

type EnvVar = Record<string, ZodType>;

interface EnvSchema<
  V extends EnvVar,
  Prefix extends Maybe<string>,
  DisablePrefix extends ReadonlyArray<keyof V & string> = [],
> {
  vars: V;
  prefix?: Prefix;
  skipValidation?: boolean;
  disablePrefix?: UniqueArray<DisablePrefix>;
}

type PrefixedEnvVars<
  V extends EnvVar,
  Prefix extends Maybe<string>,
  DisablePrefix extends keyof V & string = never,
> = {
  [K in keyof V as K extends DisablePrefix
    ? K
    : Prefix extends string
      ? `${Prefix}_${string & K}`
      : K]: z.infer<V[K]>;
};

/**
 * Loads and validates environment variables based on the provided schema.
 */
export function createEnv<
  V extends EnvVar,
  Prefix extends Maybe<string> = undefined,
  DisablePrefix extends readonly (keyof V & string)[] = [],
>(
  options: EnvSchema<V, Prefix, DisablePrefix>
): PrefixedEnvVars<V, Prefix, DisablePrefix[number]> {
  const {
    vars,
    prefix,
    skipValidation = false,
    disablePrefix = [] as unknown as DisablePrefix,
  } = options;

  const runtimeEnv = { ...process.env } as Record<string, Maybe<string>>;

  const transformedEnv: Record<string, unknown> = {};
  Object.keys(vars).forEach((key) => {
    const envKey =
      prefix && !disablePrefix.includes(key as keyof V & string)
        ? `${prefix}_${key}`
        : key;

    const value = runtimeEnv[envKey];
    if (value !== undefined) {
      transformedEnv[key as keyof V & string] = value;
    }
  });

  if (skipValidation) {
    return Object.keys(vars).reduce(
      (finalEnv, key) => {
        const shouldPrefix =
          prefix && !disablePrefix.includes(key as keyof V & string);
        const envKey = shouldPrefix ? `${prefix}_${key}` : key;
        finalEnv[envKey] = runtimeEnv[envKey];
        return finalEnv;
      },
      {} as Record<string, unknown>
    ) as PrefixedEnvVars<V, Prefix, DisablePrefix[number]>;
  }

  const schema = z.object(vars);
  const parsed = schema.safeParse(transformedEnv);

  if (!parsed.success) {
    const { fieldErrors } = (parsed.error as ZodError).flatten();
    const prefixedFieldErrors = Object.entries(fieldErrors).reduce<
      Record<string, string[]>
    >((acc, [key, value]) => {
      if (value) {
        const prefixedKey =
          prefix && !disablePrefix.includes(key as keyof V & string)
            ? `${prefix}_${key}`
            : key;
        acc[prefixedKey] = value;
      }
      return acc;
    }, {});

    console.error('❌ Invalid environment variables:', prefixedFieldErrors);
    throw new Error('Invalid environment variables');
  }

  const finalEnv: Record<string, unknown> = {};

  Object.entries(parsed.data).forEach(([key, value]) => {
    const envKey =
      prefix && !disablePrefix.includes(key) ? `${prefix}_${key}` : key;
    finalEnv[envKey] = value;
  });

  return finalEnv as PrefixedEnvVars<V, Prefix, DisablePrefix[number]>;
}

const env = createEnv({
  vars: {
    NODE_ENV: z.string().min(1),
    DASHBOARD_URL: z.string().min(1),
  },
  prefix: 'NEXT_PUBLIC',
  skipValidation: false,
  disablePrefix: ['DASHBOARD_URL', 'NODE_ENV'],
});

console.log(env.NODE_ENV);
