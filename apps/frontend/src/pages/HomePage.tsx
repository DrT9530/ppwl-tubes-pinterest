import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useAuthStore } from "../stores/auth.store";
import { OnboardingModal } from "../components/OnboardingModal";
import { usePostFeed } from "../hooks/usePostFeed";
import { ExternalLink, MoreHorizontal, Heart, EyeOff, Download, Flag } from "lucide-react";
import type { PostDTO } from "shared/types";

// ─── Pin More Menu (Portal-based dropdown) ───────────────────────────
function PinMoreMenu({
  onClose,
  anchorRef,
}: {
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement>;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  // Position the menu relative to the anchor button
  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      const menuWidth = 236;
      // Position below the button, aligned to the right edge
      let left = rect.right - menuWidth;
      if (left < 8) left = 8;
      setPos({
        top: rect.bottom + 6,
        left,
      });
    }
  }, [anchorRef]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 10);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose, anchorRef]);

  const menuItems = [
    { icon: Heart, label: "See more like this", onClick: () => onClose() },
    { icon: EyeOff, label: "See less like this", onClick: () => onClose() },
    { icon: Download, label: "Download image", onClick: () => onClose() },
    { icon: Flag, label: "Report Pin", onClick: () => onClose(), danger: true },
  ];

  return createPortal(
    <div
      ref={menuRef}
      className="pin-more-menu"
      style={{ top: `${pos.top}px`, left: `${pos.left}px` }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="pin-more-menu-hint">
        This Pin was inspired by your recent activity
      </div>
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.label}
            className={`pin-more-menu-item ${item.danger ? "danger" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              item.onClick();
            }}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>,
    document.body
  );
}

// ─── Varied height helper (deterministic per post) ──────────────────
const HEIGHT_VARIANTS = [280, 320, 360, 240, 400, 300, 340, 260, 380, 310, 350, 270, 330, 290, 370, 250];

function getVariedHeight(index: number): number {
  return HEIGHT_VARIANTS[index % HEIGHT_VARIANTS.length];
}

// ─── Pin Card Component ──────────────────────────────────────────────
function PinCard({ post, index }: { post: PostDTO; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const cardHeight = getVariedHeight(index);

  return (
    <div
      className="pin-card mb-4 break-inside-avoid"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        if (!showMoreMenu) {
          setIsHovered(false);
        }
      }}
    >
      {/* Image Container */}
      <div className="pin-card-image-wrapper">
        {/* Skeleton */}
        {!imageLoaded && (
          <div
            className="w-full rounded-2xl animate-pulse"
            style={{
              backgroundColor: "var(--color-surface-secondary)",
              height: `${cardHeight}px`,
            }}
          />
        )}

        {/* Main Image */}
        <img
          src={post.imageUrl}
          alt={post.caption || "Pin"}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          style={{ height: `${cardHeight}px` }}
          className={`w-full rounded-2xl object-cover transition-opacity duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0 absolute inset-0"
          }`}
        />

        {/* Hover Overlay */}
        <div
          className={`absolute inset-0 rounded-2xl transition-opacity duration-200 ${
            isHovered || showMoreMenu ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          {/* Save Button — top right */}
          <button
            className="pin-save-btn"
            onClick={(e) => e.stopPropagation()}
          >
            Save
          </button>

          {/* Bottom Actions — share (left) + more (right) */}
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
            {/* Share / Upload button */}
            <button
              className="pin-action-btn"
              onClick={(e) => e.stopPropagation()}
              title="Share"
            >
              <ExternalLink size={16} />
            </button>

            {/* More / Three dots button */}
            <button
              ref={moreButtonRef}
              className="pin-action-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowMoreMenu(!showMoreMenu);
              }}
              title="More options"
            >
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Portal-based More Menu */}
      {showMoreMenu && (
        <PinMoreMenu
          anchorRef={moreButtonRef as React.RefObject<HTMLButtonElement>}
          onClose={() => {
            setShowMoreMenu(false);
            setIsHovered(false);
          }}
        />
      )}

      {/* Caption + Creator Info */}
      {(post.caption || post.creator) && (
        <div className="px-1 pt-2 pb-1">
          {post.caption && (
            <p className="text-sm font-medium text-[#111] line-clamp-2 leading-tight">
              {post.caption}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1.5">
            {post.creator.avatarUrl ? (
              <img
                src={post.creator.avatarUrl}
                alt={post.creator.username}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#e9e9e9] flex items-center justify-center text-xs font-bold text-[#111]">
                {post.creator.username.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-xs font-medium text-[#111] truncate">
              {post.creator.username}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Skeleton Card ───────────────────────────────────────────────────
function SkeletonCard({ index = 0 }: { index?: number }) {
  const height = getVariedHeight(index);
  return (
    <div className="mb-4 break-inside-avoid">
      <div
        className="w-full rounded-2xl animate-pulse"
        style={{
          backgroundColor: "var(--color-surface-secondary)",
          height: `${height}px`,
        }}
      />
      <div className="px-1 pt-2 space-y-2">
        <div
          className="h-3 rounded-full animate-pulse w-3/4"
          style={{ backgroundColor: "var(--color-surface-secondary)" }}
        />
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full animate-pulse"
            style={{ backgroundColor: "var(--color-surface-secondary)" }}
          />
          <div
            className="h-3 rounded-full animate-pulse w-16"
            style={{ backgroundColor: "var(--color-surface-secondary)" }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Home Page ───────────────────────────────────────────────────────
export function HomePage() {
  const { user } = useAuthStore();
  const [showOnboarding, setShowOnboarding] = useState(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = usePostFeed();

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
