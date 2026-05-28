import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { todayCategories, type TodayCategory } from "../data/todayCategories";
import { ArrowLeft, MoreHorizontal } from "lucide-react";

// Custom descriptions dictionary for each category slug to match Screenshot 1's high aesthetic fidelity
const categoryMeta: Record<string, { description: string; subtitle: string }> = {
  "adha-greeting": {
    description: "Share heartfelt Eid al-Adha greetings with loved ones, spreading joy, blessings, and warm wishes.",
    subtitle: "Papan unggulan · 78 Pin"
  },
  "music-inspired-diy": {
    description: "Creative craft projects, vintage vinyl upgrades, and artistic home additions inspired by your favorite tunes.",
    subtitle: "Papan unggulan · 45 Pin"
  },
  "minimalist-room-decor": {
    description: "Clean lines, neutral color schemes, and clutter-free arrangements to create your ultimate peaceful sanctuary.",
    subtitle: "Papan unggulan · 62 Pin"
  },
  "healthy-breakfast-ideas": {
    description: "Nutritious, delicious, and easy-to-make breakfast options to kickstart your morning with high energy.",
    subtitle: "Papan unggulan · 50 Pin"
  },
  "streetwear-fashion": {
    description: "Bold urban fashion inspiration, trendy streetwear outfits, sneakers, and modern casual aesthetic looks.",
    subtitle: "Papan unggulan · 85 Pin"
  },
  "digital-art-portrait": {
    description: "Stunning digital character designs, colorful portrait illustrations, neon lighting aesthetics, and fantasy art.",
    subtitle: "Papan unggulan · 40 Pin"
  },
  "nature-photography": {
    description: "Breathtaking landscapes, misty forests, majestic mountains, and beautiful travel photography across the world.",
    subtitle: "Papan unggulan · 96 Pin"
  }
};

export default function TodayCategoryPage() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<TodayCategory | null>(null);
  const [dummyImages, setDummyImages] = useState<string[]>([]);

  useEffect(() => {
    const found = todayCategories.find((c) => c.slug === categorySlug);
    if (found) {
      setCategory(found);
      
      const primaryKeyword = found.unsplashKeywords.split(',')[0];
      
      // Generate 40 dummy image URLs using loremflickr with the keyword
      const images = Array.from({ length: 40 }).map((_, i) => {
        const width = 600;
        const height = Math.floor(Math.random() * 400) + 600; // random height between 600 and 1000
        return `https://loremflickr.com/${width}/${height}/${primaryKeyword}?lock=${i + 1}`;
      });
      setDummyImages(images);
    }
  }, [categorySlug]);

  if (!category) {
    return (
      <div className="pt-32 text-center">
        <h2 className="text-2xl font-bold text-[#111]">Kategori tidak ditemukan.</h2>
        <button 
          onClick={() => navigate("/today")} 
          className="mt-4 px-6 py-3 bg-[#e60023] text-white rounded-full font-semibold hover:bg-red-700 transition-colors"
        >
          Kembali ke Hari Ini
        </button>
      </div>
    );
  }

  // Get description meta or use fallback
  const meta = categoryMeta[category.slug] || {
    description: "Discover ideas, inspiration, and beautiful visual contents curated specifically for this category.",
    subtitle: "Papan unggulan · 40 Pin"
  };

  return (
    <div className="category-page-container max-w-[1800px] mx-auto animate-fade-in">
      {/* Header & Back Button Wrapper (Deep Padding for Centering Text) */}
      <div className="category-page-header-wrapper">
        {/* Back Button Floating on top left */}
        <div className="category-page-back-btn">
          <button 
            onClick={() => navigate("/today")}
            className="w-12 h-12 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
            title="Kembali ke Hari Ini"
          >
            <ArrowLeft size={24} className="text-[#111]" />
          </button>
        </div>

        {/* Header Info Section (Pinterest Board Style) */}
        <div className="category-page-header-section flex flex-col md:flex-row w-full items-start justify-between gap-6">
          <div className="flex flex-col flex-1 min-w-0">
            {/* Big Title */}
            <h1 className="category-page-title text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111] tracking-tight leading-tight">
              {category.title}
            </h1>
            
            {/* Subtitle (Board Pin Count) */}
            <div className="category-page-subtitle flex items-center gap-2 text-[15px] font-semibold text-[#111]">
              <svg aria-hidden="true" height="18" viewBox="0 0 24 24" width="18" fill="currentColor">
                <path d="M19.5 21a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h15zM4.5 4.5h15a4.5 4.5 0 0 1 4.5 4.5v1.5h-24V9a4.5 4.5 0 0 1 4.5-4.5z" opacity=".3"></path>
                <path d="M4.5 3A6 6 0 0 0 0 9v9a6 6 0 0 0 6 6h12a6 6 0 0 0 6-6V9a6 6 0 0 0-6-6H4.5zm13.5 3a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-12a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3h12z"></path>
              </svg>
              <span>{meta.subtitle}</span>
            </div>
            
            {/* Description */}
            <p className="category-page-description text-[15px] text-[#111] max-w-[650px] leading-relaxed">
              {meta.description}
            </p>
            
            {/* Creator Profile Link */}
            <div className="category-page-creator-row flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#e60023] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                P
              </div>
              <span className="text-[15px] text-[#111] font-semibold">
                oleh <span className="hover:underline cursor-pointer">Pinterest Clone</span>
              </span>
            </div>
          </div>
          
          {/* Right Side Share & More Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0 max-sm:w-full max-sm:justify-end">
            <button className="category-page-share-btn flex items-center gap-2 bg-[#efefef] font-bold text-[15px] text-[#111] hover:bg-[#e2e2e2] transition-colors cursor-pointer">
              Bagikan
            </button>
            <button 
              className="category-page-more-btn flex h-12 w-12 items-center justify-center bg-[#efefef] text-[#111] hover:bg-[#e2e2e2] transition-colors cursor-pointer" 
              title="More options"
            >
              <MoreHorizontal size={22} strokeWidth={2.4} />
            </button>
          </div>
        </div>
      </div>

      {/* Masonry Grid */}
      <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-4 space-y-4 px-1">
        {dummyImages.map((src, idx) => (
          <div key={idx} className="break-inside-avoid relative group rounded-[16px] overflow-hidden cursor-zoom-in shadow-sm border border-gray-100 bg-[#f9f9f9]">
            <img 
              src={src} 
              alt={`${category.title} inspiration ${idx}`} 
              className="w-full h-auto object-cover transition-transform duration-300 group-hover:brightness-95"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
          </div>
        ))}
      </div>
    </div>
  );
}
