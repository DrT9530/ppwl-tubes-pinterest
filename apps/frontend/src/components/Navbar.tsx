// components/Navbar.tsx — Main navigation bar
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Bell, MessageCircle, User, LogOut } from "lucide-react";
import { useAuthStore } from "../stores/auth.store";
import { useState, useRef, useEffect } from "react";
import { MessageDropdown } from "./MessageDropdown";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showMsgDropdown, setShowMsgDropdown] = useState(false);
  const msgDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click (DIPERBAIKI AMAN)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      // Menutup dropdown profile jika klik di luar
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setShowDropdown(false);
      }

      // Menutup dropdown pesan jika klik di luar, KECUALI klik pada tombolnya sendiri
      if (msgDropdownRef.current && !msgDropdownRef.current.contains(target)) {
        // Cek apakah klik berasal dari tombol pesan itu sendiri atau ikon di dalamnya
        const clickedToggleButton = (target as HTMLElement).closest("#nav-messages");
        if (!clickedToggleButton) {
          setShowMsgDropdown(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
    setShowMsgDropdown(false);
    navigate("/login");
  };

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  return (
    <nav className="navbar" id="main-navbar">
      {/* Logo */}
      <Link to="/" className="navbar-logo" id="nav-logo">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
        </svg>
        <span className="hidden sm:inline">Pinterest</span>
      </Link>

      {/* Navigation Links */}
      <div className="navbar-nav">
        <Link to="/" className={location.pathname === "/" ? "active" : ""}>
          Home
        </Link>
        {isAuthenticated && (
          <Link to="/create" className={location.pathname === "/create" ? "active" : ""}>
            Create
          </Link>
        )}
      </div>

      {/* Search Bar */}
      <div className="navbar-search" id="nav-search">
        <Search size={20} className="search-icon" />
        <input
          type="text"
          placeholder="Search for ideas..."
          id="search-input"
        />
      </div>

      {/* Right Actions */}
      <div className="navbar-actions">
        {isAuthenticated ? (
          <>
            {/* Notification Bell */}
            <button className="navbar-icon-btn" id="nav-notifications" title="Notifications">
              <Bell size={24} />
            </button>

            {/* Messages Dropdown Area */}
            <div className="relative" ref={msgDropdownRef}>
              <button 
                id="nav-messages" 
                onClick={() => {
                  setShowMsgDropdown(!showMsgDropdown);
                  setShowDropdown(false); 
                }}
                className={`navbar-icon-btn flex items-center justify-center transition-colors ${showMsgDropdown ? "text-[#e60023]" : "text-gray-700"}`} 
                title="Messages"
              >
                <MessageCircle size={24} />
              </button>

              {/* Tampilkan panel list chat Pinterest pas diklik */}
              {showMsgDropdown && (
                <MessageDropdown onClose={() => setShowMsgDropdown(false)} />
              )}
            </div>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                className="navbar-icon-btn"
                id="nav-user-menu"
                onClick={() => {
                  setShowDropdown(!showDropdown);
                  setShowMsgDropdown(false); 
                }}
                title="Profile"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="avatar avatar-sm">
                    {getInitial(user?.username || "U")}
                  </div>
                )}
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div
                  className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
                  style={{ animation: "var(--animate-slide-down)" }}
                >
                  <div className="p-4 border-b border-gray-100">
                    <p className="font-semibold text-sm">{user?.username}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <div className="py-2">
                    <button
                      onClick={() => {
                        navigate(`/profile/${user?.id}`);
                        setShowDropdown(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm text-left hover:bg-gray-50 transition-colors"
                      id="dropdown-profile"
                    >
                      <User size={18} />
                      Your Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm text-left hover:bg-gray-50 transition-colors text-red-500"
                      id="dropdown-logout"
                    >
                      <LogOut size={18} />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-primary" id="nav-login-btn">
              Log in
            </Link>
            <Link to="/register" className="btn-outline" id="nav-signup-btn">
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}