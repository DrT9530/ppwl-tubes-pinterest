// components/SearchHeader.tsx — Pinterest-style top search bar
import { Search, Camera, Mic } from "lucide-react";
import { useAuthStore } from "../stores/auth.store";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut, ChevronDown } from "lucide-react";

export function SearchHeader() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
    navigate("/");
  };

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  return (
    <header className="search-header" id="search-header">
      {/* Search Bar */}
      <div className="search-header-bar">
        <Search size={16} className="search-header-icon" />
        <input
          type="text"
          placeholder="Search"
          className="search-header-input"
          id="search-input"
        />
        <div className="search-header-actions">
          <button className="search-header-action-btn" title="Search by image">
            <Camera size={20} />
          </button>
          <button className="search-header-action-btn" title="Voice search">
            <Mic size={20} />
          </button>
        </div>
      </div>

      {/* User Avatar */}
      {isAuthenticated && user && (
        <div className="relative flex-shrink-0" ref={dropdownRef}>
          <button
            className="search-header-avatar"
            onClick={() => setShowDropdown(!showDropdown)}
            id="header-user-menu"
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                style={{ backgroundColor: "#7c3aed" }}
              >
                {getInitial(user.username)}
              </div>
            )}
            <ChevronDown size={14} className="text-[#767676] ml-0.5 flex-shrink-0" />
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div
              className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-[60]"
              style={{ animation: "var(--animate-slide-down)" }}
            >
              <div className="p-4 border-b border-gray-100">
                <p className="font-semibold text-sm">{user.username}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <div className="py-2">
                <button
                  onClick={() => {
                    navigate(`/profile/${user.id}`);
                    setShowDropdown(false);
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
        </div>
      )}
    </header>
  );
}
