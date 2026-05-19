import { Elysia, t } from "elysia";
import { prisma } from "../../lib/prisma";
import { authGuard } from "../../middleware/auth";
// Import dari shared (Golden Rule 2) [cite: 227]
// import { createCommentSchema, createReplySchema } from "shared/validators";

export const commentRoutes = new Elysia()
  .use(authGuard) // Wajib login [cite: 278, 400]
  
  // 1. POST /posts/:id/comments - Tambah Komentar [cite: 400]
  .post("/posts/:id/comments", async ({ params, body, userId }) => {
    // Validasi: max 5 komentar per user (total semua post) [cite: 401]
    const totalComments = await prisma.comment.count({
      where: { userId: userId }
    });

    if (totalComments >= 5) {
      return { success: false, message: "Maksimal 5 komentar per user tercapai." }; // Format error wajib [cite: 218]
    }

    // Ambil post untuk mendapatkan post owner ID
    const post = await prisma.post.findUnique({ where: { id: params.id } });
    if (!post) return { success: false, message: "Post tidak ditemukan." };

    // Buat komentar
    const newComment = await prisma.comment.create({
      data: {
        content: body.content,
        postId: params.id,
        userId: userId,
      }
    });

    // Buat notification untuk post owner (type: COMMENT) [cite: 402]
    // Jangan kirim notif jika post owner adalah diri sendiri
    if (post.creatorId !== userId) {
      await prisma.notification.create({
        data: {
          userId: post.creatorId,
          type: "COMMENT", // Enum NotificationType [cite: 214]
          actorId: userId,
          postId: params.id
        }
      });
    }

    return { success: true, message: "Komentar berhasil ditambahkan", data: newComment }; // Format sukses wajib [cite: 239]
  }, {
    // body: createCommentSchema // Gunakan schema dari shared
  })

  // 2. POST /comments/:id/reply - Balas Komentar [cite: 403]
  .post("/comments/:id/reply", async ({ params, body, userId }) => {
    // Cek apakah comment target ada
    const targetComment = await prisma.comment.findUnique({ where: { id: params.id } });
    if (!targetComment) return { success: false, message: "Komentar tidak ditemukan." };

    // Reply 1 level: Schema Prisma menghubungkan Reply langsung ke Comment [cite: 173, 180, 406]
    const newReply = await prisma.reply.create({
      data: {
        content: body.content,
        commentId: params.id,
        userId: userId
      }
    });

    // Buat notification untuk comment owner (type: REPLY) [cite: 405]
    if (targetComment.userId !== userId) {
      await prisma.notification.create({
        data: {
          userId: targetComment.userId,
          type: "REPLY", // Enum NotificationType [cite: 214]
          actorId: userId,
          postId: targetComment.postId
        }
      });
    }

    return { success: true, message: "Balasan berhasil ditambahkan", data: newReply }; // [cite: 239]
  }, {
     // body: createReplySchema 
  });