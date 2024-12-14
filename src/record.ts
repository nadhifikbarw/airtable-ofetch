import type { AirtableTable } from "./table";
import type { FieldSet, GetRecordOptions, RecordData } from "./types";

export class AirtableRecord<
  TFields extends FieldSet = Record<string, unknown>,
> {
  readonly table: AirtableTable<TFields>;
  readonly id: string;

  _data?: RecordData<TFields>;

  // Airtable API often doesn't send keys for "empty"-valued field
  fields?: Partial<TFields>;
  createdTime?: Date;
  commentCount?: number;

  get $fetch() {
    return this.table.$fetch;
  }

  constructor(table: AirtableTable<TFields>, recordId: string) {
    this.table = table;
    this.id = recordId;
  }

  get encodedResourceId() {
    return encodeURIComponent(this.id);
  }

  get encodedResourcePath() {
    return `${this.table.encodedResourcePath}/${this.encodedResourceId}`;
  }

  static fromData<T extends FieldSet = Record<string, unknown>>(
    table: AirtableTable<T>,
    data: RecordData<T>
  ) {
    const rec = new AirtableRecord(table, data.id);
    rec._data = data;
    rec.fields = data.fields;
    rec.createdTime = new Date(data.createdTime);
    if (data.commentCount) rec.commentCount = data.commentCount;
    return rec;
  }

  async fetch(opts?: GetRecordOptions) {
    const data = await this.$fetch<RecordData<TFields>>(
      this.encodedResourcePath,
      { method: "GET", query: opts }
    );

    this._data = data;
    this.fields = data.fields;
    this.createdTime = new Date(data.createdTime);
    if (this.commentCount) this.commentCount = data.commentCount;
  }

  // TODO
  async listComments() {}
  async createComment() {}
  async updateComment() {}
  async deleteComment() {}
}
