// middleware/auth.ts — JWT authentication middleware
import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { prisma } from "../lib/prisma";

export const jwtPlugin = new Elysia({ name: "jwt-plugin" }).use(
  jwt({
    name: "jwt",
    secret: process.env.JWT_SECRET || "dev-secret-key",
    exp: "7d",
  })
);

/**
 * Auth guard middleware — derives `user` from JWT token.
 * Extracts token from Authorization header or cookie.
 */
export const authGuard = (app: Elysia) => app
  .use(jwtPlugin)
  .derive(async ({ jwt, request, set }) => {
    // Try Authorization header first
    const authHeader = request.headers.get("Authorization");
    let token: string | undefined;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }

    // Fallback to cookie
    if (!token) {
      const cookieHeader = request.headers.get("Cookie");
      if (cookieHeader) {
        const cookies = Object.fromEntries(
          cookieHeader.split(";").map((c) => {
            const [key, ...val] = c.trim().split("=");
            return [key, val.join("=")];
          })
        );
        token = cookies["auth_token"];
      }
    }

    if (!token) {
      set.status = 401;
      return {
        user: null as any,
        userId: null as any,
      };
    }

    const payload = await jwt.verify(token);
    if (!payload || !payload.userId) {
      set.status = 401;
      return {
        user: null as any,
        userId: null as any,
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
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
      set.status = 401;
      return {
        user: null as any,
        userId: null as any,
      };
    }

    return {
      user,
      userId: user.id,
    };
  })
  .onBeforeHandle(({ user, set }) => {
    if (!user) {
      set.status = 401;
      return {
        success: false,
        message: "Unauthorized — silakan login terlebih dahulu",
      };
    }
  });

/**
 * Optional auth — derives `user` if token exists, but doesn't block.
 * Used for public routes where auth data is optionally needed (e.g., checking isLiked).
 */
export const optionalAuth = (app: Elysia) => app
  .use(jwtPlugin)
  .derive(async ({ jwt, request }) => {
    const authHeader = request.headers.get("Authorization");
    let token: string | undefined;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }

    if (!token) {
      const cookieHeader = request.headers.get("Cookie");
      if (cookieHeader) {
        const cookies = Object.fromEntries(
          cookieHeader.split(";").map((c) => {
            const [key, ...val] = c.trim().split("=");
            return [key, val.join("=")];
          })
        );
        token = cookies["auth_token"];
      }
    }

    if (!token) {
      return { user: null, userId: null };
    }

    const payload = await jwt.verify(token);
    if (!payload || !payload.userId) {
      return { user: null, userId: null };
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
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
      user: user || null,
      userId: user?.id || null,
    };
  });
