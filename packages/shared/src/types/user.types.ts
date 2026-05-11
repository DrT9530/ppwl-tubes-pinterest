// user.types.ts — User DTO
export interface UserDTO {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface AuthResponse {
  user: UserDTO;
  token: string;
}
