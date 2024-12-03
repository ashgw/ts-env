import { z, ZodType, ZodError } from 'zod';

type Var = Record<string, ZodType>;

type Maybe<T> = T | undefined;
type ReadonlyPrefixArray<T> = ReadonlyArray<keyof T & string>;

export interface EnvSchema<
  V extends Var,
  Prefix extends Maybe<string>,
  DisablePrefix extends ReadonlyPrefixArray<V> = [],
> {
  vars: V;
  prefix?: Prefix;
  skipValidation?: boolean;
  disablePrefix?: DisablePrefix;
}

export type PrefixedEnvVars<
  V extends Var,
  Prefix extends Maybe<string>,
  DisablePrefix extends keyof V & string = never,
> = {
  [K in keyof V as K extends DisablePrefix
    ? K
    : Prefix extends string
      ? `${Prefix}_${string & K}`
      : K]: z.infer<V[K]>;
};

export function createEnv<
  V extends Var,
  Prefix extends Maybe<string> = undefined,
  DisablePrefix extends ReadonlyPrefixArray<V> = [],
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

  for (const key of Object.keys(vars) as Array<keyof V & string>) {
    const usePrefix = prefix && !disablePrefix.includes(key);
    const envKey = usePrefix ? `${prefix}_${key}` : key;
    const value = runtimeEnv[envKey];

    if (value !== undefined) {
      transformedEnv[key] = value;
    }
  }

  if (skipValidation) {
    const finalEnv: Record<string, unknown> = {};
    for (const key of Object.keys(vars) as Array<keyof V & string>) {
      const usePrefix = prefix && !disablePrefix.includes(key);
      const envKey = usePrefix ? `${prefix}_${key}` : key;
      finalEnv[envKey] = runtimeEnv[envKey];
    }
    return finalEnv as PrefixedEnvVars<V, Prefix, DisablePrefix[number]>;
  }

  const schema = z.object(vars);
  const parsed = schema.safeParse(transformedEnv);

  if (!parsed.success) {
    const error: ZodError = parsed.error;

    const fieldErrors = error.flatten().fieldErrors;

    const prefixedFieldErrors: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(fieldErrors)) {
      const usePrefix =
        prefix && !disablePrefix.includes(key as keyof V & string);
      const prefixedKey = usePrefix ? `${prefix}_${key}` : key;
      if (value !== undefined) {
        prefixedFieldErrors[prefixedKey] = value;
      }
    }

    console.error('❌ Invalid environment variables:', prefixedFieldErrors);
    throw new Error('Invalid environment variables');
  }

  const finalEnv: Record<string, unknown> = {};
  for (const key of Object.keys(parsed.data) as Array<keyof V & string>) {
    const usePrefix = prefix && !disablePrefix.includes(key);
    const envKey = usePrefix ? `${prefix}_${key}` : key;
    finalEnv[envKey] = parsed.data[key];
  }

  return finalEnv as PrefixedEnvVars<V, Prefix, DisablePrefix[number]>;
}
