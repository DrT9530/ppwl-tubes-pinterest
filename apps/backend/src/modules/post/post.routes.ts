// modules/post/post.routes.ts — Post endpoints (Feed + CRUD)
import { Elysia, t } from "elysia";
import { prisma } from "../../lib/prisma";
import {
  deleteImageFromCloudinary,
  uploadImageToCloudinary,
} from "../../lib/cloudinary";
import { authGuard, optionalAuth } from "../../middleware/auth";
import type { ApiResponse, PostDTO, PaginatedResponse } from "shared/types";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export const postRoutes = new Elysia({ prefix: "/posts" })

  // ─── GET /posts — Public Feed (with optional auth for isLiked) ──────
  .use(optionalAuth)
  .get(
    "/",
    async ({ request, query, user }) => {
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 20;
      const skip = (page - 1) * limit;

      const [posts, total] = await Promise.all([
        prisma.post.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            creator: {
              select: {
                id: true,
                email: true,
                username: true,
                avatarUrl: true,
                createdAt: true,
              },
            },
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
            likes: user
              ? {
                  where: { userId: user.id },
                  select: { id: true },
                }
              : false,
          },
        }),
        prisma.post.count(),
      ]);

      const data: PostDTO[] = posts.map((post: any) => ({
        id: post.id,
        imageUrl: post.imageUrl,
        caption: post.caption,
        creator: {
          ...post.creator,
          createdAt: post.creator.createdAt.toISOString(),
        },
        likeCount: post._count.likes,
        commentCount: post._count.comments,
        isLiked: user ? post.likes.length > 0 : false,
        createdAt: post.createdAt.toISOString(),
      }));

      return {
        success: true,
        message: "Feed berhasil diambil",
        data,
        meta: {
          page,
          limit,
          total,
          hasNext: skip + limit < total,
        },
      };
    }
  )

  // ─── GET /posts/:id — Post Detail ──────────────────────────────────
  .get(
    "/:id",
    async ({ params: { id }, user, set }) => {
      const post = await prisma.post.findUnique({
        where: { id },
        include: {
          creator: {
            select: {
              id: true,
              email: true,
              username: true,
              avatarUrl: true,
              createdAt: true,
            },
          },
          comments: {
            orderBy: { createdAt: "desc" },
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  username: true,
                  avatarUrl: true,
                  createdAt: true,
                },
              },
              replies: {
                orderBy: { createdAt: "asc" },
                include: {
                  user: {
                    select: {
                      id: true,
                      email: true,
                      username: true,
                      avatarUrl: true,
                      createdAt: true,
                    },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
          likes: user
            ? {
                where: { userId: user.id },
                select: { id: true },
              }
            : false,
        },
      });

      if (!post) {
        set.status = 404;
        return { success: false, message: "Post tidak ditemukan" };
      }

      return {
        success: true,
        message: "Detail post berhasil diambil",
        data: {
          id: post.id,
          imageUrl: post.imageUrl,
          caption: post.caption,
          creator: {
            ...post.creator,
            createdAt: post.creator.createdAt.toISOString(),
          },
          likeCount: post._count.likes,
          commentCount: post._count.comments,
          isLiked: user ? post.likes.length > 0 : false,
          createdAt: post.createdAt.toISOString(),
          comments: post.comments.map((comment: any) => ({
            id: comment.id,
            content: comment.content,
            user: {
              ...comment.user,
              createdAt: comment.user.createdAt.toISOString(),
            },
            replies: comment.replies.map((r: any) => ({
              id: r.id,
              content: r.content,
              user: {
                ...r.user,
                createdAt: r.user.createdAt.toISOString(),
              },
              createdAt: r.createdAt.toISOString(),
            })),
            createdAt: comment.createdAt.toISOString(),
          })),
        },
      };
    }
  )

  // ─── POST /posts — Create Post ─────────────────────────────────────
  .use(authGuard)
  .post(
    "/",
    async ({ user, body, set }) => {
      // Enforce max 2 posts per user
      const postCount = await prisma.post.count({
        where: { creatorId: user.id },
      });

      if (postCount >= 2) {
        set.status = 403;
        return {
          success: false,
          message: "Maksimal 2 postingan per user",
        };
      }

      const { image, caption } = body as any;

      if (!image || !(image instanceof File)) {
        set.status = 400;
        return {
          success: false,
          message: "File gambar wajib diunggah",
        };
      }

      if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
        set.status = 400;
        return {
          success: false,
          message: "File harus berupa gambar JPG, PNG, WEBP, atau GIF",
        };
      }

      if (caption && caption.length > 500) {
        set.status = 400;
        return {
          success: false,
          message: "Caption maksimal 500 karakter",
        };
      }

      let imageUrl: string;

      try {
        const uploaded = await uploadImageToCloudinary(image);
        imageUrl = uploaded.imageUrl;
      } catch (error) {
        set.status = 500;
        return {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Gagal upload gambar ke Cloudinary",
        };
      }

      const post = await prisma.post.create({
        data: {
          imageUrl,
          caption: caption?.trim() || null,
          creatorId: user.id,
        },
        include: {
          creator: {
            select: {
              id: true,
              email: true,
              username: true,
              avatarUrl: true,
              createdAt: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Post berhasil dibuat",
        data: {
          id: post.id,
          imageUrl: post.imageUrl,
          caption: post.caption,
          creator: {
            ...post.creator,
            createdAt: post.creator.createdAt.toISOString(),
          },
          likeCount: 0,
          commentCount: 0,
          isLiked: false,
          createdAt: post.createdAt.toISOString(),
        },
      };
    }
  )

  // ─── PATCH /posts/:id — Edit Caption ───────────────────────────────
  .patch(
    "/:id",
    async ({ params: { id }, user, body, set }) => {
      const post = await prisma.post.findUnique({ where: { id } });

      if (!post) {
        set.status = 404;
        return { success: false, message: "Post tidak ditemukan" };
      }

      if (post.creatorId !== user.id) {
        set.status = 403;
        return { success: false, message: "Tidak memiliki akses" };
      }

      const { caption } = body as any;

      if (caption && caption.length > 500) {
        set.status = 400;
        return { success: false, message: "Caption maksimal 500 karakter" };
      }

      const updated = await prisma.post.update({
        where: { id },
        data: { caption: caption?.trim() || null },
      });

      return {
        success: true,
        message: "Post berhasil diperbarui",
        data: {
          id: updated.id,
          imageUrl: updated.imageUrl,
          caption: updated.caption,
          createdAt: updated.createdAt.toISOString(),
        },
      };
    }
  )

  // ─── DELETE /posts/:id — Delete Post ───────────────────────────────
  .delete(
    "/:id",
    async ({ params: { id }, user, set }) => {
      const post = await prisma.post.findUnique({ where: { id } });

      if (!post) {
        set.status = 404;
        return { success: false, message: "Post tidak ditemukan" };
      }

      if (post.creatorId !== user.id) {
        set.status = 403;
        return { success: false, message: "Tidak memiliki akses" };
      }

      try {
        await deleteImageFromCloudinary(post.imageUrl);
      } catch (error) {
        set.status = 500;
        return {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Gagal menghapus gambar dari Cloudinary",
        };
      }

      await prisma.post.delete({ where: { id } });

      return {
        success: true,
        message: "Post berhasil dihapus",
      };
    }
  );
