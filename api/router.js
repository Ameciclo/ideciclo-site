import { handleAuthRequest } from "../server/auth-server.mjs";
import { handleDbRequest } from "../server/db-server.mjs";

const json = (response, statusCode, payload) => {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload));
};

const rewriteRequestUrl = (request, routePath) => {
  const host = request.headers.host || "127.0.0.1";
  const incomingUrl = new URL(request.url, `http://${host}`);
  const fallbackPath = incomingUrl.pathname.replace(/^\/api\/?/, "");
  const normalizedPath = String(routePath || fallbackPath || "").replace(/^\/+/, "");
  const rewrittenUrl = new URL(`/api/${normalizedPath}`, `http://${host}`);

  incomingUrl.searchParams.forEach((value, key) => {
    if (key !== "path") {
      rewrittenUrl.searchParams.append(key, value);
    }
  });

  request.url = `${rewrittenUrl.pathname}${rewrittenUrl.search}`;
  return normalizedPath;
};

export default async function handler(request, response) {
  try {
    const host = request.headers.host || "127.0.0.1";
    const requestUrl = new URL(request.url, `http://${host}`);
    const routePath = rewriteRequestUrl(request, requestUrl.searchParams.get("path"));

    if (routePath.startsWith("auth/")) {
      return handleAuthRequest(request, response);
    }

    if (routePath.startsWith("db/")) {
      return handleDbRequest(request, response);
    }

    json(response, 404, { error: "Not found" });
  } catch (error) {
    console.error("Erro no roteador de API:", error);
    json(response, 500, {
      error: error instanceof Error ? error.message : "Erro interno do servidor.",
    });
  }
}
