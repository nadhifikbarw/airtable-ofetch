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
    const requestAttempt = context.options.requestAttempt ?? 0;
    const retryNumber = requestAttempt > 1 ? requestAttempt - 1 : 0;

    // Increment counter whenever retry delay requested
    const rawBackoffTimeMs = $opts.initialDelayMs * Math.pow(2, retryNumber);

    // Support custom backoff?
    const clippedBackoffTimeMs = Math.min($opts.maxDelayMs, rawBackoffTimeMs);
    const jitteredBackoffTimeMs = Math.random() * clippedBackoffTimeMs;
    return jitteredBackoffTimeMs;
  };
}
