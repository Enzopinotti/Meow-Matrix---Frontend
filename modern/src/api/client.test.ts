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

  it("sends cart mutations with cookies but no browser-owned identity", async () => {
    const payload = {
      data: {
        id: "cart-1",
        userId: "server-user",
        items: [],
        total: 0,
        checkoutReady: false,
        version: 2,
        updatedAt: "2026-09-16T14:00:00.000Z",
      },
    };
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const client = createApiClient("https://api.example.com");
    await client.commerce.setCartItem("product-1", 3);

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url.toString()).toBe(
      "https://api.example.com/api/v1/cart/items/product-1",
    );
    expect(init).toMatchObject({
      method: "PUT",
      credentials: "include",
    });
    expect(JSON.parse(String(init.body))).toEqual({ quantity: 3 });
    expect(String(init.body)).not.toContain("userId");
    expect(String(init.body)).not.toContain("price");
    expect(String(init.body)).not.toContain("total");
  });

  it("sends the checkout idempotency key without inventing purchase data", async () => {
    const order = {
      id: "order-1",
      code: "MM-1",
      purchaserId: "server-user",
      status: "confirmed",
      lines: [],
      total: 100,
      createdAt: "2026-09-16T14:00:00.000Z",
    };
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: { order, replayed: false } }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const client = createApiClient("https://api.example.com");
    await expect(
      client.commerce.checkout("checkout:cart-1:2:abc12345"),
    ).resolves.toEqual({ order, replayed: false });

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url.toString()).toBe("https://api.example.com/api/v1/checkout");
    expect(init).toMatchObject({
      method: "POST",
      credentials: "include",
    });
    expect(new Headers(init.headers).get("Idempotency-Key")).toBe(
      "checkout:cart-1:2:abc12345",
    );
    expect(init.body).toBeUndefined();
  });

  it("builds owner-scoped order history requests without user identifiers", async () => {
    const payload = { data: { items: [], total: 0, limit: 25, offset: 10 } };
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const client = createApiClient("https://api.example.com");
    await client.commerce.listOrders({ limit: 25, offset: 10 });

    const requestedUrl = new URL(fetchMock.mock.calls[0]?.[0].toString());
    expect(requestedUrl.pathname).toBe("/api/v1/orders");
    expect(Object.fromEntries(requestedUrl.searchParams)).toEqual({
      limit: "25",
      offset: "10",
    });
    expect(requestedUrl.searchParams.has("userId")).toBe(false);
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
