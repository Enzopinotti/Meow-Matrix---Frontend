import type { CartViewDto } from "../api/contracts";

const STORAGE_KEY = "meow.checkout.intent.v1";

type StoredIntent = {
  cartId: string;
  cartVersion: number;
  key: string;
};

function parseStoredIntent(value: string | null): StoredIntent | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<StoredIntent>;
    if (
      typeof parsed.cartId !== "string" ||
      typeof parsed.cartVersion !== "number" ||
      !Number.isSafeInteger(parsed.cartVersion) ||
      typeof parsed.key !== "string"
    ) {
      return null;
    }
    return {
      cartId: parsed.cartId,
      cartVersion: parsed.cartVersion,
      key: parsed.key,
    };
  } catch {
    return null;
  }
}

export function clearCheckoutIntent(storage: Storage = sessionStorage): void {
  storage.removeItem(STORAGE_KEY);
}

export function getCheckoutIntentKey(
  cart: Pick<CartViewDto, "id" | "version">,
  storage: Storage = sessionStorage,
  createId: () => string = () => crypto.randomUUID(),
): string {
  const current = parseStoredIntent(storage.getItem(STORAGE_KEY));
  if (
    current &&
    current.cartId === cart.id &&
    current.cartVersion === cart.version
  ) {
    return current.key;
  }

  const key = `checkout:${cart.id}:${cart.version}:${createId()}`;
  storage.setItem(
    STORAGE_KEY,
    JSON.stringify({ cartId: cart.id, cartVersion: cart.version, key }),
  );
  return key;
}
