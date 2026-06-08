// services/message.service.ts
import { api } from "./api";
import type { ApiResponse, UserDTO } from "shared/types";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string | null;
  sharedPostId: string | null;
  createdAt: string;
  sender: UserDTO;
  sharedPost: any | null; // Detailed post
}

export interface ConversationParticipant {
  id: string;
  userId: string;
  user: UserDTO;
  joinedAt: string;
}

export interface Conversation {
  id: string;
  createdAt: string;
  updatedAt: string;
  participants: ConversationParticipant[];
  messages: Message[];
}

export interface ConversationSummary {
  id: string;
  updatedAt: string;
  unreadCount: number;
  otherUser: UserDTO;
  lastMessage?: Message;
}

export const messageService = {
  searchUsers: (query: string) => 
    api.get<ApiResponse<UserDTO[]>>(`/messages/users/search?q=${encodeURIComponent(query)}`),
    
  getConversations: () =>
    api.get<ApiResponse<ConversationSummary[]>>("/messages/conversations"),

  getConversation: (id: string) =>
    api.get<ApiResponse<Conversation>>(`/messages/conversations/${id}`),

  createConversation: (targetUserId: string) =>
    api.post<ApiResponse<Conversation>>("/messages/conversations", { targetUserId }),

  sendMessage: (conversationId: string, payload: { content?: string; sharedPostId?: string }) =>
    api.post<ApiResponse<Message>>(`/messages/conversations/${conversationId}`, payload)
};
