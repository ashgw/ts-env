import { z, ZodType, ZodError } from 'zod';

type Maybe<T> = T | undefined;

export interface EnvSchema<
  T extends Record<string, ZodType>,
  Prefix extends Maybe<string>,
> {
  vars: T;
  prefix?: Prefix;
  skipValidation?: boolean;
  emptyStringAsUndefined?: boolean;
}

export type PrefixedEnvVars<
  T extends Record<string, ZodType>,
  Prefix extends Maybe<string>,
> = Prefix extends string
  ? {
      [K in keyof T as `${Prefix}_${string & K}`]: T[K]['_output'];
    }
  : {
      [K in keyof T]: T[K]['_output'];
    };

export function createEnv<
  T extends Record<string, ZodType>,
  Prefix extends Maybe<string> = undefined,
>(options: EnvSchema<T, Prefix>): PrefixedEnvVars<T, Prefix> {
  const {
    vars,
    prefix,
    skipValidation = false,
    emptyStringAsUndefined = false,
  } = options;

  const runtimeEnv = { ...process.env };

  if (emptyStringAsUndefined) {
    for (const [key, value] of Object.entries(runtimeEnv)) {
      if (value === '') {
        delete runtimeEnv[key];
      }
    }
  }

  const transformedEnv: Record<string, unknown> = {};
  if (prefix) {
    for (const [key, value] of Object.entries(runtimeEnv)) {
      if (key.startsWith(`${prefix}_`)) {
        const strippedKey = key.slice(prefix.length + 1);
        transformedEnv[strippedKey] = value;
      }
    }
  } else {
    Object.assign(transformedEnv, runtimeEnv);
  }
  if (skipValidation) {
    return runtimeEnv as PrefixedEnvVars<T, Prefix>;
  }

  const schema = z.object(vars);
  const parsed = schema.safeParse(transformedEnv);

  if (!parsed.success) {
    const error: ZodError = parsed.error;
    console.error(
      '❌ Invalid environment variables:',
      error.flatten().fieldErrors
    );
    throw new Error('Invalid environment variables');
  }

  const finalEnv: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(parsed.data)) {
    if (prefix) {
      finalEnv[`${prefix}_${key}`] = value;
    } else {
      finalEnv[key] = value;
    }
  }

  return finalEnv as PrefixedEnvVars<T, Prefix>;
}
