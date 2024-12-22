import type { $Fetch, FetchResponse } from "ofetch";
import type { RetryDelayOption } from "./retry";
import type {
  $FetchPaginate,
  AirtableOptions,
  BaseConfig,
  BaseInfo,
  CreateAirtableFetchOptions,
  CustomHeaders,
  FetchPaginateContext,
  FetchPaginateOptions,
  FetchPaginateRequest,
  TableSchema,
  UserInfo,
} from "./types";

import { defu } from "defu";
import { ofetch } from "ofetch";
import { AirtableBase } from "./base";
import { AirtableError } from "./error";
import { createRetryDelayFn } from "./retry";
import { defaultGetOffset, isEmptyObject } from "./utils";

// Prevent key being an enumerable property
// retain security practice from airtable.js implementation
// read airtable.test.ts
const $secrets: WeakMap<Airtable, string> = new WeakMap();

declare module "ofetch" {
  interface FetchOptions {
    requestAttempt?: number;
  }
}

export class Airtable {
  readonly apiVersion: string;
  readonly apiVersionMajor: string;
  readonly customHeaders: CustomHeaders | undefined;
  readonly endpointUrl: string;
  readonly contentEndpointUrl: string;
  readonly noRetryIfRateLimited: boolean | RetryDelayOption;
  readonly requestTimeout: number;

  readonly $fetch: $Fetch;
  readonly $fetchContent: $Fetch;
  readonly $fetchPaginate: $FetchPaginate;

  constructor(opts?: AirtableOptions) {
    const $opts = defu(opts, {
      endpointURL:
        process.env.AIRTABLE_ENDPOINT_URL || "https://api.airtable.com",
      contentEndpointURL:
        process.env.AIRTABLE_CONTENT_ENDPOINT_URL ||
        "https://content.airtable.com",
      apiVersion: "0.1.0",
      apiKey: process.env.AIRTABLE_API_KEY,
      noRetryIfRateLimited: false,
      requestTimeout: 300 * 1000, // $ minutes
    } satisfies AirtableOptions);
    if (!$opts.apiKey) {
      throw new Error("An API key is required to connect to Airtable");
    }

    $secrets.set(this, $opts.apiKey);
    this.endpointUrl = $opts.endpointURL;
    this.contentEndpointUrl = $opts.contentEndpointURL;
    this.apiVersion = $opts.apiVersion;
    this.apiVersionMajor = $opts.apiVersion.split(".")[0];
    this.noRetryIfRateLimited = $opts.noRetryIfRateLimited;
    this.requestTimeout = $opts.requestTimeout;
    this.customHeaders = $opts.customHeaders;

    const retryDelayFn =
      typeof this.noRetryIfRateLimited === "boolean"
        ? this.noRetryIfRateLimited
          ? 0
          : createRetryDelayFn()
        : createRetryDelayFn(this.noRetryIfRateLimited);

    const retryStatusCodes = [429];

    this.$fetch = ofetch.create({
      baseURL: `${this.endpointUrl}/v${this.apiVersionMajor}`,
      headers: {
        Authorization: "Bearer " + this.apiKey,
        ...this.customHeaders,
      },
      // Perform automatic retry
      retry:
        typeof this.noRetryIfRateLimited === "boolean"
          ? this.noRetryIfRateLimited
            ? false
            : Infinity
          : (this.noRetryIfRateLimited.maxRetries ?? Infinity),
      timeout: this.requestTimeout,
      retryDelay: retryDelayFn,
      retryStatusCodes,
      onRequest(ctx) {
        ctx.options.requestAttempt =
          ctx.options.requestAttempt === undefined
            ? 0
            : ctx.options.requestAttempt + 1;
      },
      onRequestError(ctx) {
        throw new AirtableError("CONNECTION_ERROR", ctx.error.message);
      },
      // onResponseError() always getting called before ofetch native hook
      // to handle feature such as retry and timeout, make sure to pass
      // through such scenario when maintaining response error hook!
      onResponseError(ctx) {
        const response = ctx.response as FetchResponse<{
          error?: {
            type?: string;
            message?: string;
          };
        }>;
        const statusCode = response.status;

        // If retry allowed, pass through retry status codes
        if (
          ctx.options.retry !== false &&
          retryStatusCodes.includes(statusCode)
        )
          return;

        const hasBody = response._data !== undefined;
        const { type, message } = response._data?.error ?? {};

        switch (statusCode) {
          case 401: {
            throw new AirtableError(
              "AUTHENTICATION_REQUIRED",
              "You should provide valid api key to perform this operation",
              response
            );
          }
          case 403: {
            throw new AirtableError(
              "NOT_AUTHORIZED",
              "You are not authorized to perform this operation",
              response
            );
          }
          case 404: {
            throw new AirtableError(
              "NOT_FOUND",
              message ?? "Could not find what you are looking for",
              response
            );
          }
          case 413: {
            throw new AirtableError(
              "REQUEST_TOO_LARGE",
              "Request body is too large",
              response
            );
          }
          case 422: {
            throw new AirtableError(
              type ?? "UNPROCESSABLE_ENTITY",
              message ?? "The operation cannot be processed",
              response
            );
          }
          case 429: {
            throw new AirtableError(
              "TOO_MANY_REQUESTS",
              "You have made too many requests in a short period of time. Please retry your request later",
              response
            );
          }
          case 500: {
            throw new AirtableError(
              "SERVER_ERROR",
              "Try again. If the problem persists, contact support.",
              response
            );
          }
          case 503: {
            throw new AirtableError(
              "SERVICE_UNAVAILABLE",
              "The service is temporarily unavailable. Please retry shortly.",
              response
            );
          }
          default: {
            throw new AirtableError(
              type ?? "UNEXPECTED_ERROR",
              (message ?? hasBody)
                ? "An unexpected error occurred"
                : "The response from Airtable was invalid JSON. Please try again soon.",
              response
            );
          }
        }
      },
    });

    this.$fetchContent = this.$fetch.create({
      baseURL: `${this.contentEndpointUrl}/v${this.apiVersionMajor}`,
    });

    this.$fetchPaginate = async <T = any>(
      request: FetchPaginateRequest,
      options: FetchPaginateOptions<T>
    ) => {
      let offsetParams: Record<string, any> = {};

      while (true) {
        const opts = {
          ...options,
          // Only support request params replace not merging
          // Airtable pagination always provide pagination params in flat manner

          // Read Enterprise's Audit Log pagination
          ...(!options.method || options.method.toUpperCase() === "GET"
            ? // GET = query | POST = body
              { query: { ...options.query, ...offsetParams } }
            : { body: { ...options.body, ...offsetParams } }),
        };
        const response = await this.$fetch<T, "json">(request, opts);

        const ctx: FetchPaginateContext<T> = { request, response };

        const requestNextPage = (await options.onEachPage(ctx)) ?? true;
        if (requestNextPage === false) break;

        // Perform pagination using new offset params
        const pageOffsetParams =
          typeof options.getOffset === "function"
            ? await options.getOffset(ctx)
            : defaultGetOffset(ctx);

        if (!pageOffsetParams || isEmptyObject(pageOffsetParams)) break;
        offsetParams = pageOffsetParams;
      }
    };
  }

