import { Hono } from "hono";
import { prisma } from "../../lib/prisma";
import { authGuard } from "../../middleware/auth";

export const likeRoutes = new Hono()
  .use("*", authGuard)
  .post("/:id/like", async (c) => {
    const user = c.get("user") as any;
    const id = c.req.param("id");

    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return c.json({ success: false, message: "Post tidak ditemukan" }, 404);
    }

    const existingLike = await prisma.like.findUnique({
      where: { postId_userId: { postId: id, userId: user.id } },
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: { postId_userId: { postId: id, userId: user.id } },
      });

      const likeCount = await prisma.like.count({
        where: { postId: id },
      });

      return c.json({
        success: true,
        message: "Unlike berhasil",
        data: { liked: false, likeCount },
      });
    } else {
      // Like
      await prisma.like.create({
        data: { postId: id, userId: user.id },
      });

      // Buat notifikasi untuk post owner (kecuali kalau like sendiri)
      if (post.creatorId !== user.id) {
        await prisma.notification.create({
          data: {
            userId: post.creatorId,
            type: "LIKE",
            postId: id,
            actorId: user.id,
          },
        });
      }

      const likeCount = await prisma.like.count({
        where: { postId: id },
      });

      return c.json({
        success: true,
        message: "Like berhasil",
        data: { liked: true, likeCount },
      });
    }
  });
