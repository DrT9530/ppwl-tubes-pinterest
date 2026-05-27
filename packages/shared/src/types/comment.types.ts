// comment.types.ts — Comment & Reply DTO
import type { UserDTO } from "./user.types";

export interface CommentDTO {
  id: string;
  content: string;
  imageUrl?: string;
  isHighlighted?: boolean;
  likeCount?: number;
  isLiked?: boolean;
  user: UserDTO;
  replies: ReplyDTO[];
  createdAt: string;
}

export interface ReplyDTO {
  id: string;
  content: string;
  imageUrl?: string;
  likeCount?: number;
  isLiked?: boolean;
  user: UserDTO;
  createdAt: string;
}
