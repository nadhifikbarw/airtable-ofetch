import type { FetchContext } from "ofetch";

export type RetryDelayFn = (context: FetchContext) => number;
export interface RetryDelayOption {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
}

export function createRetryDelayFn(opts?: RetryDelayOption): RetryDelayFn {
  const $opts = { initialDelayMs: 1000, maxDelayMs: 45_000, ...opts };
  return function (context) {
    const requestAttempt = context.options.requestAttempt ?? 1;

    // Increment counter whenever retry delay requested
    const rawBackoffTimeMs = $opts.initialDelayMs * 2 ** requestAttempt;

    // Support custom backoff?
    const clippedBackoffTimeMs = Math.min($opts.maxDelayMs, rawBackoffTimeMs);
    const jitteredBackoffTimeMs = Math.random() * clippedBackoffTimeMs;
    return jitteredBackoffTimeMs;
  };
}