  get apiKey() {
    return $secrets.get(this);
  }

  create(
    opts: AirtableOptions,
    fetchOptions?: CreateAirtableFetchOptions
  ): Airtable {
    const $fetchOptions = {
      headers: "resolve",
      ...fetchOptions,
    } satisfies CreateAirtableFetchOptions;

    const $opts = defu(opts, {
      endpointURL: this.endpointUrl,
      apiVersion: this.apiVersion,
      apiKey: this.apiKey,
      noRetryIfRateLimited: this.noRetryIfRateLimited,
      requestTimeout: this.requestTimeout,
      customHeaders:
        $fetchOptions.headers === "resolve" ? this.customHeaders : undefined,
    } satisfies AirtableOptions);

    if ($fetchOptions.headers === "replace")
      $opts.customHeaders = opts.customHeaders;

    return new Airtable($opts as AirtableOptions);
  }

  base(baseId: string) {
    return new AirtableBase(this, baseId);
  }

  async whoami(): Promise<UserInfo> {
    const data = await this.$fetch<UserInfo>("/meta/whoami");
    return { id: data.id, email: data.email, scopes: data.scopes };
  }

  async bases() {
    const result: BaseInfo[] = [];
    await this.$fetchPaginate<{ bases: BaseInfo[] }>("/meta/bases", {
      method: "GET",
      onEachPage(ctx) {
        result.push(...ctx.response.bases);
      },
    });
    return result;
  }

  async createBase(config: BaseConfig) {
    return await this.$fetch<{ id: string; tables: TableSchema[] }>(
      "/meta/bases",
      { method: "POST", body: config }
    );
  }
}
