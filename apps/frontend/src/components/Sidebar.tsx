// components/Sidebar.tsx — Pinterest-style vertical sidebar navigation
import { Link, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { MessageDropdown } from "./MessageDropdown"; 
import { NotificationSidebar } from "./NotificationSidebar";
import { SettingsDropdown } from "./SettingsDropdown";
import { useNotificationStore } from "../stores/notification.store";
import { useQueryClient } from "@tanstack/react-query";
import { notificationService } from "../services/notification.service";
import pionterestLogo from "../assets/Pionterest.png";
import { useAuthStore } from "../stores/auth.store";

import {
  Home,
  Compass,
  LayoutGrid,
  Plus,
  Settings,
} from "lucide-react";

export function Sidebar() {
  const location = useLocation();

  // State dan Ref untuk Dropdown Pesan
  const [showMsgDropdown, setShowMsgDropdown] = useState(false);
  const [isMsgClosing, setIsMsgClosing] = useState(false);
  const msgDropdownRef = useRef<HTMLDivElement>(null);

  // State dan Ref untuk Notification Sidebar
  const [showNotifSidebar, setShowNotifSidebar] = useState(false);
  const [isNotifClosing, setIsNotifClosing] = useState(false);
  const notifSidebarRef = useRef<HTMLDivElement>(null);

  // State dan Ref untuk Dropdown Settings
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const settingsDropdownRef = useRef<HTMLDivElement>(null);

  const closeNotif = () => {
    setIsNotifClosing(true);
    setTimeout(() => {
      setShowNotifSidebar(false);
      setIsNotifClosing(false);
    }, 280); // matches animation duration
  };

  const closeMsg = () => {
    setIsMsgClosing(true);
    setTimeout(() => {
      setShowMsgDropdown(false);
      setIsMsgClosing(false);
    }, 280);
  };

  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { unreadCount, setUnreadCount, reset } = useNotificationStore();

  useEffect(() => {
    // 1. Fetch initial unread count
    const fetchUnreadCount = async () => {
      try {
        const res = await notificationService.getUnreadCount();
        if (res.data) {
          setUnreadCount(res.data.count);
        }
      } catch (err) {
        console.error("Gagal mengambil unread count", err);
      }
    };
    fetchUnreadCount();

    // 2. Establish persistent WebSocket for real-time notifications
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const wsUrl = apiUrl.replace(/^http/, 'ws');
    const ws = new WebSocket(`${wsUrl}/ws/notifications?token=${token}`);

    ws.onopen = () => {
      console.log("[WS-Sidebar] Connected to notification server");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "NEW_NOTIFICATION") {
          const newNotif = data.payload;
          // Update Query Cache so the list is updated when user opens NotificationSidebar
          queryClient.setQueryData(["notifications"], (oldData: any) => {
            if (!oldData) return { data: [newNotif] };
            return {
              ...oldData,
              data: [newNotif, ...oldData.data]
            };
          });
          // Increment unread count in store
          setUnreadCount(useNotificationStore.getState().unreadCount + 1);
        }
      } catch (err) {
        console.error("WS Sidebar Message Error", err);
      }
    };

    ws.onerror = (err) => {
      console.error("[WS-Sidebar] Error:", err);
    };

    return () => {
      ws.close();
    };
  }, [queryClient, setUnreadCount]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      // Klik luar untuk dropdown pesan
      if (
        msgDropdownRef.current &&
        !msgDropdownRef.current.contains(target)
      ) {
        const clickedToggleButton = (target as HTMLElement).closest("#sidebar-messages");
        if (!clickedToggleButton && showMsgDropdown) {
          closeMsg();
        }
      }

      // Klik luar untuk sidebar notifikasi
      if (
        notifSidebarRef.current &&
        !notifSidebarRef.current.contains(target)
      ) {
        const clickedToggleButton = (target as HTMLElement).closest("#sidebar-notifications");
        if (!clickedToggleButton && showNotifSidebar) {
          closeNotif();
        }
      }
      // Klik luar untuk dropdown settings
      if (settingsDropdownRef.current && !settingsDropdownRef.current.contains(target)) {
        const clickedSettingsButton = (target as HTMLElement).closest("#sidebar-settings");
        if (!clickedSettingsButton) {
          setShowSettingsDropdown(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const mainNavItems = [
    { icon: Home, path: "/", label: "Home" },
    { icon: Compass, path: "/today", label: "Explore" },
    { icon: LayoutGrid, path: user ? `/profile/${user.id}?tab=saved` : "/profile/me", label: "Your boards" },
    { icon: Plus, path: "/create", label: "Create" },
  ];

  return (
    <aside className="sidebar" id="main-sidebar">
      {/* ── Top group: Logo + all main nav ── */}
      <div className="sidebar-top-group">
        {/* Pionterest Logo */}
        <Link to="/" className="sidebar-logo" id="sidebar-logo">
          <img src={pionterestLogo} alt="Pionterest Logo" className="w-[32px] h-[32px] object-contain" />
        </Link>

        {/* Main Navigation Items */}
        <nav className="sidebar-nav">
          {mainNavItems.map((item) => {
            let isActive = false;
            if (item.label === "Your boards") {
              isActive = user ? (location.pathname === `/profile/${user.id}` && location.search.includes("tab=saved")) : false;
            } else if (item.path === "/") {
              isActive = location.pathname === "/";
            } else {
              isActive = location.pathname.startsWith(item.path.split("?")[0]);
            }
            
            const renderIcon = () => {
              if (item.label === "Home" && isActive) {
                return (
                  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                    <path d="M9.59.92a3.63 3.63 0 0 1 4.82 0l7.25 6.44A4 4 0 0 1 23 10.35v8.46a3.9 3.9 0 0 1-3.6 3.92 106 106 0 0 1-14.8 0A3.9 3.9 0 0 1 1 18.8v-8.46a4 4 0 0 1 1.34-3zM12 16a5 5 0 0 1-3.05-1.04l-1.23 1.58a7 7 0 0 0 8.56 0l-1.23-1.58A5 5 0 0 1 12 16"></path>
                  </svg>
                );
              }
              
              if (item.label === "Explore" && isActive) {
                return (
                  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                    <path d="M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4m0 14a12 12 0 1 0 0-24 12 12 0 0 0 0 24M8.8 7.24l8-1.6a1.32 1.32 0 0 1 1.56 1.55l-1.6 8a2 2 0 0 1-1.57 1.57l-8 1.6a1.32 1.32 0 0 1-1.55-1.55l1.6-8A2 2 0 0 1 8.8 7.24"></path>
                  </svg>
                );
              }
              
              const Icon = item.icon;
              return (
                <Icon
                  size={24}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  fill={isActive ? "currentColor" : "none"}
                />
              );
            };

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-nav-item ${isActive ? "active" : ""}`}
                title={item.label}
                id={`sidebar-${item.label.toLowerCase().replace(/\s/g, "-")}`}
              >
                {renderIcon()}
              </Link>
            );
          })}

          {/* ── TOMBOL NOTIFIKASI ── */}
          <div className="relative" ref={notifSidebarRef}>
            <button
              type="button"
              id="sidebar-notifications"
              onClick={() => {
                if (showNotifSidebar) {
                  closeNotif();
                } else {
                  setShowNotifSidebar(true);
                  reset(); // Hilangkan bulatan notifikasi (unreadCount = 0) langsung saat dipencet
                  if (showMsgDropdown) closeMsg();
                  setShowSettingsDropdown(false);
                }
              }}
              className={`sidebar-nav-item w-full flex items-center justify-center cursor-pointer border-0 bg-transparent transition-colors ${
                showNotifSidebar ? "dropdown-active" : ""
              }`}
              title="Updates"
            >
              <div className="relative flex items-center justify-center w-full h-full">
                {showNotifSidebar ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                    <path d="M20.54 14.24A3.15 3.15 0 0 0 23.66 17H24v2h-8v1h-.02a3.4 3.4 0 0 1-3.38 3h-1.2a3.4 3.4 0 0 1-3.38-3H8v-1H0v-2h.34a3.15 3.15 0 0 0 3.12-2.76l.8-6.41a7.8 7.8 0 0 1 15.48 0zM10 19.6c0 .77.63 1.4 1.4 1.4h1.2c.77 0 1.4-.63 1.4-1.4a.6.6 0 0 0-.6-.6h-2.8a.6.6 0 0 0-.6.6" className="custom-cursor-on-hover"></path>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    {unreadCount > 0 && (
                      <circle cx="18" cy="6" r="3.5" fill="#E60023" stroke="none" />
                    )}
                  </svg>
                )}
              </div>
            </button>

            {/* PANEL SIDEBAR NOTIFIKASI MELAYANG FIXED */}
            {showNotifSidebar && (
              <div 
                className="fixed left-[72px] top-0 bottom-0 z-[9999] py-4 pr-4"
                style={{ animation: isNotifClosing ? "var(--animate-slide-out-left)" : "var(--animate-slide-right)" }}
              > 
                <NotificationSidebar onClose={closeNotif} />
              </div>
            )}
          </div>

          {/* ── TOMBOL MESSAGES ── */}
          <div className="relative" ref={msgDropdownRef}>
            <button
              type="button"
              id="sidebar-messages"
              onClick={() => {
                if (showMsgDropdown) {
                  closeMsg();
                } else {
                  setShowMsgDropdown(true);
                  if (showNotifSidebar) closeNotif();
                  setShowSettingsDropdown(false);
                }
              }}
              className={`sidebar-nav-item w-full flex items-center justify-center cursor-pointer border-0 bg-transparent transition-colors ${
                showMsgDropdown ? "dropdown-active" : ""
              }`}
              title="Messages"
            >
              {showMsgDropdown ? (
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M17 22.35A11.5 11.5 0 1 1 22.36 17l.64 3.7a2 2 0 0 1-2.3 2.3zM7 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m5 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m5-3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3" className="custom-cursor-on-hover"></path>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M7 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m5 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m5 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m-5 10c1.8 0 3.5-.41 5-1.15l3.69.65A2 2 0 0 0 23 20.7l-.65-3.7A11.5 11.5 0 1 0 12 23.5m8.55-7.36-.28.58.76 4.31-4.31-.76-.58.28q-1.89.93-4.14.95a9.5 9.5 0 1 1 8.55-5.36" className="custom-cursor-on-hover"></path>
                </svg>
              )}
            </button>

            {/* PANEL DROPDOWN MELAYANG */}
            {showMsgDropdown && (
              <div 
                className="fixed left-[88px] top-[16px] z-[9999]"
                style={{ animation: isMsgClosing ? "var(--animate-slide-out-left)" : "var(--animate-slide-right)" }}
              > 
                <MessageDropdown onClose={closeMsg} />
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* ── Bottom group: Settings (DIPERBAIKI JADI DROPDOWN MELAYANG) ── */}
      <div className="sidebar-bottom-group">
        <div className="relative" ref={settingsDropdownRef}>
          <button
            type="button"
            id="sidebar-settings"
            onClick={() => {
              setShowSettingsDropdown(!showSettingsDropdown);
              setShowMsgDropdown(false); // Tutup pesan kalau settings dibuka
              if (showNotifSidebar) closeNotif(); // Tutup notif kalau settings dibuka
            }}
            className={`sidebar-nav-item w-full flex items-center justify-center cursor-pointer border-0 bg-transparent transition-colors ${
              showSettingsDropdown ? "dropdown-active" : ""
            }`}
            title="Settings & support"
          >
            <Settings 
              size={24} 
              strokeWidth={showSettingsDropdown ? 2.5 : 1.8} 
            />
          </button>

          {/* PANEL SETTINGS DROPDOWN MELAYANG */}
        {showSettingsDropdown && (
          <div className="fixed left-[80px] top-0 h-screen z-[999]">
            <SettingsDropdown onClose={() => setShowSettingsDropdown(false)} />
          </div>
        )}

        </div>
      </div>
    </aside>
  );
}