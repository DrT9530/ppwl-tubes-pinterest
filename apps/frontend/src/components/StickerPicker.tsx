import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

// Tenor API v2 - Free tier key for testing (Google public key)
const TENOR_API_KEY = "AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ";
const TENOR_CLIENT = "pinterest_clone";

interface TenorResult {
  id: string;
  title: string;
  media_formats: {
    tinygif_transparent?: { url: string };
    nanogif_transparent?: { url: string };
    gif_transparent?: { url: string };
    tinygif?: { url: string };
    nanogif?: { url: string };
    gifpreview?: { url: string };
    tinywebp_transparent?: { url: string };
    nanowebp_transparent?: { url: string };
    webp_transparent?: { url: string };
    tinywebp?: { url: string };
    nanowebp?: { url: string };
  };
}

interface StickerPickerProps {
  onSelect: (stickerUrl: string) => void;
  onClose: () => void;
}

const STICKER_CATEGORIES = [
  { label: "😊", query: "happy sticker" },
  { label: "😂", query: "laugh sticker" },
  { label: "❤️", query: "love sticker" },
  { label: "👍", query: "thumbs up sticker" },
  { label: "🎉", query: "celebration sticker" },
  { label: "😢", query: "sad sticker" },
  { label: "🔥", query: "fire sticker" },
  { label: "🐱", query: "cat sticker" },
];

export function StickerPicker({ onSelect, onClose }: StickerPickerProps) {
  const [stickers, setStickers] = useState<TenorResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchStickers = async (query: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        key: TENOR_API_KEY,
        client_key: TENOR_CLIENT,
        limit: "30",
        media_filter: "tinygif_transparent,tinygif,tinywebp_transparent,tinywebp",
        searchfilter: "sticker",
      });
      const res = await fetch(`https://tenor.googleapis.com/v2/search?${params}`);
      const data = await res.json();
      setStickers(data.results || []);
    } catch (err) {
      console.error("Tenor fetch error:", err);
      setStickers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStickers(STICKER_CATEGORIES[activeCategory].query);
  }, [activeCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchStickers(searchQuery + " sticker");
    }
  };

  const getStickerUrl = (sticker: TenorResult): string => {
    const mf = sticker.media_formats;
    return (
      mf.tinygif_transparent?.url ||
      mf.tinywebp_transparent?.url ||
      mf.tinygif?.url ||
      mf.tinywebp?.url ||
      mf.nanogif_transparent?.url ||
      mf.nanowebp_transparent?.url ||
      mf.nanogif?.url ||
      mf.nanowebp?.url ||
      ""
    );
  };

  return (
    <div
      ref={containerRef}
      className="sticker-picker-panel"
      style={{
        width: 340,
        maxHeight: 400,
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        overflow: "hidden",
        border: "1px solid #e0e0e0",
      }}
    >
      {/* Header */}
      <div style={{ padding: "12px 14px 8px", borderBottom: "1px solid #f0f0f0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#111" }}>Stickers</span>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", cursor: "pointer", padding: 4,
              borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            }}
            className="hover:bg-black/5 transition"
          >
            <X size={18} color="#767676" />
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 6 }}>
          <div style={{
            display: "flex", alignItems: "center", flex: 1, background: "#f5f5f5",
            borderRadius: 20, padding: "6px 12px", gap: 6,
          }}>
            <Search size={16} color="#8a8a8a" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search stickers..."
              style={{
                border: "none", outline: "none", background: "transparent",
                fontSize: 13, flex: 1, color: "#111",
              }}
            />
          </div>
        </form>

        {/* Category pills */}
        <div style={{ display: "flex", gap: 4, marginTop: 8, overflowX: "auto", paddingBottom: 2 }}>
          {STICKER_CATEGORIES.map((cat, i) => (
            <button
              key={i}
              onClick={() => { setActiveCategory(i); setSearchQuery(""); }}
              style={{
                padding: "4px 10px", borderRadius: 16, border: "none", cursor: "pointer",
                fontSize: 18, background: activeCategory === i ? "#111" : "#f0f0f0",
                filter: activeCategory === i ? "none" : "grayscale(0.3)",
                transition: "all 0.15s",
                flexShrink: 0,
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sticker grid */}
      <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
            <div className="spinner" style={{ borderColor: "#e9e9e9", borderTopColor: "#e60023", width: 28, height: 28 }} />
          </div>
        ) : stickers.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#999", fontSize: 13 }}>
            Tidak ada stiker ditemukan
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 6,
          }}>
            {stickers.map((sticker) => {
              const url = getStickerUrl(sticker);
              if (!url) return null;
              return (
                <button
                  key={sticker.id}
                  onClick={() => onSelect(url)}
                  style={{
                    background: "transparent", border: "2px solid transparent", borderRadius: 12,
                    padding: 6, cursor: "pointer", transition: "all 0.15s",
                    aspectRatio: "1/1", display: "flex", alignItems: "center", justifyContent: "center",
                    overflow: "hidden",
                  }}
                  className="hover:bg-gray-100 hover:border-gray-300"
                  title={sticker.title}
                >
                  <img
                    src={url}
                    alt={sticker.title}
                    loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Tenor attribution */}
      <div style={{
        padding: "6px 14px", borderTop: "1px solid #f0f0f0",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
        fontSize: 10, color: "#999",
      }}>
        Powered by
        <img
          src="https://www.gstatic.com/tenor/web/attribution/PB_tenor_logo_blue_horizontal.svg"
          alt="Tenor"
          style={{ height: 12 }}
        />
      </div>
    </div>
  );
}
