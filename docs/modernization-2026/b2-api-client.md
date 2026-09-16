# B2 — typed API client (2026)

## Purpose

The frontend now has an explicit transport contract for the paired `MeowMatrix---Backend-2v` `/api/v1` authority instead of a generic `request<T>` that trusted any JSON shape by convention.

The B1 security rule remains unchanged: authentication state is backend-owned and requests use `credentials: include`. The modern frontend does not write auth/session material to `document.cookie`, `localStorage`, or `sessionStorage`.

## Shared language

The frontend declares transport DTOs matching backend B2 for:

- Product;
- Category;
- Cart and CartLine;
- sanitized User;
- legacy-compatible Ticket;
- forward Order and OrderLine;
- success/error envelopes;
- product-list query and response types.

Cart/User/Ticket/Order types are contract preparation only. The client does not claim authenticated or checkout endpoints that the backend has not implemented yet.

## Active client surface

`createApiClient()` now exposes a typed `catalog` namespace:

- `catalog.listProducts(params)` → `GET /api/v1/products`;
- `catalog.getProduct(productId)` → `GET /api/v1/products/:productId`;
- `catalog.listCategories()` → `GET /api/v1/categories`;
- `catalog.getCategory(categoryId)` → `GET /api/v1/categories/:categoryId`.

The low-level `request<T>` remains available for infrastructure calls such as `/healthz`, but new product code should prefer typed resource methods.

## Error behavior

Backend error envelopes are preserved as `ApiResponseError` with:

- HTTP `status`;
- stable backend `code`;
- human message;
- optional field-level `details`.

Unknown/non-JSON error responses fail as `UNEXPECTED_API_ERROR`; the client does not invent success data when the backend is unavailable.

## Deliberate non-goals

B2 does not replace the reconstruction status pages with fake catalog content. Product/category UI migration starts only when the real persistence adapter exists and the v1 contract can return real product data.

B2 also does not implement login, cart mutations, checkout, orders, uploads, deployment or observability. Those remain the next modernization blocks and must build on this client rather than bypass it.
