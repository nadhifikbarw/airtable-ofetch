import type { AirtableTable } from "./table";
import type {
  FieldSet,
  GetRecordOptions,
  ListCommentsOptions,
  RecordData,
  UpdateRecordOptions,
  UploadAttachmentData,
} from "./types";

export class AirtableRecord<
  TFields extends FieldSet = Record<string, unknown>,
> {
  readonly table: AirtableTable<TFields>;
  readonly id: string;

  _data?: RecordData<TFields>;

  // Airtable API often doesn't send keys for "empty"-valued field
  fields: Partial<TFields>;
  createdTime?: Date;
  commentCount?: number;

  /**
   * Property exists once `delete()` replied with `deleted: true`
   * only used as indicative, won't be used to prevent
   * further API call
   */
  deleted?: true;

  get $fetch() {
    return this.table.$fetch;
  }

  constructor(table: AirtableTable<TFields>, recordId: string) {
    this.table = table;
    this.id = recordId;
    this.fields = {};
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

  setData(data: RecordData<TFields>) {
    this._data = data;
    this.fields = data.fields;
    this.createdTime = new Date(data.createdTime);
    if (data.commentCount) this.commentCount = data.commentCount;
  }

  get<Field extends keyof TFields>(
    columnNameOrId: Field
  ): TFields[Field] | undefined {
    return this.fields[columnNameOrId];
  }

  set<Field extends keyof TFields>(
    columnNameOrId: Field,
    columnValue: TFields[Field]
  ): void {
    this.fields[columnNameOrId] = columnValue;
  }

  async fetch(opts?: GetRecordOptions) {
    const data = await this.$fetch<RecordData<TFields>>(
      this.encodedResourcePath,
      { method: "GET", query: opts }
    );
    this.setData(data);
  }

  async save(opts?: UpdateRecordOptions) {
    await this.putUpdate(this.fields, opts);
  }

  async patchUpdate(fields: Partial<TFields>, opts?: UpdateRecordOptions) {
    const data = await this.$fetch<RecordData<TFields>>(
      this.encodedResourcePath,
      { method: "PATCH", body: { ...opts, fields } }
    );
    this.setData(data);
  }

  async putUpdate(fields: Partial<TFields>, opts?: UpdateRecordOptions) {
    const data = await this.$fetch<RecordData<TFields>>(
      this.encodedResourcePath,
      { method: "PUT", body: { ...opts, fields } }
    );
    this.setData(data);
  }

  async delete() {
    const response = await this.table.delete(this.id);
    if (response.deleted === true) this.deleted = true;
    return response;
  }

  async uploadAttachment(
    attachmentFieldIdOrName: string,
    attachment: UploadAttachmentData
  ) {
    return await this.table.uploadAttachment(
      this.id,
      attachmentFieldIdOrName,
      attachment
    );
  }

  comments(opts?: ListCommentsOptions) {
    return this.table.comments(this.id, opts);
  }

  async createComment(text: string, parentCommentId?: string) {
    return await this.table.createComment(this.id, text, parentCommentId);
  }

  async updateComment(rowCommentId: string, text: string) {
    return await this.table.updateComment(this.id, rowCommentId, text);
  }

  async deleteComment(rowCommentId: string) {
    return await this.table.deleteComment(this.id, rowCommentId);
  }
}
