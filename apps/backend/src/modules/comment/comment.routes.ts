import { Elysia } from "elysia";
import { prisma } from "../../lib/prisma";
import { authGuard } from "../../middleware/auth";
import { sendNewNotification } from "../../lib/realtime.service";
import { uploadImageToCloudinary } from "../../lib/cloudinary";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

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

    // Cek apakah komentar diizinkan
    if (!post.allowComments) {
      set.status = 403;
      return { success: false, message: "Komentar dinonaktifkan pada post ini." };
    }

    // Buat komentar
    const bodyObj = body as any;
    const content = bodyObj.content || "";
    const image = bodyObj.image as File | undefined;
    const imageBase64 = bodyObj.imageBase64 as string | undefined;
    const stickerUrl = bodyObj.stickerUrl as string | undefined;
    
    if (!content && !image && !imageBase64 && !stickerUrl) {
      set.status = 400;
      return { success: false, message: "Komentar tidak boleh kosong" };
    }
    
    let imageUrl: string | undefined;
    if (imageBase64) {
      try {
        const uploaded = await uploadImageToCloudinary(imageBase64);
        imageUrl = uploaded.imageUrl;
      } catch (error) {
        set.status = 500;
        return { success: false, message: "Gagal upload gambar" };
      }
    } else if (image && image instanceof File) {
      if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
        set.status = 400;
        return { success: false, message: "File harus berupa gambar JPG, PNG, WEBP, atau GIF" };
      }
      try {
        const uploaded = await uploadImageToCloudinary(image);
        imageUrl = uploaded.imageUrl;
      } catch (error) {
        set.status = 500;
        return { success: false, message: "Gagal upload gambar" };
      }
    }

    // Use stickerUrl directly if provided
    if (!imageUrl && stickerUrl) {
      imageUrl = stickerUrl;
    }

    const newComment = await prisma.comment.create({
      data: {
        content,
        imageUrl,
        postId: id,
        userId: user.id,
      }
    });

    // Buat notification untuk post owner (type: COMMENT)
    if (post.creatorId !== user.id) {
      const newNotif = await prisma.notification.create({
        data: {
          userId: post.creatorId,
          type: "COMMENT", 
          actorId: user.id,
          postId: id
        }
      });
      await sendNewNotification(post.creatorId, newNotif.id);
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
    const bodyObj = body as any;
    const content = bodyObj.content || "";
    const image = bodyObj.image as File | undefined;
    const imageBase64 = bodyObj.imageBase64 as string | undefined;
    const stickerUrl = bodyObj.stickerUrl as string | undefined;
    
    if (!content && !image && !imageBase64 && !stickerUrl) {
      set.status = 400;
      return { success: false, message: "Balasan tidak boleh kosong" };
    }
    
    let imageUrl: string | undefined;
    if (imageBase64) {
      try {
        const uploaded = await uploadImageToCloudinary(imageBase64);
        imageUrl = uploaded.imageUrl;
      } catch (error) {
        set.status = 500;
        return { success: false, message: "Gagal upload gambar" };
      }
    } else if (image && image instanceof File) {
      if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
        set.status = 400;
        return { success: false, message: "File harus berupa gambar JPG, PNG, WEBP, atau GIF" };
      }
      try {
        const uploaded = await uploadImageToCloudinary(image);
        imageUrl = uploaded.imageUrl;
      } catch (error) {
        set.status = 500;
        return { success: false, message: "Gagal upload gambar" };
      }
    }

    // Use stickerUrl directly if provided
    if (!imageUrl && stickerUrl) {
      imageUrl = stickerUrl;
    }

    const newReply = await prisma.reply.create({
      data: {
        content,
        imageUrl,
        commentId: id,
        userId: user.id
      }
    });

    // Buat notification untuk comment owner (type: REPLY)
    if (targetComment.userId !== user.id) {
      const newNotif = await prisma.notification.create({
        data: {
          userId: targetComment.userId,
          type: "REPLY", 
          actorId: user.id,
          postId: targetComment.postId
        }
      });
      await sendNewNotification(targetComment.userId, newNotif.id);
    }

    return { success: true, message: "Balasan berhasil ditambahkan", data: newReply };
  })

  // 3. POST /comments/:id/like - Like Komentar
  .post("/comments/:id/like", async ({ params: { id }, user, set }) => {
    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      set.status = 404;
      return { success: false, message: "Komentar tidak ditemukan" };
    }

    try {
      await prisma.commentLike.create({
        data: {
          commentId: id,
          userId: user.id
        }
      });

      if (comment.userId !== user.id) {
        const newNotif = await prisma.notification.create({
          data: {
            userId: comment.userId,
            type: "COMMENT_LIKE",
            actorId: user.id,
            postId: comment.postId
          }
        });
        await sendNewNotification(comment.userId, newNotif.id);
      }

      return { success: true, message: "Komentar disukai" };
    } catch (error) {
      set.status = 400;
      return { success: false, message: "Sudah menyukai komentar ini" };
    }
  })

  // 4. DELETE /comments/:id/like - Unlike Komentar
  .delete("/comments/:id/like", async ({ params: { id }, user, set }) => {
    try {
      await prisma.commentLike.delete({
        where: {
          commentId_userId: {
            commentId: id,
            userId: user.id
          }
        }
      });
      return { success: true, message: "Batal menyukai komentar" };
    } catch (error) {
      set.status = 400;
      return { success: false, message: "Belum menyukai komentar ini" };
    }
  })

  // 5. PUT /comments/:id - Edit Komentar
  .put("/comments/:id", async ({ params: { id }, user, body, set }) => {
    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      set.status = 404;
      return { success: false, message: "Komentar tidak ditemukan" };
    }
    
    if (comment.userId !== user.id) {
      set.status = 403;
      return { success: false, message: "Tidak memiliki akses" };
    }

    const bodyObj = body as any;
    const content = bodyObj.content || "";

    if (!content) {
      set.status = 400;
      return { success: false, message: "Konten tidak boleh kosong" };
    }

    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { content }
    });

    return { success: true, message: "Komentar berhasil diperbarui", data: updatedComment };
  })

  // 6. DELETE /comments/:id - Hapus Komentar
  .delete("/comments/:id", async ({ params: { id }, user, set }) => {
    const comment = await prisma.comment.findUnique({ 
      where: { id },
      include: { post: true }
    });
    
    if (!comment) {
      set.status = 404;
      return { success: false, message: "Komentar tidak ditemukan" };
    }

    // Bisa dihapus oleh pembuat komentar atau pemilik postingan
    if (comment.userId !== user.id && comment.post.creatorId !== user.id) {
      set.status = 403;
      return { success: false, message: "Tidak memiliki akses" };
    }

    await prisma.comment.delete({ where: { id } });
    return { success: true, message: "Komentar berhasil dihapus" };
  })

  // 7. PUT /comments/:id/highlight - Toggle Sorotan Komentar
  .put("/comments/:id/highlight", async ({ params: { id }, user, set }) => {
    const comment = await prisma.comment.findUnique({ 
      where: { id },
      include: { post: true }
    });

    if (!comment) {
      set.status = 404;
      return { success: false, message: "Komentar tidak ditemukan" };
    }

    if (comment.post.creatorId !== user.id) {
      set.status = 403;
      return { success: false, message: "Hanya pemilik postingan yang dapat menyorot komentar" };
    }

    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { isHighlighted: !comment.isHighlighted }
    });

    return { 
      success: true, 
      message: updatedComment.isHighlighted ? "Komentar disorot" : "Sorotan dilepas",
      isHighlighted: updatedComment.isHighlighted
    };
  })
  
  // 8. PUT /replies/:id - Edit Balasan
  .put("/replies/:id", async ({ params: { id }, user, body, set }) => {
    const reply = await prisma.reply.findUnique({ where: { id } });
    if (!reply) {
      set.status = 404;
      return { success: false, message: "Balasan tidak ditemukan" };
    }
    
    if (reply.userId !== user.id) {
      set.status = 403;
      return { success: false, message: "Tidak memiliki akses" };
    }

    const bodyObj = body as any;
    const content = bodyObj.content || "";

    if (!content) {
      set.status = 400;
      return { success: false, message: "Konten tidak boleh kosong" };
    }

    const updatedReply = await prisma.reply.update({
      where: { id },
      data: { content }
    });

    return { success: true, message: "Balasan berhasil diperbarui", data: updatedReply };
  })

  // 9. DELETE /replies/:id - Hapus Balasan
  .delete("/replies/:id", async ({ params: { id }, user, set }) => {
    const reply = await prisma.reply.findUnique({ 
      where: { id },
      include: { comment: { include: { post: true } } }
    });
    
    if (!reply) {
      set.status = 404;
      return { success: false, message: "Balasan tidak ditemukan" };
    }

    // Bisa dihapus oleh pembuat balasan atau pemilik postingan
    if (reply.userId !== user.id && reply.comment.post.creatorId !== user.id) {
      set.status = 403;
      return { success: false, message: "Tidak memiliki akses" };
    }

    await prisma.reply.delete({ where: { id } });
    return { success: true, message: "Balasan berhasil dihapus" };
  })

  // 10. POST /replies/:id/like - Like Balasan
  .post("/replies/:id/like", async ({ params: { id }, user, set }) => {
    const reply = await prisma.reply.findUnique({ where: { id }, include: { comment: true } });
    if (!reply) {
      set.status = 404;
      return { success: false, message: "Balasan tidak ditemukan" };
    }

    try {
      await prisma.replyLike.create({
        data: {
          replyId: id,
          userId: user.id
        }
      });

      // (Optional) add notification for reply like if needed
      // We will skip notification for reply likes to keep it simple, or send COMMENT_LIKE type.
      if (reply.userId !== user.id) {
        const newNotif = await prisma.notification.create({
          data: {
            userId: reply.userId,
            type: "COMMENT_LIKE",
            actorId: user.id,
            postId: reply.comment.postId
          }
        });
        await sendNewNotification(reply.userId, newNotif.id);
      }

      return { success: true, message: "Balasan disukai" };
    } catch (error) {
      set.status = 400;
      return { success: false, message: "Sudah menyukai balasan ini" };
    }
  })

  // 11. DELETE /replies/:id/like - Unlike Balasan
  .delete("/replies/:id/like", async ({ params: { id }, user, set }) => {
    try {
      await prisma.replyLike.delete({
        where: {
          replyId_userId: {
            replyId: id,
            userId: user.id
          }
        }
      });
      return { success: true, message: "Batal menyukai balasan" };
    } catch (error) {
      set.status = 400;
      return { success: false, message: "Belum menyukai balasan ini" };
    }
  });