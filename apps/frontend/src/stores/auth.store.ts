// stores/auth.store.ts — Authentication state management
import { create } from "zustand";
import type { UserDTO } from "shared/types";
import { authService } from "../services/auth.service";
import type { RegisterInput, LoginInput } from "shared/validators";

interface AuthState {
  user: UserDTO | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  setUser: (user: UserDTO | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (data) => {
    const response = await authService.login(data);
    if (response.data) {
      // Store token in localStorage as fallback
      localStorage.setItem("auth_token", response.data.token);
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    }
  },

  register: async (data) => {
    const response = await authService.register(data);
    if (response.data) {
      localStorage.setItem("auth_token", response.data.token);
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore logout API errors
    } finally {
      localStorage.removeItem("auth_token");
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  fetchUser: async () => {
    try {
      set({ isLoading: true });
      const response = await authService.getMe();
      if (response.data) {
        set({
          user: response.data,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch {
      localStorage.removeItem("auth_token");
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
    });
  },
}));
