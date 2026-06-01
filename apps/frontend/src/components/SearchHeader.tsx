// components/SearchHeader.tsx — Pinterest-style top search bar
import { Search } from "lucide-react";
import { useAuthStore } from "../stores/auth.store";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Loader2 } from "lucide-react";

export function SearchHeader() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
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
    setIsLoggingOut(true);
    await logout();
    setShowDropdown(false);
    navigate("/");
    setIsLoggingOut(false);
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
            <ChevronDown size={18} className="text-[#767676] flex-shrink-0" />
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div className="profile-dropdown-container">
              {/* Section 1: Saat ini menggunakan */}
              <div className="profile-dropdown-section-label">Saat ini menggunakan</div>
              
              <div 
                onClick={() => {
                  navigate(`/profile/${user.id}`);
                  setShowDropdown(false);
                }}
                className="profile-dropdown-card"
              >
                <div className="profile-dropdown-avatar">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.username}
                      className="profile-dropdown-avatar-img"
                    />
                  ) : (
                    <div className="profile-dropdown-avatar-initial">
                      {getInitial(user.username)}
                    </div>
                  )}
                </div>
                <div className="profile-dropdown-card-details">
                  <span className="profile-dropdown-card-title">{user.username}</span>
                  <span className="profile-dropdown-card-subtitle">Pribadi</span>
                  <span className="profile-dropdown-card-email truncate">{user.email}</span>
                </div>
                <span className="profile-dropdown-card-checkmark">✓</span>
              </div>

              {/* Menu Item: Konversikan ke bisnis */}
              <button className="profile-dropdown-menu-item">
                Konversikan ke bisnis
              </button>

              {/* Section 2: Akun Anda */}
              <div className="profile-dropdown-section-label">Akun Anda</div>

              {/* Menu Item: Tambahkan akun */}
              <button className="profile-dropdown-menu-item">
                Tambahkan akun Pinterest
              </button>

              {/* Menu Item: Keluar */}
              <button
                onClick={handleLogout}
                className="profile-dropdown-menu-item flex items-center gap-2"
                disabled={isLoggingOut}
              >
                {isLoggingOut ? <Loader2 size={16} className="animate-spin" /> : null}
                Keluar
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
