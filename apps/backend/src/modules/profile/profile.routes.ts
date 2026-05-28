// modules/profile/profile.routes.ts — User profile endpoints
import { Elysia, t } from "elysia";
import { hash, compare } from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { authGuard, optionalAuth } from "../../middleware/auth";
import { updateProfileSchema, changePasswordSchema } from "shared/validators";
import type { ApiResponse, UserDTO } from "shared/types";

export const profileRoutes = new Elysia({ prefix: "/users" })

  // ─── GET /users — List all users with secret key (Target #15) ────────
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
    async ({ params: { id }, set }) => {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          username: true,
          avatarUrl: true,
          createdAt: true,
          _count: {
            select: {
              posts: true,
            },
          },
        },
      });

      if (!user) {
        set.status = 404;
        return {
          success: false,
          message: "User tidak ditemukan",
        };
      }

      return {
        success: true,
        message: "Profil berhasil diambil",
        data: {
          id: user.id,
          email: user.email,
          username: user.username,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt.toISOString(),
          postCount: user._count.posts,
        },
      };
    },
    {
      params: t.Object({ id: t.String() }),
    }
  )

  // ─── Protected routes below ─────────────────────────────────────────
  .use(authGuard)

  // ─── PATCH /users/me — Update Profile ───────────────────────────────
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

      const { username, email } = parsed.data;

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
        },
        select: {
          id: true,
          email: true,
          username: true,
          avatarUrl: true,
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
      }),
    }
  )

  // ─── PATCH /users/me/avatar — Update Avatar ────────────────────────
  .patch(
    "/me/avatar",
    async ({ body, user, set }) => {
      // For now, accept avatarUrl directly
      // Later: integrate Cloudinary upload
      const { avatarUrl } = body;

      if (!avatarUrl) {
        set.status = 400;
        return { success: false, message: "Avatar URL wajib diisi" };
      }

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { avatarUrl },
        select: {
          id: true,
          email: true,
          username: true,
          avatarUrl: true,
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
        avatarUrl: t.String(),
      }),
    }
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
