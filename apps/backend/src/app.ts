import { Hono } from "hono";
import { cors } from "hono/cors";
import { authRoutes } from "./modules/auth";
import { profileRoutes } from "./modules/profile";
import { postRoutes } from "./modules/post";
import { likeRoutes } from "./modules/like";
import { notificationRoutes } from "./modules/notification";

export const app = new Hono()
  .use("*", cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "https://*.cloudfront.net",
    ],
    credentials: true,
  }))
  .get("/", (c) => c.json({ success: true, message: "Pinterest Clone API is running!" }))
  .route("/auth", authRoutes)
  .route("/users", profileRoutes)
  .route("/posts", postRoutes)
  .route("/posts", likeRoutes)
  .route("/notifications", notificationRoutes);
