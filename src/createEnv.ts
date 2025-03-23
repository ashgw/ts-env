import type { Maybe, UniqueArray } from 'ts-roids';
import type { ZodError } from 'zod';
import { z } from 'zod';

type EnvVar = Record<string, any>;

// type to generate prefixed keys for runtime environment
type PrefixedRuntimeEnv<
  V extends EnvVar,
  Prefix extends Maybe<string>,
  DisablePrefix extends readonly (keyof V & string)[],
> = {
  [K in keyof V as K extends DisablePrefix[number]
    ? K
    : Prefix extends string
      ? `${Prefix}_${string & K}`
      : K]: Maybe<string>;
};

interface EnvSchema<
  V extends EnvVar,
  Prefix extends Maybe<string>,
  DisablePrefix extends readonly (keyof V & string)[] = [],
> {
  vars: V;
  prefix?: Prefix;
  skipValidation?: boolean;
  disablePrefix?: UniqueArray<DisablePrefix>;
  // have runtimeEnv type-safe by requiring all variables from vars
  runtimeEnv?: PrefixedRuntimeEnv<V, Prefix, DisablePrefix>;
}

type RenameKeys<
  E extends EnvVar,
  Prefix extends Maybe<string>,
  Disable extends string,
> = {
  [K in keyof E as K extends Disable
    ? K
    : Prefix extends string
      ? K extends string
        ? `${Prefix}_${K}`
        : K
      : K]: E[K];
};
type InferEnvVars<V extends EnvVar> = {
  [K in keyof V]: z.infer<V[K]>;
};

type PrefixedEnvVars<
  V extends EnvVar,
  Prefix extends Maybe<string>,
  DisablePrefix extends keyof V & string = never,
> = RenameKeys<InferEnvVars<V>, Prefix, DisablePrefix>;

/**
 * Creates a prefixed environment variable object based on the provided schema.
 *
 * @returns An object containing the environment variables, with keys potentially prefixed.
 *
 * @throws Error if the environment variables do not match the defined schema and validation is not skipped.
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
    runtimeEnv: customRuntimeEnv,
  } = options;

  const runtimeEnv = customRuntimeEnv
    ? { ...process.env, ...customRuntimeEnv }
    : ({ ...process.env } as Record<string, Maybe<string>>);

  const transformedEnv: Record<string, unknown> = {};
  for (const key of Object.keys(vars)) {
    const envKey =
      prefix && !disablePrefix.includes(key as keyof V & string)
        ? `${prefix}_${key}`
        : key;

    const value = runtimeEnv[envKey];
    if (value !== undefined) {
      transformedEnv[key] = value;
    }
  }

  if (skipValidation) {
    const finalEnv: Record<string, unknown> = {};
    for (const key of Object.keys(vars)) {
      const shouldPrefix =
        prefix && !disablePrefix.includes(key as keyof V & string);
      const envKey = shouldPrefix ? `${prefix}_${key}` : key;
      finalEnv[envKey] = runtimeEnv[envKey];
    }

    return finalEnv as PrefixedEnvVars<V, Prefix, DisablePrefix[number]>;
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
  for (const [key, value] of Object.entries(parsed.data)) {
    const envKey =
      prefix && !disablePrefix.includes(key as keyof V & string)
        ? `${prefix}_${key}`
        : key;
    finalEnv[envKey] = value;
  }

  return finalEnv as PrefixedEnvVars<V, Prefix, DisablePrefix[number]>;
}
