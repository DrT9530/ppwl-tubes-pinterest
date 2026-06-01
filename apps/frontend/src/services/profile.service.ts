// services/profile.service.ts — Profile API calls
import { api } from "./api";
import type { ApiResponse, UserDTO } from "shared/types";
import type { UpdateProfileInput, ChangePasswordInput } from "shared/validators";

export const profileService = {
  getProfile: (userId: string) =>
    api.get<ApiResponse<UserDTO & { postCount: number; followerCount: number; followingCount: number; isFollowed: boolean }>>(`/users/${userId}`),

  updateProfile: (data: UpdateProfileInput) =>
    api.patch<ApiResponse<UserDTO>>("/users/me", data),

  updateAvatar: async (file: File) => {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    return api.patch<ApiResponse<UserDTO>>("/users/me/avatar", { imageBase64: base64 });
  },

  changePassword: (data: ChangePasswordInput) =>
    api.patch<ApiResponse>("/users/me/password", data),

  followUser: (userId: string) =>
    api.post<ApiResponse<{ isFollowed: boolean }>>(`/users/${userId}/follow`),
  unfollowUser: (userId: string) =>
    api.delete<ApiResponse<{ isFollowed: boolean }>>(`/users/${userId}/follow`),
  getFollowers: (id: string) => api.get<ApiResponse<UserDTO[]>>(`/users/${id}/followers`),
  getFollowing: (id: string) => api.get<ApiResponse<UserDTO[]>>(`/users/${id}/following`),
};
