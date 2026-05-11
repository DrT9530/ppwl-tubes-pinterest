// pages/LandingPage.tsx — Pinterest landing page for guest users
import { useState, useCallback } from "react";
import { LandingNavbar } from "../components/LandingNavbar";
import { AuthModal, InlineSignupForm } from "../components/AuthModal";
import heroCollage from "../assets/landing/hero-collage.png";
import featureSearch from "../assets/landing/feature-search.png";
import featureBoards from "../assets/landing/feature-boards.png";
import featureVisualSearch from "../assets/landing/feature-visual-search.png";
import signupBg from "../assets/landing/signup-bg.png";

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
            Create the life you love on Pinterest
          </h1>
          <div className="landing-hero-actions">
            <button onClick={openRegister} className="landing-cta-primary">
              Join Pinterest for free
            </button>
            <button onClick={openLogin} className="landing-cta-secondary">
              I already have an account
            </button>
          </div>
        </div>
        <div className="landing-hero-visual">
          <img
            src={heroCollage}
            alt="Pinterest inspiration collage"
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
              With Pinterest, you can unlock tools that spark your creativity and help you find more inspiration.
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
              Visualize your ideas with others, using a Pinterest account
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
              <svg viewBox="0 0 165 40" fill="currentColor" width="130" height="32" style={{ display: "block" }}>
                <path d="M86.2687 19.0505C88.008 19.0505 88.6278 20.07 88.6278 21.2694C88.6278 23.3283 86.9684 24.5677 84.3693 24.5677C83.4297 24.5677 82.1502 24.3478 81.3704 24.1079C81.6903 22.2289 82.9499 19.0505 86.2687 19.0505ZM123.795 19.0505C125.394 19.0505 126.154 20.07 126.154 21.2694C126.154 23.3283 124.495 24.5677 121.896 24.5677C120.956 24.5677 119.657 24.3478 118.897 24.1079C119.237 22.2289 120.656 19.0505 123.795 19.0505ZM159.382 19.2104H163.381C163.92 19.2104 164.26 18.9905 164.38 18.5107C164.56 17.8111 164.88 16.5717 164.98 16.2319C165.1 15.7921 164.82 15.4523 164.32 15.4523H160.362C160.642 14.3728 161.761 10.8546 161.761 8.55572C161.761 3.97801 157.703 0.07996 151.925 0.07996C145.407 0.07996 141.169 4.25787 141.169 10.1549C141.169 11.8741 141.828 13.8731 142.668 15.1324C142.328 15.1124 141.968 15.0925 141.589 15.0925C136.65 15.0925 133.531 17.6712 133.531 21.4093C133.531 24.9275 136.43 26.2869 139.149 27.1864C141.569 27.986 143.788 28.3658 143.788 30.1849C143.788 31.4043 142.568 32.1239 140.169 32.1239C137.33 32.1239 135.751 30.8446 135.371 30.3448C135.631 30.1449 136.031 29.6652 136.031 28.8456C136.031 27.7261 135.211 26.8066 133.671 26.8066C132.372 26.8066 131.272 27.8261 130.992 29.1454C128.913 30.7846 126.634 31.8441 123.415 31.8441C120.236 31.8441 118.597 30.2649 118.597 26.8866C119.337 27.1064 121.276 27.3663 122.555 27.3663C127.934 27.3663 131.592 25.0275 131.592 20.3498C131.592 17.8311 129.293 15.1924 124.715 15.1924H124.695C118.697 15.1924 115.318 18.8306 113.859 22.8486C113.439 22.7486 113.039 22.6687 112.619 22.5687C112.959 21.6892 113.179 20.6497 113.179 19.5102C113.179 17.5312 111.899 15.1924 108.481 15.1924C106.101 15.1924 103.822 16.6917 102.263 18.9305C102.663 17.4713 102.903 16.4918 102.923 16.4318C103.023 16.052 102.863 15.6122 102.243 15.6122H98.7641C98.2643 15.6122 97.9044 15.7721 97.7645 16.3318C97.6645 16.6917 96.465 21.2294 95.2854 25.6472C94.5456 28.4058 90.707 31.8441 85.9088 31.8441C82.7299 31.8441 81.0905 30.1449 81.0905 26.7866C81.9102 27.1064 83.7696 27.3663 85.0491 27.3663C90.6471 27.3663 94.0858 25.0275 94.0858 20.3498C94.0858 17.8311 91.7867 15.1924 87.2083 15.1924H87.1883C80.4308 15.1924 76.2923 20.2299 75.5725 25.927C75.2727 28.3058 73.1934 31.5642 70.9342 31.5642C69.8346 31.5642 69.2149 30.9045 69.2149 29.7651C69.2149 28.7856 69.9346 26.4068 70.7143 23.4283C70.9742 22.4288 71.3741 20.9095 71.8139 19.2104H75.4926C76.0324 19.2104 76.3523 18.9905 76.4922 18.5107C76.6721 17.8111 76.992 16.5717 77.092 16.2319C77.2119 15.7921 76.952 15.4523 76.4322 15.4523H72.8135C72.8135 15.4523 74.4729 9.09545 74.5129 8.91554C74.6729 8.27586 74.1131 7.89605 73.5133 8.01599C73.5133 8.01599 70.7143 8.53573 70.1945 8.63568C69.6747 8.73563 69.2748 9.01549 69.0749 9.73513C69.0549 9.83508 67.5954 15.4323 67.5954 15.4323H64.6965C64.1367 15.4323 63.8368 15.6522 63.6969 16.1319C63.5169 16.8316 63.197 18.071 63.0971 18.4108C62.9771 18.8506 63.237 19.1904 63.7568 19.1904H66.5958C66.5758 19.2704 65.5762 22.9485 64.7565 26.2269C64.3766 27.8061 63.0771 31.5042 60.9778 31.5042C59.7183 31.5042 59.1985 30.8846 59.1985 29.5852C59.1985 27.5262 61.2977 22.3888 61.2977 20.07C61.3177 16.9915 59.5784 15.1924 55.9997 15.1924C53.7405 15.1924 51.4013 16.5917 50.4217 17.8111C50.4217 17.8111 50.7216 16.8116 50.8215 16.4318C50.9215 16.032 50.7016 15.6322 50.1418 15.6322H46.6431C45.9033 15.6322 45.7034 16.012 45.5834 16.4318C45.5435 16.6117 44.2839 21.3293 43.0644 25.8871C42.2447 29.0055 40.2254 31.6042 38.0862 31.6042C36.9866 31.6042 36.4867 30.9445 36.4867 29.8051C36.4867 28.8256 37.1465 26.4268 37.9262 23.4483C38.8859 19.8101 39.7256 16.8316 39.8055 16.4718C39.9255 16.032 39.7056 15.6322 39.1058 15.6322H35.5871C34.9473 15.6322 34.7274 15.952 34.5874 16.3918C34.5874 16.3918 33.5878 19.97 32.5482 23.968C31.7885 26.8666 30.9488 29.8251 30.9488 31.2044C30.9488 33.6832 32.1083 35.5422 35.3072 35.5422C37.7663 35.5422 39.7256 34.3428 41.205 32.8236C40.9851 33.6432 40.8452 34.1629 40.8252 34.2229C40.7052 34.7026 40.8452 35.1024 41.4249 35.1024H45.0236C45.6434 35.1024 45.8833 34.8626 46.0233 34.3428C46.1432 33.8431 48.8423 23.7281 48.8423 23.7281C49.562 21.0095 51.3014 19.2104 53.7805 19.2104C54.96 19.2104 55.9597 19.95 55.8397 21.3893C55.7198 22.9885 53.7205 28.6857 53.7205 31.1844C53.7205 33.0835 54.4602 35.5422 58.1789 35.5422C60.7179 35.5422 62.5973 34.3828 63.9568 32.8636C64.4566 34.4628 65.7761 35.5422 68.1952 35.5422C72.2138 35.5422 74.6329 33.2634 76.0524 30.9645C77.2319 33.6232 80.0109 35.5422 84.0695 35.5422C88.208 35.5422 91.4068 33.8631 93.666 31.6042C93.2661 33.1434 92.9862 34.1829 92.9662 34.2629C92.8263 34.7426 93.0462 35.1224 93.646 35.1224H97.2047C97.6845 35.1224 98.0444 34.8826 98.1643 34.3828C98.2243 34.1429 98.7441 32.2439 99.4639 29.5252C100.863 24.3478 103.083 18.9705 106.441 18.9705C107.621 18.9705 108.101 19.6102 108.101 20.6097C108.101 21.0895 107.961 21.4893 107.841 21.7091C106.221 21.4093 104.902 22.1689 104.902 23.8281C104.902 24.9075 106.081 25.907 107.701 25.907C108.92 25.907 109.94 25.6272 110.76 25.0875C111.519 25.2474 112.319 25.4073 113.139 25.5872C113.019 26.3668 112.959 27.1264 112.959 27.8461C112.959 32.004 116.218 35.5222 121.776 35.5222C126.134 35.5222 128.913 34.1229 131.532 32.044C132.772 33.983 135.911 35.5622 140.009 35.5622C145.627 35.5622 148.826 32.7636 148.826 29.0655C148.826 25.7071 145.947 24.4878 142.988 23.4483C140.589 22.6087 138.57 22.1689 138.57 20.5297C138.57 19.1904 139.669 18.5907 141.549 18.5907C142.768 18.5907 143.688 18.8506 144.168 18.9705C144.647 20.1299 145.647 21.4293 147.366 21.4293C148.826 21.4293 149.466 20.3298 149.466 19.3103C149.466 16.4318 144.448 16.1319 144.448 9.93503C144.448 6.09695 146.727 2.91854 151.425 2.91854C154.684 2.91854 156.823 4.89755 156.823 8.09595C156.823 10.7346 155.144 15.4323 155.144 15.4323H152.345C151.805 15.4323 151.485 15.6522 151.345 16.1319C151.165 16.8316 150.845 18.071 150.745 18.4108C150.625 18.8506 150.885 19.1904 151.405 19.1904H154.184C154.184 19.1904 151.325 29.3253 151.325 31.1644C151.325 33.6432 152.784 35.5023 155.963 35.5023C160.482 35.5023 163.301 32.7036 164.52 28.6057C164.62 28.2859 164.42 28.026 164.1 28.026H162.381C162.041 28.026 161.841 28.2059 161.741 28.5257C161.341 29.985 160.382 31.5042 158.482 31.5042C157.383 31.5042 156.763 30.8446 156.763 29.7051C156.763 28.7256 157.443 26.4468 158.262 23.3683C158.682 21.949 159.382 19.2104 159.382 19.2104ZM41.7648 10.2949C41.8848 8.51574 40.5453 7.07646 38.7459 7.07646C36.9466 7.07646 35.4071 8.51574 35.2672 10.2949C35.1472 12.074 36.4867 13.5132 38.2861 13.5132C40.0854 13.5332 41.6449 12.074 41.7648 10.2949ZM16.7339 0C5.79789 0 0 7.01649 0 14.6727C0 18.2309 1.97928 22.6487 5.13813 24.068C5.61796 24.2879 5.87786 24.1879 5.97783 23.7481C6.0578 23.4083 6.49764 21.7691 6.67757 20.9895C6.73755 20.7496 6.71756 20.5297 6.49764 20.2899C5.45802 19.0705 4.61832 16.8316 4.61832 14.7526C4.61832 9.3953 8.83679 4.23788 16.0542 4.23788C22.2719 4.23788 26.6303 8.29585 26.6303 14.1129C26.6303 20.6697 23.1716 25.2274 18.6732 25.2274C16.1941 25.2274 14.3348 23.2684 14.9146 20.8496C15.6343 17.971 17.0138 14.8526 17.0138 12.7736C17.0138 10.9145 15.9742 9.35532 13.815 9.35532C11.2759 9.35532 9.23664 11.8741 9.23664 15.2524C9.23664 17.3913 9.99637 18.8506 9.99637 18.8506C9.99637 18.8506 7.49728 29.0255 7.03744 30.9045C6.25773 34.1229 7.13741 39.3203 7.21738 39.7801C7.25736 40.02 7.53726 40.0999 7.6972 39.9001C7.93712 39.5802 10.976 35.2424 11.8157 32.104C12.1156 30.9645 13.3951 26.3268 13.3951 26.3268C14.2148 27.8461 16.634 29.1054 19.193 29.1054C26.8303 29.1054 32.3283 22.3688 32.3283 14.013C32.3283 5.997 25.5107 0 16.7339 0Z" />
              </svg>
            </div>
            <p className="landing-footer-copy">© 2026 Pinterest</p>
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
