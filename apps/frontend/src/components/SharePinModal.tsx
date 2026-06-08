// components/SharePinModal.tsx
import { X, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { postService } from "../services/post.service";

interface SharePinModalProps {
  onClose: () => void;
  onSelectPin: (postId: string) => void;
}

export function SharePinModal({ onClose, onSelectPin }: SharePinModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: response, isLoading } = useQuery({
    queryKey: ["posts", "feed", debouncedSearch],
    queryFn: () => postService.getFeed(1, 40, debouncedSearch),
  });

  const filteredPosts = response?.data || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div 
        className="bg-white rounded-3xl shadow-2xl w-[450px] max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-[#111]">Kirim Pin</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="share-pin-search-container border-b border-gray-100">
          <div className="share-pin-search-input-wrapper">
            <Search className="share-pin-search-icon" size={16} />
            <input 
              type="text" 
              placeholder="Cari Pin untuk dikirim..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="share-pin-search-input"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {isLoading ? (
            <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-gray-200 border-t-[#e60023] rounded-full animate-spin"></div></div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center p-8 text-gray-500">Tidak ada Pin ditemukan.</div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredPosts.map((post: any) => (
                <div 
                  key={post.id} 
                  onClick={() => {
                    onSelectPin(post.id);
                    onClose();
                  }}
                  className="relative group cursor-pointer rounded-xl overflow-hidden aspect-[3/4] bg-gray-100"
                >
                  <img src={post.imageUrl} alt={post.caption || "Pin"} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <button className="opacity-0 group-hover:opacity-100 bg-[#e60023] text-white font-bold py-2 px-4 rounded-full transform translate-y-2 group-hover:translate-y-0 transition-all">
                      Kirim
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
