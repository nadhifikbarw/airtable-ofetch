import type {
  CommentData,
  CommentsQueryEachPageFn,
  ListCommentsOptions,
  ListRecordsOptions,
} from "./types";
import { AirtableComment } from "./comment";
import type { AirtableTable } from "./table";

export class AirtableCommentQuery {
  readonly table: AirtableTable;
  readonly recordId: string;
  readonly opts?: ListRecordsOptions;

  get $fetchPaginate() {
    return this.table.$fetchPaginate;
  }

  constructor(
    table: AirtableTable,
    recordId: string,
    opts?: ListCommentsOptions
  ) {
    this.table = table;
    this.recordId = recordId;
    if (this.opts) this.opts = opts;
  }

  async firstPage() {
    const comments: AirtableComment[] = [];

    await this.eachPage((pageComments) => {
      comments.push(...pageComments);
      return false;
    });

    return comments;
  }

  async eachPage(eachPageFn: CommentsQueryEachPageFn) {
    const table = this.table;
    const recordId = this.recordId;

    await this.$fetchPaginate<{
      comments: CommentData[];
    }>(
      `${this.table.encodedResourcePath}/${encodeURIComponent(this.recordId)}/comments`,
      {
        query: this.opts,
        async onEachPage(ctx) {
          return await eachPageFn(
            ctx.response?.comments.map(
              (data) => new AirtableComment(table, recordId, data)
            )
          );
        },
      }
    );
  }
  //
  async all() {
    const comments: AirtableComment[] = [];
    const table = this.table;
    const recordId = this.recordId;

    // Always delete pageSize to use maximum API defaults to save round trip
    const query = { ...this.opts };
    if (query.pageSize) delete query.pageSize;

    await this.$fetchPaginate<{
      comments: CommentData[];
    }>(
      `${this.table.encodedResourcePath}/${encodeURIComponent(this.recordId)}/comments`,
      {
        query,
        async onEachPage(ctx) {
          const pageComments = ctx.response?.comments || [];
          for (const data of pageComments) {
            comments.push(new AirtableComment(table, recordId, data));
          }
          return true;
        },
      }
    );

    return comments;
  }
}
