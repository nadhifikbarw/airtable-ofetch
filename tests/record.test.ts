import { describe, expect, test, beforeEach } from "vitest";
import { AirtableComment } from "../src/comment";
import { mockResponses } from "./utils";
import { Airtable } from "../src";

describe("AirtableRecord", function () {
  test("get field value", async function () {
    mockResponses(200, {
      id: "recPaibwSLDbZr80V",
      createdTime: "2024-12-15T04:20:33.000Z",
      fields: { Name: "Sample Record" },
    });

    const table = new Airtable()
      .base("appEpvhkjHcG8OvKu")
      .table("tblc7ieWKVQM9eequ");
    const record = await table.get("recPaibwSLDbZr80V");

    expect(record.get("Name")).toEqual("Sample Record");
  });

  test("set field value", async function () {
    mockResponses(200, {
      id: "recPaibwSLDbZr80V",
      createdTime: "2024-12-15T04:20:33.000Z",
      fields: { Name: "Sample Record" },
    });

    const table = new Airtable()
      .base("appEpvhkjHcG8OvKu")
      .table("tblc7ieWKVQM9eequ");
    const record = await table.get("recPaibwSLDbZr80V");
    record.set("Name", "Updated Value");

    expect(record.get("Name")).toEqual("Updated Value");
  });

  test("save/put update record", async function () {
    mockResponses(200, [
      {
        id: "recPaibwSLDbZr80V",
        createdTime: "2024-12-15T04:20:33.000Z",
        fields: { Name: "Sample Record" },
      },
      {
        id: "recPaibwSLDbZr80V",
        createdTime: "2024-12-15T04:20:33.000Z",
        fields: { Name: "Updated Value" },
      },
    ]);

    const table = new Airtable()
      .base("appEpvhkjHcG8OvKu")
      .table("tblc7ieWKVQM9eequ");
    const record = await table.get("recPaibwSLDbZr80V");
    record.set("Name", "Updated Value");
    await record.save();

    expect(record.get("Name")).toEqual("Updated Value");
  });

  test("patch update record", async function () {
    mockResponses(200, [
      {
        id: "recPaibwSLDbZr80V",
        createdTime: "2024-12-15T04:20:33.000Z",
        fields: { Name: "Sample Value", Notes: "Notes" },
      },
      {
        id: "recPaibwSLDbZr80V",
        createdTime: "2024-12-15T04:20:33.000Z",
        fields: { Name: "Updated Value", Notes: "Notes" },
      },
    ]);

    const table = new Airtable()
      .base("appEpvhkjHcG8OvKu")
      .table("tblc7ieWKVQM9eequ");
    const record = await table.get("recPaibwSLDbZr80V");
    await record.patchUpdate({ Name: "Updated Value" });
    expect(record.get("Name")).toEqual("Updated Value");
    expect(record.get("Notes")).toEqual("Notes");
  });

  test("delete record", async function () {
    mockResponses(200, [
      {
        id: "recZ3o2dEcHjFrxyV",
        createdTime: "2024-12-22T13:16:30.000Z",
        fields: { Name: "Upserted Record" },
      },
      {
        id: "recZ3o2dEcHjFrxyV",
        deleted: true,
      },
    ]);

    const table = new Airtable()
      .base("appEpvhkjHcG8OvKu")
      .table("tblc7ieWKVQM9eequ");
    const record = await table.get("recZ3o2dEcHjFrxyV");
    const response = await record.delete();

    expect(response).toMatchObject({
      id: expect.any(String),
      deleted: true,
    });
    expect(record.deleted).toEqual(true);
  });

  test("upload attachment", async function () {
    mockResponses(200, [
      {
        id: "recPaibwSLDbZr80V",
        createdTime: "2024-12-15T04:20:33.000Z",
        fields: { Name: "Updated Name" },
      },
      {
        id: "recPaibwSLDbZr80V",
        createdTime: "2024-12-15T04:20:33.000Z",
        fields: {
          fldw7KUUaL5nVAKNU: [
            {
              id: "attz6pHoqq5qTvC32",
              url: `https://v5.airtableusercontent.com/v3/u/36/36/example_url`,
              filename: "new_attachment.png",
              size: 24_543,
              type: "image/png",
            },
          ],
        },
      },
    ]);

    const table = new Airtable()
      .base("appEpvhkjHcG8OvKu")
      .table("tblc7ieWKVQM9eequ");

    const record = await table.get("recPaibwSLDbZr80V");

    const response = await record.uploadAttachment("fldw7KUUaL5nVAKNU", {
      filename: "new_attachment.png",
      contentType: "image/png",
      file: "data:image/png;base64,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",
    });

    expect(response).toMatchObject({
      id: expect.any(String),
      createdTime: expect.any(String),
      fields: expect.objectContaining({
        fldw7KUUaL5nVAKNU: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            url: expect.any(String),
            filename: expect.any(String),
            // and more
          }),
        ]),
      }),
    });
  });

  describe("list comments", function () {
    test("#firstPage", async function () {
      mockResponses(200, [
        {
          id: "recPaibwSLDbZr80V",
          createdTime: "2024-12-15T04:20:33.000Z",
          fields: { Name: "Updated Name" },
        },
        {
          comments: [
            {
              id: "comj6cahAhw2LlLlb",
              author: {
                id: "usrgnEL26AJJjfXfa",
                email: "user@example.com",
                name: "Tester",
              },
              text: "This is a test comment",
              createdTime: "2024-12-17T01:58:24.000Z",
              lastUpdatedTime: null,
            },
            {
              id: "comSxyvJqygJmY3M5",
              author: {
                id: "usrgnEL26AJJjfXfa",
                email: "user@example.com",
                name: "Tester",
              },
              text: "This is another test comment",
              createdTime: "2024-12-17T01:58:39.000Z",
              lastUpdatedTime: null,
            },
            {
              id: "comjnTGkXKdbW9JFE",
              author: {
                id: "usrgnEL26AJJjfXfa",
                email: "user@example.com",
                name: "Tester",
              },
              text: "This is a comment with mention @[usrgnEL26AJJjfXfa]",
              createdTime: "2024-12-17T02:12:50.000Z",
              lastUpdatedTime: null,
              mentioned: {
                usrgnEL21giBjfMky: {
                  type: "user",
                  id: "usrgnEL26AJJjfXfa",
                  displayName: "Tester",
                  email: "user@example.com",
                },
              },
            },
          ],
        },
      ]);

      const table = new Airtable()
        .base("appEpvhkjHcG8OvKu")
        .table("tblc7ieWKVQM9eequ");
      const record = await table.get("recPaibwSLDbZr80V");

      await expect(
        record.comments({ pageSize: 3 }).firstPage()
      ).resolves.toEqual(expect.arrayContaining([expect.any(AirtableComment)]));
    });

    describe("#eachPage", function () {
      beforeEach(function () {
        mockResponses(200, [
          {
            id: "recPaibwSLDbZr80V",
            createdTime: "2024-12-15T04:20:33.000Z",
            fields: { Name: "Updated Name" },
          },
          {
            comments: [
              {
                id: "comj6cahAhw2LlLlb",
                author: {
                  id: "usrgnEL26AJJjfXfa",
                  email: "user@example.com",
                  name: "Tester",
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
                  id: "usrgnEL26AJJjfXfa",
                  email: "user@example.com",
                  name: "Tester",
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
                  id: "usrgnEL26AJJjfXfa",
                  email: "user@example.com",
                  name: "Tester",
                },
                text: "This is a comment with mention @[usrgnEL26AJJjfXfa]",
                createdTime: "2024-12-17T02:12:50.000Z",
                lastUpdatedTime: null,
                mentioned: {
                  usrgnEL26AJJjfXfa: {
                    type: "user",
                    id: "usrgnEL26AJJjfXfa",
                    email: "user@example.com",
                    name: "Tester",
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
        const record = await table.get("recPaibwSLDbZr80V");

        let count = 0;
        let pageCount = 0;
        await record.comments({ pageSize: 1 }).eachPage((pageComments) => {
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
        const record = await table.get("recPaibwSLDbZr80V");

        let count = 0;
        let pageCount = 0;
        await record.comments({ pageSize: 1 }).eachPage((pageComments) => {
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
      mockResponses(200, [
        {
          id: "recPaibwSLDbZr80V",
          createdTime: "2024-12-15T04:20:33.000Z",
          fields: { Name: "Updated Name" },
        },
        {
          comments: [
            {
              id: "comj6cahAhw2LlLlb",
              author: {
                id: "usrgnEL26AJJjfXfa",
                email: "user@example.com",
                name: "Tester",
              },
              text: "This is a test comment",
              createdTime: "2024-12-17T01:58:24.000Z",
              lastUpdatedTime: null,
            },
            {
              id: "comSxyvJqygJmY3M5",
              author: {
                id: "usrgnEL26AJJjfXfa",
                email: "user@example.com",
                name: "Tester",
              },
              text: "This is another test comment",
              createdTime: "2024-12-17T01:58:39.000Z",
              lastUpdatedTime: null,
            },
            {
              id: "comjnTGkXKdbW9JFE",
              author: {
                id: "usrgnEL26AJJjfXfa",
                email: "user@example.com",
                name: "Tester",
              },
              text: "This is a comment with mention @[usrgnEL26AJJjfXfa]",
              createdTime: "2024-12-17T02:12:50.000Z",
              lastUpdatedTime: null,
              mentioned: {
                usrgnEL21giBjfMky: {
                  type: "user",
                  id: "usrgnEL26AJJjfXfa",
                  displayName: "Tester",
                  email: "user@example.com",
                },
              },
            },
          ],
        },
      ]);

      const table = new Airtable()
        .base("appEpvhkjHcG8OvKu")
        .table("tblc7ieWKVQM9eequ");
      const record = await table.get("recPaibwSLDbZr80V");

      await expect(record.comments().all()).resolves.toHaveLength(3);
    });
  });

  test("create comment", async function () {
    mockResponses(200, [
      {
        id: "recPaibwSLDbZr80V",
        createdTime: "2024-12-15T04:20:33.000Z",
        fields: { Name: "Updated Name" },
      },
      {
        id: "comj6cahAhw2LlLlb",
        author: {
          id: "usrgnEL26AJJjfXfa",
          email: "user@example.com",
          name: "Tester",
        },
        text: "This is newly created comment for testing",
        createdTime: new Date().toISOString(),
        lastUpdatedTime: null,
      },
    ]);

    const table = new Airtable()
      .base("appEpvhkjHcG8OvKu")
      .table("tblc7ieWKVQM9eequ");

    const record = await table.get("recPaibwSLDbZr80V");
    const comment = await record.createComment(
      "This is newly created comment for testing"
    );
    expect(comment).toBeInstanceOf(AirtableComment);
  });

  test("update comment", async function () {
    mockResponses(200, [
      {
        id: "recPaibwSLDbZr80V",
        createdTime: "2024-12-15T04:20:33.000Z",
        fields: { Name: "Updated Name" },
      },
      {
        id: "comj6cahAhw2LlLlb",
        author: {
          id: "usrgnEL26AJJjfXfa",
          email: "user@example.com",
          name: "Tester",
        },
        text: "This is newly updated comment for testing",
        createdTime: new Date().toISOString(),
        lastUpdatedTime: new Date().toISOString(),
      },
    ]);

    const table = new Airtable()
      .base("appEpvhkjHcG8OvKu")
      .table("tblc7ieWKVQM9eequ");

    const record = await table.get("recPaibwSLDbZr80V");
    await expect(
      record.updateComment(
        "comj6cahAhw2LlLlb",
        "This is newly updated comment for testing"
      )
    ).resolves.toBeInstanceOf(AirtableComment);
  });

  test("delete comment", async function () {
    mockResponses(200, [
      {
        id: "recPaibwSLDbZr80V",
        createdTime: "2024-12-15T04:20:33.000Z",
        fields: { Name: "Updated Name" },
      },
      {
        id: "comj6cahAhw2LlLlb",
        deleted: true,
      },
    ]);

    const table = new Airtable()
      .base("appEpvhkjHcG8OvKu")
      .table("tblc7ieWKVQM9eequ");

    const record = await table.get("recPaibwSLDbZr80V");
    const response = await record.deleteComment("comj6cahAhw2LlLlb");
    expect(response).toMatchObject({ id: expect.any(String), deleted: true });
  });
});
