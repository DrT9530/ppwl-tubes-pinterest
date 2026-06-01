// validators/profile.schema.ts
import { z } from "zod";

export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(20, "Username maksimal 20 karakter")
    .regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh huruf, angka, dan underscore")
    .optional(),
  email: z.string().email("Email tidak valid").optional(),
  bio: z.string().max(200, "Bio maksimal 200 karakter").optional().nullable(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Password lama wajib diisi"),
  newPassword: z.string().min(8, "Password baru minimal 8 karakter"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
