import type { Maybe, UniqueArray } from 'ts-roids';
import type { ZodError } from 'zod';
import { z } from 'zod';

/**
 * Represents a record of environment variable definitions
 * where each key maps to a Zod schema.
 */
type EnvVar = Record<string, any>; // z.ZodTypeAny has issues

/**
 * Produces a runtime environment type that optionally applies a prefix
 * to each key, except for those listed in `DisabledKeys`.
 */
type PrefixedRuntimeEnv<
  S extends EnvVar,
  P extends Maybe<string>,
  DisabledKeys extends readonly (keyof S & string)[],
> = {
  [K in keyof S as K extends DisabledKeys[number]
    ? K
    : P extends string
      ? `${P}_${string & K}`
      : K]: Maybe<string>;
};

/**
 * Configuration object for creating a typed, prefixed environment.
 */
interface EnvSchema<
  S extends EnvVar,
  P extends Maybe<string>,
  DisabledKeys extends readonly (keyof S & string)[] = [],
> {
  /** Zod schemas for each environment variable */
  vars: S;
  /** Optional prefix to prepend to environment variable keys */
  prefix?: P;
  /** Skip validation altogether */
  skipValidation?: boolean;
  /** Keys that should not be prefixed */
  disablePrefix?: UniqueArray<DisabledKeys>;
  /** A manually provided environment object, merged with process.env */
  runtimeEnv?: PrefixedRuntimeEnv<S, P, DisabledKeys>;
}

/** Infers the validated TypeScript type for each variable in the EnvVar record. */
type InferEnvVars<S extends EnvVar> = {
  [K in keyof S]: z.infer<S[K]>;
};

/**
 * Renames (prefixes) the keys of the inferred environment variables,
 * skipping those that appear in `D`.
 */
type RenameKeys<E extends EnvVar, P extends Maybe<string>, D extends string> = {
  [K in keyof E as K extends D
    ? K
    : P extends string
      ? K extends string
        ? `${P}_${K}`
        : K
      : K]: E[K];
};

/** Final shape of the environment object after key prefixing and schema inference. */
type PrefixedEnvVars<
  S extends EnvVar,
  P extends Maybe<string>,
  D extends keyof S & string = never,
> = RenameKeys<InferEnvVars<S>, P, D>;

/**
 * Creates a typed environment object with optional key prefixing and schema validation.
 *
 * @throws if validation fails and `skipValidation` is false
 */
export function createEnv<
  S extends EnvVar,
  P extends Maybe<string> = undefined,
  D extends readonly (keyof S & string)[] = [],
>(options: EnvSchema<S, P, D>): PrefixedEnvVars<S, P, D[number]> {
  const {
    vars,
    prefix,
    skipValidation = false,
    disablePrefix = [] as unknown as D,
    runtimeEnv: customRuntimeEnv,
  } = options;

  const runtimeEnv = customRuntimeEnv
    ? // If you're using NextJS you have to explicitly declare the environment variables with process.env
      // @see https://github.com/ashgw/ts-env?tab=readme-ov-file#nextjs-monorepos
      { ...process.env, ...customRuntimeEnv }
    : ({ ...process.env } as Record<string, Maybe<string>>);

  /** Collect only the relevant environment variables (matching schema keys). */
  const transformedEnv: Record<string, unknown> = {};
  for (const key of Object.keys(vars)) {
    const shouldPrefix =
      prefix && !disablePrefix.includes(key as keyof S & string);
    const envKey = shouldPrefix ? `${prefix}_${key}` : key;

    const value = runtimeEnv[envKey];
    if (value !== undefined) {
      transformedEnv[key] = value;
    }
  }

  /**
   * If validation is skipped, just map each final environment key
   * back to runtimeEnv without actual Zod checks.
   */
  if (skipValidation) {
    const finalEnv: Record<string, unknown> = {};
    for (const key of Object.keys(vars)) {
      const shouldPrefix =
        prefix && !disablePrefix.includes(key as keyof S & string);
      const envKey = shouldPrefix ? `${prefix}_${key}` : key;
      finalEnv[envKey] = runtimeEnv[envKey];
    }
    return finalEnv as PrefixedEnvVars<S, P, D[number]>;
  }

  /** Run Zod validation. */
  const schema = z.object(vars);
  const parsed = schema.safeParse(transformedEnv);

  if (!parsed.success) {
    const { fieldErrors } = (parsed.error as ZodError).flatten();
    const prefixedFieldErrors = Object.entries(fieldErrors).reduce<
      Record<string, string[]>
    >((acc, [key, messages]) => {
      if (messages) {
        const shouldPrefix =
          prefix && !disablePrefix.includes(key as keyof S & string);
        const prefixedKey = shouldPrefix ? `${prefix}_${key}` : key;
        // @ts-expect-error just stfu
        acc[prefixedKey] = messages;
      }
      return acc;
    }, {});

    console.error('❌ Invalid environment variables:', prefixedFieldErrors);
    throw new Error('Invalid environment variables');
  }

  /**
   * Remap the validated data into the final environment object,
   * prefixing keys where appropriate.
   */
  const finalEnv: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(parsed.data)) {
    const shouldPrefix =
      prefix && !disablePrefix.includes(key as keyof S & string);
    const envKey = shouldPrefix ? `${prefix}_${key}` : key;
    finalEnv[envKey] = value;
  }

  return finalEnv as PrefixedEnvVars<S, P, D[number]>;
}
