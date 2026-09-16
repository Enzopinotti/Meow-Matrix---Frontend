export function resolveApiOrigin(value: string | undefined): string | null {
  const candidate = value?.trim();

  if (!candidate) {
    return null;
  }

  const url = new URL(candidate);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("VITE_API_ORIGIN must use http or https");
  }

  return url.origin;
}
