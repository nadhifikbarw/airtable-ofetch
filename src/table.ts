import type { Airtable } from "./airtable";
import type { AirtableBase } from "./base";

export class AirtableTable<TFields> {
  readonly airtable: Airtable;
  readonly base: AirtableBase;
  readonly id: string;

  constructor(airtable: Airtable, base: AirtableBase, tableNameOrId: string) {
    this.airtable = airtable;
    this.base = base;
    this.id = tableNameOrId;
  }
}
