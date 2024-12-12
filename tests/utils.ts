import { vi } from "vitest";

export function mockResponse(statusCode: number, data: Record<string, any>) {
  return vi.spyOn(globalThis, "fetch").mockImplementation(() =>
    //@ts-ignore
    Promise.resolve({
      status: statusCode,
      text: () => Promise.resolve(JSON.stringify(data)),
    })
  );
}
