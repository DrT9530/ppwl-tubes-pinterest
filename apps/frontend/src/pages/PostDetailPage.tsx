import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MessageCircle, ArrowLeft, Upload, MoreHorizontal, Search, Check, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { postService } from "../services/post.service";
import { useAuthStore } from "../stores/auth.store";
import { LikeButton } from "../components/LikeButton";
import { CommentSection } from "../components/CommentSection";

const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    "bg-[#a6c8e0]", // Soft sky blue
    "bg-[#b3d4c3]", // Soft green
    "bg-[#f0c2a2]", // Soft peach
    "bg-[#e0b3c3]", // Soft pink
    "bg-[#d4b3e0]", // Soft lavender
    "bg-[#ebd382]", // Soft yellow
  ];
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [captionDraft, setCaptionDraft] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [allowComments, setAllowComments] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

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

  const handleDownload = async () => {
    try {
      const response = await fetch(post.imageUrl);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const extension = blob.type.split("/")[1] || "jpg";

      link.href = url;
      link.download = `pinterest-pin-${post.id}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setShowDropdown(false);
      toast.success("Gambar berhasil diunduh!");
    } catch {
      setShowDropdown(false);
      toast.error("Gagal mengunduh gambar");
    }
  };

  const handleCopyEmbed = async () => {
    const embedCode = `<iframe src="${window.location.origin}/embed/${post.id}" width="345" height="600" frameborder="0" scrolling="no" style="border:none; border-radius:8px;"></iframe>`;

    try {
      await navigator.clipboard.writeText(embedCode);
      toast.success("Kode sisipan berhasil disalin ke clipboard!");
    } catch {
      toast.error("Gagal menyalin kode sisipan");
    } finally {
      setShowDropdown(false);
    }
  };

  const handleDeletePin = () => {
    setShowDropdown(false);
    if (window.confirm("Hapus Pin ini?")) {
      deletePost.mutate();
    }
  };

  const creatorInitials = post.creator.username ? post.creator.username.charAt(0).toUpperCase() : "U";
  const avatarBgColor = stringToColor(post.creator.username || "");

  return (
    <div className="flex justify-center w-full max-w-[1800px] mx-auto relative px-4 sm:px-6 lg:px-8 pt-8 pb-24">
      
      {/* Sticky Back Button (Simple arrow icon without card/shadow background) */}
      <div className="hidden lg:flex sticky top-24 self-start mr-4 shrink-0 z-20">
        <button 
          onClick={() => navigate(-1)} 
          className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-[#f1f1f1] active:bg-[#e1e1e1] text-[#111] transition-all duration-200"
          title="Back"
        >
          <ArrowLeft size={28} strokeWidth={2.4} className="text-[#111]" />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 w-full max-w-[1400px]">
        
        {/* LEFT COLUMN: Pin Detail (Unified White Card Container) */}
        <div className="w-full lg:w-[620px] shrink-0 bg-white rounded-[32px] shadow-[0_1px_24px_rgba(0,0,0,0.06)] border border-[#efefef] p-6 sm:p-8 flex flex-col mx-auto lg:mx-0 self-start">
          
          {/* Action Bar (Sticky Inside Card) */}
          <div className="flex items-center justify-between pb-4 sticky top-[76px] bg-white z-20 pt-1">
            <div className="flex items-center gap-3">
              <LikeButton 
                postId={post.id} 
                initialLiked={localIsLiked} 
                initialCount={localLikeCount} 
              />
              <button className="w-11 h-11 flex items-center justify-center rounded-full text-[#111] hover:bg-[#f1f1f1] active:bg-[#e1e1e1] transition-all duration-200">
                <MessageCircle size={24} strokeWidth={2.4} />
              </button>
              <button className="w-11 h-11 flex items-center justify-center rounded-full text-[#111] hover:bg-[#f1f1f1] active:bg-[#e1e1e1] transition-all duration-200">
                <Upload size={24} strokeWidth={2.4} />
              </button>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowDropdown((prev) => !prev)}
                  className={`w-11 h-11 flex items-center justify-center rounded-full text-[#111] hover:bg-[#f1f1f1] active:bg-[#e1e1e1] transition-all duration-200 ${showDropdown ? 'bg-[#f1f1f1]' : ''}`}
                  title="More options"
                  aria-expanded={showDropdown}
                >
                  <MoreHorizontal size={24} strokeWidth={2.4} />
                </button>

                {showDropdown && (
                  <div className="absolute left-0 top-full mt-2 w-[280px] rounded-[16px] border border-gray-100 bg-white p-2 shadow-[0_8px_24px_rgba(0,0,0,0.12)] z-30 animate-fade-in-up">
                    <div className="px-3 py-2 text-[12px] font-bold text-[#767676] uppercase tracking-wider">
                      Opsi Pin
                    </div>
                    {isOwner && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingCaption(true);
                            setShowDropdown(false);
                          }}
                          className="w-full rounded-xl px-3 py-2.5 text-left text-[15px] font-semibold text-[#111] hover:bg-[#f1f1f1] transition-colors"
                        >
                          Edit Pin
                        </button>
                        <button
                          type="button"
                          onClick={handleDeletePin}
                          className="w-full rounded-xl px-3 py-2.5 text-left text-[15px] font-semibold text-[#cc0000] hover:bg-[#fff0f0] transition-colors disabled:opacity-60"
                          disabled={deletePost.isPending}
                        >
                          Hapus Pin
                        </button>
                      </>
                    )}
                    
                    {/* Toggle Switch */}
                    <div className="flex w-full items-center justify-between gap-4 rounded-xl px-3 py-2.5 text-left text-[15px] font-semibold text-[#111] hover:bg-[#f1f1f1] cursor-pointer transition-colors"
                         onClick={() => setAllowComments((prev) => !prev)}>
                      <span>Izinkan komentar</span>
                      <button
                        type="button"
                        className={`relative h-6 w-11 rounded-full p-1 cursor-pointer transition-all duration-300 ${
                          allowComments ? "bg-[#0fa573]" : "bg-[#cdcdcd]"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setAllowComments((prev) => !prev);
                        }}
                      >
                        <span
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-300 ${
                            allowComments ? "left-[22px]" : "left-0.5"
                          }`}
                        />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleDownload}
                      className="w-full rounded-xl px-3 py-2.5 text-left text-[15px] font-semibold text-[#111] hover:bg-[#f1f1f1] transition-colors"
                    >
                      Unduh gambar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        toast.success("Berhasil ditambahkan ke kolase");
                        setShowDropdown(false);
                      }}
                      className="w-full rounded-xl px-3 py-2.5 text-left text-[15px] font-semibold text-[#111] hover:bg-[#f1f1f1] transition-colors"
                    >
                      Tambahkan ke kolase
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyEmbed}
                      className="w-full rounded-xl px-3 py-2.5 text-left text-[15px] font-semibold text-[#111] hover:bg-[#f1f1f1] transition-colors"
                    >
                      Dapatkan kode sisipan pin
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Right Options in Action Bar */}
            <div className="flex items-center gap-3">
              {/* Board Selector Dropdown */}
              <div className="relative">
                <button className="flex items-center gap-1.5 hover:bg-[#f1f1f1] active:bg-[#e1e1e1] px-4 py-3 rounded-full font-semibold text-[15px] text-[#111] transition-all duration-200">
                  <span>Profil</span>
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" className="text-[#111] mt-0.5"><path d="M12 16.59L6.7 11.3a1 1 0 0 1 1.4-1.4l3.9 3.9 3.9-3.9a1 1 0 0 1 1.4 1.4l-5.3 5.3z"/></svg>
                </button>
              </div>

              {/* Simpan Button */}
              <button className="bg-[#e60023] hover:bg-[#ad081b] active:scale-95 text-white font-semibold rounded-full px-5 py-3 text-[15px] transition-all duration-200">
                Simpan
              </button>
            </div>
          </div>

          {/* Main Image Container */}
          <div className="w-full relative rounded-[24px] overflow-hidden mb-6 group cursor-zoom-in" style={{ boxShadow: "0 0 0 1px rgba(0,0,0,0.05)" }}>
            <img 
              src={post.imageUrl} 
              alt={post.caption || "Pin image"} 
              className="w-full h-auto max-h-[85vh] object-cover rounded-[24px]"
            />
            {/* AI modified pill (aesthetic detail) */}
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white text-[13px] font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
              AI modified
            </div>
            
            {/* Interactive Image Tools (Always visible with premium glassmorphism) */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
               <button className="w-10 h-10 bg-white/85 backdrop-blur hover:bg-white active:scale-95 rounded-full flex items-center justify-center text-[#111] shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:scale-105 transition-all duration-200" title="Expand">
                 <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M11 5h2v14h-2zm-6 6h14v2H5z" transform="rotate(45, 12, 12)"/></svg>
               </button>
               <button className="w-10 h-10 bg-white/85 backdrop-blur hover:bg-white active:scale-95 rounded-full flex items-center justify-center text-[#111] shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:scale-105 transition-all duration-200" title="Visual search">
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
                {post.creator.avatarUrl ? (
                  <img 
                    src={post.creator.avatarUrl} 
                    alt={post.creator.username} 
                    className="w-12 h-12 rounded-full object-cover border border-gray-100 group-hover:brightness-95 transition-all" 
                  />
                ) : (
                  <div className={`w-12 h-12 rounded-full ${avatarBgColor} text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:brightness-95 transition-all`}>
                    {creatorInitials}
                  </div>
                )}
                <span className="font-semibold text-[15px] text-[#111] group-hover:underline">{post.creator.username}</span>
              </Link>
              {!isOwner && (
                <button className="bg-[#e9e9e9] hover:bg-[#e2e2e2] active:scale-95 text-[#111] font-semibold rounded-full px-5 py-3 text-[15px] transition-colors">
                  Follow
                </button>
              )}
            </div>
          </div>

          {/* Comments Section */}
          <div className="px-2 pb-10">
            <h2 className="font-semibold text-[20px] text-[#111] mb-6">
              {post.commentCount > 0 ? `${post.commentCount} Komentar` : "Belum ada komentar"}
            </h2>
            
            {allowComments ? (
              <CommentSection 
                postId={post.id} 
                comments={post.comments || []} 
                onOpenAuthModal={() => {}} 
              />
            ) : (
              <div className="rounded-2xl bg-[#f7f7f7] px-4 py-5 text-center text-[14px] font-medium text-[#767676]">
                Komentar dinonaktifkan untuk Pin ini.
              </div>
            )}
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
