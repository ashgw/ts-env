import { z } from 'zod';

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
 * @param keys Record of keys mapped to Zod schemas
 * @returns Tuple of the keys in declaration order
 */
export function envTuple<
  Schema extends Record<Uppercase<string>, z.ZodTypeAny>,
>(keys: Schema): readonly (keyof Schema & string)[] {
  return Object.keys(keys) as readonly (keyof Schema & string)[];
}
