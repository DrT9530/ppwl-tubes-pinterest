import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MessageCircle, ArrowLeft, Upload, MoreHorizontal, Search, Pencil, Trash2, Check, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { postService } from "../services/post.service";
import { useAuthStore } from "../stores/auth.store";
import { LikeButton } from "../components/LikeButton";
import { CommentSection } from "../components/CommentSection";

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [captionDraft, setCaptionDraft] = useState("");
  // Local state for optimistic UI 
  const [localIsLiked, setLocalIsLiked] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["post", id],
    queryFn: () => postService.getById(id as string),
    enabled: !!id,
  });

  const { data: relatedData } = useQuery({
    queryKey: ["relatedPosts"],
    queryFn: () => postService.getFeed(1, 20),
  });

  // Sync local state when data loads
  useEffect(() => {
    if (data?.data) {
      setLocalIsLiked(data.data.isLiked || false);
      setLocalLikeCount(data.data.likeCount || 0);
      setCaptionDraft(data.data.caption || "");
    }
  }, [data]);

  const updateCaption = useMutation({
    mutationFn: () => postService.update(id as string, { caption: captionDraft }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["post", id] });
      await queryClient.invalidateQueries({ queryKey: ["posts"] });
      setIsEditingCaption(false);
      toast.success("Caption berhasil diperbarui");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Gagal memperbarui caption"),
  });

  const deletePost = useMutation({
    mutationFn: () => postService.delete(id as string),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post berhasil dihapus");
      navigate("/", { replace: true });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Gagal menghapus post"),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="spinner spinner-lg" style={{ borderColor: "#e9e9e9", borderTopColor: "#e60023", borderWidth: "4px", width: "48px", height: "48px" }} />
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-xl font-semibold mb-2">Pin not found</h2>
        <button onClick={() => navigate(-1)} className="px-5 py-3 mt-4 bg-gray-100 rounded-full font-semibold hover:bg-gray-200 transition-colors">Go back to feed</button>
      </div>
    );
  }

  const post = data.data;
  const relatedPosts = relatedData?.data || [];
  const isOwner = user?.id === post.creator.id;

  return (
    <div className="flex justify-center w-full max-w-[1800px] mx-auto relative px-4 sm:px-6 lg:px-8 pt-8 pb-24">
      
      {/* Sticky Back Button */}
      <div className="hidden lg:flex sticky top-24 self-start mr-6 xl:mr-10 shrink-0 z-20">
        <button 
          onClick={() => navigate(-1)} 
          className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors bg-white shadow-[0_0_8px_rgba(0,0,0,0.1)]"
          title="Back"
        >
          <ArrowLeft size={24} strokeWidth={2.5} className="text-[#111]" />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 w-full max-w-[1400px]">
        
        {/* LEFT COLUMN: Pin Detail (Single Column Layout) */}
        <div className="w-full lg:w-[508px] shrink-0 flex flex-col mx-auto lg:mx-0">
          
          {/* Action Bar (Sticky) */}
          <div className="flex items-center justify-between pb-3 sticky top-[76px] bg-white z-10 pt-2">
            <div className="flex items-center gap-1 sm:gap-2">
              <LikeButton 
                postId={post.id} 
                initialLiked={localIsLiked} 
                initialCount={localLikeCount} 
              />
              <button className="hover:bg-gray-100 p-3 rounded-full transition-colors text-[#111]">
                <MessageCircle size={20} strokeWidth={2.5} />
              </button>
              <button className="hover:bg-gray-100 p-3 rounded-full transition-colors text-[#111]">
                <Upload size={20} strokeWidth={2.5} />
              </button>
              {isOwner && (
                <>
                  <button
                    onClick={() => setIsEditingCaption(true)}
                    className="hover:bg-gray-100 p-3 rounded-full transition-colors text-[#111]"
                    title="Edit caption"
                  >
                    <Pencil size={20} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("Hapus post ini?")) {
                        deletePost.mutate();
                      }
                    }}
                    className="hover:bg-gray-100 p-3 rounded-full transition-colors text-[#cc0000]"
                    title="Delete post"
                    disabled={deletePost.isPending}
                  >
                    <Trash2 size={20} strokeWidth={2.5} />
                  </button>
                </>
              )}
              <button className="hover:bg-gray-100 p-3 rounded-full transition-colors text-[#111]">
                <MoreHorizontal size={20} strokeWidth={2.5} />
              </button>
            </div>
            <button className="bg-[#e60023] hover:bg-[#ad081b] text-white font-semibold rounded-full px-5 py-3.5 text-[15px] transition-colors">
              Save
            </button>
          </div>

          {/* Main Image */}
          <div className="w-full relative rounded-[32px] overflow-hidden mb-6 group cursor-zoom-in" style={{ boxShadow: "0 0 0 1px rgba(0,0,0,0.05)" }}>
            <img 
              src={post.imageUrl} 
              alt={post.caption || "Pin image"} 
              className="w-full h-auto max-h-[85vh] object-cover"
            />
            {/* AI modified pill (aesthetic detail) */}
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white text-[13px] font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
              AI modified
            </div>
            
            {/* Interactive Image Tools */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <button className="w-10 h-10 bg-white/90 backdrop-blur hover:bg-white rounded-full flex items-center justify-center text-[#111] shadow-sm transition-colors" title="Expand">
                 <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M11 5h2v14h-2zm-6 6h14v2H5z" transform="rotate(45, 12, 12)"/></svg>
               </button>
               <button className="w-10 h-10 bg-white/90 backdrop-blur hover:bg-white rounded-full flex items-center justify-center text-[#111] shadow-sm transition-colors" title="Visual search">
                 <Search size={20} strokeWidth={2.5}/>
               </button>
            </div>
          </div>

          {/* Title & Creator */}
          <div className="px-2 mb-10">
            {isEditingCaption ? (
              <div className="mb-6">
                <textarea
                  value={captionDraft}
                  maxLength={500}
                  onChange={(event) => setCaptionDraft(event.target.value)}
                  className="input-field min-h-[128px] resize-y text-xl font-semibold leading-tight"
                  autoFocus
                />
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-[#767676]">{captionDraft.length}/500</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCaptionDraft(post.caption || "");
                        setIsEditingCaption(false);
                      }}
                      className="btn-secondary px-4 py-2"
                      disabled={updateCaption.isPending}
                    >
                      <X size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => updateCaption.mutate()}
                      className="btn-primary px-4 py-2"
                      disabled={updateCaption.isPending}
                    >
                      <Check size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ) : post.caption ? (
              <h1 className="text-2xl sm:text-[28px] font-semibold text-[#111] leading-tight mb-6 break-words">
                {post.caption}
              </h1>
            ) : isOwner ? (
              <button
                type="button"
                onClick={() => setIsEditingCaption(true)}
                className="mb-6 text-left text-[15px] font-semibold text-[#767676] hover:text-[#111]"
              >
                Add caption
              </button>
            ) : null}
            <div className="flex items-center justify-between">
              <Link to={`/profile/${post.creator.id}`} className="flex items-center gap-3 group">
                <img 
                  src={post.creator.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${post.creator.username}`} 
                  alt={post.creator.username} 
                  className="w-[48px] h-[48px] rounded-full object-cover border border-gray-100 group-hover:brightness-95 transition-all" 
                />
                <span className="font-semibold text-[15px] text-[#111] group-hover:underline">{post.creator.username}</span>
              </Link>
              <button className="bg-[#e9e9e9] hover:bg-[#e2e2e2] text-[#111] font-semibold rounded-full px-5 py-3 text-[15px] transition-colors">
                Follow
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="px-2 pb-10">
            <h2 className="font-semibold text-[20px] text-[#111] mb-6">
              {post.commentCount > 0 ? `${post.commentCount} Comments` : "No comments yet"}
            </h2>
            
            <CommentSection 
              postId={post.id} 
              comments={post.comments || []} 
              onOpenAuthModal={() => {}} 
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Masonry Grid of Related Pins */}
        <div className="flex-1 min-w-0 pb-10 pt-2 lg:pt-0">
           {/* Mobile only back button helper */}
           <div className="lg:hidden flex items-center gap-3 mb-6 px-2">
             <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
                <ArrowLeft size={24} />
             </button>
             <h2 className="font-semibold text-[20px] text-[#111]">Explore more</h2>
           </div>

           <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-2 xl:columns-3 2xl:columns-4 gap-4">
              {relatedPosts.map((relatedPost: any) => (
                 <Link to={`/post/${relatedPost.id}`} key={relatedPost.id} className="block mb-4 break-inside-avoid group relative rounded-2xl overflow-hidden cursor-zoom-in">
                    <img 
                      src={relatedPost.imageUrl} 
                      alt={relatedPost.caption || "Related pin"} 
                      loading="lazy"
                      className="w-full h-auto object-cover rounded-[20px] shadow-sm transition-transform duration-300 group-hover:brightness-[0.85]"
                    />
                    {/* Hover Overlay like main page */}
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between pointer-events-none">
                       <div className="flex justify-end gap-2 self-end mt-auto">
                          <LikeButton 
                            postId={relatedPost.id} 
                            initialLiked={relatedPost.isLiked} 
                            initialCount={relatedPost.likeCount || 0} 
                            compact={true} 
                          />
                       </div>
                    </div>
                 </Link>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
}
