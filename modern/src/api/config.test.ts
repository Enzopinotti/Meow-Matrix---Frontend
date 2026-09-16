import { describe, expect, it } from "vitest";
import { resolveApiOrigin } from "./config";

describe("resolveApiOrigin", () => {
  it("returns null when the API is deliberately unconfigured", () => {
    expect(resolveApiOrigin(undefined)).toBeNull();
    expect(resolveApiOrigin("   ")).toBeNull();
  });

  it("normalizes a configured HTTP(S) API to its origin", () => {
    expect(resolveApiOrigin("https://api.example.com/v1")).toBe(
      "https://api.example.com",
    );
  });

  it("rejects non HTTP(S) schemes", () => {
    expect(() => resolveApiOrigin("file:///tmp/api")).toThrow(
      "VITE_API_ORIGIN must use http or https",
    );
  });
});
