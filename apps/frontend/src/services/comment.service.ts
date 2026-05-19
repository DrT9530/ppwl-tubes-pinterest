import api from "./api"; // [cite: 294]
import type { ApiResponse, CommentDTO, ReplyDTO } from "shared/types"; // [cite: 316, 321]

export const commentService = {
  createComment: (postId: string, content: string) =>
    api.post<ApiResponse<CommentDTO>>(`/posts/${postId}/comments`, { content }), // [cite: 306]

  createReply: (commentId: string, content: string) =>
    api.post<ApiResponse<ReplyDTO>>(`/comments/${commentId}/reply`, { content }), // [cite: 306]
};