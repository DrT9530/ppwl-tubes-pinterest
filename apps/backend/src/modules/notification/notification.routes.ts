import { Hono } from "hono";
import { prisma } from "../../lib/prisma";
import { authGuard } from "../../middleware/auth";

export const notificationRoutes = new Hono()
  .use("*", authGuard)

  // GET / — fetch semua notifikasi user yang login
  .get("/", async (c) => {
    const user = c.get("user") as any;
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, username: true, avatarUrl: true },
        },
      },
    });

    // Ambil actor info secara manual
    const enriched = await Promise.all(
      notifications.map(async (notif) => {
        let actor = null;
        if (notif.actorId) {
          actor = await prisma.user.findUnique({
            where: { id: notif.actorId },
            select: { id: true, username: true, avatarUrl: true },
          });
        }

        let post = null;
        if (notif.postId) {
          post = await prisma.post.findUnique({
            where: { id: notif.postId },
            select: { id: true, imageUrl: true },
          });
        }

        return {
          id: notif.id,
          type: notif.type,
          read: notif.read,
          createdAt: notif.createdAt.toISOString(),
          actor,
          post,
        };
      })
    );

    return c.json({
      success: true,
      message: "Notifikasi berhasil diambil",
      data: enriched,
    });
  })

  // PATCH /read — mark semua notifikasi sebagai sudah dibaca
  .patch("/read", async (c) => {
    const user = c.get("user") as any;
    await prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });

    return c.json({
      success: true,
      message: "Semua notifikasi ditandai sudah dibaca",
    });
  })

  // PATCH /:id/read — mark satu notifikasi sebagai sudah dibaca
  .patch("/:id/read", async (c) => {
    const user = c.get("user") as any;
    const id = c.req.param("id");

    const notif = await prisma.notification.findFirst({
      where: { id, userId: user.id },
    });

    if (!notif) {
      return c.json({ success: false, message: "Notifikasi tidak ditemukan" }, 404);
    }

    await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return c.json({ success: true, message: "Notifikasi ditandai sudah dibaca" });
  })

  // GET /unread-count — jumlah notifikasi belum dibaca
  .get("/unread-count", async (c) => {
    const user = c.get("user") as any;
    const count = await prisma.notification.count({
      where: { userId: user.id, read: false },
    });

    return c.json({
      success: true,
      message: "Unread count berhasil diambil",
      data: { count },
    });
  });
