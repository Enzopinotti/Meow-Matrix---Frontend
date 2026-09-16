# B5 — Private files frontend authority

B5 extends the maintained React authority on top of backend B5 main `57e6563b5480ce217ad7bf0f9d5d380cd4772f08`.

## Scope

The browser is a client of the backend-owned private-file authority. It does not own identity, authorization, storage paths, file integrity, approval state or delivery state.

The maintained route is:

```text
/files
```

It consumes:

```text
GET    /api/v1/files
POST   /api/v1/files/purposes/:purpose
GET    /api/v1/files/:fileId/content
DELETE /api/v1/files/:fileId
```

## Browser trust boundary

All requests continue to use the backend-owned HttpOnly session with `credentials: include`.

The browser never receives or persists:

- session tokens;
- private storage keys;
- filesystem roots or source paths;
- SMTP/outbox internals;
- blobs encoded into localStorage/sessionStorage/IndexedDB/Cache API;
- base64/data-URL copies of private documents.

The upload client uses `FormData` and deliberately does not set `Content-Type`; the browser generates the multipart boundary. Only the selected file and purpose route are sent.

Private downloads return a `Blob` in memory. The UI creates a temporary object URL only for the download action and revokes it immediately after triggering the browser download.

## Purpose policies

The frontend mirrors the public parts of the backend contract only for fast UX feedback:

| Purpose | Browser-declared types | Local limit |
| --- | --- | ---: |
| avatar | JPEG, PNG, WebP | 2 MiB |
| premium-identification | JPEG, PNG, PDF | 5 MiB |
| premium-address | JPEG, PNG, PDF | 5 MiB |
| premium-bank-statement | JPEG, PNG, PDF | 5 MiB |

This validation is not an integrity claim. Backend B5 remains authoritative for magic bytes, MIME/extension agreement, size, checksum, ownership and lifecycle.

## One active slot per purpose

The UI represents each purpose as one slot because the backend enforces one current active file per owner/purpose.

Replacement is intentionally explicit:

```text
existing file -> confirm delete -> backend delete -> select/upload replacement
```

The frontend does not present this as an atomic replacement because B5 does not provide that contract.

## Privacy and authorization UX

Anonymous users see an authentication gate before any file metadata request is made.

For authenticated users:

- list metadata comes only from the API;
- filename shown is display metadata, never an internal path;
- download goes through the authenticated content endpoint;
- delete requires an explicit confirmation step;
- foreign/missing resources inherit the backend's non-disclosing 404 behavior;
- server 413/415/503 and structured errors are shown factually.

## Claims deliberately not made

Uploading the three Premium-related documents does not mean a Premium application was submitted or approved. No maintained backend workflow currently establishes that fact.

Likewise, an order being confirmed does not prove that its confirmation email was delivered. Backend B5 uses an at-least-once outbox worker and does not expose a user-facing delivery-state contract yet.

## Accessibility and responsive behavior

The B5 screen provides:

- semantic headings and labels;
- keyboard-visible focus;
- `role=status` / `role=alert` feedback;
- disabled busy states;
- explicit delete confirmation;
- responsive purpose cards and full-width mobile actions.

## CI invariants

Permanent frontend quality must continue to prove:

- dependency audit;
- formatting, lint, TypeScript, unit/integration tests and build;
- no `document.cookie` or `localStorage` authority;
- `sessionStorage` remains allow-listed only for the non-secret B4 checkout intent;
- no `storageKey`, `PRIVATE_STORAGE_ROOT`, `readAsDataURL`, IndexedDB or Cache API usage in the private-file authority;
- artifact budget below the existing 2 MiB limit.

## B6 handoff

B5 intentionally does not decide production blob topology. B6 owns the full-stack runtime:

- hardened frontend/API containers;
- transaction-capable Mongo topology;
- persistent private-storage volume outside webroot;
- isolated development SMTP;
- health/readiness wiring;
- restart and persistence smoke tests.
