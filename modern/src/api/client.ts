import { resolveApiOrigin } from "./config";
import {
  isErrorEnvelope,
  type ApiErrorDetail,
  type AuthSessionDto,
  type CartViewDto,
  type CategoryDto,
  type CheckoutResultDto,
  type LoginRequest,
  type OrderDto,
  type OrderListDto,
  type OrderListParams,
  type PasswordResetConfirmRequest,
  type PrivateFileDto,
  type PrivateFileListDto,
  type PrivateFilePurpose,
  type ProductDto,
  type ProductListDto,
  type ProductListParams,
  type RegisterRequest,
  type SuccessEnvelope,
  type UserDto,
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

async function responseError(response: Response): Promise<ApiResponseError> {
  const body = await readJson(response);
  if (isErrorEnvelope(body)) {
    return new ApiResponseError(
      response.status,
      body.error.code,
      body.error.message,
      body.error.details,
    );
  }
  return new ApiResponseError(
    response.status,
    "UNEXPECTED_API_ERROR",
    `API request failed with HTTP ${response.status}`,
  );
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

function orderListSearch(params: OrderListParams): string {
  const search = new URLSearchParams();
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.offset !== undefined) search.set("offset", String(params.offset));
  const value = search.toString();
  return value.length === 0 ? "" : `?${value}`;
}

function jsonRequest(body: unknown, method = "POST"): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

export function createApiClient(
  origin = resolveApiOrigin(import.meta.env.VITE_API_ORIGIN),
) {
  async function execute(path: string, init: RequestInit = {}): Promise<Response> {
    if (!origin) {
      throw new ApiConfigurationError("API origin is not configured");
    }

    return fetch(new URL(path, `${origin}/`), {
      ...init,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...init.headers,
      },
    });
  }

  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await execute(path, init);
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

  const auth = {
    async register(input: RegisterRequest): Promise<UserDto> {
      const response = await request<SuccessEnvelope<UserDto>>(
        "/api/v1/auth/register",
        jsonRequest(input),
      );
      return response.data;
    },

    async login(input: LoginRequest): Promise<AuthSessionDto> {
      const response = await request<SuccessEnvelope<AuthSessionDto>>(
        "/api/v1/auth/login",
        jsonRequest(input),
      );
      return response.data;
    },

    async currentUser(): Promise<UserDto> {
      const response =
        await request<SuccessEnvelope<UserDto>>("/api/v1/auth/me");
      return response.data;
    },

    async logout(): Promise<void> {
      await request<null>("/api/v1/auth/logout", { method: "POST" });
    },

    async requestPasswordReset(email: string): Promise<void> {
      await request<SuccessEnvelope<{ accepted: true }>>(
        "/api/v1/auth/password-reset/request",
        jsonRequest({ email }),
      );
    },

    async confirmPasswordReset(
      input: PasswordResetConfirmRequest,
    ): Promise<void> {
      await request<null>(
        "/api/v1/auth/password-reset/confirm",
        jsonRequest(input),
      );
    },
  };

  const catalog = {
    async listProducts(
      params: ProductListParams = {},
    ): Promise<ProductListDto> {
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
      const response =
        await request<SuccessEnvelope<readonly CategoryDto[]>>(
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

  const commerce = {
    async getCart(): Promise<CartViewDto> {
      const response =
        await request<SuccessEnvelope<CartViewDto>>("/api/v1/cart");
      return response.data;
    },

    async setCartItem(
      productId: string,
      quantity: number,
    ): Promise<CartViewDto> {
      const response = await request<SuccessEnvelope<CartViewDto>>(
        `/api/v1/cart/items/${encodeURIComponent(productId)}`,
        jsonRequest({ quantity }, "PUT"),
      );
      return response.data;
    },

    async removeCartItem(productId: string): Promise<CartViewDto> {
      const response = await request<SuccessEnvelope<CartViewDto>>(
        `/api/v1/cart/items/${encodeURIComponent(productId)}`,
        { method: "DELETE" },
      );
      return response.data;
    },

    async clearCart(): Promise<CartViewDto> {
      const response = await request<SuccessEnvelope<CartViewDto>>(
        "/api/v1/cart",
        { method: "DELETE" },
      );
      return response.data;
    },

    async checkout(idempotencyKey: string): Promise<CheckoutResultDto> {
      const response = await request<SuccessEnvelope<CheckoutResultDto>>(
        "/api/v1/checkout",
        {
          method: "POST",
          headers: { "Idempotency-Key": idempotencyKey },
        },
      );
      return response.data;
    },

    async listOrders(params: OrderListParams = {}): Promise<OrderListDto> {
      const response = await request<SuccessEnvelope<OrderListDto>>(
        `/api/v1/orders${orderListSearch(params)}`,
      );
      return response.data;
    },

    async getOrder(orderId: string): Promise<OrderDto> {
      const response = await request<SuccessEnvelope<OrderDto>>(
        `/api/v1/orders/${encodeURIComponent(orderId)}`,
      );
      return response.data;
    },
  };

  const files = {
    async list(): Promise<PrivateFileListDto> {
      const response = await request<SuccessEnvelope<PrivateFileListDto>>(
        "/api/v1/files",
      );
      return response.data;
    },

    async upload(purpose: PrivateFilePurpose, file: File): Promise<PrivateFileDto> {
      const form = new FormData();
      form.append("file", file, file.name);
      const response = await request<SuccessEnvelope<PrivateFileDto>>(
        `/api/v1/files/purposes/${encodeURIComponent(purpose)}`,
        { method: "POST", body: form },
      );
      return response.data;
    },

    async download(fileId: string): Promise<Blob> {
      const response = await execute(
        `/api/v1/files/${encodeURIComponent(fileId)}/content`,
        { headers: { Accept: "*/*" } },
      );
      if (!response.ok) {
        throw await responseError(response);
      }
      return response.blob();
    },

    async delete(fileId: string): Promise<void> {
      await request<null>(`/api/v1/files/${encodeURIComponent(fileId)}`, {
        method: "DELETE",
      });
    },
  };

  return { request, auth, catalog, commerce, files };
}

export const apiClient = createApiClient();
