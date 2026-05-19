// middleware/auth.ts — JWT authentication middleware (Hono)
import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";
import { getCookie } from "hono/cookie";
import { prisma } from "../lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";

/**
 * Auth guard middleware — derives `user` from JWT token.
 * Extracts token from Authorization header or cookie.
 */
export const authGuard = createMiddleware(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  const cookieToken = getCookie(c, "auth_token");
  const token = authHeader?.replace("Bearer ", "") || cookieToken;

  if (!token) {
    return c.json({ success: false, message: "Unauthorized — silakan login terlebih dahulu" }, 401);
  }

  try {
    const payload = await verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        username: true,
        avatarUrl: true,
        provider: true,
        createdAt: true,
      },
    });

    if (!user) {
      return c.json({ success: false, message: "Unauthorized — silakan login terlebih dahulu" }, 401);
    }

    c.set("user", user);
    await next();
  } catch {
    return c.json({ success: false, message: "Unauthorized — silakan login terlebih dahulu" }, 401);
  }
});

/**
 * Optional auth — derives `user` if token exists, but doesn't block.
 * Used for public routes where auth data is optionally needed (e.g., checking isLiked).
 */
export const optionalAuth = createMiddleware(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  const cookieToken = getCookie(c, "auth_token");
  const token = authHeader?.replace("Bearer ", "") || cookieToken;

  if (!token) {
    c.set("user", null);
    await next();
    return;
  }

  try {
    const payload = await verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        username: true,
        avatarUrl: true,
        provider: true,
        createdAt: true,
      },
    });
    c.set("user", user || null);
  } catch {
    c.set("user", null);
  }
  await next();
});
