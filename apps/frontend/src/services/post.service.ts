import { api } from "./api"; 
import type { PostDTO, PaginatedResponse } from "shared/types"; 

export const postService = {
  // Fungsi fetch feed dengan pagination
  getFeed: async (page = 1, limit = 20) => {
    const response = await api.get<PaginatedResponse<PostDTO>>("/posts", {
      params: { page, limit },
    });
    return response;
  },
};
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

  create: (data: { imageUrl: string; caption?: string }) =>
    api.post<ApiResponse<PostDTO>>("/posts", data),

  update: (id: string, data: { caption?: string }) =>
    api.patch<ApiResponse>(`/posts/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse>(`/posts/${id}`),
};
