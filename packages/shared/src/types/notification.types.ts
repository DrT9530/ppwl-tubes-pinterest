// notification.types.ts — Notification DTO
import type { UserDTO } from "./user.types";

export interface NotificationDTO {
  id: string;
  type: "LIKE" | "COMMENT" | "REPLY" | "COMMENT_LIKE" | "FOLLOW";
  actor: UserDTO;
  postId: string;
  read: boolean;
  createdAt: string;
}
