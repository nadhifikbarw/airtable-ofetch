import { afterEach, beforeEach, vi } from "vitest";

beforeEach(() => {
  vi.stubEnv(
    "AIRTABLE_API_KEY",
    "patlfHCwkcfjTs2S7.Sb57FdCh8lN80v3lBrR5WCQoB0GDTQAF96paAOHQSXgUwaQiEOZZfD7ZqPwHK9De" // Fake API Key
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});
