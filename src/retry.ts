import type { FetchContext } from "ofetch";

export type RetryDelayFn = (context: FetchContext) => number;

export interface RetryDelayOption {
  initialDelayMs: number;
  maxDelayMs: number;
}

export function createRetryDelayFn(
  opts: RetryDelayOption = { initialDelayMs: 5000, maxDelayMs: 60_000 }
): RetryDelayFn {
  // Memory leak?
  const retryCounter = new WeakMap<Request, number>();
  const { initialDelayMs, maxDelayMs } = opts;

  function incrRetryCounter(context: FetchContext) {
    if (!retryCounter.has(context.request as Request)) {
      retryCounter.set(context.request as Request, 0);
    }

    const now = (retryCounter.get(context.request as Request) as number) + 1;
    retryCounter.set(context.request as Request, now);
    return now;
  }

  return function (context) {
    // Increment counter whenever retry delay requested
    const numRetries = incrRetryCounter(context);

    const rawBackoffTimeMs = initialDelayMs * 2 ** numRetries;
    const clippedBackoffTimeMs = Math.min(maxDelayMs, rawBackoffTimeMs);
    const jitteredBackoffTimeMs = Math.random() * clippedBackoffTimeMs;
    return jitteredBackoffTimeMs;
  };
}
