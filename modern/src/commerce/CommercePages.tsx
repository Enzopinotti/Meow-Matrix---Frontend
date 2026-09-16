import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { apiClient, ApiResponseError } from "../api/client";
import type {
  CartItemDto,
  CartViewDto,
  CategoryDto,
  CheckoutResultDto,
  OrderDto,
  ProductDto,
  ProductListParams,
} from "../api/contracts";
import { useAuth } from "../auth/AuthContext";
import { clearCheckoutIntent, getCheckoutIntentKey } from "./checkout-intent";

const money = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 2,
});

function errorMessage(cause: unknown): string {
  if (cause instanceof ApiResponseError) {
    return `${cause.message} (${cause.code})`;
  }
  return cause instanceof Error ? cause.message : "Ocurrió un error inesperado";
}

function LoginRequired({ action }: { action: string }) {
  return (
    <section className="panel commerce-empty">
      <h1>Necesitás iniciar sesión</h1>
      <p>{action} usa la sesión segura del backend y no acepta un usuario elegido desde el navegador.</p>
      <Link className="button-link" to="/login">
        Ingresar
      </Link>
    </section>
  );
}

function ProductCard({ product }: { product: ProductDto }) {
  const { status } = useAuth();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const canBuy = product.stock > 0 && product.status && product.isVisible;

  async function addToCart() {
    setBusy(true);
    setNotice(null);
    try {
      await apiClient.commerce.setCartItem(product.id, 1);
      clearCheckoutIntent();
      setNotice("Agregado al carrito");
    } catch (cause) {
      setNotice(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="product-card">
      <div className="product-card__media" aria-hidden="true">
        {product.thumbnailUrls[0] ? (
          <img src={product.thumbnailUrls[0]} alt="" loading="lazy" />
        ) : (
          <span>MM</span>
        )}
      </div>
      <div className="product-card__body">
        <p className="eyebrow">{product.code}</p>
        <h2>{product.name}</h2>
        {product.description ? <p>{product.description}</p> : null}
        <div className="product-card__meta">
          <strong>{money.format(product.price)}</strong>
          <span>{product.stock > 0 ? `${product.stock} disponibles` : "Sin stock"}</span>
        </div>
        {status === "authenticated" ? (
          <button disabled={!canBuy || busy} onClick={() => void addToCart()}>
            {busy ? "Agregando…" : canBuy ? "Agregar al carrito" : "No disponible"}
          </button>
        ) : (
          <Link className="button-link" to="/login">
            Ingresar para comprar
          </Link>
        )}
        {notice ? <p className="form-message" role="status">{notice}</p> : null}
      </div>
    </article>
  );
}

export function CatalogPage() {
  const [products, setProducts] = useState<readonly ProductDto[]>([]);
  const [categories, setCategories] = useState<readonly CategoryDto[]>([]);
  const [filters, setFilters] = useState<ProductListParams>({ limit: 24, sort: "newest" });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    void Promise.all([
      apiClient.catalog.listProducts(filters),
      apiClient.catalog.listCategories(),
    ])
      .then(([productPage, categoryList]) => {
        if (!active) return;
        setProducts(productPage.items);
        setCategories(categoryList);
      })
      .catch((cause) => {
        if (active) setError(errorMessage(cause));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [filters]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = search.trim();
    setFilters((current) => ({ ...current, q: q || undefined, offset: 0 }));
  }

  return (
    <section className="commerce-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Catálogo 2026</p>
          <h1>Productos</h1>
          <p>Precio, visibilidad y stock provienen de la API autoritativa.</p>
        </div>
        <Link to="/cart">Ver carrito</Link>
      </div>

      <form className="catalog-filters" onSubmit={submitSearch}>
        <label>
          Buscar
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nombre o producto" />
        </label>
        <label>
          Categoría
          <select
            value={filters.categoryId ?? ""}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                categoryId: event.target.value || undefined,
                offset: 0,
              }))
            }
          >
            <option value="">Todas</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </label>
        <label>
          Ordenar
          <select
            value={filters.sort ?? "newest"}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                sort: event.target.value as NonNullable<ProductListParams["sort"]>,
              }))
            }
          >
            <option value="newest">Más recientes</option>
            <option value="price_asc">Menor precio</option>
            <option value="price_desc">Mayor precio</option>
          </select>
        </label>
        <button type="submit">Aplicar búsqueda</button>
      </form>

      {loading ? <p role="status">Cargando catálogo…</p> : null}
      {error ? <p className="error-message" role="alert">{error}</p> : null}
      {!loading && !error && products.length === 0 ? <p>No hay productos para estos filtros.</p> : null}
      <div className="product-grid">
        {products.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
}

