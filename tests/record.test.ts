import { describe, expect, test } from "vitest";
import { Airtable } from "../src";
import { mockResponses } from "./utils";
import { exec } from "node:child_process";

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
});
