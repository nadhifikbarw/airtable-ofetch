import { createRetryDelayFn } from "../src/retry";
import { describe, test, expect, beforeEach, vi } from "vitest";
import type { RetryDelayOption } from "../src/retry";

describe("createRetryDelayFn", () => {
  beforeEach(() => {
    vi.spyOn(Math, "random").mockReturnValue(1);
  });

  test("should allow default options", () => {
    const retryDelayFn = createRetryDelayFn();
    const context = { options: { requestAttempt: 0 } };
    //@ts-expect-error
    expect(retryDelayFn(context)).toEqual(1000);
  });

  test("should use custom initial delay", () => {
    const opts: RetryDelayOption = { initialDelayMs: 500 };
    const retryDelayFn = createRetryDelayFn(opts);
    const context = { options: { requestAttempt: 1 } };
    //@ts-expect-error
    expect(retryDelayFn(context)).toEqual(500);
  });

  test("should use custom max delay", () => {
    const opts: RetryDelayOption = { maxDelayMs: 10_000 };
    const retryDelayFn = createRetryDelayFn(opts);
    const context = { options: { requestAttempt: 10 } };
    //@ts-expect-error
    expect(retryDelayFn(context)).toEqual(10_000);
  });

  test("should default to first request attempt", () => {
    const retryDelayFn = createRetryDelayFn();
    const context = { options: { requestAttempt: undefined } };
    //@ts-expect-error
    expect(() => retryDelayFn(context)).not.toThrow();
    //@ts-expect-error
    expect(retryDelayFn(context)).toEqual(1000);
  });

  test("should jitter backoff time", () => {
    vi.restoreAllMocks();
    const retryDelayFn = createRetryDelayFn();
    const context = { options: { requestAttempt: 1 } };
    //@ts-expect-error
    const backoffTime1 = retryDelayFn(context);
    //@ts-expect-error
    const backoffTime2 = retryDelayFn(context);
    expect(backoffTime1).not.toEqual(backoffTime2);
  });

  test("should clip backoff time", () => {
    const opts: RetryDelayOption = { maxDelayMs: 1000 };
    const retryDelayFn = createRetryDelayFn(opts);
    const context = { options: { requestAttempt: 10 } };
    //@ts-expect-error
    expect(retryDelayFn(context)).toEqual(1000);
  });
});
