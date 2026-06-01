// user.types.ts — User DTO
export interface UserDTO {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  bio?: string | null;
  followerCount?: number;
  followingCount?: number;
  isFollowed?: boolean;
  postCount?: number;
  createdAt: string;
}

export interface AuthResponse {
  user: UserDTO;
  token: string;
}
