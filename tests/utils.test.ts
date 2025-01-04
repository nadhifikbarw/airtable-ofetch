import { AirtableError } from "../src/error";
import { isEmptyObject, isIterationTimeoutError } from "../src/utils";
import { describe, expect, test } from "vitest";

describe("isEmptyObject function", () => {
  test("returns false for null and undefined values", () => {
    expect(isEmptyObject(null)).toBe(false);
    expect(isEmptyObject(undefined)).toBe(false);
  });

  test("returns false for non-object values", () => {
    expect(isEmptyObject(123)).toBe(false);
    expect(isEmptyObject("hello")).toBe(false);
    expect(isEmptyObject(true)).toBe(false);
  });

  test("returns false for array values", () => {
    expect(isEmptyObject([])).toBe(false);
    expect(isEmptyObject([1, 2, 3])).toBe(false);
  });

  test("returns false for date values", () => {
    expect(isEmptyObject(new Date())).toBe(false);
  });

  test("returns true for empty object", () => {
    expect(isEmptyObject({})).toBe(true);
  });

  test("returns true for object with null or undefined values", () => {
    expect(isEmptyObject({ a: null, b: undefined })).toBe(true);
  });

  test("returns false for object with non-null values", () => {
    expect(isEmptyObject({ a: 1, b: "hello" })).toBe(false);
  });
});

describe("isIterationTimeoutError function", () => {
  test("returns true on iteration error", () => {
    expect(
      isIterationTimeoutError(
        new AirtableError(
          "LIST_RECORDS_ITERATOR_NOT_AVAILABLE",
          "The operation cannot be processed"
        )
      )
    ).toBe(true);
  });

  test("returns false on other AirtableError", () => {
    expect(
      isIterationTimeoutError(
        new AirtableError(
          "NOT_FOUND",
          "Could not find what you are looking for"
        )
      )
    ).toBe(false);
  });
});
