import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Check, X } from "lucide-react";
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
  const [commentsCollapsed, setCommentsCollapsed] = useState(false);
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
  const isOwner = !!user && !!post?.creator && String(user.id) === String(post.creator.id);

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
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
      
      {/* Main Layout Grid / Flex */}
      <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 items-start justify-center">
        
        {/* Sticky Back Button on the far left (Desktop only) */}
        <div className="hidden lg:flex sticky top-24 self-start shrink-0 z-20">
          <button 
            onClick={() => navigate(-1)} 
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-[#f1f1f1] active:bg-[#e1e1e1] text-[#111] transition-all duration-200"
            title="Kembali"
          >
            <ArrowLeft size={28} strokeWidth={2.4} className="text-[#111]" />
          </button>
        </div>

        {/* The Unified Vertical Detail Card (matches real Pinterest layout) */}
        <div className="w-full max-w-[532px] bg-white rounded-[32px] shadow-[0_1px_24px_rgba(0,0,0,0.06)] border border-[#efefef] flex flex-col overflow-hidden shrink-0">
          
          {/* TOP BAR: Full width row with all actions */}
          <div className="flex items-center justify-between px-6 py-4 z-20 bg-white">
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Back Button inside the card (Mobile/Tablet only) */}
              <button 
                onClick={() => navigate(-1)} 
                className="lg:hidden w-11 h-11 flex items-center justify-center rounded-full hover:bg-[#f1f1f1] active:bg-[#e1e1e1] text-[#111] transition-all duration-200"
                title="Kembali"
              >
                <ArrowLeft size={24} strokeWidth={2.5} />
              </button>

              <LikeButton 
                postId={post.id} 
                initialLiked={localIsLiked} 
                initialCount={localLikeCount} 
              />
              <button className="w-12 h-12 flex items-center justify-center rounded-full text-[#111] hover:bg-[#f1f1f1] active:bg-[#e1e1e1] transition-all duration-200" title="Komentar">
                <svg aria-hidden="true" className="text-[#111]" height="24" viewBox="0 0 24 24" width="24" fill="currentColor">
                  <path d="m20.27 16.72.28-.58q.93-1.89.95-4.14a9.5 9.5 0 1 0-5.36 8.55l.58-.28 4.31.76zm-3.26 5.63A11.5 11.5 0 1 1 22.36 17l.64 3.7a2 2 0 0 1-2.3 2.3z"></path>
                </svg>
              </button>
              <button className="w-12 h-12 flex items-center justify-center rounded-full text-[#111] hover:bg-[#f1f1f1] active:bg-[#e1e1e1] transition-all duration-200" title="Bagikan">
                <svg aria-hidden="true" className="text-[#111]" height="24" viewBox="0 0 24 24" width="24" fill="currentColor">
                  <path d="M17.7 5.8 12 .08l-5.7 5.7L7.7 7.2 11 3.9V15h2V3.91l3.3 3.3zM2 18v-5H0v5a4 4 0 0 0 4 4h16a4 4 0 0 0 4-4v-5h-2v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2"></path>
                </svg>
              </button>
              
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowDropdown((prev) => !prev)}
                  className={`w-12 h-12 flex items-center justify-center rounded-full text-[#111] hover:bg-[#f1f1f1] active:bg-[#e1e1e1] transition-all duration-200 ${showDropdown ? 'bg-[#f1f1f1]' : ''}`}
                  title="Tindakan lainnya"
                  aria-expanded={showDropdown}
                >
                  <svg aria-hidden="true" className="text-[#111]" height="24" viewBox="0 0 24 24" width="24" fill="currentColor">
                    <path d="M2.5 9.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5m9.5 0a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5m9.5 0a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5"></path>
                  </svg>
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
                        
                        {/* Toggle Switch - Only visible and editable by the Owner! */}
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
                      </>
                    )}

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
            
            {/* Right Action Buttons */}
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={() => toast.success("Papan Profil terpilih")}
                className="flex items-center gap-1.5 hover:bg-[#f1f1f1] active:bg-[#e1e1e1] px-4 py-2.5 rounded-full font-bold text-[16px] text-[#111] transition-all duration-200 select-none border border-[#e2e2e2]"
              >
                <span className="truncate max-w-[90px]">Profil</span>
                <svg aria-hidden="true" className="text-[#111] mt-0.5" height="12" viewBox="0 0 24 24" width="12" fill="currentColor">
                  <path d="M23.7 8.7 12 20.42.3 8.71l1.4-1.42L12 17.6 22.3 7.3z"></path>
                </svg>
              </button>
              <button className="bg-[#e60023] hover:bg-[#ad081b] active:scale-95 text-white font-bold rounded-full px-5 py-3 text-[16px] transition-all duration-200 shadow-sm">
                Simpan
              </button>
            </div>
          </div>

          {/* IMAGE SECTION: Below Top Bar (Floating centered image matching Pinterest) */}
          <div className="px-6 pb-4">
            <div className="relative rounded-[24px] overflow-hidden group shadow-[0_2px_12px_rgba(0,0,0,0.04)] max-w-full flex items-center justify-center bg-white border border-[#efefef]">
              <img 
                src={post.imageUrl} 
                alt={post.caption || "Pin image"} 
                className="w-full h-auto block object-contain max-h-[503px]"
              />
              
              {/* AI modified pill */}
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white text-[13px] font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                AI modified
              </div>
              
              {/* Interactive Image Tools - Premium hover slide animations */}
              <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10 pointer-events-none">
                
                {/* "Lihat lebih besar" Button */}
                <div className="pointer-events-auto">
                  <button 
                    onClick={() => window.open(post.imageUrl, "_blank")}
                    className="group/btn h-12 flex items-center justify-end rounded-full bg-white/90 hover:bg-white active:scale-95 text-[#111] shadow-[0_4px_10px_rgba(0,0,0,0.15)] overflow-hidden transition-all duration-300 ease-out w-12 hover:w-[155px]"
                    title="Lihat lebih besar"
                  >
                    <div className="overflow-hidden whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-all duration-300 ease-out pl-4 text-[14px] font-bold tracking-tight text-[#111]">
                      Lihat lebih besar
                    </div>
                    <div className="w-12 h-12 flex items-center justify-center shrink-0">
                      <svg aria-label="Lihat lebih besar" className="text-[#111]" height="20" viewBox="0 0 24 24" width="20" fill="currentColor">
                        <path d="M23 1v9h-2V4.41l-6.3 6.3-1.4-1.42L19.58 3H14V1zM1 23v-9h2v5.59l6.3-6.3 1.4 1.42L4.42 21H10v2z" />
                      </svg>
                    </div>
                  </button>
                </div>

                {/* "Cari gambar" Button */}
                <div className="pointer-events-auto">
                  <button 
                    onClick={() => toast.success("Mencari gambar serupa...")}
                    className="group/btn h-12 flex items-center justify-end rounded-full bg-white/90 hover:bg-white active:scale-95 text-[#111] shadow-[0_4px_10px_rgba(0,0,0,0.15)] overflow-hidden transition-all duration-300 ease-out w-12 hover:w-[135px]"
                    title="Cari gambar"
                  >
                    <div className="overflow-hidden whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-all duration-300 ease-out pl-4 text-[14px] font-bold tracking-tight text-[#111]">
                      Cari gambar
                    </div>
                    <div className="w-12 h-12 flex items-center justify-center shrink-0">
                      <svg aria-label="Cari gambar" className="text-[#111]" height="20" viewBox="0 0 24 24" width="20" fill="currentColor">
                        <path d="M19.64.62a5 5 0 0 0 3.74 3.74l.62.14v1l-.62.14a5 5 0 0 0-3.74 3.74l-.14.62h-1l-.14-.62a5 5 0 0 0-3.74-3.74L14 5.5v-1l.62-.14A5 5 0 0 0 18.36.62L18.5 0h1zM11 19a8 8 0 0 0 7.94-7h2.01c-.2 2.01-1 3.85-2.2 5.33l4.46 4.47-1.41 1.41-4.47-4.47a10 10 0 1 1-2.25-16.88l-3 1.21Q11.53 3 11 3a8 8 0 1 0 0 16" />
                      </svg>
                    </div>
                  </button>
                </div>

              </div>
            </div>
          </div>

          {/* DETAILS SECTION: At the bottom of the card */}
          <div className="flex flex-col px-8 pb-8 bg-white space-y-6">
            
            {/* Title & Caption */}
            <div>
              {isEditingCaption ? (
                <div className="mb-4">
                  <textarea
                    value={captionDraft}
                    maxLength={500}
                    onChange={(event) => setCaptionDraft(event.target.value)}
                    className="input-field min-h-[120px] w-full resize-y text-xl font-semibold leading-tight p-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none"
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
                <div>
                  <h1 className="text-[32px] sm:text-[36px] font-bold text-[#111] leading-tight tracking-tight break-words mb-2">
                    {post.caption}
                  </h1>
                  <p className="text-[15px] text-[#5f5f5f] leading-normal break-words">
                    shot on Nikon A10
                  </p>
                </div>
              ) : isOwner ? (
                <button
                  type="button"
                  onClick={() => setIsEditingCaption(true)}
                  className="mb-4 text-left text-[15px] font-semibold text-[#767676] hover:text-[#111]"
                >
                  Add caption
                </button>
              ) : null}
            </div>

            {/* Creator Profile Block */}
            <div className="flex items-center justify-between py-2 border-b border-[#efefef] pb-5">
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
                <div className="flex flex-col">
                  <span className="font-semibold text-[15px] text-[#111] group-hover:underline">{post.creator.username}</span>
                  <span className="text-[12px] text-[#767676]">Pengunggah</span>
                </div>
              </Link>
              {!isOwner && (
                <button className="bg-[#e9e9e9] hover:bg-[#e2e2e2] active:scale-95 text-[#111] font-bold rounded-full px-5 py-2.5 text-[15px] transition-colors">
                  Follow
                </button>
              )}
            </div>

            {/* Comments Container */}
            <div className="space-y-4 pt-2">
              <div 
                className="flex items-center justify-between cursor-pointer py-1 select-none group"
                onClick={() => setCommentsCollapsed(!commentsCollapsed)}
              >
                <h2 className="font-bold text-[20px] text-[#111] group-hover:underline">
                  {post.commentCount > 0 ? `${post.commentCount} Komentar` : "Belum ada komentar"}
                </h2>
                <div className={`text-[#111] p-1.5 hover:bg-[#f1f1f1] rounded-full transition-transform duration-300 ${commentsCollapsed ? 'rotate-180' : ''}`}>
                  <svg aria-hidden="true" className="text-[#111]" height="16" viewBox="0 0 24 24" width="16" fill="currentColor">
                    <path d="M23.7 8.7 12 20.42.3 8.71l1.4-1.42L12 17.6 22.3 7.3z"></path>
                  </svg>
                </div>
              </div>
              
              {!commentsCollapsed && (
                <div className="pt-2 transition-all duration-300">
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
              )}
            </div>

          </div>

        </div>

        {/* RELATED PINS SECTION: On the right side on desktop, below on mobile (matches real Pinterest layout) */}
        <div className="flex-1 w-full min-w-0">
          <div className="mb-6 bg-white/80 backdrop-blur border border-gray-100 rounded-2xl px-6 py-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <h2 className="font-bold text-[20px] text-[#111] text-center lg:text-left">Lebih banyak seperti ini</h2>
          </div>
          
          <div className="columns-2 sm:columns-3 xl:columns-4 gap-4">
            {relatedPosts.map((relatedPost: any) => (
               <Link to={`/post/${relatedPost.id}`} key={relatedPost.id} className="block mb-4 break-inside-avoid group relative rounded-[20px] overflow-hidden cursor-zoom-in">
                  <img 
                    src={relatedPost.imageUrl} 
                    alt={relatedPost.caption || "Related pin"} 
                    loading="lazy"
                    className="w-full h-auto object-cover rounded-[20px] shadow-sm transition-transform duration-300 group-hover:brightness-[0.85]"
                  />
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
