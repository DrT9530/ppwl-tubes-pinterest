// modules/auth/auth.routes.ts — Authentication endpoints
import { Elysia, t } from "elysia";
import { hash, compare } from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { jwtPlugin, authGuard } from "../../middleware/auth";
import { registerSchema, loginSchema } from "shared/validators";
import type { ApiResponse, AuthResponse, UserDTO } from "shared/types";
import { generateState, generateCodeVerifier } from "arctic";
import { google } from "../../lib/arctic";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .use(jwtPlugin)

  // ─── POST /auth/register ───────────────────────────────────────────
  .post(
    "/register",
    async ({ body, jwt, set, cookie: { auth_token } }) => {
      // Validate input
      const parsed = registerSchema.safeParse(body);
      if (!parsed.success) {
        set.status = 400;
        return {
          success: false,
          message: "Validasi gagal",
          error: parsed.error.errors.map((e) => e.message).join(", "),
        };
      }

      const { email, username, password } = parsed.data;

      // Check if email already exists
      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail) {
        set.status = 409;
        return {
          success: false,
          message: "Email sudah terdaftar",
        };
      }

      // Check if username already exists
      const existingUsername = await prisma.user.findUnique({ where: { username } });
      if (existingUsername) {
        set.status = 409;
        return {
          success: false,
          message: "Username sudah digunakan",
        };
      }

      // Hash password
      const passwordHash = await hash(password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          username,
          passwordHash,
          provider: "EMAIL",
        },
        select: {
          id: true,
          email: true,
          username: true,
          avatarUrl: true,
          createdAt: true,
        },
      });

      // Generate JWT
      const token = await jwt.sign({ userId: user.id });

      // Set cookie
      auth_token.set({
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });

      set.status = 201;
      return {
        success: true,
        message: "Registrasi berhasil",
        data: {
          user: {
            ...user,
            createdAt: user.createdAt.toISOString(),
          },
          token,
        },
      } satisfies ApiResponse<AuthResponse>;
    },
    {
      body: t.Object({
        email: t.String(),
        username: t.String(),
        password: t.String(),
      }),
    }
  )

  // ─── POST /auth/login ──────────────────────────────────────────────
  .post(
    "/login",
    async ({ body, jwt, set, cookie: { auth_token } }) => {
      // Validate input
      const parsed = loginSchema.safeParse(body);
      if (!parsed.success) {
        set.status = 400;
        return {
          success: false,
          message: "Validasi gagal",
          error: parsed.error.errors.map((e) => e.message).join(", "),
        };
      }

      const { email, password } = parsed.data;

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          username: true,
          avatarUrl: true,
          passwordHash: true,
          provider: true,
          createdAt: true,
        },
      });

      if (!user) {
        set.status = 401;
        return {
          success: false,
          message: "Email atau password salah",
        };
      }

      // Check if user uses OAuth (no password)
      if (!user.passwordHash) {
        set.status = 401;
        return {
          success: false,
          message: "Akun ini menggunakan Google OAuth. Silakan login via Google.",
        };
      }

      // Compare password
      const passwordMatch = await compare(password, user.passwordHash);
      if (!passwordMatch) {
        set.status = 401;
        return {
          success: false,
          message: "Email atau password salah",
        };
      }

      // Generate JWT
      const token = await jwt.sign({ userId: user.id });

      // Set cookie
      auth_token.set({
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      });

      return {
        success: true,
        message: "Login berhasil",
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            avatarUrl: user.avatarUrl,
            createdAt: user.createdAt.toISOString(),
          },
          token,
        },
      } satisfies ApiResponse<AuthResponse>;
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
    }
  )

  // ─── GET /auth/google ──────────────────────────────────────────────
  .get("/google", async ({ cookie: { oauth_state, oauth_code_verifier }, redirect }) => {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    
    const url = google.createAuthorizationURL(state, codeVerifier, [
      "profile",
      "email"
    ]);

    oauth_state.set({
      value: state,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 10 // 10 minutes
    });

    oauth_code_verifier.set({
      value: codeVerifier,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 10
    });

    return redirect(url.toString());
  })

  // ─── GET /auth/google/callback ─────────────────────────────────────
  .get("/google/callback", async ({ query, cookie: { oauth_state, oauth_code_verifier, auth_token }, jwt, set, redirect }) => {
    const code = query.code;
    const state = query.state;
    const storedState = oauth_state?.value;
    const storedCodeVerifier = oauth_code_verifier?.value;

    if (!code || !state || !storedState || !storedCodeVerifier || state !== storedState) {
      set.status = 400;
      return { success: false, message: "Invalid request or expired session" };
    }

    try {
      const tokens = await google.validateAuthorizationCode(code, storedCodeVerifier);
      
      const googleUserResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
        headers: {
          Authorization: `Bearer ${tokens.accessToken()}`
        }
      });
      const googleUser = await googleUserResponse.json();

      if (!googleUser.email) {
        set.status = 400;
        return { success: false, message: "No email provided from Google" };
      }

      // Find or create user
      let user = await prisma.user.findUnique({
        where: { email: googleUser.email }
      });

      if (!user) {
        // Create random unique username from email
        const baseUsername = googleUser.email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
        const uniqueSuffix = Math.random().toString(36).substring(2, 6);
        
        user = await prisma.user.create({
          data: {
            email: googleUser.email,
            username: `${baseUsername}${uniqueSuffix}`,
            provider: "GOOGLE",
            avatarUrl: googleUser.picture,
          }
        });
      }

      // Login user
      const token = await jwt.sign({ userId: user.id });

      auth_token.set({
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      });

      // Redirect back to frontend with token in URL so frontend can save it to localStorage
      const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
      return redirect(`${frontendUrl}/?token=${token}`);
    } catch (e) {
      console.error("Google OAuth error:", e);
      set.status = 500;
      return { success: false, message: "Internal server error during authentication" };
    }
  })

  // ─── POST /auth/logout ─────────────────────────────────────────────
  .use(authGuard)
  .post("/logout", ({ cookie: { auth_token } }) => {
    auth_token.set({
      value: "",
      httpOnly: true,
      maxAge: 0,
      path: "/",
    });

    return {
      success: true,
      message: "Logout berhasil",
    } satisfies ApiResponse;
  })

  // ─── GET /auth/me ──────────────────────────────────────────────────
  .get("/me", ({ user }) => {
    return {
      success: true,
      message: "Data user berhasil diambil",
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt.toISOString(),
      },
    } satisfies ApiResponse<UserDTO>;
  });
