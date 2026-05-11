// services/profile.service.ts — Profile API calls
import { api } from "./api";
import type { ApiResponse, UserDTO } from "shared/types";
import type { UpdateProfileInput, ChangePasswordInput } from "shared/validators";

export const profileService = {
  getProfile: (userId: string) =>
    api.get<ApiResponse<UserDTO & { postCount: number }>>(`/users/${userId}`),

  updateProfile: (data: UpdateProfileInput) =>
    api.patch<ApiResponse<UserDTO>>("/users/me", data),

  updateAvatar: (avatarUrl: string) =>
    api.patch<ApiResponse<UserDTO>>("/users/me/avatar", { avatarUrl }),

  changePassword: (data: ChangePasswordInput) =>
    api.patch<ApiResponse>("/users/me/password", data),
};
