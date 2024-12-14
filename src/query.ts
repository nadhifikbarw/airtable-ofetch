import type { AirtableTable } from "./table";
import type {
  FieldSet,
  ListRecordsOptions,
  QueryEachPageFn,
  RecordData,
} from "./types";
import { AirtableRecord } from "./record";

// TODO: extend for Comment
export class AirtableQuery<TFields extends FieldSet> {
  readonly table: AirtableTable<TFields>;
  readonly opts?: ListRecordsOptions;

  get $fetchPaginate() {
    return this.table.$fetchPaginate;
  }

  constructor(table: AirtableTable<TFields>, opts?: ListRecordsOptions) {
    this.table = table;
    if (this.opts) this.opts = opts;
  }

  // TODO: support iterator timeout scenario
  // @link https://airtable.com/developers/web/api/list-records

  async firstPage() {
    const records: AirtableRecord<TFields>[] = [];

    await this.eachPage((pageRecords) => {
      records.push(...pageRecords);
      return false;
    });

    return records;
  }

  async eachPage(eachPageFn: QueryEachPageFn<TFields>) {
    const table = this.table;
    const body = this.opts;

    await this.$fetchPaginate<{
      records: RecordData<TFields>[];
    }>(`${this.table.encodedResourcePath}/listRecords`, {
      body,
      method: "POST",
      async onEachPage(ctx) {
        return await eachPageFn(
          ctx.response?.records.map((data) =>
            AirtableRecord.fromData(table, data)
          )
        );
      },
    });
  }

  async all() {
    const records: AirtableRecord<TFields>[] = [];
    const table = this.table;

    // Always delete pageSize to use maximum API defaults to save round trip
    const body = { ...this.opts };
    if (body.pageSize) delete body.pageSize;

    await this.$fetchPaginate<{
      records: RecordData<TFields>[];
    }>(`${this.table.encodedResourcePath}/listRecords`, {
      body,
      method: "POST",
      async onEachPage(ctx) {
        const pageRecords = ctx.response?.records || [];
        for (const data of pageRecords) {
          records.push(AirtableRecord.fromData(table, data));
        }
        return true;
      },
    });

    return records;
  }
}
