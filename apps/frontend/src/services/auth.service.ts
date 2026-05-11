// services/auth.service.ts — Authentication API calls
import { api } from "./api";
import type { ApiResponse, AuthResponse, UserDTO } from "shared/types";
import type { RegisterInput, LoginInput } from "shared/validators";

export const authService = {
  register: (data: RegisterInput) =>
    api.post<ApiResponse<AuthResponse>>("/auth/register", data),

  login: (data: LoginInput) =>
    api.post<ApiResponse<AuthResponse>>("/auth/login", data),

  logout: () =>
    api.post<ApiResponse>("/auth/logout"),

  getMe: () =>
    api.get<ApiResponse<UserDTO>>("/auth/me"),
};
