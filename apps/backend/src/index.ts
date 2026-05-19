import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { authRoutes } from "./modules/auth";
import { profileRoutes } from "./modules/profile";
import { postRoutes } from "./modules/post"; // Import rute post milik Bila
import { commentRoutes } from "./modules/comment"; // [cite: 234]

const PORT = process.env.PORT || 3000;

const app = new Elysia()
  .use(cors())
  .use(authRoutes)
  .use(profileRoutes)
  .use(postRoutes) // Mendaftarkan route posts ke server utama
  .use(commentRoutes) // Mendaftarkan route milik Evelyn[cite: 232, 418]
  .listen(PORT);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);