// @ts-nocheck
import { vi } from "vitest";
import { Headers } from "ofetch";

export function mockResponses(
  statusCode: number,
  responses?: Record<string, any> | Record<string, any>[]
) {
  // Support easy pagination mocking
  const $responses: Record<string, any>[] =
    responses === undefined
      ? []
      : Array.isArray(responses)
        ? responses
        : [responses];

  let idx = 0;

  const stubbedFetch = vi.fn(() => {
    const body =
      $responses.length > 0 ? JSON.stringify($responses[idx]) : undefined;

    if (idx < $responses.length - 1) idx = idx + 1;

    return Promise.resolve({
      body,
      status: statusCode,
      headers: new Headers({ "content-type": "application/json" }),
      text: () => Promise.resolve(body),
    });
  });

  vi.stubGlobal("fetch", stubbedFetch);
}
