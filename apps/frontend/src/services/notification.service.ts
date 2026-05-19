import { api } from "./api";
import type { ApiResponse, NotificationDTO } from "shared/types";

export const notificationService = {
  getAll: () =>
    api.get<ApiResponse<NotificationDTO[]>>("/notifications"),

  getUnreadCount: () =>
    api.get<ApiResponse<{ count: number }>>("/notifications/unread-count"),

  markAllRead: () =>
    api.patch<ApiResponse<undefined>>("/notifications/read", {}),

  markOneRead: (id: string) =>
    api.patch<ApiResponse<undefined>>(`/notifications/${id}/read`, {}),
};
