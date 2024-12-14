import { describe, expect, test } from "vitest";
import { Airtable } from "../src/airtable";
import { mockResponses } from "./utils";
import { AirtableTable } from "../src/table";

describe("AirtableBase", function () {
  test("instantiate AirtableBase", function () {
    const base = new Airtable().base("appBoraw3Xf63uBHF");
    const table = base.table("tblEAg3wFC0fsDH8z");

    expect(table).toBeInstanceOf(AirtableTable);
    expect(table.id).toEqual("tblEAg3wFC0fsDH8z");
  });

  test("/meta/bases/:id/tables", async function () {
    mockResponses(200, {
      tables: [
        {
          id: "tblEAg3wFC0fsDH8z",
          name: "Sample Table",
          primaryFieldId: "fldPENopNiUUuMYWB",
          fields: [
            {
              type: "singleLineText",
              id: "fldPENopNiUUuMYWB",
              name: "Name",
            },
            {
              type: "multilineText",
              id: "fldfL4ygE2SOSmvr0",
              name: "Notes",
            },
            {
              type: "singleCollaborator",
              id: "fldixhCUullp8fNKM",
              name: "Assignee",
            },
            {
              type: "singleSelect",
              options: {
                choices: [
                  {
                    id: "selFCNNF1P6HGavWH",
                    name: "Todo",
                    color: "redLight2",
                  },
                  {
                    id: "selzuPNyi4eXEWiaO",
                    name: "In progress",
                    color: "yellowLight2",
                  },
                  {
                    id: "sel1UeIa8NVbLHOCt",
                    name: "Done",
                    color: "greenLight2",
                  },
                ],
              },
              id: "fldjCCJySccuy6aGh",
              name: "Status",
            },
          ],
          views: [
            {
              id: "viwGezlzUHj53lHtU",
              name: "Grid view",
              type: "grid",
              visibleFieldIds: [
                "fldPENopNiUUuMYWB",
                "fldfL4ygE2SOSmvr0",
                "fldixhCUullp8fNKM",
                "fldjCCJySccuy6aGh",
              ],
            },
          ],
        },
      ],
    });

    const base = new Airtable().base("appBoraw3Xf63uBHF");
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
