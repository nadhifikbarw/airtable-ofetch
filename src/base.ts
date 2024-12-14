import type { Airtable } from "./airtable";
import { AirtableTable } from "./table";
import type { BaseSchema } from "./types";

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

  async schema(includeVisibleFieldIds: boolean = false) {
    return await this.airtable.$fetch<BaseSchema>(
      `/meta/bases/${this.id}/tables`,
      {
        query: {
          include: includeVisibleFieldIds ? "visibleFieldIds" : undefined,
        },
      }
    );
  }
}
