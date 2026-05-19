// modules/auth/auth.routes.ts — Versi Hono
import { Hono } from "hono";
import { sign, verify } from "hono/jwt";
import { setCookie, getCookie } from "hono/cookie";
import { hash, compare } from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { registerSchema, loginSchema } from "shared/validators";
import { google } from "../../lib/arctic";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";

export const authRoutes = new Hono()

  // POST /auth/register
  .post("/register", async (c) => {
    const body = await c.req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return c.json({ success: false, message: "Validasi gagal", error: parsed.error.errors.map(e => e.message).join(", ") }, 400);
    }

    const { email, username, password } = parsed.data;

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) return c.json({ success: false, message: "Email sudah terdaftar" }, 409);

    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) return c.json({ success: false, message: "Username sudah digunakan" }, 409);

    const passwordHash = await hash(password, 12);
    const user = await prisma.user.create({
      data: { email, username, passwordHash, provider: "EMAIL" },
      select: { id: true, email: true, username: true, avatarUrl: true, createdAt: true },
    });

    const token = await sign({ userId: user.id, exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 }, JWT_SECRET);

    setCookie(c, "auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return c.json({ success: true, message: "Registrasi berhasil", data: { user: { ...user, createdAt: user.createdAt.toISOString() }, token } }, 201);
  })

  // POST /auth/login
  .post("/login", async (c) => {
    const body = await c.req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return c.json({ success: false, message: "Validasi gagal" }, 400);
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, username: true, avatarUrl: true, passwordHash: true, provider: true, createdAt: true },
    });

    if (!user || !user.passwordHash) {
      return c.json({ success: false, message: "Email atau password salah" }, 401);
    }

    const passwordMatch = await compare(password, user.passwordHash);
    if (!passwordMatch) return c.json({ success: false, message: "Email atau password salah" }, 401);

    const token = await sign({ userId: user.id, exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 }, JWT_SECRET);

    setCookie(c, "auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return c.json({
      success: true,
      message: "Login berhasil",
      data: {
        user: { id: user.id, email: user.email, username: user.username, avatarUrl: user.avatarUrl, createdAt: user.createdAt.toISOString() },
        token,
      },
    });
  })

  // POST /auth/logout
  .post("/logout", (c) => {
    setCookie(c, "auth_token", "", { maxAge: 0, path: "/" });
    return c.json({ success: true, message: "Logout berhasil" });
  })

  // GET /auth/me
  .get("/me", async (c) => {
    const authHeader = c.req.header("Authorization");
    const cookieToken = getCookie(c, "auth_token");
    const token = authHeader?.replace("Bearer ", "") || cookieToken;

    if (!token) return c.json({ success: false, message: "Unauthorized" }, 401);

    try {
      const payload = await verify(token, JWT_SECRET) as { userId: string };
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true, username: true, avatarUrl: true, createdAt: true },
      });
      if (!user) return c.json({ success: false, message: "User tidak ditemukan" }, 404);
      return c.json({ success: true, message: "OK", data: { ...user, createdAt: user.createdAt.toISOString() } });
    } catch {
      return c.json({ success: false, message: "Token tidak valid" }, 401);
    }
  })

  // GET /auth/google — Redirect ke Google OAuth
  .get("/google", async (c) => {
    const callbackUrl = `${process.env.BACKEND_URL || "http://localhost:3000"}/auth/google/callback`;
    return c.redirect("https://accounts.google.com/...");
  });
