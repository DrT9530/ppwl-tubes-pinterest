// services/post.service.ts — Post API calls
import { api } from "./api";
import type { ApiResponse, PostDTO, PaginatedResponse } from "shared/types";

export const postService = {
  getFeed: (page = 1, limit = 20) =>
    api.get<PaginatedResponse<PostDTO>>("/posts", {
      params: { page, limit },
    }),

  getById: (id: string) =>
    api.get<ApiResponse<PostDTO & { comments: any[] }>>(`/posts/${id}`),

  getUploadSignature: () =>
    api.get<ApiResponse<{ signature: string; timestamp: number; apiKey: string; folder: string; cloudName: string }>>("/posts/upload-signature"),

  create: (data: { imageUrl: string; caption?: string }) =>
    api.post<ApiResponse<PostDTO>>("/posts", data),

  update: (id: string, data: { caption?: string; allowComments?: boolean }) =>
    api.patch<ApiResponse>(`/posts/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse>(`/posts/${id}`),

  addComment: (id: string, content: string) =>
    api.post<ApiResponse>(`/posts/${id}/comments`, { content }),

  getUserPosts: (userId: string) =>
    api.get<ApiResponse<PostDTO[]>>(`/posts/user/${userId}`),

  getSavedPosts: () =>
    api.get<ApiResponse<PostDTO[]>>(`/posts/saved`),

  toggleSave: (id: string) =>
    api.post<ApiResponse<{ isSaved: boolean }>>(`/posts/${id}/save`),
};