function availabilityLabel(item: CartItemDto): string {
  if (item.availability === "available") return "Disponible";
  if (item.availability === "insufficient_stock") return "Stock insuficiente";
  return "No disponible";
}

function CartLine({
  item,
  onChanged,
}: {
  item: CartItemDto;
  onChanged(cart: CartViewDto): void;
}) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateQuantity() {
    setBusy(true);
    setError(null);
    try {
      const cart = await apiClient.commerce.setCartItem(item.productId, quantity);
      clearCheckoutIntent();
      onChanged(cart);
    } catch (cause) {
      setError(errorMessage(cause));
      setQuantity(item.quantity);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    setError(null);
    try {
      const cart = await apiClient.commerce.removeCartItem(item.productId);
      clearCheckoutIntent();
      onChanged(cart);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="cart-line">
      <div>
        <p className="eyebrow">{availabilityLabel(item)}</p>
        <h2>{item.product?.name ?? "Producto no disponible"}</h2>
        <p>{item.product ? money.format(item.product.price) : item.productId}</p>
      </div>
      <div className="cart-line__actions">
        <label>
          Cantidad
          <input
            type="number"
            min={1}
            max={99}
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
            disabled={busy}
          />
        </label>
        <button disabled={busy || quantity === item.quantity || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99} onClick={() => void updateQuantity()}>
          Actualizar
        </button>
        <button className="button-secondary" disabled={busy} onClick={() => void remove()}>
          Quitar
        </button>
      </div>
      <strong>{item.lineTotal === null ? "—" : money.format(item.lineTotal)}</strong>
      {error ? <p className="error-message" role="alert">{error}</p> : null}
    </article>
  );
}

export function CartPage() {
  const { status } = useAuth();
  const [cart, setCart] = useState<CartViewDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResultDto | null>(null);

  const loadCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCart(await apiClient.commerce.getCart());
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") void loadCart();
  }, [loadCart, status]);

  if (status === "loading") return <p role="status">Verificando sesión…</p>;
  if (status !== "authenticated") {
    return <LoginRequired action="El carrito" />;
  }

  async function clearCart() {
    setBusy(true);
    setError(null);
    try {
      const next = await apiClient.commerce.clearCart();
      clearCheckoutIntent();
      setCart(next);
      setCheckoutResult(null);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  async function checkout() {
    if (!cart || !cart.checkoutReady) return;
    setBusy(true);
    setError(null);
    try {
      const key = getCheckoutIntentKey(cart);
      const result = await apiClient.commerce.checkout(key);
      clearCheckoutIntent();
      setCheckoutResult(result);
      setCart(await apiClient.commerce.getCart());
    } catch (cause) {
      if (cause instanceof ApiResponseError && cause.code === "IDEMPOTENCY_KEY_REUSED") {
        clearCheckoutIntent();
      }
      setError(errorMessage(cause));
      if (
        cause instanceof ApiResponseError &&
        ["STOCK_CHANGED", "CART_CHANGED", "CART_EMPTY"].includes(cause.code)
      ) {
        await loadCart();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="commerce-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Carrito server-authoritative</p>
          <h1>Tu carrito</h1>
          <p>El backend vuelve a resolver stock, precio y total antes de confirmar.</p>
        </div>
        <Link to="/orders">Mis órdenes</Link>
      </div>

      {loading ? <p role="status">Cargando carrito…</p> : null}
      {error ? <p className="error-message" role="alert">{error}</p> : null}
      {checkoutResult ? (
        <div className="success-message" role="status">
          Orden <strong>{checkoutResult.order.code}</strong> confirmada{checkoutResult.replayed ? " (retry seguro)" : ""}.{" "}
          <Link to={`/orders/${checkoutResult.order.id}`}>Ver detalle</Link>
        </div>
      ) : null}

      {cart && cart.items.length === 0 ? (
        <div className="commerce-empty">
          <p>Tu carrito está vacío.</p>
          <Link to="/products">Explorar productos</Link>
        </div>
      ) : null}

      <div className="cart-list">
        {cart?.items.map((item) => (
          <CartLine key={item.productId} item={item} onChanged={setCart} />
        ))}
      </div>

      {cart && cart.items.length > 0 ? (
        <aside className="checkout-summary">
          <span>Total autoritativo</span>
          <strong>{money.format(cart.total)}</strong>
          {!cart.checkoutReady ? <p>Corregí las líneas no disponibles antes de comprar.</p> : null}
          <div className="action-row">
            <button className="button-secondary" disabled={busy} onClick={() => void clearCart()}>Vaciar carrito</button>
            <button disabled={busy || !cart.checkoutReady} onClick={() => void checkout()}>{busy ? "Procesando…" : "Confirmar compra"}</button>
          </div>
        </aside>
      ) : null}
    </section>
  );
}

export function OrdersPage() {
  const { status } = useAuth();
  const [orders, setOrders] = useState<readonly OrderDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    let active = true;
    setLoading(true);
    void apiClient.commerce
      .listOrders({ limit: 50 })
      .then((result) => {
        if (active) setOrders(result.items);
      })
      .catch((cause) => {
        if (active) setError(errorMessage(cause));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [status]);

  if (status === "loading") return <p role="status">Verificando sesión…</p>;
  if (status !== "authenticated") return <LoginRequired action="El historial de órdenes" />;

  return (
    <section className="commerce-page">
      <div className="page-heading"><div><p className="eyebrow">Historial</p><h1>Mis órdenes</h1></div><Link to="/products">Seguir comprando</Link></div>
      {loading ? <p role="status">Cargando órdenes…</p> : null}
      {error ? <p className="error-message" role="alert">{error}</p> : null}
      {!loading && !error && orders.length === 0 ? <p>Todavía no hay órdenes confirmadas.</p> : null}
      <div className="order-list">
        {orders.map((order) => (
          <article key={order.id} className="order-card">
            <div><p className="eyebrow">{order.status}</p><h2>{order.code}</h2><p>{new Date(order.createdAt).toLocaleString("es-AR")}</p></div>
            <strong>{money.format(order.total)}</strong>
            <Link to={`/orders/${order.id}`}>Ver detalle</Link>
          </article>
        ))}
      </div>
    </section>
  );
}

export function OrderDetailPage() {
  const { status } = useAuth();
  const { orderId } = useParams();
  const [order, setOrder] = useState<OrderDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !orderId) return;
    let active = true;
    void apiClient.commerce
      .getOrder(orderId)
      .then((result) => {
        if (active) setOrder(result);
      })
      .catch((cause) => {
        if (active) setError(errorMessage(cause));
      });
    return () => {
      active = false;
    };
  }, [orderId, status]);

  if (status === "loading") return <p role="status">Verificando sesión…</p>;
  if (status !== "authenticated") return <LoginRequired action="El detalle de la orden" />;
  if (!orderId) return <p className="error-message">Orden inválida.</p>;

  return (
    <section className="commerce-page">
      <div className="page-heading"><div><p className="eyebrow">Orden</p><h1>{order?.code ?? "Detalle de compra"}</h1></div><Link to="/orders">Volver a mis órdenes</Link></div>
      {error ? <p className="error-message" role="alert">{error}</p> : null}
      {!order && !error ? <p role="status">Cargando orden…</p> : null}
      {order ? (
        <div className="order-detail panel">
          <p>Estado: <strong>{order.status}</strong></p>
          <p>Fecha: {new Date(order.createdAt).toLocaleString("es-AR")}</p>
          <div className="order-lines">
            {order.lines.map((line) => (
              <div key={line.productId} className="order-line">
                <span>{line.name} × {line.quantity}</span>
                <span>{money.format(line.unitPrice)} c/u</span>
                <strong>{money.format(line.lineTotal)}</strong>
              </div>
            ))}
          </div>
          <div className="order-total"><span>Total</span><strong>{money.format(order.total)}</strong></div>
        </div>
      ) : null}
    </section>
  );
}
