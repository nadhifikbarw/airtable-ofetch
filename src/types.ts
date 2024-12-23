import type { RetryDelayOption } from "./retry";
export type MaybePromise<T> = T | PromiseLike<T>;
export type CustomHeaders = Record<string, string | number | boolean>;
import type { FetchOptions, FetchRequest, MappedResponseType } from "ofetch";
import type { AirtableComment } from "./comment";
import type { AirtableRecord } from "./record";

// --------------------------
// Options
// --------------------------

export interface AirtableOptions {
  /**
   * As of February 1st 2024, Airtable Web API has ended deprecation period
   * of Airtable API Key and has prompted all users to migrate to use personal
   * access token (PAT) or OAuth access token
   *
   * @see https://airtable.com/developers/web/api/authentication
   */
  apiKey?: string;

  /**
   * API Endpoint URL target, users may override this if they need
   * to pass requests through an API proxy. Don't include trailing slash
   * for consistency.
   *
   * @optional
   */
  endpointURL?: string;

  /**
   * Content Endpoint URL target, users may override this if they need
   * to pass requests through an API proxy. Don't include trailing slash
   * for consistency.
   *
   * @see https://airtable.com/developers/web/api/upload-attachment
   * @optional
   */
  contentEndpointURL?: string;

  /**
   * API version that to be included as 'x-api-version'
   * header and to determine API major version
   *
   * @optional
   */
  apiVersion?: string;

  /**
   * Custom headers to be included when requesting to API endpoint
   *
   * @optional
   */
  customHeaders?: CustomHeaders;

  /**
   * Disable / configure exponential backoff with jitter retry
   * whenever API request receive 429 status code response
   *
   * @see https://airtable.com/developers/web/api/rate-limits
   * @optional
   */
  noRetryIfRateLimited?: boolean | RetryDelayOption;

  /**
   * How long in ms before aborting a request attempt.
   * Default to 5 minutes.
   *
   * @optional
   */
  requestTimeout?: number;
}

export interface CreateAirtableFetchOptions {
  headers: "resolve" | "replace";
}

// --------------------------
// Pagination
// --------------------------

export type $FetchPaginate = <T = any>(
  request: FetchPaginateRequest,
  options: FetchPaginateOptions<T>
) => Promise<void>;

export type FetchPaginateRequest = Exclude<FetchRequest, Request>;

// Only support record-styled as body
export interface FetchPaginateOptions<T = any>
  extends Omit<FetchOptions<"json", T>, "body">,
    FetchPaginateHooks<T> {
  body?: Record<string, any> | null;
}

export interface FetchPaginateContext<T = any> {
  request: FetchPaginateRequest;
  response: MappedResponseType<"json", T>;
}
export type FetchPaginateEachPageFn<T = any> = (
  ctx: FetchPaginateContext<T>
) => MaybePromise<boolean | void>;

export type FetchPaginateGetOffsetFn<T = any> = (
  ctx: FetchPaginateContext<T>
) => MaybePromise<Record<string, any> | void>;

export interface FetchPaginateHooks<T = any> {
  /**Return `false` to stop next page iteration*/
  onEachPage: FetchPaginateEachPageFn<T>;

  /**
   * Callback to provide parameters
   * that will be included for next page request
   */
  getOffset?: FetchPaginateGetOffsetFn<T>;
}

// --------------------------
// API Options
// --------------------------

export interface SortOption {
  field: string;
  direction?: "asc" | "desc";
}

export type CellFormatOption = "json" | "string";

export interface GetRecordOptions {
  cellFormat?: CellFormatOption;
  returnFieldsByFieldId?: true;
}

export interface CreateRecordsOptions {
  returnFieldsByFieldId?: boolean;
  typecast?: boolean;
}

