# B6 — Frontend container runtime

B6 starts from the fully qualified B5 frontend main `eac5ce4760a2af49db06fc0b772c192ea0ff313e` and backend main `57e6563b5480ce217ad7bf0f9d5d380cd4772f08`.

## Authority boundary

The maintained container authority is `modern/Dockerfile`. Historical project files remain recoverable and are not rewritten to look newer.

The frontend container is intentionally independent from the backend container. Full-stack orchestration and the exact cross-repository pin live in the B6 backend/integration lane after this image contract is merged.

## Build stage

The image uses a Node 24 build stage and the maintained npm lockfile:

```text
package.json + package-lock.json -> npm ci --ignore-scripts -> Vite/TypeScript build
```

`VITE_API_ORIGIN` is a build argument because Vite statically embeds public client configuration. B6 local Compose will provide the local API origin; B7 owns the production public origin/cookie/CORS topology.

## Runtime stage

The runtime contains only:

- Node 24 runtime;
- generated `dist/` files;
- `container/server.mjs`.

It does not copy source, tests, development dependencies or npm credentials. No runtime `npm install` occurs.

The runtime:

- runs as the image's non-root `node` user;
- listens on unprivileged port `8080`;
- works with a read-only root filesystem;
- needs no Linux capabilities;
- needs no writable cache or temporary application directory;
- supports clean SIGTERM/SIGINT shutdown.

## Static server contract

The dependency-free Node HTTP server provides:

- `GET /healthz` -> `{"status":"ok"}`;
- SPA fallback to `index.html` for extensionless routes such as `/files` and `/orders/...`;
- explicit 404 for missing asset paths;
- decoded/normalized path containment inside `dist`;
- immutable one-year caching for hashed `/assets/*`;
- `no-store` for HTML/SPA responses.

Security headers include CSP, COOP, Permissions-Policy, Referrer-Policy, `nosniff` and frame denial. The CSP is deliberately a B6 local/runtime baseline; B7 may tighten public network origins once deployment authority is known.

## Docker context hygiene

`modern/.dockerignore` excludes dependencies, build output, coverage, `.env*`, logs and tests from the build context while retaining the actual TypeScript/Vite sources required to compile.

## CI contract

`.github/workflows/modern-container.yml` must build the maintained image and run it with:

```text
--read-only
--cap-drop=ALL
--security-opt=no-new-privileges:true
```

The workflow then proves:

- image user is non-root;
- process user is non-root;
- `/healthz` responds;
- `/` serves the built application;
- `/files` exercises SPA fallback;
- security headers are present;
- HTML is `no-store`;
- hashed JS assets are immutable-cached.

This container gate is additional to the existing frontend quality, dependency audit, browser-auth boundary, private-file browser boundary and artifact budget.

## B6 handoff

The backend/integration lane must consume a pinned frontend commit with this container contract and prove the system together with:

- hardened API image;
- Mongo single-node replica set for real transactions;
- private storage volume outside webroot;
- isolated development SMTP;
- liveness/readiness;
- checkout, private-file, outbox and restart/persistence integration smokes.
