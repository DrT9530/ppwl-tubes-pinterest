import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { authRoutes } from "./modules/auth";
import { profileRoutes } from "./modules/profile";
import { postRoutes } from "./modules/post"; // Import rute post milik Bila

const PORT = process.env.PORT || 3000;

const app = new Elysia()
  .use(cors())
  .use(authRoutes)
  .use(profileRoutes)
  .use(postRoutes) // Mendaftarkan route posts ke server utama
  .listen(PORT);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);