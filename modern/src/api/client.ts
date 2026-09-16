import { resolveApiOrigin } from "./config";
import {
  isErrorEnvelope,
  type ApiErrorDetail,
  type CategoryDto,
  type ProductDto,
  type ProductListDto,
  type ProductListParams,
  type SuccessEnvelope,
} from "./contracts";

export class ApiConfigurationError extends Error {}

export class ApiResponseError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: readonly ApiErrorDetail[] | undefined;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: readonly ApiErrorDetail[],
  ) {
    super(message);
    this.name = "ApiResponseError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function readJson(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return null;
  }
  return response.json();
}

function productListSearch(params: ProductListParams): string {
  const search = new URLSearchParams();
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.offset !== undefined) search.set("offset", String(params.offset));
  if (params.q !== undefined) search.set("q", params.q);
  if (params.categoryId !== undefined)
    search.set("categoryId", params.categoryId);
  if (params.sort !== undefined) search.set("sort", params.sort);
  const value = search.toString();
  return value.length === 0 ? "" : `?${value}`;
}

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
    const body = await readJson(response);

    if (!response.ok) {
      if (isErrorEnvelope(body)) {
        throw new ApiResponseError(
          response.status,
          body.error.code,
          body.error.message,
          body.error.details,
        );
      }
      throw new ApiResponseError(
        response.status,
        "UNEXPECTED_API_ERROR",
        `API request failed with HTTP ${response.status}`,
      );
    }

    return body as T;
  }

  const catalog = {
    async listProducts(params: ProductListParams = {}): Promise<ProductListDto> {
      const response = await request<SuccessEnvelope<ProductListDto>>(
        `/api/v1/products${productListSearch(params)}`,
      );
      return response.data;
    },

    async getProduct(productId: string): Promise<ProductDto> {
      const response = await request<SuccessEnvelope<ProductDto>>(
        `/api/v1/products/${encodeURIComponent(productId)}`,
      );
      return response.data;
    },

    async listCategories(): Promise<readonly CategoryDto[]> {
      const response = await request<SuccessEnvelope<readonly CategoryDto[]>>(
        "/api/v1/categories",
      );
      return response.data;
    },

    async getCategory(categoryId: string): Promise<CategoryDto> {
      const response = await request<SuccessEnvelope<CategoryDto>>(
        `/api/v1/categories/${encodeURIComponent(categoryId)}`,
      );
      return response.data;
    },
  };

  return { request, catalog };
}

export const apiClient = createApiClient();
