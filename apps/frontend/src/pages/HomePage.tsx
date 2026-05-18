import { Link } from "react-router-dom"; 
import { Heart, MessageCircle } from "lucide-react"; 

// Data simulasi gambar estetik ala Pinterest biar Homepage kamu langsung penuh gambar!
const DUMMY_POSTS = [
  { id: "1", imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60", caption: "Abstract Wave Aesthetic", likeCount: 142, commentCount: 12, creator: { username: "bila_design" } },
  { id: "2", imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500&auto=format&fit=crop&q=60", caption: "Retro Floral Art", likeCount: 95, commentCount: 4, creator: { username: "vintage_vibes" } },
  { id: "3", imageUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=500&auto=format&fit=crop&q=60", caption: "Neon Fluid Typography", likeCount: 320, commentCount: 45, creator: { username: "cyber_art" } },
  { id: "4", imageUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&auto=format&fit=crop&q=60", caption: "Minimalist Room Interior Setup", likeCount: 210, commentCount: 18, creator: { username: "cozy_space" } },
  { id: "5", imageUrl: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=500&auto=format&fit=crop&q=60", caption: "Oil Painting Texture", likeCount: 88, commentCount: 3, creator: { username: "painter_hub" } },
  { id: "6", imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=60", caption: "Yosemite Valley Landscape", likeCount: 512, commentCount: 89, creator: { username: "nature_geo" } },
];

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 mt-6">
      <h1 className="text-xl font-bold text-gray-800 mb-6 px-1">Inspirasi untuk Kamu</h1>
      
      {/* Grid Layout CSS Murni ala Pinterest */}
      <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-4">
        {DUMMY_POSTS.map((post) => (
          <div key={post.id} className="break-inside-avoid mb-4 group relative cursor-pointer">
            
            {/* Klik gambar ini otomatis pindah ke halaman detail */}
            <Link to={`/post/${post.id}`} className="block relative overflow-hidden rounded-2xl">
              <img
                src={post.imageUrl}
                alt={post.caption}
                loading="lazy" 
                className="w-full object-cover rounded-2xl transition duration-300 group-hover:brightness-75 shadow-sm"
              />
              
              {/* Overlay pas di-hover */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between text-white pointer-events-none">
                <div className="flex justify-end gap-3 self-end mt-auto bg-black/50 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 fill-white text-white" /> {post.likeCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5 fill-white text-white" /> {post.commentCount}
                  </span>
                </div>
              </div>
            </Link>

            {/* Info Kreator & Caption */}
            <div className="mt-2 px-1 text-gray-900">
              <p className="text-sm font-semibold truncate mb-0.5">{post.caption}</p>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-[10px] font-bold text-gray-600">
                  {post.creator.username[0].toUpperCase()}
                </div>
                <span className="text-xs text-gray-500 hover:underline font-medium truncate">
                  {post.creator.username}
                </span>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}