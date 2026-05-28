import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { notificationService } from "../services/notification.service";
import { useNotificationStore } from "../stores/notification.store";
import type { NotificationDTO } from "shared/types";

export function NotificationSidebar({}: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const { unreadCount, setUnreadCount, reset } = useNotificationStore();

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
    if (unreadCount > 0) {
      setTimeout(() => markAllRead(), 1500);
    }
  }, [unreadCount, markAllRead]);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const wsUrl = apiUrl.replace(/^http/, 'ws');
    const ws = new WebSocket(`${wsUrl}/ws/notifications?token=${token}`);

    ws.onopen = () => {
      console.log("[WS] Connected to notification server");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "NEW_NOTIFICATION") {
          const newNotif = data.payload;
          queryClient.setQueryData(["notifications"], (oldData: any) => {
            if (!oldData) return { data: [newNotif] };
            return {
              ...oldData,
              data: [newNotif, ...oldData.data]
            };
          });
          setUnreadCount(useNotificationStore.getState().unreadCount + 1);
        }
      } catch (err) {
        console.error("WS Message Error", err);
      }
    };

    ws.onerror = (err) => {
      console.error("[WS] Error:", err);
    };

    return () => {
      ws.close();
    };
  }, [queryClient, setUnreadCount]);

  const notifications: NotificationDTO[] = data?.data ?? [];

  return (
    <div className="flex flex-col w-[360px] h-[calc(100vh-32px)] bg-white shadow-[8px_0_24px_rgba(0,0,0,0.08)] overflow-hidden animate-in fade-in slide-in-from-left-4 duration-300 rounded-[24px] border border-[#efefef]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-8 pb-2">
        <h2 className="text-[28px] font-semibold text-[#111]">Pembaruan</h2>
      </div>

      <div className="px-6 py-4 flex items-center justify-between">
        <h3 className="text-[16px] font-semibold text-[#111]">Dilihat</h3>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={() => markAllRead()}
            className="text-[14px] font-medium text-[#e60023] hover:underline"
          >
            Tandai semua dibaca
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
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
  const label = {
    LIKE: "menyukai Pin Anda.",
    COMMENT: "mengomentari Pin Anda.",
    REPLY: "membalas komentar Anda.",
  }[notif.type];

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-2xl hover:bg-[#f5f5f5] transition-colors cursor-pointer ${
        !notif.read ? "bg-[#f1f1f1]" : ""
      }`}
    >
      <div className="relative flex-shrink-0 mt-1">
        <img
          src={notif.actor?.avatarUrl ?? `https://ui-avatars.com/api/?name=${notif.actor?.username ?? "?"}&background=e60023&color=fff`}
          alt={notif.actor?.username}
          className="w-12 h-12 rounded-full object-cover"
        />
        <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] bg-white shadow border border-gray-100">
          {notif.type === "LIKE" ? "❤️" : notif.type === "COMMENT" ? "💬" : "↩️"}
        </span>
      </div>

      <div className="flex-1 min-w-0 pr-2">
        <p className="text-[15px] text-[#111] leading-snug">
          <span className="font-bold">{notif.actor?.username ?? "Seseorang"}</span>{" "}
          <span className="font-normal text-[#111]">{label}</span>
        </p>
        <p className="text-[13px] text-[#767676] mt-1">
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
          className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-gray-100"
        />
      )}

      {!notif.read && (
        <span className="w-2.5 h-2.5 rounded-full bg-[#E60023] flex-shrink-0 self-center ml-1" />
      )}
    </div>
  );
}