export interface ListRecordsOptions {
  timeZone?: Timezone;
  userLocale?: string;
  pageSize?: number;
  maxRecords?: number;
  offset?: string;
  view?: string;
  sort?: SortOption[];
  filterByFormula?: string;
  cellFormat?: CellFormatOption;
  fields?: string[];
  returnFieldsByFieldId?: boolean;
  recordsMetadata?: string[];
}

/**
 * Return `false` to stop page iteration earlier even if more page
 * available, this might be preferred if you need to iterate records and unable
 * to control pagination behavior using other pagination parameters such as
 * maxRecords, filterByFormula, view or etc.
 */
export type QueryEachPageFn<
  TFields extends FieldSet = Record<string, unknown>,
> = (records: AirtableRecord<TFields>[]) => MaybePromise<boolean | void>;

export interface CreateRecordData<TFields extends FieldSet> {
  fields: Partial<TFields>;
}

/**
 * PATCH for non-destructive updates, PUT for destructive updates
 * to clear all unset fields
 *
 * {@link https://airtable.com/developers/web/api/update-multiple-records}
 */
export type UpdateRecordsMethod = "PATCH" | "PUT";

export interface UpdateRecordOptions {
  returnFieldsByFieldId?: boolean;
  typecast?: boolean;
}

export interface UpsertRecordsOptions extends UpdateRecordOptions {
  performUpsert: { fieldsToMergeOn: string[] };
}

export interface UpdateRecordData<TFields extends FieldSet> {
  id: string;
  fields: Partial<TFields>;
}

export interface UpsertRecordData<TFields extends FieldSet> {
  id?: string;
  fields: Partial<TFields>;
}

export type CreateFieldOptions = FieldConfig;

export interface UpdateFieldOptions {
  name: string;
  description?: string;
}

export interface ListCommentsOptions {
  pageSize?: number;
  offset?: string;
}

export type CommentsQueryEachPageFn = (
  comments: AirtableComment[]
) => MaybePromise<boolean | void>;

// --------------------------
// Error
// --------------------------

export interface IAirtableError extends Error {
  error: string;
  statusCode?: number;
}

// --------------------------
// Airtable Response & Format
// --------------------------

export interface UserInfo {
  id: string;
  email?: string;
  scopes?: string[];
}

export interface BaseInfo {
  id: string;
  name: string;
  permissionLevel: UserPermissionLevel;
}

export interface BaseConfig {
  name: string;
  workspaceId: string;
  tables: TableConfig[];
}

export interface BaseSchema {
  tables: TableSchema[];
}

export interface TableConfig {
  name: string;
  description?: string;
  fields: FieldConfig[];
}

export interface FieldConfig {
  name: string;
  type: FieldType;
  description?: string;
  options?: FieldOptions;
}

export interface FieldSchema {
  id: string;
  type?: FieldType;
  name: string;
  description?: string;
  options: FieldOptions;
}

export interface TableSchema {
  id: string;
  primaryFieldId: string;
  name: string;
  description?: string;
  fields: FieldSchema[];
  views: {
    id: string;
    type: ViewType;
    name: string;
    visibleFieldIds?: string[];
  }[];
}

export interface RecordData<TFields> {
  id: string;
  // Airtable API often doesn't send keys for "empty"-valued field
  fields: Partial<TFields>;
  createdTime: string;
  commentCount?: number;
}

export interface DeletedData {
  id: string;
  deleted: boolean;
}

export interface UploadAttachmentData {
  contentType: string;
  file: string;
  filename: string;
}

export type AttachmentRecordData = RecordData<
  Record<string, ReadonlyArray<Attachment>>
>;

export interface CreatedRecordsData<TFields extends FieldSet> {
  records: RecordData<TFields>[];
}

export interface CreatedRecords<TFields extends FieldSet> {
  records: AirtableRecord<TFields>[];
}

export interface UpdatedRecordsData<TFields extends FieldSet> {
  records: RecordData<TFields>[];
}

export interface UpdatedRecords<TFields extends FieldSet> {
  records: AirtableRecord<TFields>[];
}

