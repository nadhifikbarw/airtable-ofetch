import type { RetryDelayOption } from "./retry";
export type CustomHeaders = Record<string, string | number | boolean>;

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
   * pass requests through an API proxy
   * @optional
   */
  endpointURL?: string;

  /**
   * API version that to be included as 'x-api-version' header
   * and to determine API major version
   * @optional
   */
  apiVersion?: string;

  /**
   * Custom headers to be included when requesting to API endpoint
   * @optional
   */
  customHeaders?: CustomHeaders;

  /**
   * Disable exponential backoff with jitter retry behaviour
   * whenever API request receive 429 status code response
   */
  noRetryIfRateLimited?: boolean | RetryDelayOption;

  /**
   * How long client should wait in ms before aborting fetch attempt.
   * Default to 5 minutes.
   */
  requestTimeout?: number;
}

export interface CreateAirtableFetchOptions {
  headers: "resolve" | "replace";
}

export interface FetchPaginateContext<T = any> {
  request: RequestInit;
  response: T;
}

export interface FetchPaginateOptions<T = any> {
  /**
   * onEachPage() callback should return false to stop
   * next page iteration
   */
  onEachPage: (ctx: FetchPaginateContext) => Promise<boolean>;
  getOffset: (response: T) => Record<string, string>;
}

// --------------------------
// Error
// --------------------------

export interface IAirtableError extends Error {
  error: string;
  statusCode?: number;
}

// --------------------------
// Airtable Types
// --------------------------

export interface UserInfo {
  id: string;
  email?: string;
  scopes?: string[];
}

export type UserBasePermissionLevel =
  | "none"
  | "read"
  | "comment"
  | "edit"
  | "create";

export interface BaseInfo {
  id: string;
  name: string;
  permissionLevel: UserBasePermissionLevel;
}

export interface RecordData<TFields> {
  id: string;
  fields: TFields;
  commentCount?: number;
}

export interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

export interface Attachment {
  id: string;
  url: string;
  filename: string;
  size: number;
  type: string;
  thumbnails?: {
    small: Thumbnail;
    large: Thumbnail;
    full: Thumbnail;
  };
}

export interface Collaborator {
  id: string;
  email: string;
  name: string;
}

export interface FieldSet {
  [key: string]:
    | undefined
    | string
    | number
    | boolean
    | Collaborator
    | ReadonlyArray<Collaborator>
    | ReadonlyArray<string>
    | ReadonlyArray<Attachment>;
}
