# B4 — Commerce frontend authority

## Scope

B4 replaces the reconstruction placeholders with a browser client for the transactional commerce authority exposed by the paired backend.

The frontend does not recreate business authority locally. It renders backend state and sends only the inputs the browser is allowed to choose.

## Catalog

`/products` reads `/api/v1/products` and `/api/v1/categories` through the typed client. Search, category and sorting are query inputs only; product visibility, price and stock remain backend-owned values.

Adding a product to the cart sends only the product id in the URL and an integer quantity in the request body. The browser does not submit a purchaser, trusted price, trusted stock or total.

## Session ownership

Cart and order screens require the B3 backend-owned session. The browser never chooses the cart owner or order purchaser.

Anonymous users are routed to the login flow instead of receiving a locally-created anonymous cart that would compete with the backend authority.

## Cart UX

`/cart` renders `CartViewDto`, including the backend-provided line availability state:

- `available`;
- `insufficient_stock`;
- `unavailable`.

The page displays the backend-calculated total and honors `checkoutReady`. A line that becomes hidden, unavailable, self-owned or under-stocked therefore blocks checkout until the user changes the cart.

Cart mutations are bounded to quantities 1–99 and replace the local view with the server response.

## Checkout intent and idempotency

The browser maintains one non-secret checkout intent key in `sessionStorage` for one `(cartId, cartVersion)` pair.

This key exists only to preserve the same `Idempotency-Key` across a retry of the same purchase intent, including a retry after a transient network failure or same-tab reload. It is not an authentication credential and is never used as identity.

Rules:

- same cart id + version → reuse the same key;
- material cart mutation/version change → rotate the key;
- different cart → rotate the key;
- successful checkout → delete the key;
- explicit cart mutation/clear → delete the key;
- `IDEMPOTENCY_KEY_REUSED` → delete the stale key;
- transient/unknown checkout failure → retain the key so retry remains safe.

The client does not send order lines, prices, totals, purchaser id or stock during checkout. It sends only `POST /api/v1/checkout` with the idempotency header and the B3 cookie credentials.

## Stock and concurrency conflicts

`STOCK_CHANGED`, `CART_CHANGED` and `CART_EMPTY` trigger a fresh cart read. The UI does not optimistically claim that an order succeeded when the backend rejected the transaction.

A successful response renders the backend order code and links to the persisted order detail. `replayed: true` is presented as a safe retry rather than a second order.

## Orders

`/orders` and `/orders/:orderId` use the session-scoped backend routes. No `userId` query parameter or purchaser selector exists in the browser client.

Order lines are immutable snapshots from the backend transaction and are rendered as receipt-like history. The UI says an order was confirmed; B4 does not claim payment capture or email delivery.

## Accessibility and responsive behavior

Commerce controls use semantic labels, native inputs/selects/buttons, focus-visible outlines, status/alert roles for asynchronous feedback and layouts that collapse to one column on small screens.

Checkout remains a normal button action and does not hide unavailable-line errors behind disabled controls alone; the page explains why checkout is blocked.

## Qualification before merge

B4 frontend is complete only when permanent CI verifies:

- typed commerce client paths and cookie credentials;
- no browser-provided user/purchaser/price/total authority;
- checkout idempotency key preservation for the same cart version;
- key rotation after cart mutation;
- anonymous cart/order guard;
- catalog/cart/order route wiring;
- format, lint, TypeScript, tests and build;
- existing auth-boundary and artifact-budget checks.
