import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { MoreHorizontal, Heart, EyeOff, Download, Flag } from "lucide-react";
import type { PostDTO } from "shared/types";
import { postService } from "../services/post.service";
import toast from "react-hot-toast";
import { useAuthStore } from "../stores/auth.store";

// ─── Pin More Menu ──────────────────────────────────────────────────
function PinMoreMenu({
  onClose,
  anchorRef,
}: {
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement>;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      const menuWidth = 236;
      let left = rect.right - menuWidth;
      if (left < 8) left = 8;
      setPos({
        top: rect.bottom + 6,
        left,
      });
    }
  }, [anchorRef]);

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

// ─── Varied height helper ───────────────────────────────────────────
const HEIGHT_VARIANTS = [280, 320, 360, 240, 400, 300, 340, 260, 380, 310, 350, 270, 330, 290, 370, 250];

export function getVariedHeight(index: number): number {
  return HEIGHT_VARIANTS[index % HEIGHT_VARIANTS.length];
}

// ─── Pin Card Component ──────────────────────────────────────────────
export function PinCard({ post, index }: { post: PostDTO; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [isSaving, setIsSaving] = useState(false);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const cardHeight = getVariedHeight(index);

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Silakan login untuk menyimpan pin");
      return;
    }
    
    if (isSaving) return;
    setIsSaving(true);
    try {
      const res = await postService.toggleSave(post.id);
      setIsSaved(res.data?.isSaved ?? false);
      if (res.data?.isSaved) {
        toast.success("Disimpan ke profil");
      }
    } catch (error) {
      toast.error("Gagal menyimpan pin");
    } finally {
      setIsSaving(false);
    }
  };

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
      <div className="pin-card-image-wrapper">
        {!imageLoaded && (
          <div
            className="w-full rounded-2xl animate-pulse"
            style={{
              backgroundColor: "var(--color-surface-secondary)",
              height: `${cardHeight}px`,
            }}
          />
        )}

        <Link to={`/post/${post.id}`} className="block">
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
        </Link>

        <div
          className={`pin-image-overlay ${
            isHovered || showMoreMenu ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => navigate(`/post/${post.id}`)}
        >
          <button
            className={`pin-save-btn ${isSaved ? "bg-[#111] text-white" : ""}`}
            onClick={handleSave}
            disabled={isSaving}
            style={isSaved ? { backgroundColor: "#111", color: "#fff" } : {}}
          >
            {isSaved ? "Saved" : "Save"}
          </button>

          <a
            className="pin-download-btn"
            href={post.imageUrl}
            download
            onClick={(e) => e.stopPropagation()}
            title="Download image"
          >
            <Download size={18} strokeWidth={2.5} />
          </a>
        </div>
      </div>

      <div className="pin-card-footer">
        <button
          ref={moreButtonRef}
          className="pin-more-btn"
          onClick={(e) => {
            e.stopPropagation();
            setShowMoreMenu(!showMoreMenu);
          }}
          title="More options"
        >
          <MoreHorizontal size={20} strokeWidth={2.5} />
        </button>
      </div>

      {showMoreMenu && (
        <PinMoreMenu
          anchorRef={moreButtonRef as React.RefObject<HTMLButtonElement>}
          onClose={() => {
            setShowMoreMenu(false);
            setIsHovered(false);
          }}
        />
      )}
    </div>
  );
}

// ─── Skeleton Card ───────────────────────────────────────────────────
export function SkeletonCard({ index = 0 }: { index?: number }) {
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
    </div>
  );
}
