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