import { beforeEach, describe, expect, test } from "vitest";
import { Airtable } from "../src/airtable";
import { mockResponses } from "./utils";
import { AirtableRecord } from "../src/record";

describe("AirtableTable", function () {
  describe("List Records - /:baseId/:tableId", function () {
    test("#firstPage", async function () {
      mockResponses(200, {
        records: [
          {
            id: "rec0GjNoQFxWcCzUI",
            createdTime: "2024-12-15T05:06:02.000Z",
            fields: {
              Name: "01JF4BAFS82AKNZDQ0SGMA59WK",
              Notes: "Savings Institutions",
            },
          },
          {
            id: "rec0LcBQrI0LLDVH0",
            createdTime: "2024-12-15T05:06:02.000Z",
            fields: {
              Name: "01JF4BAFSB5YGXDJ8F4A42MT18",
              Notes: "Major Pharmaceuticals",
            },
          },
        ],
        offset: "itrnrqAimdUnCiqct/rec0LcBQrI0LLDVH0",
      });

      const table = new Airtable()
        .base("appEpvhkjHcG8OvKu")
        .table("tblc7ieWKVQM9eequ");

      await expect(table.list({ pageSize: 2 }).firstPage()).resolves.toEqual(
        expect.arrayContaining([expect.any(AirtableRecord)])
      );
    });

    describe("#eachPage", function () {
      beforeEach(function () {
        mockResponses(200, [
          {
            records: [
              {
                id: "rec0GjNoQFxWcCzUI",
                createdTime: "2024-12-15T05:06:02.000Z",
                fields: {
                  Name: "01JF4BAFS82AKNZDQ0SGMA59WK",
                  Notes: "Savings Institutions",
                },
              },
              {
                id: "rec0LcBQrI0LLDVH0",
                createdTime: "2024-12-15T05:06:02.000Z",
                fields: {
                  Name: "01JF4BAFSB5YGXDJ8F4A42MT18",
                  Notes: "Major Pharmaceuticals",
                },
              },
              // Up to max records allowed
            ],
            offset: "itrjH1BVGgfWAxXLV/recBxL3V4PRZ2FZVk",
          },
          {
            records: [
              {
                id: "rec0GjNoQFxWcCzUI",
                createdTime: "2024-12-15T05:06:02.000Z",
                fields: {
                  Name: "01JF4BAFS82AKNZDQ0SGMA59WK",
                  Notes: "Savings Institutions",
                },
              },
              {
                id: "rec0LcBQrI0LLDVH0",
                createdTime: "2024-12-15T05:06:02.000Z",
                fields: {
                  Name: "01JF4BAFSB5YGXDJ8F4A42MT18",
                  Notes: "Major Pharmaceuticals",
                },
              },
            ],
            offset: "itrjH1BVGgfWAxXLV/rec0lLDu0lTB57c5c",
          },
          {
            records: [
              {
                id: "rec0dcGQfhzsPbxBn",
                createdTime: "2024-12-15T05:06:02.000Z",
                fields: {
                  Name: "01JF4BAFRGEW00MMN30QA3FYZ7",
                  Notes: "Investment Managers",
                },
              },
              {
                id: "rec0lLDu0lTB57c5c",
                createdTime: "2024-12-15T05:06:02.000Z",
                fields: {
                  Name: "01JF4BAFPNSZHMHPAVRA8173QJ",
                  Notes: "n/a",
                },
              },
            ],
          },
        ]);
      });

      test("iterate completely", async function () {
        const table = new Airtable()
          .base("appEpvhkjHcG8OvKu")
          .table("tblc7ieWKVQM9eequ");

        let count = 0;
        let pageCount = 0;
        await table.list({ pageSize: 2 }).eachPage((pageRecords) => {
          pageCount++;
          count += pageRecords.length;

          expect(pageRecords).toEqual(
            expect.arrayContaining([expect.any(AirtableRecord)])
          );
        });

        expect(count).toEqual(6);
        expect(pageCount).toEqual(3);
      });

      test("iterate partially", async function () {
        const table = new Airtable()
          .base("appEpvhkjHcG8OvKu")
          .table("tblc7ieWKVQM9eequ");

        let count = 0;
        let pageCount = 0;
        await table.list({ pageSize: 2 }).eachPage((pageRecords) => {
          pageCount++;
          count += pageRecords.length;

          expect(pageRecords).toEqual(
            expect.arrayContaining([expect.any(AirtableRecord)])
          );

          // Stop at page 2
          if (pageCount === 2) return false;
        });

        expect(count).toEqual(4);
        expect(pageCount).toEqual(2);
      });
    });

    test("#all", async function () {
      mockResponses(200, [
        {
          records: [
            {
              id: "rec0GjNoQFxWcCzUI",
              createdTime: "2024-12-15T05:06:02.000Z",
              fields: {
                Name: "01JF4BAFS82AKNZDQ0SGMA59WK",
                Notes: "Savings Institutions",
              },
            },
            {
              id: "rec0LcBQrI0LLDVH0",
              createdTime: "2024-12-15T05:06:02.000Z",
              fields: {
                Name: "01JF4BAFSB5YGXDJ8F4A42MT18",
                Notes: "Major Pharmaceuticals",
              },
            },
            // Up to max records allowed
          ],
          offset: "itrjH1BVGgfWAxXLV/recBxL3V4PRZ2FZVk",
        },
        {
          records: [
            {
              id: "rec0GjNoQFxWcCzUI",
              createdTime: "2024-12-15T05:06:02.000Z",
              fields: {
                Name: "01JF4BAFS82AKNZDQ0SGMA59WK",
                Notes: "Savings Institutions",
              },
            },
            {
              id: "rec0LcBQrI0LLDVH0",
              createdTime: "2024-12-15T05:06:02.000Z",
              fields: {
                Name: "01JF4BAFSB5YGXDJ8F4A42MT18",
                Notes: "Major Pharmaceuticals",
              },
            },
          ],
        },
      ]);

      const table = new Airtable()
        .base("appEpvhkjHcG8OvKu")
        .table("tblc7ieWKVQM9eequ");

      await expect(table.list().all()).resolves.toHaveLength(4);
    });
  });

  test("Get Record - /:baseId/:tableId/:recordId", async function () {
    mockResponses(200, {
      id: "recPaibwSLDbZr80V",
      createdTime: new Date().toISOString(),
      fields: {
        Name: "Sample Record",
      },
    });

    const table = new Airtable()
      .base("appEpvhkjHcG8OvKu")
      .table("tblc7ieWKVQM9eequ");
    const record = await table.get("recPaibwSLDbZr80V");

    expect(record).toMatchObject({
      id: expect.any(String),
      fields: expect.any(Object),
      createdTime: expect.any(Date),
    });
  });
});
