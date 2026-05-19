// modules/profile/profile.routes.ts — User profile endpoints
import { Hono } from "hono";
import { hash, compare } from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { authGuard, optionalAuth } from "../../middleware/auth";
import { updateProfileSchema, changePasswordSchema } from "shared/validators";
import type { ApiResponse, UserDTO } from "shared/types";

export const profileRoutes = new Hono()

  // ─── GET /users/:id — Public Profile ────────────────────────────────
  .get(
    "/:id",
    optionalAuth,
    async (c) => {
      const id = c.req.param("id");
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
        return c.json({
          success: false,
          message: "User tidak ditemukan",
        }, 404);
      }

      return c.json({
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
      });
    }
  )

  // ─── Protected routes below ─────────────────────────────────────────

  // ─── PATCH /users/me — Update Profile ───────────────────────────────
  .patch(
    "/me",
    authGuard,
    async (c) => {
      const user = c.get("user") as any;
      const body = await c.req.json();
      const parsed = updateProfileSchema.safeParse(body);
      
      if (!parsed.success) {
        return c.json({
          success: false,
          message: "Validasi gagal",
          error: parsed.error.errors.map((e) => e.message).join(", "),
        }, 400);
      }

      const { username, email } = parsed.data;

      // Check uniqueness
      if (username && username !== user.username) {
        const existing = await prisma.user.findUnique({ where: { username } });
        if (existing) {
          return c.json({ success: false, message: "Username sudah digunakan" }, 409);
        }
      }

      if (email && email !== user.email) {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
          return c.json({ success: false, message: "Email sudah terdaftar" }, 409);
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

      return c.json({
        success: true,
        message: "Profil berhasil diperbarui",
        data: {
          ...updatedUser,
          createdAt: updatedUser.createdAt.toISOString(),
        },
      });
    }
  )

  // ─── PATCH /users/me/avatar — Update Avatar ────────────────────────
  .patch(
    "/me/avatar",
    authGuard,
    async (c) => {
      const user = c.get("user") as any;
      const body = await c.req.json();
      const { avatarUrl } = body;

      if (!avatarUrl) {
        return c.json({ success: false, message: "Avatar URL wajib diisi" }, 400);
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

      return c.json({
        success: true,
        message: "Avatar berhasil diperbarui",
        data: {
          ...updatedUser,
          createdAt: updatedUser.createdAt.toISOString(),
        },
      });
    }
  )

  // ─── PATCH /users/me/password — Change Password ────────────────────
  .patch(
    "/me/password",
    authGuard,
    async (c) => {
      const user = c.get("user") as any;
      const body = await c.req.json();
      const parsed = changePasswordSchema.safeParse(body);
      
      if (!parsed.success) {
        return c.json({
          success: false,
          message: "Validasi gagal",
          error: parsed.error.errors.map((e) => e.message).join(", "),
        }, 400);
      }

      const { currentPassword, newPassword } = parsed.data;

      // Get user with passwordHash
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { passwordHash: true, provider: true },
      });

      if (!dbUser?.passwordHash) {
        return c.json({
          success: false,
          message: "Akun OAuth tidak bisa mengubah password",
        }, 400);
      }

      // Verify current password
      const isValid = await compare(currentPassword, dbUser.passwordHash);
      if (!isValid) {
        return c.json({
          success: false,
          message: "Password lama salah",
        }, 401);
      }

      // Hash new password
      const newHash = await hash(newPassword, 12);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      });

      return c.json({
        success: true,
        message: "Password berhasil diubah",
      });
    }
  );
