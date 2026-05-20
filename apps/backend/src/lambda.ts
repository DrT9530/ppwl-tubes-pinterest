// src/lambda.ts — Entry point khusus untuk AWS Lambda (Node.js runtime)
import { app } from "./app";

// Convert Lambda event (API Gateway / Function URL) to standard Request
function buildRequest(event: any): Request {
  const isBase64 = event.isBase64Encoded;
  const headers = new Headers();

  if (event.headers) {
    for (const [key, value] of Object.entries(event.headers)) {
      if (value) headers.set(key, value as string);
    }
  }

  const host = headers.get("host") || "localhost";
  const proto = headers.get("x-forwarded-proto") || "https";
  const rawPath = event.rawPath || event.requestContext?.http?.path || event.path || "/";
  const rawQuery = event.rawQueryString || "";
  const url = `${proto}://${host}${rawPath}${rawQuery ? `?${rawQuery}` : ""}`;

  const method = (
    event.requestContext?.http?.method ||
    event.httpMethod ||
    "GET"
  ).toUpperCase();

  let body: string | Buffer | undefined = undefined;
  if (event.body) {
    body = isBase64 ? Buffer.from(event.body, "base64") : event.body;
  }

  const init: RequestInit = { method, headers };
  if (body && method !== "GET" && method !== "HEAD") {
    init.body = body;
  }

  return new Request(url, init);
}

// Convert standard Response to Lambda response format
async function buildResponse(response: Response) {
  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const contentType = headers["content-type"] || "";
  const isBinary =
    contentType.includes("image/") ||
    contentType.includes("application/octet-stream") ||
    contentType.includes("font/");

  let body: string;
  let isBase64Encoded = false;

  if (isBinary) {
    const buffer = Buffer.from(await response.arrayBuffer());
    body = buffer.toString("base64");
    isBase64Encoded = true;
  } else {
    body = await response.text();
  }

  return {
    statusCode: response.status,
    headers,
    body,
    isBase64Encoded,
  };
}

// Standard AWS Lambda handler
export const handler = async (event: any, context: any) => {
  if (context) {
    context.callbackWaitsForEmptyEventLoop = false;
  }

  try {
    const request = buildRequest(event);
    const response = await app.fetch(request);
    return buildResponse(response);
  } catch (error: any) {
    console.error("Lambda handler error:", error);
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: "Internal Server Error", message: error.message }),
      isBase64Encoded: false,
    };
  }
};
