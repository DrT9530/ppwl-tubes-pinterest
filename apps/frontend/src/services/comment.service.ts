import { api } from "./api";
import type { ApiResponse, CommentDTO, ReplyDTO } from "shared/types";

export const commentService = {
  createComment: (postId: string, content: string, image?: File, stickerUrl?: string) => {
    if (image) {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("image", image);
      return api.upload<ApiResponse<CommentDTO>>(`/posts/${postId}/comments`, formData);
    }
    return api.post<ApiResponse<CommentDTO>>(`/posts/${postId}/comments`, { content, stickerUrl });
  },

  createReply: (commentId: string, content: string, image?: File, stickerUrl?: string) => {
    if (image) {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("image", image);
      return api.upload<ApiResponse<ReplyDTO>>(`/comments/${commentId}/reply`, formData);
    }
    return api.post<ApiResponse<ReplyDTO>>(`/comments/${commentId}/reply`, { content, stickerUrl });
  },

  likeComment: (commentId: string) => {
    return api.post<ApiResponse<void>>(`/comments/${commentId}/like`);
  },

  unlikeComment: (commentId: string) => {
    return api.delete<ApiResponse<void>>(`/comments/${commentId}/like`);
  },

  editComment: (commentId: string, content: string) => {
    return api.put<ApiResponse<CommentDTO>>(`/comments/${commentId}`, { content });
  },

  deleteComment: (commentId: string) => {
    return api.delete<ApiResponse<void>>(`/comments/${commentId}`);
  },

  highlightComment: (commentId: string) => {
    return api.put<ApiResponse<{ isHighlighted: boolean }>>(`/comments/${commentId}/highlight`);
  },

  likeReply: (replyId: string) => {
    return api.post<ApiResponse<void>>(`/replies/${replyId}/like`);
  },

  unlikeReply: (replyId: string) => {
    return api.delete<ApiResponse<void>>(`/replies/${replyId}/like`);
  },

  editReply: (replyId: string, content: string) => {
    return api.put<ApiResponse<ReplyDTO>>(`/replies/${replyId}`, { content });
  },

  deleteReply: (replyId: string) => {
    return api.delete<ApiResponse<void>>(`/replies/${replyId}`);
  },
};