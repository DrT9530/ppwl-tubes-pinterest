// validators/comment.schema.ts
import { z } from "zod";

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Komentar tidak boleh kosong")
    .max(500, "Komentar maksimal 500 karakter"),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
