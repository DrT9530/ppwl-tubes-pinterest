import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";
import { OnboardingModal } from "../components/OnboardingModal";
import { usePostFeed } from "../hooks/usePostFeed";
import { PinCard, SkeletonCard } from "../components/PinCard";

// ─── Home Page ───────────────────────────────────────────────────────
export default function HomePage() {
  const { user } = useAuthStore();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || undefined;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = usePostFeed(20, searchQuery);

  // Onboarding logic
  useEffect(() => {
    if (user) {
      const onboarded = localStorage.getItem(
        `pinterest_onboarded_${user.id}`
      );
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

  // Infinite scroll observer
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage) {
            fetchNextPage();
          }
        },
        { threshold: 0.1 }
      );

      if (node) observerRef.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  // Flatten all pages into a single array
  const allPosts =
    data?.pages.flatMap((page) => page.data || []) || [];

  return (
    <div className="relative min-h-screen">
      {showOnboarding && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}

      <div className="masonry-feed-container">
        {/* Loading State */}
        {isLoading && (
          <div className="masonry-grid">
            {Array.from({ length: 20 }).map((_, i) => (
              <SkeletonCard key={i} index={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-6xl mb-4">😢</div>
            <h2 className="text-xl font-semibold text-[#111] mb-2">
              Gagal memuat feed
            </h2>
            <p className="text-[#767676] mb-4">
              Terjadi kesalahan saat mengambil data
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-full font-semibold text-white"
              style={{ backgroundColor: "#e60023" }}
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && allPosts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-6xl mb-4">📌</div>
            <h2 className="text-xl font-semibold text-[#111] mb-2">
              Belum ada postingan
            </h2>
            <p className="text-[#767676]">
              Jadilah yang pertama membagikan inspirasi!
            </p>
          </div>
        )}

        {/* Masonry Feed */}
        {!isLoading && allPosts.length > 0 && (
          <div className="masonry-grid">
            {allPosts.map((post, index) => (
              <div
                key={post.id}
                style={{
                  animation: "var(--animate-fade-in)",
                  animationDelay: `${Math.min(index * 0.03, 0.5)}s`,
                  animationFillMode: "both",
                }}
              >
                <PinCard post={post} index={index} />
              </div>
            ))}

            {/* Infinite Scroll Trigger */}
            {hasNextPage && (
              <div ref={loadMoreRef} className="break-inside-avoid">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonCard key={`loading-${i}`} index={i + allPosts.length} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Loading more indicator */}
        {isFetchingNextPage && (
          <div className="flex justify-center py-8">
            <div
              className="spinner"
              style={{
                borderColor: "#e9e9e9",
                borderTopColor: "#e60023",
                width: "32px",
                height: "32px",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
