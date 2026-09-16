import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ApiConfigurationError,
  ApiResponseError,
  createApiClient,
} from "./client";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("createApiClient", () => {
  it("fails closed when no API origin is configured", async () => {
    const client = createApiClient(null);

    await expect(client.request("/healthz")).rejects.toBeInstanceOf(
      ApiConfigurationError,
    );
  });

  it("uses the configured origin and backend-owned cookie credentials", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: "ok" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const client = createApiClient("https://api.example.com");
    await expect(
      client.request<{ status: string }>("/healthz"),
    ).resolves.toEqual({ status: "ok" });

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0]?.[0].toString()).toBe(
      "https://api.example.com/healthz",
    );
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      credentials: "include",
    });
  });

  it("builds the versioned product query and unwraps the success envelope", async () => {
    const payload = {
      data: { items: [], total: 0, limit: 10, offset: 20 },
    };
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const client = createApiClient("https://api.example.com");
    await expect(
      client.catalog.listProducts({
        limit: 10,
        offset: 20,
        q: "monitor",
        categoryId: "category-1",
        sort: "price_desc",
      }),
    ).resolves.toEqual(payload.data);

    const requestedUrl = new URL(fetchMock.mock.calls[0]?.[0].toString());
    expect(requestedUrl.pathname).toBe("/api/v1/products");
    expect(Object.fromEntries(requestedUrl.searchParams)).toEqual({
      limit: "10",
      offset: "20",
      q: "monitor",
      categoryId: "category-1",
      sort: "price_desc",
    });
  });

  it("preserves backend error codes and validation details", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            code: "VALIDATION_ERROR",
            message: "Request validation failed",
            details: [{ field: "limit", message: "Invalid limit" }],
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const client = createApiClient("https://api.example.com");
    const request = client.catalog.listProducts({ limit: 0 });

    await expect(request).rejects.toMatchObject({
      status: 400,
      code: "VALIDATION_ERROR",
      details: [{ field: "limit", message: "Invalid limit" }],
    });
    await expect(request).rejects.toBeInstanceOf(ApiResponseError);
  });
});
