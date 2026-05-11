// components/LandingNavbar.tsx — Navbar for landing/guest page (Pinterest-style)
import { Link } from "react-router-dom";

interface LandingNavbarProps {
  onLogin: () => void;
  onSignup: () => void;
}

export function LandingNavbar({ onLogin, onSignup }: LandingNavbarProps) {
  return (
    <nav className="landing-navbar" id="landing-navbar">
      {/* Left: Logo + Explore */}
      <div className="landing-navbar-left">
        <Link to="/" className="landing-navbar-logo" id="landing-logo">
          <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
          </svg>
          <span>Pinterest</span>
        </Link>
        <Link to="/" className="landing-navbar-link">Explore</Link>
      </div>

      {/* Right: Navigation links + Auth buttons */}
      <div className="landing-navbar-right">
        <div className="landing-navbar-links">
          <a href="#" className="landing-navbar-link">About</a>
          <a href="#" className="landing-navbar-link">Business</a>
          <a href="#" className="landing-navbar-link">Press</a>
        </div>
        <div className="landing-navbar-auth">
          <button onClick={onLogin} className="landing-btn-login" id="landing-login-btn">Log in</button>
          <button onClick={onSignup} className="landing-btn-signup" id="landing-signup-btn">Sign up</button>
        </div>
      </div>
    </nav>
  );
}
