import { z, ZodType, ZodError } from 'zod';

type EnvVar = Record<string, ZodType<any>>;
type Maybe<T> = T | undefined;

interface EnvSchema<
  V extends EnvVar,
  Prefix extends Maybe<string> = undefined,
  DisablePrefix extends ReadonlyArray<keyof V & string> = [],
> {
  vars: V;
  prefix?: Prefix;
  skipValidation?: boolean;
  disablePrefix?: DisablePrefix;
}

/**
 * Loads and validates environment variables based on the provided schema.
 */
export function createEnv<
  V extends EnvVar,
  Prefix extends Maybe<string> = undefined,
  DisablePrefix extends readonly (keyof V & string)[] = [],
>(
  options: EnvSchema<V, Prefix, DisablePrefix>
): Record<string, z.infer<V[string]>> {
  const {
    vars,
    prefix,
    skipValidation = false,
    disablePrefix = [] as unknown as DisablePrefix,
  } = options;

  const runtimeEnv = { ...process.env } as Record<string, Maybe<string>>;

  const transformedEnv: Record<string, unknown> = {};
  for (const key in vars) {
    const shouldPrefix = prefix && !disablePrefix.includes(key);
    const envKey = shouldPrefix ? `${prefix}_${key}` : key;
    const value = runtimeEnv[envKey];
    if (value !== undefined) {
      transformedEnv[key] = value;
    }
  }

  if (skipValidation) {
    const finalEnv: Record<string, unknown> = {};
    for (const key in vars) {
      const shouldPrefix = prefix && !disablePrefix.includes(key);
      const envKey = shouldPrefix ? `${prefix}_${key}` : key;
      finalEnv[envKey] = runtimeEnv[envKey];
    }
    return finalEnv as Record<string, z.infer<V[string]>>;
  }

  const schema = z.object(vars);
  const parsed = schema.safeParse(transformedEnv);

  if (!parsed.success) {
    const { fieldErrors } = (parsed.error as ZodError).flatten();
    const prefixedFieldErrors = Object.entries(fieldErrors).reduce<
      Record<string, string[]>
    >((acc, [key, value]) => {
      if (value) {
        const shouldPrefix =
          prefix && !disablePrefix.includes(key as keyof V & string);
        const prefixedKey = shouldPrefix ? `${prefix}_${key}` : key;
        acc[prefixedKey] = value;
      }
      return acc;
    }, {});

    console.error('❌ Invalid environment variables:', prefixedFieldErrors);
    throw new Error('Invalid environment variables');
  }

  const finalEnv: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(parsed.data)) {
    const shouldPrefix =
      prefix && !disablePrefix.includes(key as keyof V & string);
    const envKey = shouldPrefix ? `${prefix}_${key}` : key;
    finalEnv[envKey] = value;
  }

  return finalEnv as Record<string, z.infer<V[string]>>;
}