export interface UpsertedRecords<TFields extends FieldSet>
  extends UpdatedRecords<TFields> {
  createdRecords?: string[];
  updatedRecords?: string[];
}

export interface UpsertedRecordData<TFields extends FieldSet>
  extends UpdatedRecordsData<TFields> {
  createdRecords?: string[];
  updatedRecords?: string[];
}

export interface UserMention {
  id: string;
  type: string;
  displayName: string;
  email: string;
}

export interface UserGroupMention {
  id: string;
  type: string;
  displayName: string;
}

export type Mention = UserMention | UserGroupMention;

export interface ReactingUser {
  userId: string;
  email: string;
  name?: string;
}

export interface Reaction {
  emoji: { unicodeCharacter: string };
  reactingUser: ReactingUser;
}

export interface CommentAuthor {
  id: string;
  email: string;
  name?: string;
}

export interface CommentData {
  id: string;
  createdTime: string;
  lastUpdatedTime: string | null;
  text: string;
  parentCommentId: string;
  mentioned?: Record<string, Mention>;
  reactions: Reaction[];
  author: CommentAuthor;
}

// --------------------------
// Airtable Constants
// --------------------------

export type UserPermissionLevel =
  | "none"
  | "read"
  | "comment"
  | "edit"
  | "create";

export type Timezone =
  | "utc"
  | "client"
  | "Africa/Abidjan"
  | "Africa/Accra"
  | "Africa/Addis_Ababa"
  | "Africa/Algiers"
  | "Africa/Asmara"
  | "Africa/Bamako"
  | "Africa/Bangui"
  | "Africa/Banjul"
  | "Africa/Bissau"
  | "Africa/Blantyre"
  | "Africa/Brazzaville"
  | "Africa/Bujumbura"
  | "Africa/Cairo"
  | "Africa/Casablanca"
  | "Africa/Ceuta"
  | "Africa/Conakry"
  | "Africa/Dakar"
  | "Africa/Dar_es_Salaam"
  | "Africa/Djibouti"
  | "Africa/Douala"
  | "Africa/El_Aaiun"
  | "Africa/Freetown"
  | "Africa/Gaborone"
  | "Africa/Harare"
  | "Africa/Johannesburg"
  | "Africa/Juba"
  | "Africa/Kampala"
  | "Africa/Khartoum"
  | "Africa/Kigali"
  | "Africa/Kinshasa"
  | "Africa/Lagos"
  | "Africa/Libreville"
  | "Africa/Lome"
  | "Africa/Luanda"
  | "Africa/Lubumbashi"
  | "Africa/Lusaka"
  | "Africa/Malabo"
  | "Africa/Maputo"
  | "Africa/Maseru"
  | "Africa/Mbabane"
  | "Africa/Mogadishu"
  | "Africa/Monrovia"
  | "Africa/Nairobi"
  | "Africa/Ndjamena"
  | "Africa/Niamey"
  | "Africa/Nouakchott"
  | "Africa/Ouagadougou"
  | "Africa/Porto-Novo"
  | "Africa/Sao_Tome"
  | "Africa/Tripoli"
  | "Africa/Tunis"
  | "Africa/Windhoek"
  | "America/Adak"
  | "America/Anchorage"
  | "America/Anguilla"
  | "America/Antigua"
  | "America/Araguaina"
  | "America/Argentina/Buenos_Aires"
  | "America/Argentina/Catamarca"
  | "America/Argentina/Cordoba"
  | "America/Argentina/Jujuy"
  | "America/Argentina/La_Rioja"
  | "America/Argentina/Mendoza"
  | "America/Argentina/Rio_Gallegos"
  | "America/Argentina/Salta"
  | "America/Argentina/San_Juan"
  | "America/Argentina/San_Luis"
  | "America/Argentina/Tucuman"
  | "America/Argentina/Ushuaia"
  | "America/Aruba"
  | "America/Asuncion"
  | "America/Atikokan"
  | "America/Bahia"
  | "America/Bahia_Banderas"
  | "America/Barbados"
  | "America/Belem"
  | "America/Belize"
  | "America/Blanc-Sablon"
  | "America/Boa_Vista"
  | "America/Bogota"
  | "America/Boise"
  | "America/Cambridge_Bay"
  | "America/Campo_Grande"
  | "America/Cancun"
  | "America/Caracas"
  | "America/Cayenne"
  | "America/Cayman"
  | "America/Chicago"
  | "America/Chihuahua"
  | "America/Costa_Rica"
  | "America/Creston"
  | "America/Cuiaba"
  | "America/Curacao"
  | "America/Danmarkshavn"
  | "America/Dawson"
  | "America/Dawson_Creek"
  | "America/Denver"
  | "America/Detroit"
  | "America/Dominica"
  | "America/Edmonton"
  | "America/Eirunepe"
  | "America/El_Salvador"
  | "America/Fort_Nelson"
  | "America/Fortaleza"
  | "America/Glace_Bay"
  | "America/Godthab"
  | "America/Goose_Bay"
  | "America/Grand_Turk"
  | "America/Grenada"
  | "America/Guadeloupe"
  | "America/Guatemala"
  | "America/Guayaquil"
  | "America/Guyana"
  | "America/Halifax"
  | "America/Havana"
  | "America/Hermosillo"
  | "America/Indiana/Indianapolis"
  | "America/Indiana/Knox"
  | "America/Indiana/Marengo"
  | "America/Indiana/Petersburg"
  | "America/Indiana/Tell_City"
  | "America/Indiana/Vevay"
  | "America/Indiana/Vincennes"
  | "America/Indiana/Winamac"
  | "America/Inuvik"
  | "America/Iqaluit"
  | "America/Jamaica"
  | "America/Juneau"
  | "America/Kentucky/Louisville"
  | "America/Kentucky/Monticello"
  | "America/Kralendijk"
  | "America/La_Paz"
  | "America/Lima"
  | "America/Los_Angeles"
  | "America/Lower_Princes"
  | "America/Maceio"
  | "America/Managua"
  | "America/Manaus"
  | "America/Marigot"
  | "America/Martinique"
  | "America/Matamoros"
  | "America/Mazatlan"
  | "America/Menominee"
  | "America/Merida"
  | "America/Metlakatla"
  | "America/Mexico_City"
  | "America/Miquelon"
  | "America/Moncton"
  | "America/Monterrey"
  | "America/Montevideo"
  | "America/Montserrat"
  | "America/Nassau"
  | "America/New_York"
  | "America/Nipigon"
  | "America/Nome"
  | "America/Noronha"
  | "America/North_Dakota/Beulah"
  | "America/North_Dakota/Center"
  | "America/North_Dakota/New_Salem"
  | "America/Nuuk"
  | "America/Ojinaga"
  | "America/Panama"
  | "America/Pangnirtung"
  | "America/Paramaribo"
  | "America/Phoenix"
  | "America/Port-au-Prince"
  | "America/Port_of_Spain"
  | "America/Porto_Velho"
  | "America/Puerto_Rico"
  | "America/Punta_Arenas"
  | "America/Rainy_River"
  | "America/Rankin_Inlet"
  | "America/Recife"
  | "America/Regina"
  | "America/Resolute"
  | "America/Rio_Branco"
  | "America/Santarem"
  | "America/Santiago"
  | "America/Santo_Domingo"
  | "America/Sao_Paulo"
  | "America/Scoresbysund"
  | "America/Sitka"
  | "America/St_Barthelemy"
  | "America/St_Johns"
  | "America/St_Kitts"
  | "America/St_Lucia"
  | "America/St_Thomas"
  | "America/St_Vincent"
  | "America/Swift_Current"
  | "America/Tegucigalpa"
  | "America/Thule"
  | "America/Thunder_Bay"
  | "America/Tijuana"
  | "America/Toronto"
  | "America/Tortola"
  | "America/Vancouver"
  | "America/Whitehorse"
  | "America/Winnipeg"
  | "America/Yakutat"
  | "America/Yellowknife"
  | "Antarctica/Casey"
  | "Antarctica/Davis"
  | "Antarctica/DumontDUrville"
  | "Antarctica/Macquarie"
  | "Antarctica/Mawson"
  | "Antarctica/McMurdo"
  | "Antarctica/Palmer"
  | "Antarctica/Rothera"
  | "Antarctica/Syowa"
  | "Antarctica/Troll"
  | "Antarctica/Vostok"
  | "Arctic/Longyearbyen"
  | "Asia/Aden"
  | "Asia/Almaty"
  | "Asia/Amman"
  | "Asia/Anadyr"
  | "Asia/Aqtau"
  | "Asia/Aqtobe"
  | "Asia/Ashgabat"
  | "Asia/Atyrau"
  | "Asia/Baghdad"
  | "Asia/Bahrain"
  | "Asia/Baku"
  | "Asia/Bangkok"
  | "Asia/Barnaul"
  | "Asia/Beirut"
  | "Asia/Bishkek"
  | "Asia/Brunei"
  | "Asia/Chita"
  | "Asia/Choibalsan"
  | "Asia/Colombo"
  | "Asia/Damascus"
  | "Asia/Dhaka"
  | "Asia/Dili"
  | "Asia/Dubai"
  | "Asia/Dushanbe"
  | "Asia/Famagusta"
  | "Asia/Gaza"
  | "Asia/Hebron"
  | "Asia/Ho_Chi_Minh"
  | "Asia/Hong_Kong"
  | "Asia/Hovd"
  | "Asia/Irkutsk"
  | "Asia/Istanbul"
  | "Asia/Jakarta"
  | "Asia/Jayapura"
  | "Asia/Jerusalem"
  | "Asia/Kabul"
  | "Asia/Kamchatka"
  | "Asia/Karachi"
  | "Asia/Kathmandu"
  | "Asia/Khandyga"
  | "Asia/Kolkata"
  | "Asia/Krasnoyarsk"
  | "Asia/Kuala_Lumpur"
  | "Asia/Kuching"
  | "Asia/Kuwait"
  | "Asia/Macau"
  | "Asia/Magadan"
  | "Asia/Makassar"
  | "Asia/Manila"
  | "Asia/Muscat"
  | "Asia/Nicosia"
  | "Asia/Novokuznetsk"
  | "Asia/Novosibirsk"
  | "Asia/Omsk"
  | "Asia/Oral"
  | "Asia/Phnom_Penh"
  | "Asia/Pontianak"
  | "Asia/Pyongyang"
  | "Asia/Qatar"
  | "Asia/Qostanay"
  | "Asia/Qyzylorda"
  | "Asia/Rangoon"
  | "Asia/Riyadh"
  | "Asia/Sakhalin"
  | "Asia/Samarkand"
  | "Asia/Seoul"
  | "Asia/Shanghai"
  | "Asia/Singapore"
  | "Asia/Srednekolymsk"
  | "Asia/Taipei"
  | "Asia/Tashkent"
  | "Asia/Tbilisi"
  | "Asia/Tehran"
  | "Asia/Thimphu"
  | "Asia/Tokyo"
  | "Asia/Tomsk"
  | "Asia/Ulaanbaatar"
  | "Asia/Urumqi"
  | "Asia/Ust-Nera"
  | "Asia/Vientiane"
  | "Asia/Vladivostok"
  | "Asia/Yakutsk"
  | "Asia/Yangon"
  | "Asia/Yekaterinburg"
  | "Asia/Yerevan"
  | "Atlantic/Azores"
  | "Atlantic/Bermuda"
  | "Atlantic/Canary"
  | "Atlantic/Cape_Verde"
  | "Atlantic/Faroe"
  | "Atlantic/Madeira"
  | "Atlantic/Reykjavik"
  | "Atlantic/South_Georgia"
  | "Atlantic/St_Helena"
  | "Atlantic/Stanley"
  | "Australia/Adelaide"
  | "Australia/Brisbane"
  | "Australia/Broken_Hill"
  | "Australia/Currie"
  | "Australia/Darwin"
  | "Australia/Eucla"
  | "Australia/Hobart"
  | "Australia/Lindeman"
  | "Australia/Lord_Howe"
  | "Australia/Melbourne"
  | "Australia/Perth"
  | "Australia/Sydney"
  | "Europe/Amsterdam"
  | "Europe/Andorra"
  | "Europe/Astrakhan"
  | "Europe/Athens"
  | "Europe/Belgrade"
  | "Europe/Berlin"
  | "Europe/Bratislava"
  | "Europe/Brussels"
  | "Europe/Bucharest"
  | "Europe/Budapest"
  | "Europe/Busingen"
  | "Europe/Chisinau"
  | "Europe/Copenhagen"
  | "Europe/Dublin"
  | "Europe/Gibraltar"
  | "Europe/Guernsey"
  | "Europe/Helsinki"
  | "Europe/Isle_of_Man"
  | "Europe/Istanbul"
  | "Europe/Jersey"
  | "Europe/Kaliningrad"
  | "Europe/Kiev"
  | "Europe/Kirov"
  | "Europe/Lisbon"
  | "Europe/Ljubljana"
  | "Europe/London"
  | "Europe/Luxembourg"
  | "Europe/Madrid"
  | "Europe/Malta"
  | "Europe/Mariehamn"
  | "Europe/Minsk"
  | "Europe/Monaco"
  | "Europe/Moscow"
  | "Europe/Nicosia"
  | "Europe/Oslo"
  | "Europe/Paris"
  | "Europe/Podgorica"
  | "Europe/Prague"
  | "Europe/Riga"
  | "Europe/Rome"
  | "Europe/Samara"
  | "Europe/San_Marino"
  | "Europe/Sarajevo"
  | "Europe/Saratov"
  | "Europe/Simferopol"
  | "Europe/Skopje"
  | "Europe/Sofia"
  | "Europe/Stockholm"
  | "Europe/Tallinn"
  | "Europe/Tirane"
  | "Europe/Ulyanovsk"
  | "Europe/Uzhgorod"
  | "Europe/Vaduz"
  | "Europe/Vatican"
  | "Europe/Vienna"
  | "Europe/Vilnius"
  | "Europe/Volgograd"
  | "Europe/Warsaw"
  | "Europe/Zagreb"
  | "Europe/Zaporozhye"
  | "Europe/Zurich"
  | "Indian/Antananarivo"
  | "Indian/Chagos"
  | "Indian/Christmas"
  | "Indian/Cocos"
  | "Indian/Comoro"
  | "Indian/Kerguelen"
  | "Indian/Mahe"
  | "Indian/Maldives"
  | "Indian/Mauritius"
  | "Indian/Mayotte"
  | "Indian/Reunion"
  | "Pacific/Apia"
  | "Pacific/Auckland"
  | "Pacific/Bougainville"
  | "Pacific/Chatham"
  | "Pacific/Chuuk"
  | "Pacific/Easter"
  | "Pacific/Efate"
  | "Pacific/Enderbury"
  | "Pacific/Fakaofo"
  | "Pacific/Fiji"
  | "Pacific/Funafuti"
  | "Pacific/Galapagos"
  | "Pacific/Gambier"
  | "Pacific/Guadalcanal"
  | "Pacific/Guam"
  | "Pacific/Honolulu"
  | "Pacific/Kanton"
  | "Pacific/Kiritimati"
  | "Pacific/Kosrae"
  | "Pacific/Kwajalein"
  | "Pacific/Majuro"
  | "Pacific/Marquesas"
  | "Pacific/Midway"
  | "Pacific/Nauru"
  | "Pacific/Niue"
  | "Pacific/Norfolk"
  | "Pacific/Noumea"
  | "Pacific/Pago_Pago"
  | "Pacific/Palau"
  | "Pacific/Pitcairn"
  | "Pacific/Pohnpei"
  | "Pacific/Port_Moresby"
  | "Pacific/Rarotonga"
  | "Pacific/Saipan"
  | "Pacific/Tahiti"
  | "Pacific/Tarawa"
  | "Pacific/Tongatapu"
  | "Pacific/Wake"
  | "Pacific/Wallis";

