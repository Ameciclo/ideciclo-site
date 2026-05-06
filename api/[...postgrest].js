const POSTGREST_TARGET = process.env.DATABASE_API_PROXY_TARGET;

const readRequestBody = async (request) => {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return undefined;
  }

  return Buffer.concat(chunks);
};

export default async function handler(request, response) {
  if (!POSTGREST_TARGET) {
    response.writeHead(500, {
      "Content-Type": "application/json; charset=utf-8",
    });
    response.end(
      JSON.stringify({
        error: "DATABASE_API_PROXY_TARGET não está configurado.",
      })
    );
    return;
  }

  const incomingUrl = new URL(request.url, `http://${request.headers.host}`);
  const proxiedUrl = new URL(
    incomingUrl.pathname.replace(/^\/api/, "") + incomingUrl.search,
    POSTGREST_TARGET
  );

  const proxiedHeaders = {};
  const forwardedHeaderNames = [
    "accept",
    "accept-profile",
    "content-type",
    "prefer",
    "range",
  ];

  forwardedHeaderNames.forEach((headerName) => {
    const headerValue = request.headers[headerName];
    if (typeof headerValue === "string" && headerValue.length > 0) {
      proxiedHeaders[headerName] = headerValue;
    }
  });

  const proxiedResponse = await fetch(proxiedUrl, {
    method: request.method,
    headers: proxiedHeaders,
    body:
      request.method === "GET" || request.method === "HEAD"
        ? undefined
        : await readRequestBody(request),
  });

  response.statusCode = proxiedResponse.status;

  proxiedResponse.headers.forEach((value, key) => {
    if (key.toLowerCase() === "transfer-encoding") return;
    response.setHeader(key, value);
  });

  const buffer = Buffer.from(await proxiedResponse.arrayBuffer());
  response.end(buffer);
}
