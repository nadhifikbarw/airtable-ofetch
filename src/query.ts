import { AirtableError } from "./error";
import { AirtableRecord } from "./record";
import { isIterationTimeoutError } from "./utils";
import type { AirtableTable } from "./table";
import type {
  FieldSet,
  ListRecordsOptions,
  QueryEachPageFn,
  RecordData,
} from "./types";

export class AirtableQuery<TFields extends FieldSet> {
  private readonly _resetIteration: boolean;
  readonly table: AirtableTable<TFields>;
  readonly opts?: ListRecordsOptions;

  get $fetchPaginate() {
    return this.table.$fetchPaginate;
  }

  constructor(table: AirtableTable<TFields>, opts?: ListRecordsOptions) {
    this.table = table;
    this._resetIteration = !this.table.base.airtable.noIterationReset;

    if (opts) this.opts = opts;
  }

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

    // Always ignore pageSize to use maximum API defaults to save round trip
    const body = { ...this.opts };
    if (body.pageSize) delete body.pageSize;

    const paginate = async () => {
      await this.$fetchPaginate<{
        records: RecordData<TFields>[];
      }>(`${this.table.encodedResourcePath}/listRecords`, {
        body,
        method: "POST",
        async onEachPage(ctx) {
          if (ctx.response?.records) {
            const pageRecords = ctx.response.records;
            for (const data of pageRecords)
              records.push(AirtableRecord.fromData(table, data));
          }
          return true;
        },
      });
    };

    // Handle iteration timeout
    let retry = true;
    while (retry) {
      try {
        await paginate();
        retry = false;
      } catch (error) {
        if (
          !this._resetIteration ||
          (error instanceof AirtableError && !isIterationTimeoutError(error))
        )
          throw error;

        records.length = 0;
      }
    }

    return records;
  }
}
