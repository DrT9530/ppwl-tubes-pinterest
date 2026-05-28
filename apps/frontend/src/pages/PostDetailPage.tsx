import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Maximize2,
  Minus,
  MoreHorizontal,
  Plus,
  Search,
  Upload,
  X,
} from "lucide-react";
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
    "bg-[#a6c8e0]",
    "bg-[#b3d4c3]",
    "bg-[#f0c2a2]",
    "bg-[#e0b3c3]",
    "bg-[#d4b3e0]",
    "bg-[#ebd382]",
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
  const [localIsLiked, setLocalIsLiked] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);

  useEffect(() => {
    if (!isExpanded) {
      setZoomScale(1);
    }
  }, [isExpanded]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["post", id],
    queryFn: () => postService.getById(id as string),
    enabled: !!id,
  });

  const { data: relatedData } = useQuery({
    queryKey: ["relatedPosts"],
    queryFn: () => postService.getFeed(1, 20),
  });

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
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Gagal memperbarui caption"),
  });

  const deletePost = useMutation({
    mutationFn: () => postService.delete(id as string),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post berhasil dihapus");
      navigate("/", { replace: true });
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Gagal menghapus post"),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div
          className="spinner spinner-lg"
          style={{
            borderColor: "#e9e9e9",
            borderTopColor: "#e60023",
            borderWidth: "4px",
            width: "48px",
            height: "48px",
          }}
        />
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <h2 className="mb-2 text-xl font-semibold">Pin not found</h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 rounded-full bg-gray-100 px-5 py-3 font-semibold transition-colors hover:bg-gray-200"
        >
          Go back to feed
        </button>
      </div>
    );
  }

  const post = data.data;
  const relatedPosts = (relatedData?.data || []).filter(
    (relatedPost: any) => relatedPost.id !== post.id
  );
  const isOwner = user?.id === post.creator.id;
  const creatorInitials = post.creator.username
    ? post.creator.username.charAt(0).toUpperCase()
    : "U";
  const avatarBgColor = stringToColor(post.creator.username || "");

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

  const sidebarPosts = relatedPosts.slice(0, 6);
  const bottomPosts = relatedPosts.slice(6);

  const renderRelatedPost = (relatedPost: any) => (
    <article
      key={relatedPost.id}
      className="mb-5 break-inside-avoid overflow-hidden rounded-[18px]"
    >
      <Link
        to={`/post/${relatedPost.id}`}
        className="group block overflow-hidden rounded-[18px] bg-[#f5f5f5]"
      >
        <img
          src={relatedPost.imageUrl}
          alt={relatedPost.caption || "Related pin"}
          loading="lazy"
          className="w-full rounded-[18px] object-cover transition duration-200 group-hover:brightness-[0.88]"
        />
      </Link>
      <div className="mt-2 flex items-start justify-end px-2">
        <button
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[#111] transition-colors hover:bg-[#f1f1f1]"
          title="More options"
        >
          <MoreHorizontal size={20} strokeWidth={2.5} />
        </button>
      </div>
    </article>
  );

  return (
    <div className="post-detail-page-container mx-auto flex w-full max-w-[1800px] flex-col items-center gap-10 px-4 sm:px-6 md:px-8">
      {/* Top Section: Main Card + Sidebar */}
      <div className="flex w-full items-start justify-center gap-6 max-[1180px]:flex-col max-[1180px]:items-center">
        {/* Main Detail Card */}
        <section className="w-full max-w-[1016px] flex-1 min-w-0 rounded-[24px] border border-[#efefef] bg-white shadow-[0_1px_20px_rgba(0,0,0,0.05)] overflow-hidden flex-shrink-0">
        <div className="grid min-h-[500px] lg:h-[calc(100vh-140px)] grid-cols-1 lg:grid-cols-2">
          {/* Image Section */}
          <div className="relative flex items-center justify-center bg-white lg:rounded-l-[24px] lg:h-full overflow-hidden lg:border-r border-[#efefef] lg:p-4">
            <button
              onClick={() => navigate(-1)}
              className="absolute left-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-[#111] shadow-sm transition-colors hover:bg-[#f1f1f1] active:bg-[#e1e1e1]"
              title="Kembali"
            >
              <ArrowLeft size={26} strokeWidth={2.4} />
            </button>

            <div className="group relative flex w-full items-center justify-center overflow-hidden max-lg:min-h-0 h-full">
              <img
                src={post.imageUrl}
                alt={post.caption || "Pin image"}
                className="h-full w-full lg:max-h-full object-contain max-lg:max-h-[72vh]"
              />

              <div className="absolute bottom-4 left-4 rounded-full bg-black/55 px-3 py-1.5 text-[13px] font-semibold text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                AI modified
              </div>

              <div className="absolute bottom-4 right-4 flex flex-col gap-3">
                <button
                  onClick={() => setIsExpanded(true)}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white/85 text-[#111] shadow-[0_2px_10px_rgba(0,0,0,0.16)] backdrop-blur transition hover:scale-105 hover:bg-white active:scale-95"
                  title="Expand"
                >
                  <Maximize2 size={21} strokeWidth={2.4} />
                </button>
                <button
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white/85 text-[#111] shadow-[0_2px_10px_rgba(0,0,0,0.16)] backdrop-blur transition hover:scale-105 hover:bg-white active:scale-95"
                  title="Visual search"
                >
                  <Search size={21} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>

          <aside className="relative min-w-0 lg:min-h-[500px] max-lg:flex max-lg:flex-col lg:h-full rounded-r-[24px]">
            <div className="post-detail-aside-content lg:absolute lg:inset-0 flex flex-col max-lg:relative max-lg:h-auto lg:h-full w-full overflow-hidden">
              <div className="flex-none px-8 pt-8 lg:pl-10 lg:pr-8 max-lg:px-4 max-lg:pt-4">
                <div className="post-detail-actions-bar flex items-center justify-between gap-4 max-sm:flex-wrap">
              <div className="flex items-center gap-3 sm:gap-4">
                <LikeButton
                  postId={post.id}
                  initialLiked={localIsLiked}
                  initialCount={localLikeCount}
                />
                <button className="flex h-12 w-12 items-center justify-center rounded-full text-[#111] transition-colors hover:bg-[#f1f1f1] active:bg-[#e1e1e1]">
                  <svg aria-hidden="true" height="24" viewBox="0 0 24 24" width="24" fill="currentColor">
                    <path d="m20.27 16.72.28-.58q.93-1.89.95-4.14a9.5 9.5 0 1 0-5.36 8.55l.58-.28 4.31.76zm-3.26 5.63A11.5 11.5 0 1 1 22.36 17l.64 3.7a2 2 0 0 1-2.3 2.3z"></path>
                  </svg>
                </button>
                <button className="flex h-12 w-12 items-center justify-center rounded-full text-[#111] transition-colors hover:bg-[#f1f1f1] active:bg-[#e1e1e1]">
                  <Upload size={25} strokeWidth={2.3} />
                </button>

                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowDropdown((prev) => !prev)}
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-[#111] transition-colors hover:bg-[#f1f1f1] active:bg-[#e1e1e1] ${
                      showDropdown ? "bg-[#f1f1f1]" : ""
                    }`}
                    title="More options"
                    aria-expanded={showDropdown}
                  >
                    <MoreHorizontal size={25} strokeWidth={2.4} />
                  </button>

                  {showDropdown && (
                    <div className="post-detail-dropdown">
                      {isOwner && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingCaption(true);
                              setShowDropdown(false);
                            }}
                            className="post-detail-dropdown-item"
                          >
                            Edit Pin
                          </button>
                          <button
                            type="button"
                            onClick={handleDeletePin}
                            className="post-detail-dropdown-item post-detail-dropdown-item-danger"
                            disabled={deletePost.isPending}
                          >
                            Hapus Pin
                          </button>
                          <div
                            className="post-detail-dropdown-toggle-row"
                            onClick={() => setAllowComments((prev) => !prev)}
                          >
                            <span>Izinkan komentar</span>
                            <button
                              type="button"
                              className="post-detail-dropdown-toggle-switch"
                              style={{ backgroundColor: allowComments ? "#0066f5" : "#cdcdcd" }}
                              onClick={(event) => {
                                event.stopPropagation();
                                setAllowComments((prev) => !prev);
                              }}
                            >
                              <span
                                className="post-detail-dropdown-toggle-circle"
                                style={{ left: allowComments ? "22px" : "2px" }}
                              />
                            </button>
                          </div>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={handleDownload}
                        className="post-detail-dropdown-item"
                      >
                        Unduh gambar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          toast.success("Berhasil ditambahkan ke kolase");
                          setShowDropdown(false);
                        }}
                        className="post-detail-dropdown-item"
                      >
                        Tambahkan ke kolase
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyEmbed}
                        className="post-detail-dropdown-item"
                      >
                        Dapatkan kode sisipan pin
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button className="flex h-12 items-center gap-2 rounded-full px-4 text-[15px] font-semibold text-[#111] transition-colors hover:bg-[#f1f1f1] active:bg-[#e1e1e1]">
                  Profil
                  <ChevronDown size={16} strokeWidth={2.2} />
                </button>
                 <button className="post-detail-save-btn flex h-12 min-w-[94px] items-center justify-center rounded-full bg-[#e60023] px-5 text-[16px] font-semibold text-white transition-colors hover:bg-[#b6001a]">
                  Simpan
                </button>
              </div>
            </div>
          </div>

            <div className="post-detail-creator-row flex items-center justify-between gap-4">
              <Link
                to={`/profile/${post.creator.id}`}
                className="group flex min-w-0 items-center gap-3"
              >
                {post.creator.avatarUrl ? (
                  <img
                    src={post.creator.avatarUrl}
                    alt={post.creator.username}
                    className="h-9 w-9 rounded-full border border-gray-100 object-cover transition group-hover:brightness-95"
                  />
                ) : (
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${avatarBgColor} text-base font-bold text-white shadow-sm transition group-hover:brightness-95`}
                  >
                    {creatorInitials}
                  </div>
                )}
                <span className="post-detail-creator-name truncate text-[16px] font-normal text-[#111] group-hover:underline">
                  {post.creator.username}
                </span>
              </Link>
            </div>

            <div className="post-detail-caption-box">
              {isEditingCaption ? (
                <div>
                  <textarea
                    value={captionDraft}
                    maxLength={500}
                    onChange={(event) => setCaptionDraft(event.target.value)}
                    className="input-field min-h-[104px] resize-y text-[20px] font-semibold leading-tight"
                    autoFocus
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-[#767676]">
                      {captionDraft.length}/500
                    </span>
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
                <h1 className="post-detail-title text-[28px] font-bold leading-tight text-[#111]">
                  {post.caption}
                </h1>
              ) : isOwner ? (
                <button
                  type="button"
                  onClick={() => setIsEditingCaption(true)}
                  className="text-left text-[15px] font-semibold text-[#767676] hover:text-[#111]"
                >
                  Add caption
                </button>
              ) : null}
            </div>

            {/* Garis Horizontal pembatas - Ubah "h-[1px]" untuk mengatur ketebalan garis */}
            <hr className="post-detail-divider h-[1px] w-full border-0 bg-[#efefef]" />
            <div className="flex flex-col">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="post-detail-comment-header text-[20px] font-bold text-[#111]">
                  {post.commentCount > 0
                    ? `${post.commentCount} Komentar`
                    : "Komentar"}
                </h2>
                <button className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[#f1f1f1]">
                  <ChevronDown size={22} strokeWidth={2.2} />
                </button>
              </div>
            </div>
            <CommentSection
              postId={post.id}
              postOwnerId={post.creator.id}
              comments={post.comments || []}
              onOpenAuthModal={() => {}}
              allowComments={allowComments}
            />
          </div>
        </aside>
      </div>
    </section>

        {/* Sidebar Recommendations (Desktop Only) */}
        {sidebarPosts.length > 0 && (
          <aside className="w-[300px] xl:w-[360px] flex-none max-[1180px]:hidden">
            <div className="columns-2 gap-4">
              {sidebarPosts.map(renderRelatedPost)}
            </div>
          </aside>
        )}
      </div>

      {/* Bottom Related Pins Section */}
      <section className="w-full mt-4 flex flex-col">
        
        {/* Desktop View: Show only bottomPosts (sidebar handles the rest) */}
        <div className="hidden min-[1181px]:block w-full columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-4 px-2">
          {bottomPosts.map(renderRelatedPost)}
        </div>

        {/* Mobile/Tablet View: Show all relatedPosts */}
        <div className="min-[1181px]:hidden w-full columns-2 sm:columns-3 md:columns-4 gap-4 px-2">
          {relatedPosts.map(renderRelatedPost)}
        </div>
      </section>

      {/* Full-Screen Lightbox Modal for Pin Expansion */}
      {isExpanded && (
        <div className="pin-lightbox-overlay" onClick={() => setIsExpanded(false)}>
          {/* Top Header Row */}
          <div className="pin-lightbox-header" onClick={(e) => e.stopPropagation()}>
            {/* Left Close Button */}
            <button
              onClick={() => setIsExpanded(false)}
              className="pin-lightbox-close-btn"
              title="Tutup"
            >
              <X size={24} strokeWidth={2.5} />
            </button>

            {/* Right Action Buttons */}
            <div className="pin-lightbox-actions">
              <button className="pin-lightbox-share-btn" onClick={handleCopyEmbed}>
                Bagikan
                <Upload size={16} strokeWidth={2.3} className="ml-1.5 inline-block" />
              </button>
              
              <button className="pin-lightbox-profile-btn" onClick={() => navigate(`/profile/${post.creator.id}`)}>
                Profil
                <ChevronDown size={14} strokeWidth={2.2} className="ml-1 inline-block" />
              </button>

              <button className="pin-lightbox-save-btn">
                Simpan
              </button>
            </div>
          </div>

          {/* Central Image Container */}
          <div className="pin-lightbox-content" onClick={() => setIsExpanded(false)}>
            <div 
              className="pin-lightbox-image-wrapper"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={post.imageUrl}
                alt={post.caption || "Expanded pin"}
                className="pin-lightbox-image"
                style={{ transform: `scale(${zoomScale})` }}
              />

              {/* Visual Search Button - only visible at normal zoom (scale 1) */}
              {zoomScale === 1 && (
                <button 
                  className="pin-lightbox-search-btn"
                  title="Cari gambar"
                >
                  Cari gambar <Search size={16} strokeWidth={2.5} className="ml-1.5 inline-block" />
                </button>
              )}
            </div>
          </div>

          {/* Floating Zoom Controls in bottom-right of the screen */}
          <div 
            className="pin-lightbox-zoom-controls"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setZoomScale(prev => Math.min(3, prev + 0.2))}
              className="pin-lightbox-zoom-btn"
              title="Perbesar"
            >
              <Plus size={22} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => setZoomScale(prev => Math.max(0.5, prev - 0.2))}
              className="pin-lightbox-zoom-btn"
              title="Perkecil"
            >
              <Minus size={22} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
