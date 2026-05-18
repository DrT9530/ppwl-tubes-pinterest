// components/Sidebar.tsx — Pinterest-style vertical sidebar navigation
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";
import { useState, useRef, useEffect } from "react";
import {
  Home,
  Compass,
  LayoutGrid,
  Plus,
  Bell,
  MessageCircle,
  Settings,
  LogOut,
  User,
} from "lucide-react";

export function Sidebar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setShowProfileMenu(false);
    navigate("/");
  };


  // All main nav items grouped together (logo → home → ... → messages)
  const mainNavItems = [
    { icon: Home, path: "/", label: "Home", filled: true },
    { icon: Compass, path: "/explore", label: "Explore" },
    { icon: LayoutGrid, path: "/boards", label: "Your boards" },
    { icon: Plus, path: "/create", label: "Create" },
    { icon: Bell, path: "/notifications", label: "Updates" },
    { icon: MessageCircle, path: "/messages", label: "Messages" },
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
            const isActive = location.pathname === item.path;
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
        </nav>
      </div>

      {/* ── Bottom group: Settings (far away from main group) ── */}
      <div className="sidebar-bottom-group">
        <Link
          to="/settings"
          className="sidebar-nav-item"
          title="Settings & support"
          id="sidebar-settings"
        >
          <Settings size={24} strokeWidth={1.8} />
        </Link>
      </div>

      {/* Profile dropdown (hidden, triggered from SearchHeader avatar) */}
      {isAuthenticated && showProfileMenu && (
        <div
          ref={profileMenuRef}
          className="absolute left-full bottom-16 ml-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-[60]"
          style={{ animation: "var(--animate-scale-in)" }}
        >
          <div className="p-4 border-b border-gray-100">
            <p className="font-semibold text-sm">{user?.username}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          <div className="py-2">
            <button
              onClick={() => {
                navigate(`/profile/${user?.id}`);
                setShowProfileMenu(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-left hover:bg-gray-50 transition-colors"
            >
              <User size={18} />
              Your Profile
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-left hover:bg-gray-50 transition-colors text-red-500"
            >
              <LogOut size={18} />
              Log out
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
