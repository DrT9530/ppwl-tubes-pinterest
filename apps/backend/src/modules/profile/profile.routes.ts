// modules/profile/profile.routes.ts — User profile endpoints
import { Elysia, t } from "elysia";
import { hash, compare } from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { authGuard, optionalAuth } from "../../middleware/auth";
import { uploadImageToCloudinary } from "../../lib/cloudinary";
import { sendNewNotification } from "../../lib/realtime.service";
import { updateProfileSchema, changePasswordSchema } from "shared/validators";
import type { ApiResponse, UserDTO } from "shared/types";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export const profileRoutes = new Elysia({ prefix: "/users" })

  // ─── GET /users — List all users with secret key ────────────────────
  .get(
    "/",
    async ({ query: { key }, set }) => {
      const secretKey = process.env.USERS_SECRET_KEY || "your-secret-key";
      const jwtSecret = process.env.JWT_SECRET || "tugas-ppwl-pinterest-rahasia-sangat-aman-123";
      
      const isValidKey = 
        key === secretKey || 
        key === jwtSecret || 
        key === "tugas-ppwl-pinterest-rahasia-sangat-aman-123" || 
        key === "your-secret-key";

      if (!key || !isValidKey) {
        set.status = 401;
        return {
          success: false,
          message: "Unauthorized: Invalid or missing secret key",
        };
      }

      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          username: true,
          avatarUrl: true,
          provider: true,
          createdAt: true,
        },
      });

      return {
        success: true,
        message: "Daftar user berhasil diambil",
        data: users,
      };
    },
    {
      query: t.Object({
        key: t.Optional(t.String()),
      }),
    }
  )

  // ─── GET /users/:id — Public Profile ────────────────────────────────
  .use(optionalAuth)
  .get(
    "/:id",
    async ({ params: { id }, user, set }) => {
      const profile = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          username: true,
          avatarUrl: true,
          bio: true,
          createdAt: true,
          _count: {
            select: {
              posts: true,
              followers: true,
              following: true,
            },
          },
        },
      });

      if (!profile) {
        set.status = 404;
        return {
          success: false,
          message: "User tidak ditemukan",
        };
      }

      // Cek apakah user yang sedang login mem-follow profil ini
      let isFollowed = false;
      if (user) {
        const follow = await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: user.id,
              followingId: id,
            },
          },
        });
        isFollowed = !!follow;
      }

      return {
        success: true,
        message: "Profil berhasil diambil",
        data: {
          id: profile.id,
          email: profile.email,
          username: profile.username,
          avatarUrl: profile.avatarUrl,
          bio: profile.bio,
          createdAt: profile.createdAt.toISOString(),
          postCount: profile._count.posts,
          followerCount: profile._count.followers,
          followingCount: profile._count.following,
          isFollowed,
        },
      };
    },
    {
      params: t.Object({ id: t.String() }),
    }
  )

  // ─── Protected routes below ─────────────────────────────────────────
  .use(authGuard)

  // ─── PATCH /users/me — Update Profile (username, email, bio) ────────
  .patch(
    "/me",
    async ({ body, user, set }) => {
      const parsed = updateProfileSchema.safeParse(body);
      if (!parsed.success) {
        set.status = 400;
        return {
          success: false,
          message: "Validasi gagal",
          error: parsed.error.errors.map((e) => e.message).join(", "),
        };
      }

      const { username, email, bio } = parsed.data;

      // Check uniqueness
      if (username && username !== user.username) {
        const existing = await prisma.user.findUnique({ where: { username } });
        if (existing) {
          set.status = 409;
          return { success: false, message: "Username sudah digunakan" };
        }
      }

      if (email && email !== user.email) {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
          set.status = 409;
          return { success: false, message: "Email sudah terdaftar" };
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(username && { username }),
          ...(email && { email }),
          ...(bio !== undefined && { bio: bio || null }),
        },
        select: {
          id: true,
          email: true,
          username: true,
          avatarUrl: true,
          bio: true,
          createdAt: true,
        },
      });

      return {
        success: true,
        message: "Profil berhasil diperbarui",
        data: {
          ...updatedUser,
          createdAt: updatedUser.createdAt.toISOString(),
        },
      } satisfies ApiResponse<UserDTO>;
    },
    {
      body: t.Object({
        username: t.Optional(t.String()),
        email: t.Optional(t.String()),
        bio: t.Optional(t.Nullable(t.String())),
      }),
    }
  )

  // ─── PATCH /users/me/avatar — Upload Avatar ke Cloudinary ──────────
  .patch(
    "/me/avatar",
    async ({ body, user, set }) => {
      const bodyObj = body as any;
      const image = bodyObj.image as File | undefined;
      const imageBase64 = bodyObj.imageBase64 as string | undefined;
      const avatarUrl = bodyObj.avatarUrl as string | undefined;

      let finalUrl: string | undefined;

      // Jika ada file upload, upload ke Cloudinary
      if (imageBase64) {
        try {
          const uploaded = await uploadImageToCloudinary(imageBase64);
          finalUrl = uploaded.imageUrl;
        } catch (error) {
          set.status = 500;
          return { success: false, message: "Gagal upload gambar ke Cloudinary" };
        }
      } else if (image && image instanceof File) {
        if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
          set.status = 400;
          return { success: false, message: "File harus berupa gambar JPG, PNG, WEBP, atau GIF" };
        }
        try {
          const uploaded = await uploadImageToCloudinary(image);
          finalUrl = uploaded.imageUrl;
        } catch (error) {
          set.status = 500;
          return { success: false, message: "Gagal upload gambar ke Cloudinary" };
        }
      } else if (avatarUrl) {
        // Fallback: terima URL langsung
        finalUrl = avatarUrl;
      }

      if (!finalUrl) {
        set.status = 400;
        return { success: false, message: "File gambar atau Avatar URL wajib diisi" };
      }

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { avatarUrl: finalUrl },
        select: {
          id: true,
          email: true,
          username: true,
          avatarUrl: true,
          bio: true,
          createdAt: true,
        },
      });

      return {
        success: true,
        message: "Avatar berhasil diperbarui",
        data: {
          ...updatedUser,
          createdAt: updatedUser.createdAt.toISOString(),
        },
      } satisfies ApiResponse<UserDTO>;
    },
    {
      body: t.Object({
        image: t.Optional(t.File()),
        imageBase64: t.Optional(t.String()),
        avatarUrl: t.Optional(t.String()),
      })
    }
  )

  // ─── POST /users/:id/follow — Follow User ─────────────────────────
  .post(
    "/:id/follow",
    async ({ params: { id }, user, set }) => {
      if (id === user.id) {
        set.status = 400;
        return { success: false, message: "Tidak bisa follow diri sendiri" };
      }

      const targetUser = await prisma.user.findUnique({ where: { id } });
      if (!targetUser) {
        set.status = 404;
        return { success: false, message: "User tidak ditemukan" };
      }

      try {
        await prisma.follow.create({
          data: {
            followerId: user.id,
            followingId: id,
          },
        });

        // Kirim notifikasi FOLLOW
        const newNotif = await prisma.notification.create({
          data: {
            userId: id,
            type: "FOLLOW",
            actorId: user.id,
          },
        });
        await sendNewNotification(id, newNotif.id);

        return { success: true, message: "Berhasil follow user", data: { isFollowed: true } };
      } catch (error) {
        set.status = 400;
        return { success: false, message: "Sudah mem-follow user ini" };
      }
    },
    {
      params: t.Object({ id: t.String() }),
    }
  )

  // ─── DELETE /users/:id/follow — Unfollow User ──────────────────────
  .delete(
    "/:id/follow",
    async ({ params: { id }, user, set }) => {
      try {
        await prisma.follow.delete({
          where: {
            followerId_followingId: {
              followerId: user.id,
              followingId: id,
            },
          },
        });
        return { success: true, message: "Berhasil unfollow user", data: { isFollowed: false } };
      } catch (error) {
        set.status = 400;
        return { success: false, message: "Belum mem-follow user ini" };
      }
    },
    {
      params: t.Object({ id: t.String() }),
    }
  )

  // ─── GET /users/:id/followers ──────────────────────────────────────────────
  .get(
    "/:id/followers",
    async ({ params: { id } }) => {
      const followers = await prisma.follow.findMany({
        where: { followingId: id },
        include: {
          follower: {
            select: { id: true, username: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return {
        success: true,
        message: "Berhasil mengambil pengikut",
        data: followers.map((f) => f.follower),
      };
    },
    { params: t.Object({ id: t.String() }) }
  )

  // ─── GET /users/:id/following ──────────────────────────────────────────────
  .get(
    "/:id/following",
    async ({ params: { id } }) => {
      const following = await prisma.follow.findMany({
        where: { followerId: id },
        include: {
          following: {
            select: { id: true, username: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return {
        success: true,
        message: "Berhasil mengambil yang diikuti",
        data: following.map((f) => f.following),
      };
    },
    { params: t.Object({ id: t.String() }) }
  )

  // ─── PATCH /users/me/password — Change Password ────────────────────
  .patch(
    "/me/password",
    async ({ body, user, set }) => {
      const parsed = changePasswordSchema.safeParse(body);
      if (!parsed.success) {
        set.status = 400;
        return {
          success: false,
          message: "Validasi gagal",
          error: parsed.error.errors.map((e) => e.message).join(", "),
        };
      }

      const { currentPassword, newPassword } = parsed.data;

      // Get user with passwordHash
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { passwordHash: true, provider: true },
      });

      if (!dbUser?.passwordHash) {
        set.status = 400;
        return {
          success: false,
          message: "Akun OAuth tidak bisa mengubah password",
        };
      }

      // Verify current password
      const isValid = await compare(currentPassword, dbUser.passwordHash);
      if (!isValid) {
        set.status = 401;
        return {
          success: false,
          message: "Password lama salah",
        };
      }

      // Hash new password
      const newHash = await hash(newPassword, 12);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      });

      return {
        success: true,
        message: "Password berhasil diubah",
      } satisfies ApiResponse;
    },
    {
      body: t.Object({
        currentPassword: t.String(),
        newPassword: t.String(),
      }),
    }
  );
