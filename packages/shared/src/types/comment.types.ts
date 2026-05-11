// comment.types.ts — Comment & Reply DTO
import type { UserDTO } from "./user.types";

export interface CommentDTO {
  id: string;
  content: string;
  user: UserDTO;
  replies: ReplyDTO[];
  createdAt: string;
}

export interface ReplyDTO {
  id: string;
  content: string;
  user: UserDTO;
  createdAt: string;
}
