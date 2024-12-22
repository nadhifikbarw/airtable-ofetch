import type { FetchResponse } from "ofetch";
import type { IAirtableError } from "./types";

export class AirtableError<T = any> extends Error implements IAirtableError {
  name: string;
  error: string;
  response?: FetchResponse<T> | null;

  constructor(
    error: string,
    message: string,
    response?: FetchResponse<T> | null
  ) {
    super(message);
    this.name = error;
    this.error = error;
    this.response = response;
  }

  get statusCode() {
    return this.response ? this.response.status : undefined;
  }

  toString() {
    return `${this.name}: ${this.message} ${this.statusCode ? `(${this.statusCode})` : ""}`;
  }
}
