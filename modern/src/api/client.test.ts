import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiConfigurationError, createApiClient } from "./client";

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
    await expect(client.request<{ status: string }>("/healthz")).resolves.toEqual(
      { status: "ok" },
    );

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0]?.[0].toString()).toBe(
      "https://api.example.com/healthz",
    );
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      credentials: "include",
    });
  });
});
