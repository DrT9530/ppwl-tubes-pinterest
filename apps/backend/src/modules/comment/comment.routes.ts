import { Hono } from "hono";
import { prisma } from "../../lib/prisma";
import { authGuard } from "../../middleware/auth";

export const commentRoutes = new Hono()
  .use("*", authGuard)
  
  // 1. POST /posts/:id/comments - Tambah Komentar
  .post("/posts/:id/comments", async (c) => {
    const user = c.get("user") as any;
    const id = c.req.param("id");
    const body = await c.req.json();

    // Validasi: max 5 komentar per user (total semua post)
    const totalComments = await prisma.comment.count({
      where: { userId: user.id }
    });

    if (totalComments >= 5) {
      return c.json({ success: false, message: "Maksimal 5 komentar per user tercapai." }, 400);
    }

    // Ambil post untuk mendapatkan post owner ID
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return c.json({ success: false, message: "Post tidak ditemukan." }, 404);
    }

    // Buat komentar
    const newComment = await prisma.comment.create({
      data: {
        content: body.content,
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

    return c.json({ success: true, message: "Komentar berhasil ditambahkan", data: newComment });
  })

  // 2. POST /comments/:id/reply - Balas Komentar
  .post("/comments/:id/reply", async (c) => {
    const user = c.get("user") as any;
    const id = c.req.param("id");
    const body = await c.req.json();

    // Cek apakah comment target ada
    const targetComment = await prisma.comment.findUnique({ where: { id } });
    if (!targetComment) {
      return c.json({ success: false, message: "Komentar tidak ditemukan." }, 404);
    }

    // Reply 1 level: Schema Prisma menghubungkan Reply langsung ke Comment
    const newReply = await prisma.reply.create({
      data: {
        content: body.content,
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

    return c.json({ success: true, message: "Balasan berhasil ditambahkan", data: newReply });
  });