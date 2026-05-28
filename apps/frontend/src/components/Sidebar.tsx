// components/Sidebar.tsx — Pinterest-style vertical sidebar navigation
import { Link, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { MessageDropdown } from "./MessageDropdown"; 
import { NotificationSidebar } from "./NotificationSidebar";
import { SettingsDropdown } from "./SettingsDropdown";
import { useNotificationStore } from "../stores/notification.store";

import {
  Home,
  Compass,
  LayoutGrid,
  Plus,
  Bell,
  MessageCircle,
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

  const { unreadCount } = useNotificationStore();

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
    { icon: Compass, path: "/explore", label: "Explore" },
    { icon: LayoutGrid, path: "/boards", label: "Your boards" },
    { icon: Plus, path: "/create", label: "Create" },
  ];

  return (
    <aside className="sidebar" id="main-sidebar">
      {/* ── Top group: Logo + all main nav ── */}
      <div className="sidebar-top-group">
        {/* Pinterest Logo */}
        <Link to="/" className="sidebar-logo" id="sidebar-logo">
          <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
          </svg>
        </Link>

        {/* Main Navigation Items */}
        <nav className="sidebar-nav">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path && !showMsgDropdown && !showNotifSidebar;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-nav-item ${isActive ? "active" : ""}`}
                title={item.label}
                id={`sidebar-${item.label.toLowerCase().replace(/\s/g, "-")}`}
              >
                <Icon
                  size={24}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  fill={isActive ? "currentColor" : "none"}
                />
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
                  if (showMsgDropdown) closeMsg();
                  setShowSettingsDropdown(false);
                }
              }}
              className={`sidebar-nav-item w-full flex items-center justify-center cursor-pointer border-0 bg-transparent transition-colors ${
                showNotifSidebar ? "bg-gray-100 text-[#111]" : ""
              }`}
              title="Updates"
            >
              <div className="relative flex items-center justify-center w-full h-full">
                <Bell
                  size={24}
                  strokeWidth={showNotifSidebar ? 2.5 : 1.8}
                  fill={showNotifSidebar ? "currentColor" : "none"}
                />
                {unreadCount > 0 && (
                  <span className="absolute top-[4px] right-[8px] min-w-[18px] h-[18px] bg-[#E60023] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
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
                showMsgDropdown ? "bg-gray-100 text-[#111]" : ""
              }`}
              title="Messages"
            >
              <MessageCircle
                size={24}
                strokeWidth={showMsgDropdown ? 2.5 : 1.8}
                fill={showMsgDropdown ? "currentColor" : "none"}
              />
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
              showSettingsDropdown ? "bg-gray-100 text-[#111]" : ""
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