import { describe, expect, test, vi } from "vitest";
import { ofetch } from "ofetch";
import { mockResponses } from "./utils";
import { Airtable } from "../src/airtable";
import { AirtableBase } from "../src/base";

describe("Airtable", function () {
  test("load API key from environment variable", function () {
    const airtable = new Airtable();
    expect(airtable.apiKey).toEqual(process.env.AIRTABLE_API_KEY);
  });

  test("prevent access token property to be enumerable", function () {
    const airtable = new Airtable();

    // Accessible
    expect(airtable).toHaveProperty("apiKey", process.env.AIRTABLE_API_KEY);

    // But not enumerable
    for (const v of Object.values(airtable)) {
      expect(v).not.toEqual(process.env.AIRTABLE_API_KEY);
    }
  });

  test("throws when API key not provided", function () {
    vi.unstubAllEnvs();
    expect(() => new Airtable()).toThrowError();
  });

  test("load endpoint url from environment variable", function () {
    vi.stubEnv("AIRTABLE_ENDPOINT_URL", "http://airtable.internal");

    const airtable = new Airtable();
    expect(airtable.endpointUrl).toEqual(process.env.AIRTABLE_ENDPOINT_URL);
  });

  test("/meta/whoami", async function () {
    const data = { id: "usrL2PNC5o3H4lBEi", email: "foo@bar.com" };
    mockResponses(200, data);

    const airtable = new Airtable();
    const userInfo = await airtable.whoami();

    expect(userInfo).toMatchObject({ id: expect.any(String) });
    expect(userInfo).toHaveProperty("email");
    expect(userInfo).toHaveProperty("scopes");
  });

  test("/meta/bases", async function () {
    const responses = [
      {
        offset: "offset1",
        bases: [
          // Up to 1000 bases on first page
          { id: "base1", name: "Mocked Base 1", permissionLevel: "create" },
          { id: "base2", name: "Mocked Base 2", permissionLevel: "create" },
          { id: "base3", name: "Mocked Base 3", permissionLevel: "create" },
        ],
      },
      {
        bases: [
          {
            id: "base1001",
            name: "Mocked Base 1001",
            permissionLevel: "create",
          },
          {
            id: "base1002",
            name: "Mocked Base 1002",
            permissionLevel: "create",
          },
          {
            id: "base1003",
            name: "Mocked Base 1003",
            permissionLevel: "create",
          },
        ],
      },
    ];

    let baseCount = 0;
    for (const res of responses) {
      baseCount += res.bases.length;
    }

    mockResponses(200, responses);

    const airtable = new Airtable();
    const baseInfos = await airtable.bases();

    expect(baseInfos).toHaveLength(baseCount);
    expect(baseInfos).toContainEqual({
      id: expect.any(String),
      name: expect.any(String),
      permissionLevel: expect.any(String),
    });
  });

  test("instantiate AirtableBase", function () {
    const airtable = new Airtable();
    const base = airtable.base("appEpvhkjHcG8OvKu");

    expect(base).toBeInstanceOf(AirtableBase);
    expect(base.id).toEqual("appEpvhkjHcG8OvKu");
  });

  describe("$fetch#retry", function () {
    test("enable retry by default", function () {
      const createFn = vi.spyOn(ofetch, "create");
      new Airtable();

      expect(createFn).toHaveBeenCalled();
      expect(createFn.mock?.lastCall?.[0]).toMatchObject({
        retry: expect.any(Number),
      });
    });

    test("allow disable retry", function () {
      const createFn = vi.spyOn(ofetch, "create");
      new Airtable({ noRetryIfRateLimited: true });

      expect(createFn).toHaveBeenCalled();
      expect(createFn.mock?.lastCall?.[0]).toMatchObject({ retry: false });
    });

    test("retry request on 429", async function () {
      const stubbedFetch = mockResponses([429, 429, 200]);

      const airtable = new Airtable({
        noRetryIfRateLimited: { initialDelayMs: 5, maxDelayMs: 10 },
        requestTimeout: 50,
      });
      await airtable.$fetch("/meta/whoami");

      expect(stubbedFetch).toHaveBeenCalledTimes(3);
    });
  });

  describe("$fetch#errorHandling", function () {
    test("throws CONNECTION_ERROR when request failed", async function () {
      vi.stubGlobal("fetch", () => Promise.reject(new Error("Network Error")));

      const airtable = new Airtable();
      await expect(() => airtable.$fetch("/meta/whoami")).rejects.toMatchObject(
        { name: "CONNECTION_ERROR" }
      );
    });

    test("throws CONNECTION_ERROR when timeout reached", async function () {
      mockResponses(200, undefined, 1000);
      const airtable = new Airtable({ requestTimeout: 10 });
      await expect(() => airtable.$fetch("/meta/whoami")).rejects.toMatchObject(
        { name: "CONNECTION_ERROR" }
      );
    });

    test("throws AUTHENTICATION_REQUIRED on 401", async function () {
      mockResponses(401);
      const airtable = new Airtable({ apiKey: "bogusKey" });
      await expect(() => airtable.$fetch("/meta/whoami")).rejects.toMatchObject(
        {
          name: "AUTHENTICATION_REQUIRED",
          message: expect.any(String),
          statusCode: 401,
        }
      );
    });

    test("throws NOT_AUTHORIZED on 403", async function () {
      mockResponses(403);
      const airtable = new Airtable();
      await expect(() =>
        airtable.$fetch("/appXops3ztc93p3mF/tbl9shxY9KbdeC18x/listRecords", {
          method: "POST",
          body: { pageSize: 10 },
        })
      ).rejects.toMatchObject({
        name: "NOT_AUTHORIZED",
        message: expect.any(String),
        statusCode: 403,
      });
    });

    test("throws NOT_FOUND on 404", async function () {
      mockResponses(404);
      const airtable = new Airtable();
      await expect(() => airtable.$fetch("/404")).rejects.toMatchObject({
        name: "NOT_FOUND",
        message: expect.any(String),
        statusCode: 404,
      });
    });

    test("throws REQUEST_TOO_LARGE on 413", async function () {
      mockResponses(413);
      const airtable = new Airtable();
      await expect(() => airtable.$fetch("")).rejects.toMatchObject({
        name: "REQUEST_TOO_LARGE",
        message: expect.any(String),
        statusCode: 413,
      });
    });

    test("throws UNPROCESSABLE_ENTITY on 422", async function () {
      mockResponses(422, {
        error: { type: "INVALID_REQUEST", message: "Server error" },
      });

      const airtable = new Airtable();
      await expect(() =>
        airtable.$fetch("/meta/bases", { method: "POST" })
      ).rejects.toMatchObject({
        name: expect.any(String),
        message: expect.any(String),
        statusCode: 422,
      });
    });

    test("throws TOO_MANY_REQUESTS on 429", async function () {
      mockResponses(429);
      const airtable = new Airtable({ noRetryIfRateLimited: true });
      await expect(() => airtable.$fetch("/meta/whoami")).rejects.toMatchObject(
        {
          name: "TOO_MANY_REQUESTS",
          message: expect.any(String),
          statusCode: 429,
        }
      );
    });

    test("throws SERVER_ERROR on 500", async function () {
      mockResponses(500);
      const airtable = new Airtable();
      await expect(() => airtable.$fetch("/meta/whoami")).rejects.toMatchObject(
        {
          name: "SERVER_ERROR",
          message: expect.any(String),
          statusCode: 500,
        }
      );
    });

    test("throws SERVICE_UNAVAILABLE on 503", async function () {
      mockResponses(503);
      const airtable = new Airtable();
      await expect(() => airtable.$fetch("/meta/whoami")).rejects.toMatchObject(
        {
          name: "SERVICE_UNAVAILABLE",
          message: expect.any(String),
          statusCode: 503,
        }
      );
    });

    test("throws generic exception when status code >=400 and <600", async function () {
      mockResponses(400);
      const airtable = new Airtable();
      await expect(() => airtable.$fetch("/meta/whoami")).rejects.toMatchObject(
        {
          name: expect.any(String),
          message: expect.any(String),
          statusCode: expect.any(Number),
        }
      );
    });
  });
});
