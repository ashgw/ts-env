import type { UnionToTuple, Keys } from 'ts-roids';

type OrderedTuple<T> = UnionToTuple<Keys<T>>;

/**
 * Create a **tuple** of env var names from a Zod schema record,
 * keeping the key order you wrote too. This is perfect for piping into
 * `disablePrefix` when using `createEnv`.
 *
 * @example
 * const serverVars = {
 *   NODE_ENV: z.enum(["production", "development", "test"]).optional(),
 *   DATABASE_URL: z.string().url(),
 *   DIRECT_URL: z.string().url(),
 * } ;
 *
 * const serverVarTuple = envTuple(serverVars);
 * //    ^? ["NODE_ENV", "DATABASE_URL", "DIRECT_URL"]
 *
 */
export function envTuple<Schema extends Record<string, any>>(
  s: Schema
): OrderedTuple<typeof s> {
  return Object.keys(s) as OrderedTuple<typeof s>;
}
