// @ts-nocheck
import { vi } from "vitest";
import { Headers } from "ofetch";

export function mockResponses(
  statusCode: number | number[],
  responses?: Record<string, any> | Record<string, any>[],
  delay?: 0
) {
  // Support easy pagination mocking
  const $statusCode: number[] = Array.isArray(statusCode)
    ? statusCode
    : [statusCode];
  const $responses: Record<string, any>[] =
    responses === undefined
      ? []
      : Array.isArray(responses)
        ? responses
        : [responses];

  let idx = 0;
  let idxStatus = 0;

  const stubbedFetch = vi.fn((_request, options?: { signal?: AbortSignal }) => {
    // Listen to abort signal
    const controller = options?.signal;
    if (options?.signal) options.signal.addEventListener("abort", () => {});

    if (controller.aborted) {
      const error = new Error("Fetch aborted");
      error.name = "AbortError";
      throw error;
    }

    return new Promise((resolve, reject) => {
      if (controller)
        controller.addEventListener("abort", (ev: Error) => {
          const abortError = new Error(ev.message);
          abortError.name = "AbortError";
          reject(abortError);
        });

      // Simulate network delay
      setTimeout(() => {
        const body =
          $responses.length > 0 ? JSON.stringify($responses[idx]) : undefined;
        const status = $statusCode[idxStatus];

        if (idx < $statusCode.length - 1) idxStatus = idxStatus + 1;
        if (idx < $responses.length - 1) idx = idx + 1;

        resolve({
          body,
          status,
          headers: new Headers({ "content-type": "application/json" }),
          text: () => Promise.resolve(body),
        });
      }, delay);
    });
  });

  vi.stubGlobal("fetch", stubbedFetch);
  return stubbedFetch;
}
