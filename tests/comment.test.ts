import { describe, expect, test } from "vitest";
import { Airtable } from "../src";
import { mockResponses } from "./utils";

describe("AirtableComment", function () {
  test("save comment", { timeout: 100_000 }, async function () {
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
    const comment = await record.createComment(
      "This is newly created comment for testing"
    );
    comment.text = "This is newly updated comment for testing";
    await comment.save();
    expect(comment.text).toBe("This is newly updated comment for testing");
    expect(comment.lastUpdatedTime).toBeInstanceOf(Date);
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
        author: {
          id: "usrgnEL26AJJjfXfa",
          email: "user@example.com",
          name: "Tester",
        },
        text: "This is newly created comment for testing",
        createdTime: new Date().toISOString(),
        lastUpdatedTime: null,
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
    const comment = await record.createComment(
      "This is newly created comment for testing"
    );

    const response = await comment.delete();
    expect(comment.deleted).toEqual(true);
    expect(response).toMatchObject({ id: expect.any(String), deleted: true });
  });

  test("can have mention", async function () {
    mockResponses(200, [
      {
        id: "recPaibwSLDbZr80V",
        createdTime: "2024-12-15T04:20:33.000Z",
        fields: { Name: "Updated Name" },
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
          usrgnEL26AJJjfXfa: {
            type: "user",
            id: "usrgnEL26AJJjfXfa",
            displayName: "Tester",
            email: "user@example.com",
          },
        },
      },
    ]);

    const table = new Airtable()
      .base("appEpvhkjHcG8OvKu")
      .table("tblc7ieWKVQM9eequ");

    const record = await table.get("recPaibwSLDbZr80V");
    const comment = await record.createComment(
      "This is a comment with mention $[usrgnEL26AJJjfXfa]"
    );

    expect(comment.haveMentions).toBe(true);
  });

  test("can have reaction", async function () {
    mockResponses(200, [
      {
        id: "recPaibwSLDbZr80V",
        createdTime: "2024-12-15T04:20:33.000Z",
        fields: { Name: "Updated Name" },
      },
      {
        comments: [
          {
            author: {
              id: "usrgnEL26AJJjfXfa",
              email: "user@example.com",
              name: "Tester",
            },
            createdTime: "2024-12-17T01:58:24.000Z",
            id: "comj6cahAhw2LlLlb",
            lastUpdatedTime: "2024-12-20T07:28:28.000Z",
            reactions: [
              {
                emoji: { unicodeCharacter: "1f600" },
                reactingUser: {
                  email: "user@example.com",
                  name: "Tester",
                  userId: "usrgnEL26AJJjfXfa",
                },
              },
            ],
            text: "This is newly created comment for testing",
          },
        ],
      },
    ]);

    const table = new Airtable()
      .base("appEpvhkjHcG8OvKu")
      .table("tblc7ieWKVQM9eequ");
    const record = await table.get("recPaibwSLDbZr80V");
    const comments = await record.comments().all();
    expect(comments[0].haveReactions).toEqual(true);
  });
});
