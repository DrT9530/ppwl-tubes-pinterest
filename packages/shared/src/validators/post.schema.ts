// validators/post.schema.ts
import { z } from "zod";

export const createPostSchema = z.object({
  caption: z.string().max(500, "Caption maksimal 500 karakter").optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
