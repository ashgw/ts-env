export type Maybe<T> = T | undefined;

/**
 * Check if a value X is present in array T.
 *
 * @template T - The array to search.
 * @template X - The value to search for in the array.
 */
/* eslint-disable @typescript-eslint/no-unused-vars*/
type InArray<T extends readonly any[], X> = T extends readonly [
  X,
  ...infer _Rest,
]
  ? true
  : T extends readonly [infer _, ...infer Rest]
    ? InArray<Rest, X>
    : false;

/**
 * Utility to ensure that an array contains unique elements.
 * If duplicates are found, it results in a type error.
 * Credits go to: @see https://ja.nsommer.dk/articles/type-checked-unique-arrays.html
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export type UniqueArray<T extends readonly any[]> = T extends readonly [
  infer X,
  ...infer Rest,
]
  ? InArray<Rest, X> extends true
    ? ['Encountered duplicate env var', X]
    : readonly [X, ...UniqueArray<Rest>]
  : T;
