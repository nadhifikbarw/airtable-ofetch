import { describe, expect, test } from "vitest";
import { Airtable } from "../src/airtable";
import { mockResponses } from "./utils";
import { AirtableTable } from "../src/table";

describe("AirtableBase", function () {
  test("instantiate AirtableTable", function () {
    const table = new Airtable()
      .base("appEpvhkjHcG8OvKu")
      .table("tblc7ieWKVQM9eequ");

    expect(table).toBeInstanceOf(AirtableTable);
    expect(table.id).toEqual("tblc7ieWKVQM9eequ");
  });

  test("/meta/bases/:id/tables", async function () {
    mockResponses(200, {
      tables: [
        {
          id: "tblc7ieWKVQM9eequ",
          name: "Example Table",
          primaryFieldId: "fldCB4M9WX4ofDKHy",
          fields: [
            {
              type: "singleLineText",
              id: "fldCB4M9WX4ofDKHy",
              name: "Name",
            },
            {
              type: "multilineText",
              id: "fldXemhQhraCWy9zA",
              name: "Notes",
            },
            {
              type: "singleCollaborator",
              id: "fldEbpBsRhClHlYek",
              name: "Assignee",
            },
            {
              type: "singleSelect",
              options: {
                choices: [
                  {
                    id: "sellIKyVXAgeJC2n8",
                    name: "Todo",
                    color: "redLight2",
                  },
                  {
                    id: "selFIp8DTmQOXcIiP",
                    name: "In progress",
                    color: "yellowLight2",
                  },
                  {
                    id: "selRqqTk913qOahvn",
                    name: "Done",
                    color: "greenLight2",
                  },
                ],
              },
              id: "fldQpJuVCdQGxZzmh",
              name: "Status",
            },
          ],
          views: [
            {
              id: "viweb85ypN8Z9ZT7F",
              name: "Grid view",
              type: "grid",
              visibleFieldIds: [
                "fldCB4M9WX4ofDKHy",
                "fldXemhQhraCWy9zA",
                "fldEbpBsRhClHlYek",
                "fldQpJuVCdQGxZzmh",
              ],
            },
          ],
        },
      ],
    });

    const base = new Airtable().base("appEpvhkjHcG8OvKu");
    const schema = await base.schema(true);

    expect(schema).toMatchObject({
      tables: expect.arrayContaining([
        {
          id: expect.any(String),
          name: expect.any(String),
          primaryFieldId: expect.any(String),
          fields: expect.arrayContaining([expect.any(Object)]),
          views: expect.arrayContaining([expect.any(Object)]),
        },
      ]),
    });
  });
});
