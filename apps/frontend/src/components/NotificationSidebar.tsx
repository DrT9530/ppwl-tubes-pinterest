import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { notificationService } from "../services/notification.service";
import { useNotificationStore } from "../stores/notification.store";
import type { NotificationDTO } from "shared/types";

export function NotificationSidebar({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const { reset } = useNotificationStore();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationService.getAll(),
  });

  const { mutate: markAllRead } = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  useEffect(() => {
    markAllRead();
  }, [markAllRead]);

  const notifications: NotificationDTO[] = data?.data ?? [];

  return (
    <div className="notif-panel-container">
      {/* Header */}
      <div className="notif-panel-header">
        <h2 className="notif-panel-title">Pembaruan</h2>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }} 
          className="notif-panel-close-btn"
          title="Tutup"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-[20px] h-[20px]" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div className="notif-panel-section-bar">
        <h3 className="notif-panel-section-title">Dilihat</h3>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={() => markAllRead()}
            className="notif-panel-mark-read-btn"
          >
            Tandai semua dibaca
          </button>
        )}
      </div>

      {/* List */}
      <div className="notif-panel-list scrollbar-hide">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-20 text-center text-[#767676]">
            <p className="text-[16px]">Belum ada pembaruan</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {notifications.map((notif) => (
              <NotifItem key={notif.id} notif={notif} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NotifItem({ notif }: { notif: NotificationDTO }) {
  const label: Record<string, string> = {
    LIKE: "menyukai Pin Anda.",
    COMMENT: "mengomentari Pin Anda.",
    REPLY: "membalas komentar Anda.",
    FOLLOW: "mulai mengikuti Anda.",
    COMMENT_LIKE: "menyukai komentar Anda.",
  };
  const labelText = label[notif.type] || "mengirim pembaruan.";

  return (
    <div
      className={`notif-item-container ${!notif.read ? "unread" : ""}`}
    >
      <div className="relative flex-shrink-0 mt-1">
        <img
          src={notif.actor?.avatarUrl ?? `https://ui-avatars.com/api/?name=${notif.actor?.username ?? "?"}&background=e60023&color=fff`}
          alt={notif.actor?.username}
          className="notif-item-avatar"
        />
        <span className="notif-item-badge">
          {notif.type === "LIKE" ? "❤️" : notif.type === "COMMENT" ? "💬" : notif.type === "FOLLOW" ? "👤" : "↩️"}
        </span>
      </div>

      <div className="notif-item-content">
        <p className="notif-item-text">
          <span className="notif-item-actor">{notif.actor?.username ?? "Seseorang"}</span>{" "}
          <span className="notif-item-label">{labelText}</span>
        </p>
        <p className="notif-item-time">
          {formatDistanceToNow(new Date(notif.createdAt), {
            addSuffix: true,
            locale: localeId,
          })}
        </p>
      </div>

      {(notif as any).post?.imageUrl && (
        <img
          src={(notif as any).post.imageUrl}
          alt="post"
          className="notif-item-thumbnail"
        />
      )}

      {!notif.read && (
        <span className="notif-item-unread-dot" />
      )}
    </div>
  );
}
