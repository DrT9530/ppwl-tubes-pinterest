// post.types.ts — Post DTO
import type { UserDTO } from "./user.types";

export interface PostDTO {
  id: string;
  imageUrl: string;
  caption: string | null;
  creator: UserDTO;
  likeCount: number;
  commentCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  createdAt: string;
}
