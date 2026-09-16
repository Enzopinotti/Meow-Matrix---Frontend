import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiResponseError, createApiClient } from "../api/client";

const fileDto = {
  id: "aaaaaaaaaaaaaaaaaaaaaaaa",
  ownerId: "bbbbbbbbbbbbbbbbbbbbbbbb",
  purpose: "premium-identification" as const,
  originalName: "identity.pdf",
  mediaType: "application/pdf" as const,
  bytes: 4,
  sha256: "f".repeat(64),
  createdAt: "2026-09-16T20:00:00.000Z",
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("B5 private files API client", () => {
  it("uploads FormData with backend-owned credentials and lets the browser generate the multipart boundary", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: fileDto }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const client = createApiClient("https://api.example.com");
    const file = new File(["%PDF"], "identity.pdf", {
      type: "application/pdf",
    });

    await expect(
      client.files.upload("premium-identification", file),
    ).resolves.toEqual(fileDto);

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url.toString()).toBe(
      "https://api.example.com/api/v1/files/purposes/premium-identification",
    );
    expect(init).toMatchObject({ method: "POST", credentials: "include" });
    expect(init.body).toBeInstanceOf(FormData);
    expect(new Headers(init.headers).get("Content-Type")).toBeNull();
    expect(new Headers(init.headers).get("Accept")).toBe("application/json");

    const uploaded = (init.body as FormData).get("file");
    expect(uploaded).toBeInstanceOf(File);
    expect((uploaded as File).name).toBe("identity.pdf");
  });

  it("downloads private bytes as an ephemeral Blob without converting them to JSON/base64", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(new Uint8Array([1, 2, 3]), {
        status: 200,
        headers: { "Content-Type": "image/png" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const client = createApiClient("https://api.example.com");
    const downloaded = await client.files.download("file-1");

    expect(downloaded).toBeInstanceOf(Blob);
    expect(downloaded.type).toBe("image/png");
    expect(downloaded.size).toBe(3);
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url.toString()).toBe(
      "https://api.example.com/api/v1/files/file-1/content",
    );
    expect(init).toMatchObject({ credentials: "include" });
    expect(new Headers(init.headers).get("Accept")).toBe("*/*");
  });

  it("preserves structured backend privacy errors on binary download", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            code: "PRIVATE_FILE_NOT_FOUND",
            message: "Private file not found",
          },
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const client = createApiClient("https://api.example.com");
    const request = client.files.download("foreign-file");

    await expect(request).rejects.toMatchObject({
      status: 404,
      code: "PRIVATE_FILE_NOT_FOUND",
    });
    await expect(request).rejects.toBeInstanceOf(ApiResponseError);
  });

  it("deletes by opaque file id without sending owner or storage-path data", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    const client = createApiClient("https://api.example.com");
    await client.files.delete("file-1");

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url.toString()).toBe("https://api.example.com/api/v1/files/file-1");
    expect(init).toMatchObject({ method: "DELETE", credentials: "include" });
    expect(init.body).toBeUndefined();
  });
});
