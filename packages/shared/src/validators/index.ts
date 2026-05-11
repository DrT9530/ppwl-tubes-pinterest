// validators/index.ts
export { registerSchema, loginSchema } from "./auth.schema";
export type { RegisterInput, LoginInput } from "./auth.schema";

export { createPostSchema } from "./post.schema";
export type { CreatePostInput } from "./post.schema";

export { createCommentSchema } from "./comment.schema";
export type { CreateCommentInput } from "./comment.schema";

export { updateProfileSchema, changePasswordSchema } from "./profile.schema";
export type { UpdateProfileInput, ChangePasswordInput } from "./profile.schema";
