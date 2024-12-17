import type { CommentData, Mention, Reaction } from "./types";
import type { AirtableTable } from "./table";

export class AirtableComment {
  readonly table: AirtableTable;
  readonly recordId: string;

  _data!: CommentData;

  id!: string;
  text!: string;
  createdTime!: Date;
  lastUpdatedTime?: Date;
  parentCommentId?: string;
  mentioned?: Record<string, Mention>;
  reactions?: Reaction[];

  /**
   * Property exists once `delete()` replied with `deleted: true`
   * only used as indicative, won't be used to prevent
   * further API call
   */
  deleted?: true;

  get $fetch() {
    return this.table.$fetch;
  }

  constructor(table: AirtableTable, recordId: string, data: CommentData) {
    this.table = table;
    this.recordId = recordId;
    this.setData(data);
  }

  setData(data: CommentData) {
    this._data = data;

    this.id = data.id;
    this.text = data.text;
    this.createdTime = new Date(data.createdTime);

    if (data.lastUpdatedTime)
      this.lastUpdatedTime = new Date(data.lastUpdatedTime);
    if (data.parentCommentId) this.parentCommentId = data.parentCommentId;
    if (data.mentioned) this.mentioned = data.mentioned;
    if (data.reactions) this.reactions = data.reactions;
  }

  get haveMentions() {
    return this.mentioned !== undefined;
  }

  get haveReactions() {
    return this.reactions !== undefined;
  }

  async save() {
    await this.update(this.text);
  }

  async update(text: string) {
    const data = await this.$fetch<CommentData>(
      `${this.table.encodedResourcePath}/${encodeURIComponent(this.recordId)}/comments/${encodeURIComponent(this.id)}`,
      { method: "PATCH", body: { text } }
    );
    this.setData(data);
  }

  async delete() {
    const response = await this.table.deleteComment(this.recordId, this.id);
    if (response.deleted === true) this.deleted = true;
    return response;
  }
}
