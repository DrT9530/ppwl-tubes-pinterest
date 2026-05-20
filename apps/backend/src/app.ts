import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";

import { authRoutes } from "./modules/auth";
import { profileRoutes } from "./modules/profile";
import { postRoutes } from "./modules/post";
import { likeRoutes } from "./modules/like";
import { commentRoutes } from "./modules/comment";
import { notificationRoutes } from "./modules/notification";

export const app = new Elysia()
  .use(cors())
  .use(authRoutes)
  .use(profileRoutes)
  .use(postRoutes)
  .use(likeRoutes)
  .use(commentRoutes)
  .use(notificationRoutes);
