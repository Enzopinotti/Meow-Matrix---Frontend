export type ApiErrorDetail = {
  field: string;
  message: string;
};

export type ErrorEnvelope = {
  error: {
    code: string;
    message: string;
    details?: readonly ApiErrorDetail[];
  };
};

export type SuccessEnvelope<T> = {
  data: T;
};

export type CategoryDto = {
  id: string;
  name: string;
  description: string;
  isVisible: boolean;
  createdAt: string;
};

export type ProductDto = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  code: string;
  stock: number;
  categoryId: string | null;
  thumbnailUrls: readonly string[];
  status: boolean;
  isVisible: boolean;
  tags: readonly string[];
  createdAt: string;
  updatedAt: string;
};

export type ProductListDto = {
  items: readonly ProductDto[];
  total: number;
  limit: number;
  offset: number;
};

export type CartLineDto = {
  productId: string;
  quantity: number;
  updatedAt: string;
};

export type CartDto = {
  id: string;
  userId: string;
  lines: readonly CartLineDto[];
};

export type UserDto = {
  id: string;
  name: string;
  lastName: string;
  email: string;
  role: "user" | "admin";
  avatarUrl: string | null;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  lastName: string;
  email: string;
  password: string;
};

export type PasswordResetConfirmRequest = {
  token: string;
  password: string;
};

export type AuthSessionDto = {
  user: UserDto;
  expiresAt: string;
};

export type TicketDto = {
  id: string;
  code: string;
  purchasedAt: string;
  amount: number;
  purchaserId: string;
};

export type OrderLineDto = {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type OrderDto = {
  id: string;
  code: string;
  purchaserId: string;
  status: "draft" | "confirmed" | "partially_fulfilled" | "cancelled";
  lines: readonly OrderLineDto[];
  total: number;
  createdAt: string;
};

export type CartItemAvailability =
  "available" | "unavailable" | "insufficient_stock";

export type CartItemDto = {
  productId: string;
  product: ProductDto | null;
  quantity: number;
  lineTotal: number | null;
  availability: CartItemAvailability;
  updatedAt: string;
};

export type CartViewDto = {
  id: string;
  userId: string;
  items: readonly CartItemDto[];
  total: number;
  checkoutReady: boolean;
  version: number;
  updatedAt: string;
};

export type CheckoutResultDto = {
  order: OrderDto;
  replayed: boolean;
};

export type OrderListDto = {
  items: readonly OrderDto[];
  total: number;
  limit: number;
  offset: number;
};

export type ProductListParams = {
  limit?: number;
  offset?: number;
  q?: string;
  categoryId?: string;
  sort?: "newest" | "price_asc" | "price_desc";
};

export type OrderListParams = {
  limit?: number;
  offset?: number;
};

export const privateFilePurposes = [
  "avatar",
  "premium-identification",
  "premium-address",
  "premium-bank-statement",
] as const;

export type PrivateFilePurpose = (typeof privateFilePurposes)[number];
export type PrivateFileMediaType =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "application/pdf";

export type PrivateFileDto = {
  id: string;
  ownerId: string;
  purpose: PrivateFilePurpose;
  originalName: string;
  mediaType: PrivateFileMediaType;
  bytes: number;
  sha256: string;
  createdAt: string;
};

export type PrivateFileListDto = {
  items: readonly PrivateFileDto[];
};

export function isErrorEnvelope(value: unknown): value is ErrorEnvelope {
  if (typeof value !== "object" || value === null || !("error" in value)) {
    return false;
  }
  const error = (value as { error?: unknown }).error;
  if (typeof error !== "object" || error === null) {
    return false;
  }
  const candidate = error as { code?: unknown; message?: unknown };
  return (
    typeof candidate.code === "string" && typeof candidate.message === "string"
  );
}
