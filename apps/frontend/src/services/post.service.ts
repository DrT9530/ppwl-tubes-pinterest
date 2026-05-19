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

  create: (data: FormData) =>
    api.upload<ApiResponse<PostDTO>>("/posts", data),

  update: (id: string, data: { caption?: string }) =>
    api.patch<ApiResponse>(`/posts/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse>(`/posts/${id}`),

  addComment: (id: string, content: string) =>
    api.post<ApiResponse>(`/posts/${id}/comments`, { content }),
};
