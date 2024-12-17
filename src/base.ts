import type { Airtable } from "./airtable";
import { AirtableTable } from "./table";
import type {
  AttachmentRecordData,
  BaseSchema,
  FieldSet,
  TableConfig,
  TableSchema,
  UploadAttachmentData,
} from "./types";

export class AirtableBase {
  readonly airtable: Airtable;
  readonly id: string;

  readonly uploadAttachment: (
    recordId: string,
    attachmentFieldIdOrName: string,
    attachment: UploadAttachmentData
  ) => Promise<AttachmentRecordData>;

  get $fetch() {
    return this.airtable.$fetch;
  }

  get $fetchContent() {
    return this.airtable.$fetchContent;
  }

  get $fetchPaginate() {
    return this.airtable.$fetchPaginate;
  }

  constructor(airtable: Airtable, baseId: string) {
    this.airtable = airtable;
    this.id = baseId;

    this.uploadAttachment = async (
      recordId: string,
      attachmentFieldIdOrName: string,
      attachment: UploadAttachmentData
    ) => {
      return await this.$fetchContent<AttachmentRecordData>(
        `${this.encodedResourcePath}/${encodeURIComponent(recordId)}/${encodeURIComponent(attachmentFieldIdOrName)}/uploadAttachment`,
        { method: "POST", body: attachment }
      );
    };
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
    return await this.$fetch<BaseSchema>(
      `/meta/bases/${this.encodedResourceId}/tables`,
      {
        query: {
          include: includeVisibleFieldIds ? "visibleFieldIds" : undefined,
        },
      }
    );
  }

  async createTable(config: TableConfig) {
    return await this.$fetch<TableSchema>(
      `/meta/bases/${this.encodedResourceId}/tables`,
      { method: "POST", body: config }
    );
  }
}
