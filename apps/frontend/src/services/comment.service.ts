import { api } from "./api";
import type { ApiResponse, CommentDTO, ReplyDTO } from "shared/types";

export const commentService = {
  createComment: async (postId: string, content: string, image?: File, stickerUrl?: string) => {
    let imageBase64: string | undefined;
    if (image) {
      imageBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(image);
      });
    }
    return api.post<ApiResponse<CommentDTO>>(`/posts/${postId}/comments`, { content, stickerUrl, imageBase64 });
  },

  createReply: async (commentId: string, content: string, image?: File, stickerUrl?: string) => {
    let imageBase64: string | undefined;
    if (image) {
      imageBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(image);
      });
    }
    return api.post<ApiResponse<ReplyDTO>>(`/comments/${commentId}/reply`, { content, stickerUrl, imageBase64 });
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