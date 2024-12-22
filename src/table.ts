import type { AirtableBase } from "./base";
import type {
  FieldSet,
  RecordData,
  DeletedData,
  GetRecordOptions,
  ListRecordsOptions,
  UpdateRecordOptions,
  UpdateRecordsMethod,
  UpdateRecordData,
  CreateRecordsOptions,
  UpsertRecordsOptions,
  UpsertedRecordData,
  UpdatedRecords,
  UpsertedRecords,
  UploadAttachmentData,
  FieldSchema,
  CreateFieldOptions,
  UpdateFieldOptions,
  ListCommentsOptions,
  CommentData,
  CreateRecordData,
  CreatedRecords,
  CreatedRecordsData,
  UpsertRecordData,
} from "./types";
import { AirtableQuery } from "./query";
import { AirtableRecord } from "./record";
import { AirtableCommentQuery } from "./comment-query";
import { AirtableComment } from "./comment";

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

  // --------------------------
  // Records
  // --------------------------

  list(opts?: ListRecordsOptions): AirtableQuery<TFields> {
    return new AirtableQuery<TFields>(this, opts);
  }

  async get(
    recordId: string,
    opts?: GetRecordOptions
  ): Promise<AirtableRecord<TFields>> {
    const record = new AirtableRecord<TFields>(this, recordId);
    await record.fetch(opts);
    return record;
  }

  async create(
    fields: Partial<TFields>,
    opts?: CreateRecordsOptions
  ): Promise<AirtableRecord<TFields>>;
  async create(
    records: CreateRecordData<TFields>[],
    opts?: CreateRecordsOptions
  ): Promise<CreatedRecords<TFields>>;
  async create(
    records: Partial<TFields> | CreateRecordData<TFields>[],
    opts?: CreateRecordsOptions
  ): Promise<AirtableRecord<TFields> | CreatedRecords<TFields>> {
    // Perform fetch requests
    const isCreatingMultiple = Array.isArray(records);
    const body = {
      ...opts,
      [isCreatingMultiple ? "records" : "fields"]: records,
    };

    const data = await this.$fetch(this.encodedResourcePath, {
      body,
      method: "POST",
    });

    return isCreatingMultiple
      ? {
          records: (data as CreatedRecordsData<TFields>)?.records.map((rec) =>
            AirtableRecord.fromData(this, rec)
          ),
        }
      : AirtableRecord.fromData(this, data as RecordData<TFields>);
  }

  async update(
    method: UpdateRecordsMethod,
    recordId: string,
    data?: Partial<TFields>,
    opts?: UpdateRecordOptions
  ): Promise<AirtableRecord<TFields>>;
  async update(
    method: UpdateRecordsMethod,
    data: UpdateRecordData<TFields>[],
    opts?: UpdateRecordOptions
  ): Promise<UpdatedRecords<TFields>>;
  async update(
    method: UpdateRecordsMethod,
    data: UpsertRecordData<TFields>[],
    opts?: UpsertRecordsOptions
  ): Promise<UpsertedRecords<TFields>>;
  async update(
    method: UpdateRecordsMethod,
    recordIdOrData:
      | string
      | UpdateRecordData<TFields>[]
      | UpsertRecordData<TFields>[],
    dataOrOpts?: Partial<TFields> | UpdateRecordOptions | UpsertRecordsOptions,
    opts?: UpdateRecordOptions | UpsertRecordsOptions
  ): Promise<
    AirtableRecord<TFields> | UpdatedRecords<TFields> | UpsertedRecords<TFields>
  > {
    const isUpdatingMultiple = Array.isArray(recordIdOrData);

    if (isUpdatingMultiple) {
      const response = await this.$fetch<UpsertedRecordData<TFields>>(
        this.encodedResourcePath,
        { method, body: { ...dataOrOpts, records: recordIdOrData } }
      );

      return {
        ...response,
        records: response.records.map((rec) =>
          AirtableRecord.fromData(this, rec)
        ),
      } satisfies UpsertedRecords<TFields>;
    }

    const rec = new AirtableRecord(this, recordIdOrData);
    if (method === "PATCH") {
      await rec.patchUpdate(dataOrOpts as Partial<TFields>, opts);
    } else if (method === "PUT") {
      await rec.putUpdate(dataOrOpts as Partial<TFields>, opts);
    }
    return rec;
  }

  async delete(recordId: string): Promise<DeletedData>;
  async delete(recordIds: string[]): Promise<{ records: DeletedData[] }>;
  async delete(
    recordIds: string | string[]
  ): Promise<DeletedData | { records: DeletedData[] }> {
    const isDeletingMultiple = Array.isArray(recordIds);

    const req = isDeletingMultiple
      ? this.encodedResourcePath
      : `${this.encodedResourcePath}/${encodeURIComponent(recordIds)}`;

    return await this.$fetch(req, {
      query: isDeletingMultiple ? { records: recordIds } : undefined,
      method: "DELETE",
    });
  }

  async syncCSV(
    apiEndpointSyncId: string,
    data: RequestInit["body"]
  ): Promise<{ success: boolean }> {
    return this.$fetch<{ success: boolean }>(
      `${this.encodedResourcePath}/sync/${apiEndpointSyncId}`,
      { method: "POST", headers: { "Content-Type": "text/csv" }, body: data }
    );
  }

  async uploadAttachment(
    recordId: string,
    attachmentFieldIdOrName: string,
    attachment: UploadAttachmentData
  ) {
    return await this.base.uploadAttachment(
      recordId,
      attachmentFieldIdOrName,
      attachment
    );
  }

  // --------------------------
  // Fields
  // --------------------------

  async createField(opts: CreateFieldOptions): Promise<FieldSchema> {
    return await this.$fetch<FieldSchema>(
      `/meta/bases/${this.base.encodedResourceId}/tables/${this.encodedResourceId}/fields`,
      { method: "POST", body: opts }
    );
  }

  async updateField(
    columnId: string,
    opts: UpdateFieldOptions
  ): Promise<FieldSchema> {
    return await this.$fetch<FieldSchema>(
      `/meta/bases/${this.base.encodedResourceId}/tables/${this.encodedResourceId}/fields/${columnId}`,
      { method: "PATCH", body: opts }
    );
  }

  // --------------------------
  // Comments, allow performing Comment-related operations directly from Table
  // --------------------------
  comments(recordId: string, opts?: ListCommentsOptions) {
    return new AirtableCommentQuery(this, recordId, opts);
  }

  async createComment(
    recordId: string,
    text: string,
    parentCommentId?: string
  ) {
    const data = await this.$fetch<CommentData>(
      `${this.encodedResourcePath}/${encodeURIComponent(recordId)}/comments`,
      { method: "POST", body: { text, parentCommentId } }
    );
    return new AirtableComment(this, recordId, data);
  }

  async updateComment(recordId: string, rowCommentId: string, text: string) {
    const data = await this.$fetch<CommentData>(
      `${this.encodedResourcePath}/${encodeURIComponent(recordId)}/comments/${encodeURIComponent(rowCommentId)}`,
      { method: "PATCH", body: { text } }
    );
    return new AirtableComment(this, recordId, data);
  }

  async deleteComment(recordId: string, rowCommentId: string) {
    return await this.$fetch<DeletedData>(
      `${this.encodedResourcePath}/${recordId}/comments/${rowCommentId}`,
      { method: "DELETE" }
    );
  }
}
