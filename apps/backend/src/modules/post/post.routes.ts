// modules/post/post.routes.ts — Post endpoints (Feed + CRUD)
import { Hono } from "hono";
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
  .get(
    "/",
    optionalAuth,
    async (c) => {
      const page = Number(c.req.query("page")) || 1;
      const limit = Number(c.req.query("limit")) || 20;
      const skip = (page - 1) * limit;
      const user = c.get("user") as any;

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

      return c.json({
        success: true,
        message: "Feed berhasil diambil",
        data,
        meta: {
          page,
          limit,
          total,
          hasNext: skip + limit < total,
        },
      });
    }
  )

  // ─── GET /posts/:id — Post Detail ──────────────────────────────────
  .get(
    "/:id",
    optionalAuth,
    async (c) => {
      const id = c.req.param("id");
      const user = c.get("user") as any;

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
        return c.json({ success: false, message: "Post tidak ditemukan" }, 404);
      }

      return c.json({
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
          comments: post.comments.map((c: any) => ({
            id: c.id,
            content: c.content,
            user: {
              ...comment.user,
              createdAt: comment.user.createdAt.toISOString(),
            },
            replies: c.replies.map((r: any) => ({
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
      } satisfies ApiResponse<any>;
    },
    {
      params: t.Object({ id: t.String() }),
    }
  )

  // ─── POST /posts — Create Post ─────────────────────────────────────
  .post(
    "/",
    authGuard,
    async (c) => {
      const user = c.get("user") as any;
      const body = await c.req.json();
      
      // Enforce max 2 posts per user
      const postCount = await prisma.post.count({
        where: { creatorId: user.id },
      });

      if (postCount >= 2) {
        return c.json({
          success: false,
          message: "Maksimal 2 postingan per user",
        }, 403);
      }

      const { image, caption } = body;

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

      return c.json({
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
      } satisfies ApiResponse<PostDTO>;
    },
    {
      body: t.Object({
        image: t.File(),
        caption: t.Optional(t.String()),
      }),
    }
  )

  // ─── PATCH /posts/:id — Edit Caption ───────────────────────────────
  .patch(
    "/:id",
    authGuard,
    async (c) => {
      const id = c.req.param("id");
      const user = c.get("user") as any;
      const body = await c.req.json();
      
      const post = await prisma.post.findUnique({ where: { id } });

      if (!post) {
        return c.json({ success: false, message: "Post tidak ditemukan" }, 404);
      }

      if (post.creatorId !== user.id) {
        return c.json({ success: false, message: "Tidak memiliki akses" }, 403);
      }

      if (body.caption && body.caption.length > 500) {
        set.status = 400;
        return { success: false, message: "Caption maksimal 500 karakter" };
      }

      const updated = await prisma.post.update({
        where: { id },
        data: { caption: body.caption?.trim() || null },
      });

      return c.json({
        success: true,
        message: "Post berhasil diperbarui",
        data: {
          id: updated.id,
          imageUrl: updated.imageUrl,
          caption: updated.caption,
          createdAt: updated.createdAt.toISOString(),
        },
      } satisfies ApiResponse<any>;
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({ caption: t.Optional(t.String()) }),
    }
  )

  // ─── DELETE /posts/:id — Delete Post ───────────────────────────────
  .delete(
    "/:id",
    authGuard,
    async (c) => {
      const id = c.req.param("id");
      const user = c.get("user") as any;
      
      const post = await prisma.post.findUnique({ where: { id } });

      if (!post) {
        return c.json({ success: false, message: "Post tidak ditemukan" }, 404);
      }

      if (post.creatorId !== user.id) {
        return c.json({ success: false, message: "Tidak memiliki akses" }, 403);
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

      return c.json({
        success: true,
        message: "Post berhasil dihapus",
      });
    }
  );
