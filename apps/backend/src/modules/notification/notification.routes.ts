import { Elysia } from "elysia";
import { prisma } from "../../lib/prisma";
import { authGuard } from "../../middleware/auth";

export const notificationRoutes = new Elysia({ prefix: "/notifications" })
  .use(authGuard)

  // GET / — fetch semua notifikasi user yang login
  .get("/", async ({ user }) => {
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

    return {
      success: true,
      message: "Notifikasi berhasil diambil",
      data: enriched,
    };
  })

  // PATCH /read — mark semua notifikasi sebagai sudah dibaca
  .patch("/read", async ({ user }) => {
    await prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });

    return {
      success: true,
      message: "Semua notifikasi ditandai sudah dibaca",
    };
  })

  // PATCH /:id/read — mark satu notifikasi sebagai sudah dibaca
  .patch("/:id/read", async ({ params: { id }, user, set }) => {
    const notif = await prisma.notification.findFirst({
      where: { id, userId: user.id },
    });

    if (!notif) {
      set.status = 404;
      return { success: false, message: "Notifikasi tidak ditemukan" };
    }

    await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return { success: true, message: "Notifikasi ditandai sudah dibaca" };
  })

  // GET /unread-count — jumlah notifikasi belum dibaca
  .get("/unread-count", async ({ user }) => {
    const count = await prisma.notification.count({
      where: { userId: user.id, read: false },
    });

    return {
      success: true,
      message: "Unread count berhasil diambil",
      data: { count },
    };
  });
