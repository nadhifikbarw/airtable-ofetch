import type { Airtable } from "./airtable";
import { AirtableTable } from "./table";

export class AirtableBase {
  readonly airtable: Airtable;
  readonly id: string;

  constructor(airtable: Airtable, baseId: string) {
    this.airtable = airtable;
    this.id = baseId;
  }

  table<TFields>(tableNameOrId: string) {
    return new AirtableTable<TFields>(this.airtable, this, tableNameOrId);
  }
}
