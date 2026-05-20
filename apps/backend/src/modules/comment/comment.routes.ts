import { Elysia } from "elysia";
import { prisma } from "../../lib/prisma";
import { authGuard } from "../../middleware/auth";

export const commentRoutes = new Elysia()
  .use(authGuard)
  
  // 1. POST /posts/:id/comments - Tambah Komentar
  .post("/posts/:id/comments", async ({ params: { id }, user, body, set }) => {
    // Validasi: max 5 komentar per user (total semua post)
    const totalComments = await prisma.comment.count({
      where: { userId: user.id }
    });

    if (totalComments >= 5) {
      set.status = 400;
      return { success: false, message: "Maksimal 5 komentar per user tercapai." };
    }

    // Ambil post untuk mendapatkan post owner ID
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      set.status = 404;
      return { success: false, message: "Post tidak ditemukan." };
    }

    // Buat komentar
    const newComment = await prisma.comment.create({
      data: {
        content: (body as any).content,
        postId: id,
        userId: user.id,
      }
    });

    // Buat notification untuk post owner (type: COMMENT)
    // Jangan kirim notif jika post owner adalah diri sendiri
    if (post.creatorId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: post.creatorId,
          type: "COMMENT", 
          actorId: user.id,
          postId: id
        }
      });
    }

    return { success: true, message: "Komentar berhasil ditambahkan", data: newComment };
  })

  // 2. POST /comments/:id/reply - Balas Komentar
  .post("/comments/:id/reply", async ({ params: { id }, user, body, set }) => {
    // Cek apakah comment target ada
    const targetComment = await prisma.comment.findUnique({ where: { id } });
    if (!targetComment) {
      set.status = 404;
      return { success: false, message: "Komentar tidak ditemukan." };
    }

    // Reply 1 level: Schema Prisma menghubungkan Reply langsung ke Comment
    const newReply = await prisma.reply.create({
      data: {
        content: (body as any).content,
        commentId: id,
        userId: user.id
      }
    });

    // Buat notification untuk comment owner (type: REPLY)
    if (targetComment.userId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: targetComment.userId,
          type: "REPLY", 
          actorId: user.id,
          postId: targetComment.postId
        }
      });
    }

    return { success: true, message: "Balasan berhasil ditambahkan", data: newReply };
  });