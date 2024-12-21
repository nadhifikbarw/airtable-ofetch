import { beforeEach, describe, expect, test } from "vitest";
import { Airtable } from "../src";
import { mockResponses } from "./utils";
import { AirtableRecord } from "../src/record";
import { AirtableComment } from "../src/comment";

describe("AirtableTable", function () {
  test("Create record - /:baseId/:tableId", async function () {
    const createdTime = new Date();

    mockResponses(200, {
      id: "recZqO1PfM5Zv3CTe",
      createdTime: createdTime.toISOString(),
      fields: { Name: "Sample Record" },
    });

    const table = new Airtable()
      .base("appEpvhkjHcG8OvKu")
      .table("tblc7ieWKVQM9eequ");
    const record = await table.create({ Name: "Sample Record" });

    expect(record).toBeInstanceOf(AirtableRecord);
    expect(record.get("Name")).toEqual("Sample Record");
    expect(record.createdTime).toEqual(createdTime);
  });

  test("Create multiple records - /:baseId/:tableId", async function () {
    const createdTime = new Date();

    mockResponses(200, {
      records: [
        {
          id: "recZqO1PfM5Zv3CTe",
          createdTime: createdTime.toISOString(),
          fields: { Name: "Sample Record 1" },
        },
        {
          id: "rec0LcBQrI0LLDVH0",
          createdTime: createdTime.toISOString(),
          fields: { Name: "Sample Record 2" },
        },
      ],
    });

    const table = new Airtable()
      .base("appEpvhkjHcG8OvKu")
      .table("tblc7ieWKVQM9eequ");
    const response = await table.create([
      { fields: { Name: "Sample Record 1" } },
      { fields: { Name: "Sample Record 2" } },
    ]);

    const records = response.records;

    for (const [i, record] of records.entries()) {
      expect(record).toBeInstanceOf(AirtableRecord);
      expect(record.get("Name")).toEqual(`Sample Record ${i + 1}`);
      expect(record.createdTime).toEqual(createdTime);
    }
  });

  describe("List records - /:baseId/:tableId", function () {
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

  test("Get records - /:baseId/:tableId/:recordId", async function () {
    mockResponses(200, {
      id: "recPaibwSLDbZr80V",
      createdTime: "2024-12-15T04:20:33.000Z",
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

  test("PATCH update record - /:baseId/:tableId/:recordId", async function () {
    mockResponses(200, {
      id: "recPaibwSLDbZr80V",
      createdTime: "2024-12-15T04:20:33.000Z",
      fields: {
        Name: "Updated Name",
        // Other fields
        Notes: "Real Estate Investment Trusts",
      },
    });

    const table = new Airtable()
      .base("appEpvhkjHcG8OvKu")
      .table("tblc7ieWKVQM9eequ");
    const record = await table.update("PATCH", "recPaibwSLDbZr80V", {
      Name: "Updated Name",
    });

    expect(record).toBeInstanceOf(AirtableRecord);
    expect(record.id).toEqual("recPaibwSLDbZr80V");
    expect(record.get("Name")).toEqual("Updated Name");
    expect(record.createdTime).toBeInstanceOf(Date);
  });

  test("PATCH update multiple records - /:baseId/:tableId", async function () {
    mockResponses(200, {
      records: [
        {
          id: "recPaibwSLDbZr80V",
          createdTime: "2024-12-15T04:20:33.000Z",
          fields: {
            Name: "Updated Name",
            // Other fields
            Notes: "Real Estate Investment Trusts",
          },
        },
      ],
    });

    const table = new Airtable()
      .base("appEpvhkjHcG8OvKu")
      .table("tblc7ieWKVQM9eequ");

    const response = await table.update("PATCH", [
      { id: "recPaibwSLDbZr80V", fields: { Name: "Updated Name" } },
    ]);

    expect(response.records[0]).toBeInstanceOf(AirtableRecord);
    expect(response.records[0].id).toEqual("recPaibwSLDbZr80V");
    expect(response.records[0].get("Name")).toEqual("Updated Name");
    expect(response.records[0].createdTime).toBeInstanceOf(Date);
  });

  test.todo(
    "PATCH upsert multiple records - /:baseId/:tableId",
    async function () {}
  );

  test("PUT update record - /:baseId/:tableId/:recordId", async function () {
    mockResponses(200, {
      id: "recPaibwSLDbZr80V",
      createdTime: "2024-12-15T04:20:33.000Z",
      fields: { Name: "Updated Name" },
    });

    const table = new Airtable()
      .base("appEpvhkjHcG8OvKu")
      .table("tblc7ieWKVQM9eequ");

    const record = await table.update("PUT", "recPaibwSLDbZr80V", {
      Name: "Updated Name",
    });

    expect(record).toBeInstanceOf(AirtableRecord);
    expect(record.id).toEqual("recPaibwSLDbZr80V");
    expect(record.get("Name")).toEqual("Updated Name");
    expect(record.get("Notes")).toEqual(undefined);
    expect(record.createdTime).toBeInstanceOf(Date);
  });

  test("PUT update multiple records - /:baseId/:tableId", async function () {
    mockResponses(200, {
      records: [
        {
          id: "recPaibwSLDbZr80V",
          createdTime: "2024-12-15T04:20:33.000Z",
          fields: { Name: "Updated Name" },
        },
      ],
    });

    const table = new Airtable()
      .base("appEpvhkjHcG8OvKu")
      .table("tblc7ieWKVQM9eequ");

    const response = await table.update("PUT", [
      { id: "recPaibwSLDbZr80V", fields: { Name: "Updated Name" } },
    ]);

    expect(response.records[0]).toBeInstanceOf(AirtableRecord);
    expect(response.records[0].id).toEqual("recPaibwSLDbZr80V");
    expect(response.records[0].get("Name")).toEqual("Updated Name");
    expect(response.records[0].get("Notes")).toEqual(undefined);
    expect(response.records[0].createdTime).toBeInstanceOf(Date);
  });

  test.todo(
    "PUT upsert multiple records - /:baseId/:tableId",
    async function () {}
  );

  test("Delete record - /:baseId/:tableId/:recordId", async function () {
    mockResponses(200, { id: "recZqO1PfM5Zv3CTe", deleted: true });

    const table = new Airtable()
      .base("appEpvhkjHcG8OvKu")
      .table("tblc7ieWKVQM9eequ");

    const record = await table.delete("recZqO1PfM5Zv3CTe");
    expect(record).toMatchObject({ id: "recZqO1PfM5Zv3CTe", deleted: true });
  });

  test("Create field - /meta/bases/:baseId/tables/:tableId/fields", async function () {
    mockResponses(200, {
      id: "flddzLHBhbcSXTlfo",
      type: "singleLineText",
      name: "NewField",
    });

    const table = new Airtable()
      .base("appEpvhkjHcG8OvKu")
      .table("tblc7ieWKVQM9eequ");

    const response = await table.createField({
      name: "NewField",
      type: "singleLineText",
    });

    expect(response).toMatchObject({
      id: expect.any(String),
      type: "singleLineText",
      name: "NewField",
    });
  });

  test("Update field - /meta/bases/:baseId/tables/:tableId/fields/:columnId", async function () {
    mockResponses(200, {
      id: "flddzLHBhbcSXTlfo",
      type: "singleLineText",
      name: "NewFieldName",
    });

    const table = new Airtable()
      .base("appEpvhkjHcG8OvKu")
      .table("tblc7ieWKVQM9eequ");

    const response = await table.updateField("flddzLHBhbcSXTlfo", {
      name: "NewFieldName",
    });

    expect(response).toMatchObject({
      id: expect.any(String),
      type: "singleLineText",
      name: "NewFieldName",
    });
  });

  test("Create comment - /:baseId/:tableId/:recordId/comments", async function () {
    mockResponses(200, {
      id: "comj6cahAhw2LlLlb",
      author: {
        id: "usrgnEL26AJJjfXfa",
        email: "user@example.com",
        name: "Tester",
      },
      text: "This is newly created comment for testing",
      createdTime: new Date().toISOString(),
      lastUpdatedTime: null,
    });

    const table = new Airtable()
      .base("appEpvhkjHcG8OvKu")
      .table("tblc7ieWKVQM9eequ");

    await expect(
      table.createComment(
        "recPaibwSLDbZr80V",
        "This is newly created comment for testing"
      )
    ).resolves.toBeInstanceOf(AirtableComment);
  });

  describe("List comments - /:baseId/:tableId/:recordId/comments", function () {
    test("#firstPage", async function () {
      mockResponses(200, {
        comments: [
          {
            id: "comj6cahAhw2LlLlb",
            author: {
              id: "usrgnEL21giBjfMky",
              email: "dev@zetl.com",
              name: "Dev",
            },
            text: "This is a test comment",
            createdTime: "2024-12-17T01:58:24.000Z",
            lastUpdatedTime: null,
          },
          {
            id: "comSxyvJqygJmY3M5",
            author: {
              id: "usrgnEL21giBjfMky",
              email: "dev@zetl.com",
              name: "Dev",
            },
            text: "This is another test comment",
            createdTime: "2024-12-17T01:58:39.000Z",
            lastUpdatedTime: null,
          },
          {
            id: "comjnTGkXKdbW9JFE",
            author: {
              id: "usrgnEL21giBjfMky",
              email: "dev@zetl.com",
              name: "Dev",
            },
            text: "This is a comment with mention @[usrgnEL21giBjfMky]",
            createdTime: "2024-12-17T02:12:50.000Z",
            lastUpdatedTime: null,
            mentioned: {
              usrgnEL21giBjfMky: {
                type: "user",
                id: "usrgnEL21giBjfMky",
                displayName: "Dev",
                email: "dev@zetl.com",
              },
            },
          },
        ],
      });

      const table = new Airtable()
        .base("appEpvhkjHcG8OvKu")
        .table("tblc7ieWKVQM9eequ");

      await expect(
        table.comments("recPaibwSLDbZr80V", { pageSize: 3 }).firstPage()
      ).resolves.toEqual(expect.arrayContaining([expect.any(AirtableComment)]));
    });

    describe("#eachPage", function () {
      beforeEach(function () {
        mockResponses(200, [
          {
            comments: [
              {
                id: "comj6cahAhw2LlLlb",
                author: {
                  id: "usrgnEL21giBjfMky",
                  email: "dev@zetl.com",
                  name: "Dev",
                },
                text: "This is a test comment",
                createdTime: "2024-12-17T01:58:24.000Z",
                lastUpdatedTime: null,
              },
            ],
            offset: "offest1",
          },
          {
            comments: [
              {
                id: "comSxyvJqygJmY3M5",
                author: {
                  id: "usrgnEL21giBjfMky",
                  email: "dev@zetl.com",
                  name: "Dev",
                },
                text: "This is another test comment",
                createdTime: "2024-12-17T01:58:39.000Z",
                lastUpdatedTime: null,
              },
            ],
            offset: "offset2",
          },
          {
            comments: [
              {
                id: "comjnTGkXKdbW9JFE",
                author: {
                  id: "usrgnEL21giBjfMky",
                  email: "dev@zetl.com",
                  name: "Dev",
                },
                text: "This is a comment with mention @[usrgnEL21giBjfMky]",
                createdTime: "2024-12-17T02:12:50.000Z",
                lastUpdatedTime: null,
                mentioned: {
                  usrgnEL21giBjfMky: {
                    type: "user",
                    id: "usrgnEL21giBjfMky",
                    displayName: "Dev",
                    email: "dev@zetl.com",
                  },
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
        await table
          .comments("recPaibwSLDbZr80V", { pageSize: 1 })
          .eachPage((pageComments) => {
            pageCount++;
            count += pageComments.length;

            expect(pageComments).toEqual(
              expect.arrayContaining([expect.any(AirtableComment)])
            );
          });

        expect(count).toEqual(3);
        expect(pageCount).toEqual(3);
      });

      test("iterate partially", async function () {
        const table = new Airtable()
          .base("appEpvhkjHcG8OvKu")
          .table("tblc7ieWKVQM9eequ");

        let count = 0;
        let pageCount = 0;
        await table
          .comments("recPaibwSLDbZr80V", { pageSize: 1 })
          .eachPage((pageComments) => {
            pageCount++;
            count += pageComments.length;

            expect(pageComments).toEqual(
              expect.arrayContaining([expect.any(AirtableComment)])
            );

            // Stop at page 2
            if (pageCount === 2) return false;
          });

        expect(count).toEqual(2);
        expect(pageCount).toEqual(2);
      });
    });

    test("#all", async function () {
      mockResponses(200, {
        comments: [
          {
            id: "comj6cahAhw2LlLlb",
            author: {
              id: "usrgnEL21giBjfMky",
              email: "dev@zetl.com",
              name: "Dev",
            },
            text: "This is a test comment",
            createdTime: "2024-12-17T01:58:24.000Z",
            lastUpdatedTime: null,
          },
          {
            id: "comSxyvJqygJmY3M5",
            author: {
              id: "usrgnEL21giBjfMky",
              email: "dev@zetl.com",
              name: "Dev",
            },
            text: "This is another test comment",
            createdTime: "2024-12-17T01:58:39.000Z",
            lastUpdatedTime: null,
          },
          {
            id: "comjnTGkXKdbW9JFE",
            author: {
              id: "usrgnEL21giBjfMky",
              email: "dev@zetl.com",
              name: "Dev",
            },
            text: "This is a comment with mention @[usrgnEL21giBjfMky]",
            createdTime: "2024-12-17T02:12:50.000Z",
            lastUpdatedTime: null,
            mentioned: {
              usrgnEL21giBjfMky: {
                type: "user",
                id: "usrgnEL21giBjfMky",
                displayName: "Dev",
                email: "dev@zetl.com",
              },
            },
          },
        ],
      });

      const table = new Airtable()
        .base("appEpvhkjHcG8OvKu")
        .table("tblc7ieWKVQM9eequ");

      await expect(
        table.comments("recPaibwSLDbZr80V").all()
      ).resolves.toHaveLength(3);
    });
  });

  test("Update comment - /:baseId/:tableId/:recordId/comments/:rowCommentId", async function () {
    mockResponses(200, {
      id: "comj6cahAhw2LlLlb",
      author: {
        id: "usrgnEL26AJJjfXfa",
        email: "user@example.com",
        name: "Tester",
      },
      text: "This is newly updated comment for testing",
      createdTime: new Date().toISOString(),
      lastUpdatedTime: new Date().toISOString(),
    });

    const table = new Airtable()
      .base("appEpvhkjHcG8OvKu")
      .table("tblc7ieWKVQM9eequ");

    await expect(
      table.updateComment(
        "recPaibwSLDbZr80V",
        "comj6cahAhw2LlLlb",
        "This is newly created comment for testing"
      )
    ).resolves.toBeInstanceOf(AirtableComment);
  });

  test("Delete comment - /:baseId/:tableId/:recordId/comments/:rowCommentId", async function () {
    mockResponses(200, {
      id: "comj6cahAhw2LlLlb",
      deleted: true,
    });

    const table = new Airtable()
      .base("appEpvhkjHcG8OvKu")
      .table("tblc7ieWKVQM9eequ");

    await expect(
      table.deleteComment("recPaibwSLDbZr80V", "comj6cahAhw2LlLlb")
    ).resolves.toMatchObject({
      id: expect.any(String),
      deleted: true,
    });
  });
});
