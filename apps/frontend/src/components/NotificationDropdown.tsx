import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { notificationService } from "../services/notification.service";
import { useNotificationStore } from "../stores/notification.store";
import type { NotificationDTO } from "shared/types";

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { unreadCount, setUnreadCount, reset } = useNotificationStore();

  // Fetch unread count (polling setiap 30 detik)
  useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: async () => {
      const res = await notificationService.getUnreadCount();
      if (res.data?.count !== undefined) setUnreadCount(res.data.count);
      return res;
    },
    refetchInterval: 30_000,
  });

  // Fetch notifikasi (hanya saat dropdown dibuka)
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationService.getAll(),
    enabled: open,
  });

  // Mark all read saat dropdown dibuka
  const { mutate: markAllRead } = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const handleOpen = () => {
    setOpen((prev) => {
      if (!prev && unreadCount > 0) {
        // Tunggu sebentar biar user sempat lihat, baru mark read
        setTimeout(() => markAllRead(), 1500);
      }
      return !prev;
    });
  };

  // Tutup saat klik di luar
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const notifications: NotificationDTO[] = data?.data ?? [];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Notifikasi"
      >
        <Bell size={22} className="text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-[#E60023] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none animate-bounce">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-base text-gray-900">Notifikasi</h3>
            {notifications.some((n) => !n.read) && (
              <button
                onClick={() => markAllRead()}
                className="text-xs text-[#E60023] font-semibold hover:underline"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                      <div className="h-2 bg-gray-200 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">
                <Bell size={32} className="mx-auto mb-2 opacity-30" />
                Belum ada notifikasi
              </div>
            ) : (
              notifications.map((notif) => (
                <NotifItem key={notif.id} notif={notif} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NotifItem({ notif }: { notif: NotificationDTO }) {
  const label = {
    LIKE: "menyukai postinganmu",
    COMMENT: "mengomentari postinganmu",
    REPLY: "membalas komentarmu",
  }[notif.type];

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
        !notif.read ? "bg-red-50/40" : ""
      }`}
    >
      {/* Avatar actor */}
      <div className="relative flex-shrink-0">
        <img
          src={notif.actor?.avatarUrl ?? `https://ui-avatars.com/api/?name=${notif.actor?.username ?? "?"}&background=e60023&color=fff`}
          alt={notif.actor?.username}
          className="w-10 h-10 rounded-full object-cover"
        />
        {/* Type icon badge */}
        <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] bg-white shadow border border-gray-100">
          {notif.type === "LIKE" ? "❤️" : notif.type === "COMMENT" ? "💬" : "↩️"}
        </span>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 leading-snug">
          <span className="font-semibold">{notif.actor?.username ?? "Seseorang"}</span>{" "}
          {label}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {formatDistanceToNow(new Date(notif.createdAt), {
            addSuffix: true,
            locale: localeId,
          })}
        </p>
      </div>

      {/* Post thumbnail */}
      {notif.post?.imageUrl && (
        <img
          src={notif.post.imageUrl}
          alt="post"
          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
        />
      )}

      {/* Unread dot */}
      {!notif.read && (
        <span className="w-2 h-2 rounded-full bg-[#E60023] flex-shrink-0" />
      )}
    </div>
  );
}
