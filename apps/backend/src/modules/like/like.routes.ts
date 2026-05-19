import { Elysia, t } from "elysia";
import { prisma } from "../../lib/prisma";
import { authGuard } from "../../middleware/auth";

export const likeRoutes = new Elysia({ prefix: "/posts" })
  .use(authGuard)
  .post(
    "/:id/like",
    async ({ params, user, set }) => {
      const post = await prisma.post.findUnique({
        where: { id: params.id },
      });

      if (!post) {
        set.status = 404;
        return { success: false, message: "Post tidak ditemukan" };
      }

      const existingLike = await prisma.like.findUnique({
        where: { postId_userId: { postId: params.id, userId: user.id } },
      });

      if (existingLike) {
        // Unlike
        await prisma.like.delete({
          where: { postId_userId: { postId: params.id, userId: user.id } },
        });

        const likeCount = await prisma.like.count({
          where: { postId: params.id },
        });

        return {
          success: true,
          message: "Unlike berhasil",
          data: { liked: false, likeCount },
        };
      } else {
        // Like
        await prisma.like.create({
          data: { postId: params.id, userId: user.id },
        });

        // Buat notifikasi untuk post owner (kecuali kalau like sendiri)
        if (post.creatorId !== user.id) {
          await prisma.notification.create({
            data: {
              userId: post.creatorId,
              type: "LIKE",
              postId: params.id,
              actorId: user.id,
            },
          });
        }

        const likeCount = await prisma.like.count({
          where: { postId: params.id },
        });

        return {
          success: true,
          message: "Like berhasil",
          data: { liked: true, likeCount },
        };
      }
    },
    {
      params: t.Object({ id: t.String() }),
    }
  );
