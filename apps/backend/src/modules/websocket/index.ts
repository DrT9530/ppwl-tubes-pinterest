import { Elysia } from "elysia";
import { prisma } from "../../lib/prisma";
import { jwtPlugin } from "../../middleware/auth";

// In-memory store: userId -> set of open websocket objects
const connectedClients = new Map<string, Set<any>>();

export const websocketRoutes = new Elysia()
  .use(jwtPlugin)
  .ws("/ws/notifications", {
    async open(ws) {
      // token dikirim lewat query string ?token=...
      const token = (ws.data as any).query?.token;
      if (!token) {
        ws.send(JSON.stringify({ type: "ERROR", message: "Unauthorized" }));
        ws.close();
        return;
      }

      try {
        const payload = await (ws.data as any).jwt.verify(token);
        if (!payload || !payload.userId) {
          ws.close();
          return;
        }

        const userId = payload.userId as string;
        (ws as any)._userId = userId;

        if (!connectedClients.has(userId)) {
          connectedClients.set(userId, new Set());
        }
        connectedClients.get(userId)!.add(ws);

        console.log(`[WS] User ${userId} connected (total: ${connectedClients.get(userId)!.size})`);
        ws.send(JSON.stringify({ type: "CONNECTED" }));
      } catch (err) {
        console.error("[WS] Auth error:", err);
        ws.close();
      }
    },
    message(ws, message) {
      if (message === "ping") {
        ws.send("pong");
      }
    },
    close(ws) {
      const userId = (ws as any)._userId;
      if (userId && connectedClients.has(userId)) {
        connectedClients.get(userId)!.delete(ws);
        if (connectedClients.get(userId)!.size === 0) {
          connectedClients.delete(userId);
        }
        console.log(`[WS] User ${userId} disconnected`);
      }
    },
  });

export async function sendNewNotification(userId: string, notificationId: string) {
  const clients = connectedClients.get(userId);
  if (!clients || clients.size === 0) return;

  try {
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
    clients.forEach((ws) => {
      try {
        ws.send(payload);
      } catch (_e) {
        // Client might have disconnected
      }
    });
  } catch (err) {
    console.error("[WS] sendNewNotification error:", err);
  }
}
