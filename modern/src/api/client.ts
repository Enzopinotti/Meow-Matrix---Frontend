import { resolveApiOrigin } from "./config";

export class ApiConfigurationError extends Error {}

export function createApiClient(
  origin = resolveApiOrigin(import.meta.env.VITE_API_ORIGIN),
) {
  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    if (!origin) {
      throw new ApiConfigurationError("API origin is not configured");
    }

    const response = await fetch(new URL(path, `${origin}/`), {
      ...init,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...init.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed with HTTP ${response.status}`);
    }

    return (await response.json()) as T;
  }

  return { request };
}

export const apiClient = createApiClient();
