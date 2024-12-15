import type { AirtableBase } from "./base";
import type {
  FieldSet,
  RecordData,
  DeletedData,
  GetRecordOptions,
  ListRecordsOptions,
  UpdateRecordOption,
  UpdateRecordsMethod,
  UpdateRecordData,
  UpsertRecordsOptions,
  UpsertedRecordData,
  CreateRecordsOptions,
  UpdatedRecords,
  UpsertedRecords,
} from "./types";
import { AirtableQuery } from "./query";
import { AirtableRecord } from "./record";

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

  // TODO: cleanup typing
  async create(
    fields: Partial<TFields>,
    opts?: CreateRecordsOptions
  ): Promise<AirtableRecord<TFields>>;
  async create(
    records: Partial<TFields>[],
    opts?: CreateRecordsOptions
  ): Promise<AirtableRecord<TFields>[]>;
  async create(
    records: Partial<TFields> | Partial<TFields>[],
    opts?: CreateRecordsOptions
  ): Promise<AirtableRecord<TFields> | AirtableRecord<TFields>[]> {
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
      ? (data as { records: RecordData<TFields>[] })?.records.map((rec) =>
          AirtableRecord.fromData(this, rec)
        )
      : AirtableRecord.fromData(this, data as RecordData<TFields>);
  }

  async update(
    method: UpdateRecordsMethod,
    recordId: string,
    data?: Partial<TFields>,
    opts?: UpdateRecordOption
  ): Promise<AirtableRecord<TFields>>;
  async update(
    method: UpdateRecordsMethod,
    data: UpdateRecordData<TFields>[],
    opts?: UpdateRecordOption
  ): Promise<UpdatedRecords<TFields>>;
  async update(
    method: UpdateRecordsMethod,
    data: UpdateRecordData<TFields>[],
    opts?: UpsertRecordsOptions
  ): Promise<UpsertedRecords<TFields>>;
  async update(
    method: UpdateRecordsMethod,
    recordIdOrData: string | UpdateRecordData<TFields>[],
    dataOrOpts?: Partial<TFields> | UpdateRecordOption | UpsertRecordsOptions,
    opts?: UpdateRecordOption | UpsertRecordsOptions
  ): Promise<
    AirtableRecord<TFields> | UpdatedRecords<TFields> | UpsertedRecords<TFields>
  > {
    const isUpdatingMultiple = Array.isArray(recordIdOrData);

    if (isUpdatingMultiple) {
      const response = await this.$fetch<UpsertedRecordData<TFields>>(
        this.encodedResourcePath,
        { method, body: { ...opts, records: recordIdOrData ?? {} } }
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
      body: isDeletingMultiple ? { records: recordIds } : undefined,
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
}
