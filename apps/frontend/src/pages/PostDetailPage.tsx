import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, MessageSquare, ArrowLeft, Send } from "lucide-react";

// Data detail yang dicocokkan berdasarkan ID yang di-klik dari Homepage
const POST_DATA_STORE: Record<string, any> = {
  "1": { imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800...", caption: "Aesthetics abstract background wave painting. Sangat cocok untuk wallpaper hp atau inspirasi desain interior kamar kamu.", username: "bila_design" },
  "2": { imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800...", caption: "Retro Floral Art Illustration dengan warna-warna hangat tahun 70an.", username: "vintage_vibes" },
  "3": { imageUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800...", caption: "Neon Fluid Typography art dengan perpaduan warna ungu dan biru elektrik.", username: "cyber_art" },
  "4": { imageUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800...", caption: "Minimalist Room Interior Setup untuk kamar tidur berukuran 3x3.", username: "cozy_space" },
  "5": { imageUrl: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=800...", caption: "Oil Painting Texture sapuan kuas tebal yang artistik.", username: "painter_hub" },
  "6": { imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800...", caption: "Yosemite Valley Landscape pemandangan alam yang megah di sore hari.", username: "nature_geo" },
};

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [isLiked, setIsLiked] = useState(false);
  const [commentText, setCommentText] = useState("");

  const currentData = POST_DATA_STORE[id || "1"] || POST_DATA_STORE["1"];
  
  const [post, setPost] = useState<any>({
    id: id || "1",
    imageUrl: currentData.imageUrl.includes("...") ? "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60" : currentData.imageUrl,
    caption: currentData.caption,
    creator: {
      username: currentData.username,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${currentData.username}`,
    },
    likeCount: 142,
    comments: [
      { id: "c1", username: "dika_reza", text: "Keren banget warnanya! Kakak bikin pakai software apa?" },
      { id: "c2", username: "siti_s", text: "Izin pin dan save buat bahan referensi ya kak 🙌" },
    ]
  });

  useEffect(() => {
    const freshData = POST_DATA_STORE[id || "1"] || POST_DATA_STORE["1"];
    setPost({
      id: id || "1",
      imageUrl: freshData.imageUrl.includes("...") ? "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60" : freshData.imageUrl,
      caption: freshData.caption,
      creator: {
        username: freshData.username,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${freshData.username}`,
      },
      likeCount: 142,
      comments: [
        { id: "c1", username: "dika_reza", text: "Keren banget warnanya! Kakak bikin pakai software apa?" },
        { id: "c2", username: "siti_s", text: "Izin pin dan save buat bahan referensi ya kak 🙌" },
      ]
    });
    setIsLiked(false);
  }, [id]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setPost((prev: any) => ({
      ...prev,
      likeCount: isLiked ? prev.likeCount - 1 : prev.likeCount + 1
    }));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment = {
      id: Date.now().toString(),
      username: "kamu_user",
      text: commentText.trim(),
    };

    setPost((prev: any) => ({
      ...prev,
      comments: [...prev.comments, newComment],
    }));
    setCommentText("");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Tombol Kembali yang Estetik */}
      <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-semibold transition bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full text-sm">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Feed
      </Link>

      {/* CARD DESAIN UTAMA PIN DETAIL */}
      <div className="bg-white rounded-[32px] shadow-2xl border border-gray-100 overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[500px]">
        
        {/* Kolom Kiri: Gambar Postingan */}
        <div className="bg-gray-50 flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-gray-100">
          <img
            src={post.imageUrl}
            alt="Detail Pin"
            className="w-full h-auto max-h-[65vh] object-contain rounded-2xl"
          />
        </div>

        {/* Kolom Kanan: Panel Konten & Interaksi */}
        <div className="p-8 flex flex-col justify-between">
          <div>
            {/* Atas: Bar Interaksi & Akun */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <div className="flex items-center gap-3">
                <img src={post.creator.avatarUrl} alt="avatar" className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200" />
                <span className="text-sm font-bold text-gray-900">{post.creator.username}</span>
              </div>

              {/* Tombol Like */}
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold transition ${
                  isLiked 
                    ? "bg-red-50 border-red-200 text-red-600 shadow-sm" 
                    : "bg-gray-100 border-transparent text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? "fill-red-600 text-red-600" : ""}`} />
                <span>{post.likeCount}</span>
              </button>
            </div>

            {/* Tengah: Caption */}
            <div className="mb-6">
              <h1 className="text-xl font-extrabold text-gray-900 mb-3">Deskripsi Gambar</h1>
              <p className="text-gray-600 text-sm leading-relaxed">{post.caption}</p>
            </div>

            {/* Bawah: Kolom Komentar */}
            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" /> Komentar ({post.comments.length})
              </h3>
              
              <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                {post.comments.map((c: any) => (
                  <div key={c.id} className="text-xs bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    <span className="font-bold text-gray-900 mr-2">{c.username}</span>
                    <span className="text-gray-600 leading-normal">{c.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Kolom Input Chat Komentar */}
          <form onSubmit={handleAddComment} className="border-t border-gray-100 pt-4 mt-6 flex gap-2">
            <input
              type="text"
              placeholder="Tulis komentar kamu di sini..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 bg-gray-50 border border-transparent rounded-full px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
            />
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-full transition shadow-md disabled:opacity-40"
              disabled={!commentText.trim()}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}