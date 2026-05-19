import { api } from "./api";
import type { ApiResponse } from "shared/types";

interface LikeToggleResponse {
  liked: boolean;
  likeCount: number;
}

export const likeService = {
  toggle: (postId: string) =>
    api.post<ApiResponse<LikeToggleResponse>>(`/posts/${postId}/like`, {}),
};
