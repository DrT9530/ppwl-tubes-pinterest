// components/LandingNavbar.tsx — Navbar for landing/guest page (Pinterest-style)
import { Link } from "react-router-dom";
import pionterestLogo from "../assets/Pionterest.png";

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
          <img src={pionterestLogo} alt="Pionterest Logo" className="w-[32px] h-[32px] object-contain" />
          <span>Pionterest</span>
        </Link>
        <Link to="/today" className="landing-navbar-link">Explore</Link>
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
