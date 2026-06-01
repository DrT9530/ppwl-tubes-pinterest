// pages/LandingPage.tsx — Pionterest landing page for guest users
import { useState, useCallback } from "react";
import { LandingNavbar } from "../components/LandingNavbar";
import { AuthModal, InlineSignupForm } from "../components/AuthModal";
import heroCollage from "../assets/landing/hero-collage.png";
import featureSearch from "../assets/landing/feature-search.png";
import featureBoards from "../assets/landing/feature-boards.png";
import featureVisualSearch from "../assets/landing/feature-visual-search.png";
import signupBg from "../assets/landing/signup-bg.png";
import footerLogo from "../assets/Pionterest-landing.png";

type AuthMode = "login" | "register" | null;

export function LandingPage() {
  const [authModal, setAuthModal] = useState<AuthMode>(null);

  const openLogin = useCallback(() => setAuthModal("login"), []);
  const openRegister = useCallback(() => setAuthModal("register"), []);
  const closeModal = useCallback(() => setAuthModal(null), []);
  const switchMode = useCallback((mode: "login" | "register") => setAuthModal(mode), []);

  return (
    <div className="landing-page" id="landing-page">
      <LandingNavbar onLogin={openLogin} onSignup={openRegister} />

      {/* ═══ Auth Modal Popup ═══ */}
      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={closeModal}
          onSwitchMode={switchMode}
        />
      )}

      {/* ═══ Section 1: Hero ═══ */}
      <section className="landing-hero" id="landing-hero">
        <div className="landing-hero-content">
          <h1 className="landing-hero-title">
            Create the life you love on Pionterest
          </h1>
          <div className="landing-hero-actions">
            <button onClick={openRegister} className="landing-cta-primary">
              Join Pionterest for free
            </button>
            <button onClick={openLogin} className="landing-cta-secondary">
              I already have an account
            </button>
          </div>
        </div>
        <div className="landing-hero-visual">
          <img
            src={heroCollage}
            alt="Pionterest inspiration collage"
            className="landing-hero-img"
          />
        </div>
      </section>

      <div style={{ backgroundColor: "var(--color-surface-secondary)" }}>
        {/* ═══ Section 2: Bring ideas to life ═══ */}
        <section className="landing-section landing-section-centered" id="landing-ideas" style={{ backgroundColor: "transparent" }}>
          <div className="landing-section-intro">
            <h2 className="landing-section-title-lg">
              Bring your favorite ideas to life
            </h2>
            <p className="landing-section-subtitle">
              With Pionterest, you can unlock tools that spark your creativity and help you find more inspiration.
            </p>
          </div>
        </section>

        {/* ═══ Section 3: Search Feature ═══ */}
        <section className="landing-section landing-feature" id="landing-search-feature">
          <div className="landing-feature-visual">
            <img
              src={featureSearch}
              alt="Search by skin tone feature"
              className="landing-feature-img"
            />
          </div>
          <div className="landing-feature-content">
            <h2 className="landing-feature-title">
              Search by skin tone
            </h2>
            <p className="landing-feature-desc">
              Search with skin tone ranges for beauty ideas that represent you
            </p>
            <button onClick={openRegister} className="landing-cta-primary landing-cta-sm">
              Try now
            </button>
          </div>
        </section>

        {/* ═══ Section 4: Group Boards ═══ */}
        <section className="landing-section landing-feature" id="landing-boards-feature">
          <div className="landing-feature-content">
            <h2 className="landing-feature-title">
              Collaborate with group boards
            </h2>
            <p className="landing-feature-desc">
              Visualize your ideas with others, using a Pionterest account
            </p>
            <button onClick={openRegister} className="landing-cta-primary landing-cta-sm">
              See an example
            </button>
          </div>
          <div className="landing-feature-visual">
            <img
              src={featureBoards}
              alt="Group boards feature"
              className="landing-feature-img"
            />
          </div>
        </section>

        {/* ═══ Section 5: Visual Search ═══ */}
        <section className="landing-section landing-feature" id="landing-visual-search">
          <div className="landing-feature-visual">
            <img
              src={featureVisualSearch}
              alt="Search visually with images"
              className="landing-feature-img"
            />
          </div>
          <div className="landing-feature-content">
            <h2 className="landing-feature-title">
              Search visually with images
            </h2>
            <p className="landing-feature-desc">
              Search objects within an image to find more styles you'll love
            </p>
            <button onClick={openRegister} className="landing-cta-primary landing-cta-sm">
              Learn more
            </button>
          </div>
        </section>
      </div>

      {/* ═══ Section 6: Sign Up CTA with inline form ═══ */}
      <section className="landing-signup-section" id="landing-signup-cta">
        <div className="landing-signup-bg">
          <img
            src={signupBg}
            alt=""
            className="landing-signup-bg-img"
          />
          <div className="landing-signup-overlay" />
        </div>
        <div className="landing-signup-layout">
          <div className="landing-signup-left">
            <h2 className="landing-signup-title">
              Sign up to get your ideas
            </h2>
          </div>
          <div className="landing-signup-right">
            <InlineSignupForm />
          </div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="landing-footer" id="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-left">
            <div className="footer-logo">
              <img src={footerLogo} alt="Pionterest" width="130" style={{ display: "block", marginLeft: "-8px", objectFit: "contain", objectPosition: "left center" }} />
            </div>
            <p className="landing-footer-copy">© 2026 Pionterest</p>
          </div>
          
          <div className="landing-footer-right">
            <div className="footer-col">
              <h3>Get the app</h3>
              <a href="#">iOS</a>
              <a href="#">Android</a>
            </div>
            <div className="footer-col">
              <h3>Quick links</h3>
              <a href="#">Explore</a>
              <a href="#">Shop</a>
              <a href="#">Users</a>
              <a href="#">Collections</a>
              <a href="#">Shopping</a>
              <a href="#">Help Center</a>
            </div>
            <div className="footer-col">
              <h3>Policies</h3>
              <a href="#">Terms of service</a>
              <a href="#">Privacy policy</a>
              <a href="#">Non-user notice</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
