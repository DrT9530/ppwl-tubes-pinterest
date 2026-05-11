import { useState, useEffect } from "react";
import { useAuthStore } from "../stores/auth.store";
import { OnboardingModal } from "../components/OnboardingModal";

// pages/HomePage.tsx — Home feed page (placeholder for Bila's domain)
export function HomePage() {
  const { user } = useAuthStore();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user) {
      const onboarded = localStorage.getItem(`pinterest_onboarded_${user.id}`);
      if (!onboarded) {
        setShowOnboarding(true);
      }
    }
  }, [user]);

  const handleOnboardingComplete = () => {
    if (user) {
      localStorage.setItem(`pinterest_onboarded_${user.id}`, "true");
    }
    setShowOnboarding(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto relative">
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}
      <div className="text-center py-20">
        <h2 className="text-3xl font-bold mb-4" style={{ color: "var(--color-text-primary)" }}>
          Welcome to Pinterest Clone
        </h2>
        <p className="text-lg mb-8" style={{ color: "var(--color-text-secondary)" }}>
          Discover ideas and inspiration for your next project
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden"
              style={{
                backgroundColor: "var(--color-surface-secondary)",
                height: `${200 + Math.random() * 150}px`,
                animation: `var(--animate-slide-up)`,
                animationDelay: `${i * 0.05}s`,
                animationFillMode: "both",
              }}
            >
              <div className="flex items-center justify-center h-full text-gray-300">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