export type ViewType =
  | "grid"
  | "form"
  | "calendar"
  | "gallery"
  | "kanban"
  | "timeline"
  | "block";

// --------------------------
// Airtable Fields
// --------------------------

export type FieldOptions = Record<string, any>;

export type FieldType =
  | "singleLineText"
  | "email"
  | "url"
  | "multilineText"
  | "number"
  | "percent"
  | "currency"
  | "singleSelect"
  | "multipleSelects"
  | "singleCollaborator"
  | "multipleCollaborators"
  | "multipleRecordLinks"
  | "date"
  | "dateTime"
  | "phoneNumber"
  | "multipleAttachments"
  | "checkbox"
  | "formula"
  | "createdTime"
  | "rollup"
  | "count"
  | "lookup"
  | "multipleLookupValues"
  | "autoNumber"
  | "barcode"
  | "rating"
  | "richText"
  | "duration"
  | "lastModifiedTime"
  | "button"
  | "createdBy"
  | "lastModifiedBy"
  | "externalSyncSource"
  | "aiText";

export interface FieldSet {
  [key: string]:
    | unknown
    | undefined
    | null
    // SingleLineText, LongText, RichText, Email, Phone, URL, Date, DateTime, Formula, Rollup, SyncSource
    | string
    // AutoNumber, Count, Currency, Duration, Number, Percent, Rating, Formula, Rollup
    | number
    // Checkbox, Formula, Rollup
    | boolean
    // MultipleSelectV1, LinkedRecordV1, SingleSelectV1, Formula
    | ReadonlyArray<string>
    | ReadonlyArray<number> // Formula
    | ReadonlyArray<string | number> // Formula
    // Complex values
    | AIText
    | ReadonlyArray<Attachment>
    | Barcode
    | Button
    | Collaborator
    | ReadonlyArray<LinkedRecordV2>
    | ReadonlyArray<LookupV1>
    | LookupV2
    | ReadonlyArray<Collaborator> // MultipleCollaborator
    | SelectV2 // SingleSelectV2
    | ReadonlyArray<SelectV2> //MultipleSelectV2
    // Generic/new type catch-all
    | Record<string, any>
    | ReadonlyArray<Record<string, any>>;
}

export interface AIText {
  state: "empty" | "loading" | "generated" | "error";
  errorType?: string;
  isStale: boolean;
  value?: string | null;
}

export interface Attachment {
  id: string;
  url: string;
  filename: string;
  size: number;
  type: string;
  height?: number;
  width?: number;
  thumbnails?: {
    small: Thumbnail;
    large: Thumbnail;
    full: Thumbnail;
  };
}

export interface Barcode {
  type?: string | null;
  text: string;
}

export interface Button {
  label: string;
  url: string | null;
}

export interface Collaborator {
  id: string;
  email?: string;
  name?: string;
  permissionLevel?: UserPermissionLevel;
  profilePicUrl?: string;
}

export interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

export interface LinkedRecordV2 {
  id: string;
  name: string;
}

export type LookupV1 = number | string | boolean | Record<string, any>;

export interface LookupV2 {
  valuesByLinkedRecordId: Record<string, any>;
  linkedRecordIds: string[];
}

export interface SelectV2 {
  id: string;
  name: string;
  color?: string;
}
