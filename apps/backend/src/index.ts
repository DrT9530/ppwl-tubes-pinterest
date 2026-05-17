// src/index.ts — Backend entry point
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { authRoutes } from "./modules/auth";
import { profileRoutes } from "./modules/profile";
import { postRoutes } from "./modules/post";

const PORT = process.env.PORT || 3000;

const app = new Elysia()
  // ─── Global Plugins ──────────────────────────────────────────────
  .use(
    cors({
      origin: ["http://localhost:5173", "http://localhost:4173"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  )

  // ─── Global Error Handler ────────────────────────────────────────
  .onError(({ error, set }) => {
    console.error("❌ Server Error:", error);

    if ("status" in error) {
      set.status = (error as any).status;
    } else {
      set.status = 500;
    }

    return {
      success: false,
      message: error.message || "Internal server error",
    };
  })

  // ─── Health Check ────────────────────────────────────────────────
  .get("/", () => ({
    success: true,
    message: "📌 Pinterest Clone API is running",
    timestamp: new Date().toISOString(),
  }))

  // ─── Feature Routes ──────────────────────────────────────────────
  .use(authRoutes)
  .use(profileRoutes)
  .use(postRoutes)

  // ─── Start Server ────────────────────────────────────────────────
  .listen(PORT);

console.log(`
  ╔══════════════════════════════════════════╗
  ║   📌 Pinterest Clone API                ║
  ║   Running on http://localhost:${PORT}       ║
  ║   Environment: ${process.env.NODE_ENV || "development"}          ║
  ╚══════════════════════════════════════════╝
`);

export type App = typeof app;
