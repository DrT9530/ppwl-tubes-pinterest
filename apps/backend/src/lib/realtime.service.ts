import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import { prisma } from "./prisma"; // Wait! Is prisma located in ../lib/prisma or here? Let's check: in websocket/index.ts, it was '../../lib/prisma' which resolves to 'src/lib/prisma.ts'

const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "us-east-1";
const connectionsTable = process.env.WEBSOCKET_CONNECTIONS_TABLE;
const websocketEndpoint = process.env.WEBSOCKET_API_ENDPOINT; // e.g. https://{api-id}.execute-api.{region}.amazonaws.com/Prod

const dynamo = new DynamoDBClient({ region });

// Ambil semua Connection ID milik user tertentu menggunakan Scan & Filter
async function getUserConnectionIds(userId: string): Promise<string[]> {
  if (!connectionsTable) return [];

  try {
    const response = await dynamo.send(
      new ScanCommand({
        TableName: connectionsTable,
        FilterExpression: "userId = :uid",
        ExpressionAttributeValues: {
          ":uid": { S: userId },
        },
        ProjectionExpression: "connectionId",
      })
    );

    return response.Items
      ?.map((item) => item.connectionId?.S)
      .filter((id): id is string => Boolean(id)) || [];
  } catch (err) {
    console.error("[Realtime] Error scanning connections in DynamoDB:", err);
    return [];
  }
}

export async function sendNewNotification(userId: string, notificationId: string) {
  // Jika tidak terkonfigurasi, abaikan saja
  if (!connectionsTable || !websocketEndpoint) {
    console.log("[Realtime] WebSocket environment variables are not configured. Skipping push notification.");
    return;
  }

  try {
    const connectionIds = await getUserConnectionIds(userId);
    if (connectionIds.length === 0) {
      console.log(`[Realtime] User ${userId} is offline (no active connection IDs).`);
      return;
    }

    // Ambil data notifikasi dari database
    const notif = await prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notif) return;

    const [actor, post] = await Promise.all([
      notif.actorId
        ? prisma.user.findUnique({
            where: { id: notif.actorId },
            select: { id: true, username: true, avatarUrl: true },
          })
        : null,
      notif.postId
        ? prisma.post.findUnique({
            where: { id: notif.postId },
            select: { id: true, imageUrl: true },
          })
        : null,
    ]);

    const enriched = {
      id: notif.id,
      type: notif.type,
      read: notif.read,
      createdAt: notif.createdAt.toISOString(),
      actor,
      post,
    };

    const payload = JSON.stringify({ type: "NEW_NOTIFICATION", payload: enriched });
    const data = new TextEncoder().encode(payload);

    // Inisialisasi API Gateway Management Client
    const client = new ApiGatewayManagementApiClient({
      region,
      endpoint: websocketEndpoint,
    });

    console.log(`[Realtime] Pushing notification to ${connectionIds.length} active connection(s) for user ${userId}...`);

    await Promise.allSettled(
      connectionIds.map((ConnectionId) =>
        client.send(new PostToConnectionCommand({ ConnectionId, Data: data }))
      )
    );
  } catch (err) {
    console.error("[Realtime] Failed to send real-time notification:", err);
  }
}
