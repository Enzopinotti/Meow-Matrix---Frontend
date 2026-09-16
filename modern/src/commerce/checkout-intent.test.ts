import { beforeEach, describe, expect, it } from "vitest";
import { clearCheckoutIntent, getCheckoutIntentKey } from "./checkout-intent";

function memoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear() {
      values.clear();
    },
    getItem(key) {
      return values.get(key) ?? null;
    },
    key(index) {
      return [...values.keys()][index] ?? null;
    },
    removeItem(key) {
      values.delete(key);
    },
    setItem(key, value) {
      values.set(key, value);
    },
  };
}

describe("checkout intent", () => {
  let storage: Storage;

  beforeEach(() => {
    storage = memoryStorage();
  });

  it("reuses exactly one key for retries of the same cart version", () => {
    let generated = 0;
    const createId = () => `id-${++generated}`;
    const cart = { id: "cart-1", version: 7 };

    const first = getCheckoutIntentKey(cart, storage, createId);
    const retry = getCheckoutIntentKey(cart, storage, createId);

    expect(first).toBe("checkout:cart-1:7:id-1");
    expect(retry).toBe(first);
    expect(generated).toBe(1);
  });

  it("rotates the key after a material cart version change", () => {
    let generated = 0;
    const createId = () => `id-${++generated}`;

    const first = getCheckoutIntentKey(
      { id: "cart-1", version: 7 },
      storage,
      createId,
    );
    const afterMutation = getCheckoutIntentKey(
      { id: "cart-1", version: 8 },
      storage,
      createId,
    );

    expect(afterMutation).not.toBe(first);
    expect(afterMutation).toBe("checkout:cart-1:8:id-2");
  });

  it("rotates when a different cart becomes authoritative", () => {
    let generated = 0;
    const createId = () => `id-${++generated}`;

    const first = getCheckoutIntentKey(
      { id: "cart-1", version: 1 },
      storage,
      createId,
    );
    const next = getCheckoutIntentKey(
      { id: "cart-2", version: 1 },
      storage,
      createId,
    );

    expect(next).not.toBe(first);
  });

  it("clears the persisted intent after success or explicit cart mutation", () => {
    const createId = () => "id-1";
    const first = getCheckoutIntentKey(
      { id: "cart-1", version: 1 },
      storage,
      createId,
    );

    clearCheckoutIntent(storage);

    expect(
      getCheckoutIntentKey({ id: "cart-1", version: 1 }, storage, () => "id-2"),
    ).not.toBe(first);
  });

  it("fails safe when session storage contains malformed intent data", () => {
    storage.setItem("meow.checkout.intent.v1", "not-json");

    expect(
      getCheckoutIntentKey(
        { id: "cart-1", version: 1 },
        storage,
        () => "fresh-id",
      ),
    ).toBe("checkout:cart-1:1:fresh-id");
  });
});
