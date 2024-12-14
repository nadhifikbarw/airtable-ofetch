import type { Airtable } from "./airtable";
import { AirtableTable } from "./table";
import type { BaseSchema, FieldSet } from "./types";

export class AirtableBase {
  readonly airtable: Airtable;
  readonly id: string;

  get $fetch() {
    return this.airtable.$fetch;
  }

  get $fetchPaginate() {
    return this.airtable.$fetchPaginate;
  }

  constructor(airtable: Airtable, baseId: string) {
    this.airtable = airtable;
    this.id = baseId;
  }

  get encodedResourceId() {
    return encodeURIComponent(this.id);
  }

  get encodedResourcePath() {
    return `/${this.encodedResourceId}`;
  }

  table<TFields extends FieldSet = Record<string, unknown>>(
    tableNameOrId: string
  ) {
    return new AirtableTable<TFields>(this, tableNameOrId);
  }

  async schema(includeVisibleFieldIds: boolean = false) {
    return await this.airtable.$fetch<BaseSchema>(
      `/meta/bases/${this.encodedResourceId}/tables`,
      {
        query: {
          include: includeVisibleFieldIds ? "visibleFieldIds" : undefined,
        },
      }
    );
  }
}
