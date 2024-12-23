# airtable-ofetch

[![npm](https://img.shields.io/npm/v/airtable-ofetch)](https://www.npmjs.com/package/airtable-ofetch)
[![codecov](https://codecov.io/gh/nadhifikbarw/airtable-ofetch/graph/badge.svg?token=JPXQFLCNS2)](https://codecov.io/gh/nadhifikbarw/airtable-ofetch)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![jsDocs.io](https://img.shields.io/badge/jsDocs.io-reference-blue)](https://www.jsdocs.io/package/airtable-ofetch)


Modern JS client for [Airtable Web API](https://airtable.com/developers/web/api/introduction)

## 🚀 Quick Start

Install:
```bash
pnpm install airtable-ofetch
```

Import:
```js
// CommonJS
const { Airtable } = require('airtable-ofetch');
// ESM / TypeScript
import { Airtable } from 'airtable-ofetch';

const airtable = new Airtable(); // Will read process.env.AIRTABLE_API_KEY
```

## ✔️ Works on node, browser, and workers
This client is implemented on top of [unjs/ofetch](https://github.com/unjs/ofetch) to provide better cross-runtime compatibility.

## ⚙ Configuration
You can provide custom configuration during client initialization:

```js
const airtable = new Airtable({
  /**
   * As of February 1st 2024, Airtable Web API has ended deprecation period
   * of Airtable API Key and has prompted all users to migrate to use personal
   * access token (PAT) or OAuth access token
   *
   * @see https://airtable.com/developers/web/api/authentication
   */
  apiKey: 'YOUR_PERSONAL_ACCESS_TOKEN', // Otherwise default to process.env.AIRTABLE_API_KEY

  /**
   * API Endpoint URL target, users may override this if they need
   * to pass requests through an API proxy. Don't include trailing slash
   * for consistency.
   *
   * @optional
   */
  endpointURL: 'https://api.airtable.internal', // Also configurable via AIRTABLE_ENDPOINT_URL

  /**
   * Content Endpoint URL target, users may override this if they need
   * to pass requests through an API proxy. Don't include trailing slash
   * for consistency.
   *
   * @see https://airtable.com/developers/web/api/upload-attachment
   * @optional
   */
  contentEndpointURL: 'https://content.airtable.internal', // Also configurable via AIRTABLE_CONTENT_ENDPOINT_URL

  /**
   * How long in ms before aborting a request attempt.
   * Default to 5 minutes.
   *
   * @optional
   */
  requestTimeout: 180 * 1000,

  /**
   * Disable / configure exponential backoff with jitter retry
   * whenever API request receive 429 status code response
   *
   * @see https://airtable.com/developers/web/api/rate-limits
   * @optional
   */
  noRetryIfRateLimited: true, // This disable retry

  /**
   * Custom headers to be included when requesting to API endpoint
   *
   * @optional
   */
  customHeaders: {
    'X-Custom-Header': 'Custom Value',
  }
})
```

You can customize maximum retries and its backoff behavior:
```js
const airtable = new Airtable({
  noRetryIfRateLimited: {
    maxRetries: 5, // Maximum retry attempts. Default to Infinity
    initialDelayMs: 500, // Initial retry delay in ms. Default to 1000ms
    maxDelayMs: 2000, // Maximum retry delay in ms. Default to 45_000ms
  },
})
```

You can create a new client that inherit previous configuration and replace some of it:
```js
const airtable = new Airtable({ apiKey: 'custom-api-key' });

// New client will inherit manually passed apiKey
const newAirtable = airtable.create({ customHeaders: { 'X-Custom-Header': 'Custom Value' } });
```

## 🔁 Pagination
This client implement similar pagination control as [airtable.js](https://github.com/Airtable/airtable.js) using `eachPage()` that you can control whenever possible:

```typescript
const table = new Airtable().base('appEpvhkjHcG8OvKu').table('tblc7ieWKVQM9eequ');

// List records endpoint exposes pagination
// https://airtable.com/developers/web/api/list-records
const query = table.list({ pageSize: 50 });

// Async callback is supported
await query.eachPage(async (records: AirtableRecord[]) => {
  // Do something with records
  console.log(records);
  // Return false to stop pagination early, otherwise pagination will continue until all records are exhausted
  return false;
});
```

For convenient usage, you also have `firstPage()` or `all()` method:

```typescript
const table = new Airtable().base('appEpvhkjHcG8OvKu').table('tblc7ieWKVQM9eequ');

// List comments also exposes pagination
// https://airtable.com/developers/web/api/list-comments
const query = table.comments('recPaibwSLDbZr80V', { pageSize: 50 });

const firstPageComments: AirtableComment[] = await query.firstPage();
const allComments: AirtableComment[] = await query.all();
```

Some endpoint doesn't expose pagination control, in this case we always return all records:

```typescript
const airtable = new Airtable();

// It uses pagination but doesn't provide much control
// https://airtable.com/developers/web/api/list-bases
const bases: BaseInfo[] = await airtable.bases();
```

## 🔧 Type Friendly
Specify your own data:

```typescript
import { Airtable, type FieldSet } from "airtable-ofetch";

interface TableData extends FieldSet {
  Name: string;
  Notes: string;
}

// Type-assisted table
const table = new Airtable().base('appEpvhkjHcG8OvKu').table<TableData>('tblc7ieWKVQM9eequ');

// Return typed records
const records: AirtableRecord<TableData>[] = await table.list().all();
console.log(records[0].get('Name')) // Field name will be type assisted
```

Consult [here](https://github.com/nadhifikbarw/airtable-ofetch/blob/main/src/types.ts#L860) to see interface shape. Adjusted in accordance to [Web API docs](https://airtable.com/developers/web/api/field-model).

## 📦 Bundler Notes
Since this client implemented on top of [unjs/ofetch](https://github.com/unjs/ofetch#-bundler-notes), please consult [ofetch's Bundler Notes](https://github.com/unjs/ofetch#-bundler-notes) to ensure compatibility with your project.

## 💻 Development
* Clone this repository
* Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable`
* Install dependencies using `pnpm install`
* Run interactive tests using `pnpm dev`

## License
[MIT](./LICENSE)
