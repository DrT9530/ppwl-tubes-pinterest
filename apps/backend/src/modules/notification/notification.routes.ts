import { Elysia, t } from "elysia";
import { prisma } from "../../lib/prisma";
import { authGuard } from "../../middleware/auth";

export const notificationRoutes = new Elysia({ prefix: "/notifications" })
  .use(authGuard)

  // GET /notifications — fetch semua notifikasi user yang login
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

    // Ambil actor info (siapa yang melakukan aksi) secara manual
    // karena schema tidak punya relasi langsung ke actor
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
          createdAt: notif.createdAt,
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

  // PATCH /notifications/read — mark semua notifikasi sebagai sudah dibaca
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

  // PATCH /notifications/:id/read — mark satu notifikasi sebagai sudah dibaca
  .patch(
    "/:id/read",
    async ({ params, user, set }) => {
      const notif = await prisma.notification.findFirst({
        where: { id: params.id, userId: user.id },
      });

      if (!notif) {
        set.status = 404;
        return { success: false, message: "Notifikasi tidak ditemukan" };
      }

      await prisma.notification.update({
        where: { id: params.id },
        data: { read: true },
      });

      return { success: true, message: "Notifikasi ditandai sudah dibaca" };
    },
    {
      params: t.Object({ id: t.String() }),
    }
  )

  // GET /notifications/unread-count — jumlah notifikasi belum dibaca (untuk badge)
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
