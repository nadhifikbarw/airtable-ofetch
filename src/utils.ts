import type { FetchPaginateContext, FetchPaginateGetOffsetFn } from "./types";

export function createGetOffset(): FetchPaginateGetOffsetFn {
  return function (ctx: FetchPaginateContext) {
    const offset = ctx.response?.offset;
    if (offset) return { offset };
  };
}
export const defaultGetOffset = createGetOffset();

export function isEmptyObject(value: any): boolean {
  if (value == null) return false; // Check null or undefined
  if (typeof value !== "object") return false;

  if (Array.isArray(value)) return false;
  if (value instanceof Date) return false;

  const values = Object.values(value);
  return values.length === 0 || !values.some((v) => v != null); // Only null or undefined
}
