import { describe, expect, it } from "vitest";
import {
  acceptedFileTypes,
  privateFilePolicies,
  validateSelectedFile,
} from "./file-policy";

function selectedFile(options: {
  name: string;
  type: string;
  size: number;
}): File {
  return options as File;
}

describe("B5 private file policies", () => {
  it("keeps the purpose-specific server contract visible to the browser", () => {
    expect(privateFilePolicies.avatar.maxBytes).toBe(2 * 1024 * 1024);
    expect(privateFilePolicies["premium-identification"].maxBytes).toBe(
      5 * 1024 * 1024,
    );
    expect(acceptedFileTypes("avatar")).toBe(
      "image/jpeg,image/png,image/webp",
    );
    expect(acceptedFileTypes("premium-bank-statement")).toContain(
      "application/pdf",
    );
  });

  it("rejects empty and oversized selections before upload", () => {
    expect(
      validateSelectedFile(
        "avatar",
        selectedFile({ name: "avatar.png", type: "image/png", size: 0 }),
      ),
    ).toMatch(/vacío/i);

    expect(
      validateSelectedFile(
        "avatar",
        selectedFile({
          name: "avatar.png",
          type: "image/png",
          size: 2 * 1024 * 1024 + 1,
        }),
      ),
    ).toMatch(/supera el límite de 2\.0 MiB/i);
  });

  it("rejects declared media types and extensions outside the purpose allow-list", () => {
    expect(
      validateSelectedFile(
        "avatar",
        selectedFile({
          name: "avatar.pdf",
          type: "application/pdf",
          size: 100,
        }),
      ),
    ).toMatch(/tipo declarado/i);

    expect(
      validateSelectedFile(
        "premium-identification",
        selectedFile({ name: "id.svg", type: "image/png", size: 100 }),
      ),
    ).toMatch(/extensión/i);
  });

  it("accepts a locally valid selection without claiming content verification", () => {
    expect(
      validateSelectedFile(
        "premium-identification",
        selectedFile({ name: "id.pdf", type: "application/pdf", size: 1024 }),
      ),
    ).toBeNull();
  });
});
