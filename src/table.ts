import type { AirtableBase } from "./base";
import type { FieldSet, GetRecordOptions, ListRecordsOptions } from "./types";
import { AirtableRecord } from "./record";
import { AirtableQuery } from "./query";

export class AirtableTable<TFields extends FieldSet = Record<string, unknown>> {
  readonly base: AirtableBase;
  readonly id: string;

  get $fetch() {
    return this.base.$fetch;
  }

  get $fetchPaginate() {
    return this.base.$fetchPaginate;
  }

  constructor(base: AirtableBase, tableNameOrId: string) {
    this.base = base;
    this.id = tableNameOrId;
  }

  get encodedResourceId() {
    return encodeURIComponent(this.id);
  }

  get encodedResourcePath() {
    return `${this.base.encodedResourcePath}/${this.encodedResourceId}`;
  }

  async get(recordId: string, opts?: GetRecordOptions) {
    const record = new AirtableRecord<TFields>(this, recordId);

    await record.fetch(opts);

    return record;
  }

  list(opts?: ListRecordsOptions) {
    return new AirtableQuery<TFields>(this, opts);
  }

  // TODO: Comments
}
