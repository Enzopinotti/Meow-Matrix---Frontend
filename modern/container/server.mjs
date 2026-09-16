import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../dist/", import.meta.url)));
const port = Number.parseInt(process.env.PORT ?? "8080", 10);
const host = process.env.HOST ?? "0.0.0.0";

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
]);

function applySecurityHeaders(response) {
  response.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "base-uri 'none'",
      "connect-src 'self' http: https:",
      "font-src 'self' data:",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "img-src 'self' data: blob: http: https:",
      "object-src 'none'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
    ].join("; "),
  );
  response.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  response.setHeader(
    "Permissions-Policy",
    "camera=(), geolocation=(), microphone=()",
  );
  response.setHeader("Referrer-Policy", "no-referrer");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
}

function cachePolicy(requestPath) {
  return requestPath.startsWith("/assets/")
    ? "public, max-age=31536000, immutable"
    : "no-store";
}

function safePath(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (decoded.includes("\0")) return null;
  const relative = normalize(decoded).replace(/^[/\\]+/, "");
  if (relative.startsWith(`..${sep}`) || relative === "..") return null;
  const candidate = resolve(root, relative);
  return candidate === root || candidate.startsWith(`${root}${sep}`)
    ? candidate
    : null;
}

async function isRegularFile(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

function sendJson(response, statusCode, body) {
  const payload = Buffer.from(JSON.stringify(body));
  response.statusCode = statusCode;
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Content-Length", String(payload.length));
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(payload);
}

async function sendFile(response, path, requestPath) {
  const extension = extname(path).toLowerCase();
  const stats = await stat(path);
  response.statusCode = 200;
  response.setHeader("Content-Length", String(stats.size));
  response.setHeader(
    "Content-Type",
    mimeTypes.get(extension) ?? "application/octet-stream",
  );
  response.setHeader("Cache-Control", cachePolicy(requestPath));
  createReadStream(path).pipe(response);
}

const server = createServer(async (request, response) => {
  applySecurityHeaders(response);

  if (request.method !== "GET" && request.method !== "HEAD") {
    response.setHeader("Allow", "GET, HEAD");
    return sendJson(response, 405, { error: "method_not_allowed" });
  }

  const url = new URL(request.url ?? "/", "http://container.local");
  if (url.pathname === "/healthz") {
    return sendJson(response, 200, { status: "ok" });
  }

  const candidate = safePath(url.pathname);
  if (candidate === null) {
    return sendJson(response, 400, { error: "invalid_path" });
  }

  const explicitFile = await isRegularFile(candidate);
  const hasExtension = extname(url.pathname).length > 0;
  const selected = explicitFile
    ? candidate
    : hasExtension
      ? null
      : join(root, "index.html");

  if (selected === null || !(await isRegularFile(selected))) {
    return sendJson(response, 404, { error: "not_found" });
  }

  if (request.method === "HEAD") {
    const stats = await stat(selected);
    response.statusCode = 200;
    response.setHeader("Content-Length", String(stats.size));
    response.setHeader(
      "Content-Type",
      mimeTypes.get(extname(selected).toLowerCase()) ??
        "application/octet-stream",
    );
    response.setHeader("Cache-Control", cachePolicy(url.pathname));
    return response.end();
  }

  await sendFile(response, selected, url.pathname);
});

server.listen(port, host, () => {
  console.log(`Meow Matrix web listening on ${host}:${port}`);
});

function shutdown(signal) {
  console.log(`Received ${signal}; closing web server`);
  server.close((error) => {
    if (error) {
      console.error("Failed to close web server cleanly");
      process.exitCode = 1;
    }
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
