import { DynamoDBClient, PutItemCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { createHmac } from "crypto";

const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "us-east-1";
const connectionsTable = process.env.WEBSOCKET_CONNECTIONS_TABLE;
const jwtSecret = process.env.JWT_SECRET || "dev-secret-key";

const dynamo = new DynamoDBClient({ region });

type WebsocketEvent = {
  requestContext?: {
    routeKey: "$connect" | "$disconnect" | "$default" | string;
    connectionId: string;
    domainName?: string;
    stage?: string;
  };
  queryStringParameters?: Record<string, string | undefined> | null;
};

// We will return standard Web Responses for Bun Lambda Layer

// Native HS256 JWT Verification
function verifyJwt(token: string, secret: string): { userId?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    if (!headerB64 || !payloadB64 || !signatureB64) return null;

    // Verify HS256 Signature
    const hmac = createHmac("sha256", secret);
    hmac.update(`${headerB64}.${payloadB64}`);
    const actualSignature = hmac.digest("base64url");

    if (actualSignature !== signatureB64) {
      console.error("[WS-Handler] JWT signature verification failed");
      return null;
    }

    const payload = JSON.parse(Buffer.from(payloadB64, "base64").toString("utf-8"));
    
    // Check Expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      console.error("[WS-Handler] JWT has expired");
      return null;
    }

    return payload;
  } catch (err) {
    console.error("[WS-Handler] Error decoding JWT:", err);
    return null;
  }
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (!connectionsTable) {
      console.error("[WS-Handler] WEBSOCKET_CONNECTIONS_TABLE is not defined");
      return new Response("Configuration Error", { status: 500 });
    }

    // Bun Lambda Layer attaches the raw API Gateway event to the request object
    const event = (request as any).aws as WebsocketEvent;
    if (!event || !event.requestContext) {
      console.error("[WS-Handler] No AWS requestContext found");
      return new Response("Invalid request", { status: 400 });
    }

    const { routeKey, connectionId, domainName, stage } = event.requestContext;

    if (routeKey === "$connect") {
      const token = event.queryStringParameters?.token?.trim();
      if (!token) {
        console.error("[WS-Handler] Connection rejected: No token provided");
        return new Response("Unauthorized", { status: 401 });
      }

      const payload = verifyJwt(token, jwtSecret);
      if (!payload || !payload.userId) {
        console.error("[WS-Handler] Connection rejected: Invalid token");
        return new Response("Unauthorized", { status: 401 });
      }

      const userId = payload.userId;

      try {
        await dynamo.send(
          new PutItemCommand({
            TableName: connectionsTable,
            Item: {
              connectionId: { S: connectionId },
              userId: { S: userId },
              domainName: { S: domainName || "" },
              stage: { S: stage || "" },
              ttl: { N: String(Math.floor(Date.now() / 1000) + 60 * 60 * 24) }, // 24 hours expiry
            },
          })
        );
        return new Response("Connected", { status: 200 });
      } catch (err) {
        console.error("[WS-Handler] Failed to save connection to DynamoDB:", err);
        return new Response("Database Error", { status: 500 });
      }
    }

    if (routeKey === "$disconnect") {
      try {
        await dynamo.send(
          new DeleteItemCommand({
            TableName: connectionsTable,
            Key: {
              connectionId: { S: connectionId },
            },
          })
        );
        return new Response("Disconnected", { status: 200 });
      } catch (err) {
        console.error("[WS-Handler] Failed to delete connection from DynamoDB:", err);
        return new Response("Database Error", { status: 500 });
      }
    }

    return new Response("OK", { status: 200 });
  }
};
