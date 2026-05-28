// components/Navbar.tsx — Main navigation bar
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Bell, MessageCircle, User, LogOut } from "lucide-react";
import { useAuthStore } from "../stores/auth.store";
import { useState, useRef, useEffect } from "react";
import pionterestLogo from "../assets/Pionterest.png";
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
        <img src={pionterestLogo} alt="Pionterest Logo" className="w-[32px] h-[32px] object-contain" />
        <span className="hidden sm:inline">Pionterest</span>
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