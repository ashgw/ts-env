export type Maybe<T> = T | undefined;

/* eslint-disable @typescript-eslint/no-explicit-any */
export type UniqueArray<
  T extends readonly any[],
  Seen = never,
> = T extends readonly [infer Head, ...infer Tail]
  ? Head extends Seen
    ? ['Encountered duplicate env var', Head]
    : readonly [Head, ...UniqueArray<Tail, Seen | Head>]
  : T;
