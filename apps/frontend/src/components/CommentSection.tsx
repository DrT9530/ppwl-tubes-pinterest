import React, { useState, useRef, useEffect } from "react";
import { 
  useCreateComment, 
  useCreateReply, 
  useLikeComment, 
  useUnlikeComment, 
  useEditComment, 
  useDeleteComment, 
  useHighlightComment,
  useLikeReply,
  useUnlikeReply,
  useEditReply,
  useDeleteReply
} from "../hooks/useComments";
import { useAuthStore } from "../stores/auth.store";
import type { CommentDTO, ReplyDTO } from "shared/types";
import EmojiPicker from "emoji-picker-react";
import { StickerPicker } from "./StickerPicker";
import { X, Image as ImageIcon, Smile, StickyNote, Heart, MoreHorizontal, Pin } from "lucide-react";

interface CommentSectionProps {
  postId: string;
  postOwnerId: string;
  comments: CommentDTO[];
  onOpenAuthModal: () => void;
  allowComments?: boolean;
}

const fallbackAvatar = "https://vignette.wikia.nocookie.net/line/images/b/b3/2015-brown.png";

type PickerMode = "none" | "emoji" | "sticker" | "reply-emoji";

export const CommentSection = ({
  postId,
  postOwnerId,
  comments,
  onOpenAuthModal,
  allowComments = true,
}: CommentSectionProps) => {
  const { user, isAuthenticated } = useAuthStore();
  
  // Comment states
  const [newComment, setNewComment] = useState("");
  const [pickerMode, setPickerMode] = useState<PickerMode>("none");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [stickerPreview, setStickerPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Edit and Dropdown states
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Reply states
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  
  const createCommentMutation = useCreateComment();
  const createReplyMutation = useCreateReply();
  const likeCommentMutation = useLikeComment();
  const unlikeCommentMutation = useUnlikeComment();
  const editCommentMutation = useEditComment();
  const deleteCommentMutation = useDeleteComment();
  const highlightCommentMutation = useHighlightComment();

  const likeReplyMutation = useLikeReply();
  const unlikeReplyMutation = useUnlikeReply();
  const editReplyMutation = useEditReply();
  const deleteReplyMutation = useDeleteReply();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setPickerMode("none");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setStickerPreview(null);
      setPickerMode("none");
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeSticker = () => {
    setStickerPreview(null);
  };

  const removeAllMedia = () => {
    removeImage();
    removeSticker();
  };

  const onEmojiClick = (emojiObject: any) => {
    if (pickerMode === "reply-emoji") {
      setReplyContent(prev => prev + emojiObject.emoji);
    } else {
      setNewComment(prev => prev + emojiObject.emoji);
    }
  };

  const onStickerSelect = (stickerUrl: string) => {
    setStickerPreview(stickerUrl);
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setPickerMode("none");
  };

  const hasContent = newComment.trim() || selectedImage || stickerPreview;

  const handleCommentSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!isAuthenticated) {
      onOpenAuthModal();
      return;
    }

    if (hasContent) {
      createCommentMutation.mutate(
        { 
          postId, 
          content: newComment, 
          image: selectedImage || undefined,
          stickerUrl: stickerPreview || undefined,
        },
        { onSuccess: () => {
          setNewComment("");
          removeAllMedia();
          setPickerMode("none");
        }}
      );
    }
  };

  const handleReplySubmit = (event: React.FormEvent, commentId: string) => {
    event.preventDefault();

    if (!isAuthenticated) {
      onOpenAuthModal();
      return;
    }

    if (replyContent.trim()) {
      createReplyMutation.mutate(
        { commentId, content: replyContent },
        {
          onSuccess: () => {
            setReplyContent("");
            setReplyingToId(null);
          },
        }
      );
    }
  };

  const handleAvatarError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = fallbackAvatar;
  };

  const togglePicker = (mode: PickerMode) => {
    setPickerMode(prev => prev === mode ? "none" : mode);
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col text-[14px]">
      <div className="flex-1 overflow-y-auto px-8 lg:pl-10 lg:pr-8 max-lg:px-4 pb-4">
        {comments.length > 0 && (
          <div className="flex flex-col gap-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex flex-col">
                <div className="flex w-full items-start gap-3">
                  <div className="mt-0.5 h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                    <img
                      src={comment.user?.avatarUrl || fallbackAvatar}
                      className="h-full w-full object-cover"
                      alt="avatar"
                      onError={handleAvatarError}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    {comment.isHighlighted && (
                      <div className="mb-1 flex items-center gap-1 text-[11px] font-bold text-gray-500">
                        <Pin size={12} fill="currentColor" className="rotate-45" /> Disorot oleh penulis
                      </div>
                    )}
                    
                    {editingCommentId === comment.id ? (
                      <div className="mb-2 mt-1">
                        <textarea
                          value={editContent}
                          onChange={e => setEditContent(e.target.value)}
                          className="w-full resize-none border-b border-gray-300 bg-transparent py-1 text-[13px] outline-none focus:border-blue-500"
                          autoFocus
                          rows={2}
                        />
                        <div className="mt-2 flex justify-end gap-2">
                           <button 
                             onClick={() => setEditingCommentId(null)} 
                             className="rounded-full bg-gray-100 px-3 py-1 text-[12px] font-semibold transition hover:bg-gray-200"
                           >
                             Batal
                           </button>
                           <button 
                             onClick={() => {
                               if (editContent.trim()) {
                                 editCommentMutation.mutate({commentId: comment.id, content: editContent});
                                 setEditingCommentId(null);
                               }
                             }} 
                             className="rounded-full bg-[#e60023] px-3 py-1 text-[12px] font-semibold text-white transition hover:bg-[#b6001a]"
                           >
                             Simpan
                           </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-[13px] leading-snug text-[#111]">
                          <span className="post-detail-comment-user mr-1 font-bold hover:underline">
                            {comment.user?.username || "User"}
                          </span>
                          {" "}
                          {comment.content && (
                            <span className="post-detail-comment-body break-words font-normal">{comment.content}</span>
                          )}
                        </div>
                        
                        {comment.imageUrl && (
                          <div className="mt-2">
                            <img 
                              src={comment.imageUrl} 
                              alt="comment media" 
                              className="max-h-48 rounded-xl object-contain"
                              style={{ background: "transparent" }}
                            />
                          </div>
                        )}
                      </>
                    )}

                    <div className="mt-1 flex items-center gap-4 text-[12px] font-semibold text-[#767676]">
                      <span className="post-detail-comment-time">{new Date(comment.createdAt).toLocaleDateString()}</span>
                      <button
                        onClick={() => {
                          if (!isAuthenticated) return onOpenAuthModal();
                          setReplyingToId(
                            replyingToId === comment.id ? null : comment.id
                          );
                        }}
                        className="transition hover:text-[#111] hover:underline"
                      >
                        Reply
                      </button>

                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => {
                            if (!isAuthenticated) return onOpenAuthModal();
                            if (comment.isLiked) unlikeCommentMutation.mutate(comment.id);
                            else likeCommentMutation.mutate(comment.id);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-gray-100"
                        >
                           <Heart size={14} fill={comment.isLiked ? "#e60023" : "none"} color={comment.isLiked ? "#e60023" : "currentColor"} />
                        </button>
                        {comment.likeCount ? <span>{comment.likeCount}</span> : null}
                      </div>

                      {(user?.id === comment.user.id || user?.id === postOwnerId) && (
                        <div className="relative">
                          <button
                            onClick={() => setActiveDropdownId(activeDropdownId === comment.id ? null : comment.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-gray-100"
                          >
                            <MoreHorizontal size={16} />
                          </button>
                          
                          {activeDropdownId === comment.id && (
                            <div className="absolute left-0 top-full z-20 mt-1 w-32 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                              {user?.id === postOwnerId && user?.id !== comment.user.id && (
                                <button
                                  onClick={() => {
                                    highlightCommentMutation.mutate(comment.id);
                                    setActiveDropdownId(null);
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] font-semibold text-[#111] transition hover:bg-gray-100"
                                >
                                  {comment.isHighlighted ? "Lepas Sorot" : "Sorot"}
                                </button>
                              )}
                              
                              {user?.id === comment.user.id && (
                                <button
                                  onClick={() => {
                                    setEditContent(comment.content || "");
                                    setEditingCommentId(comment.id);
                                    setActiveDropdownId(null);
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] font-semibold text-[#111] transition hover:bg-gray-100"
                                >
                                  Edit
                                </button>
                              )}
                              
                              <button
                                onClick={() => {
                                  if (confirm("Yakin ingin menghapus komentar ini?")) {
                                    deleteCommentMutation.mutate(comment.id);
                                  }
                                  setActiveDropdownId(null);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] font-semibold text-[#cc0000] transition hover:bg-[#fff0f0]"
                              >
                                Hapus
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {replyingToId === comment.id && (
                  <div className="mt-2 flex w-full flex-col gap-2 pl-11">
                    <form onSubmit={(event) => handleReplySubmit(event, comment.id)}>
                      <div className="flex min-h-[44px] w-full items-center rounded-3xl border border-[#cdcdcd] bg-white px-4 py-1 transition focus-within:border-[#767676]">
                        <input
                          value={replyContent}
                          onChange={(event) => setReplyContent(event.target.value)}
                          placeholder="Balas"
                          className="flex-1 bg-transparent py-2 text-[14px] text-[#111] outline-none"
                          autoFocus
                        />
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => togglePicker("reply-emoji")}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-[#111] transition hover:bg-gray-100"
                          >
                            <Smile size={24} strokeWidth={2} />
                          </button>
                          
                          {pickerMode === "reply-emoji" && (
                            <div ref={pickerRef} className="absolute bottom-full right-0 mb-2 z-50 shadow-xl rounded-2xl overflow-hidden">
                              <EmojiPicker onEmojiClick={onEmojiClick} />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-2 flex justify-end gap-2">
                         <button 
                           type="button"
                           onClick={() => {
                             setReplyingToId(null);
                             setReplyContent("");
                           }}
                           className="rounded-full bg-[#efefef] px-4 py-2 text-[14px] font-semibold text-[#111] transition hover:bg-[#e2e2e2]"
                         >
                           Batal
                         </button>
                         <button 
                           type="submit"
                           disabled={!replyContent.trim() || createReplyMutation.isPending}
                           className="rounded-full bg-[#efefef] px-4 py-2 text-[14px] font-semibold text-[#a5a5a5] transition enabled:bg-[#e60023] enabled:text-white enabled:hover:bg-[#b6001a]"
                         >
                           Kirim
                         </button>
                      </div>
                    </form>
                  </div>
                )}

                {comment.replies && comment.replies.length > 0 && (
                  <div className="post-detail-reply-list ml-4 mt-3 flex flex-col gap-3 border-l border-[#efefef] pl-7">
                    {comment.replies.map((reply: ReplyDTO) => (
                      <div key={reply.id} className="post-detail-reply-item flex w-full items-start gap-2.5">
                        <div className="post-detail-reply-avatar-wrapper mt-0.5 h-6 w-6 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                          <img
                            src={reply.user?.avatarUrl || fallbackAvatar}
                            className="h-full w-full object-cover"
                            alt="avatar"
                            onError={handleAvatarError}
                          />
                        </div>
                        <div className="post-detail-reply-content min-w-0 flex-1">
                          {editingCommentId === reply.id ? (
                            <div className="mb-2 mt-1">
                              <textarea
                                value={editContent}
                                onChange={e => setEditContent(e.target.value)}
                                className="w-full resize-none border-b border-gray-300 bg-transparent py-1 text-[12px] outline-none focus:border-blue-500"
                                autoFocus
                                rows={2}
                              />
                              <div className="mt-2 flex justify-end gap-2">
                                 <button 
                                   onClick={() => setEditingCommentId(null)} 
                                   className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-semibold transition hover:bg-gray-200"
                                 >
                                   Batal
                                 </button>
                                 <button 
                                   onClick={() => {
                                     if (editContent.trim()) {
                                       editReplyMutation.mutate({replyId: reply.id, content: editContent});
                                       setEditingCommentId(null);
                                     }
                                   }} 
                                   className="rounded-full bg-[#e60023] px-3 py-1 text-[11px] font-semibold text-white transition hover:bg-[#b6001a]"
                                 >
                                   Simpan
                                 </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="text-[12px] leading-snug text-[#111]">
                                <span className="post-detail-comment-user mr-1 font-bold hover:underline">
                                  {reply.user?.username || "User"}
                                </span>
                                {" "}
                                {reply.content && (
                                  <span className="post-detail-comment-body break-words">{reply.content}</span>
                                )}
                              </div>
                              
                              {reply.imageUrl && (
                                <div className="mt-2">
                                  <img 
                                    src={reply.imageUrl} 
                                    alt="reply media" 
                                    className="max-h-40 rounded-xl object-contain"
                                    style={{ background: "transparent" }}
                                  />
                                </div>
                              )}
                            </>
                          )}

                          <div className="mt-1 flex items-center gap-4 text-[11px] font-semibold text-[#767676]">
                            <span className="post-detail-comment-time">{new Date(reply.createdAt).toLocaleDateString()}</span>
                            <button
                              onClick={() => {
                                if (!isAuthenticated) return onOpenAuthModal();
                                setReplyingToId(comment.id);
                                setReplyContent(`@${reply.user.username} `);
                              }}
                              className="transition hover:text-[#111] hover:underline"
                            >
                              Balas
                            </button>

                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => {
                                  if (!isAuthenticated) return onOpenAuthModal();
                                  if (reply.isLiked) unlikeReplyMutation.mutate(reply.id);
                                  else likeReplyMutation.mutate(reply.id);
                                }}
                                className="flex h-6 w-6 items-center justify-center rounded-full transition hover:bg-gray-100"
                              >
                                 <Heart size={12} fill={reply.isLiked ? "#e60023" : "none"} color={reply.isLiked ? "#e60023" : "currentColor"} />
                              </button>
                              {reply.likeCount ? <span>{reply.likeCount}</span> : null}
                            </div>

                            {(user?.id === reply.user.id || user?.id === postOwnerId) && (
                              <div className="relative">
                                <button
                                  onClick={() => setActiveDropdownId(activeDropdownId === reply.id ? null : reply.id)}
                                  className="flex h-6 w-6 items-center justify-center rounded-full transition hover:bg-gray-100"
                                >
                                  <MoreHorizontal size={14} />
                                </button>
                                
                                {activeDropdownId === reply.id && (
                                  <div className="absolute left-0 top-full z-20 mt-1 w-32 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                                    {user?.id === reply.user.id && (
                                      <button
                                        onClick={() => {
                                          setEditContent(reply.content || "");
                                          setEditingCommentId(reply.id);
                                          setActiveDropdownId(null);
                                        }}
                                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] font-semibold text-[#111] transition hover:bg-gray-100"
                                      >
                                        Edit
                                      </button>
                                    )}
                                    
                                    <button
                                      onClick={() => {
                                        if (confirm("Yakin ingin menghapus balasan ini?")) {
                                          deleteReplyMutation.mutate(reply.id);
                                        }
                                        setActiveDropdownId(null);
                                      }}
                                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] font-semibold text-[#cc0000] transition hover:bg-[#fff0f0]"
                                    >
                                      Hapus
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {allowComments ? (
        <div className="flex-none w-full border-t border-[#efefef] bg-white px-8 pb-6 pt-4 lg:pl-10 lg:pr-8 max-lg:px-4">
          {/* Image preview */}
          {imagePreview && (
          <div className="relative mb-3 inline-block">
            <img src={imagePreview} alt="Preview" className="max-h-24 rounded-xl object-contain border border-[#e0e0e0]" />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black transition"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Sticker preview */}
        {stickerPreview && (
          <div className="relative mb-3 inline-block">
            <img src={stickerPreview} alt="Sticker preview" className="max-h-20 object-contain" style={{ background: "transparent" }} />
            <button
              onClick={removeSticker}
              className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black transition"
            >
              <X size={14} />
            </button>
          </div>
        )}
        
        <div className="relative">
          {/* Emoji Picker */}
          {pickerMode === "emoji" && (
            <div ref={pickerRef} className="absolute bottom-full right-0 mb-2 z-50 shadow-xl rounded-2xl overflow-hidden">
              <EmojiPicker onEmojiClick={onEmojiClick} />
            </div>
          )}

          {/* Sticker Picker */}
          {pickerMode === "sticker" && (
            <div ref={pickerRef} className="absolute bottom-full right-0 mb-2 z-50">
              <StickerPicker onSelect={onStickerSelect} onClose={() => setPickerMode("none")} />
            </div>
          )}
          
          <form
            onSubmit={handleCommentSubmit}
            className="flex min-h-[44px] w-full items-center rounded-full border border-transparent bg-[#f5f5f5] py-2 pl-4 pr-3 transition hover:bg-[#eeeeee] focus-within:border-[#d0d0d0] focus-within:bg-white"
          >
            <input
              value={newComment}
              onChange={(event) => setNewComment(event.target.value)}
              onClick={() => !isAuthenticated && onOpenAuthModal()}
              placeholder="Tambahkan komentar"
              spellCheck="false"
              className="min-w-0 flex-1 bg-transparent pr-2 text-[14px] text-[#111] outline-none placeholder:text-[#8a8a8a]"
            />

            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageChange}
            />

            <div className="flex flex-shrink-0 items-center gap-1 text-[#111]">
              <button
                type="button"
                onClick={() => togglePicker("emoji")}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-black/5 ${pickerMode === "emoji" ? "bg-black/10" : ""}`}
                title="Emoji"
              >
                <Smile size={20} />
              </button>
              <button
                type="button"
                onClick={() => togglePicker("sticker")}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-black/5 ${pickerMode === "sticker" ? "bg-black/10" : ""}`}
                title="Sticker"
              >
                <StickyNote size={20} />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-black/5"
                title="Image"
              >
                <ImageIcon size={20} />
              </button>

              {hasContent && (
                <button
                  type="submit"
                  disabled={createCommentMutation.isPending}
                  className="ml-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#e60023] text-white transition hover:bg-[#b6001a] disabled:opacity-50"
                >
                  {createCommentMutation.isPending ? (
                    <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <svg aria-hidden="true" height="16" viewBox="0 0 24 24" width="16" fill="currentColor">
                      <path d="M4.07 1.37a2.1 2.1 0 0 0-2.8 2.59L3.94 12l-2.69 8.04a2.1 2.1 0 0 0 2.81 2.6l18.1-7.7A3 3 0 0 0 24 12.18v-.36a3 3 0 0 0-1.83-2.76zm-.89 1.86a.1.1 0 0 1 .1-.02l18.11 7.7a1 1 0 0 1 .61.91v.36a1 1 0 0 1-.6.92L3.28 20.8a.1.1 0 0 1-.13-.12L5.72 13H14v-2H5.72L3.16 3.33a.1.1 0 0 1 .02-.1"></path>
                    </svg>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
      ) : (
        <div className="flex-none w-full border-t border-[#efefef] bg-white px-8 pb-6 pt-4 lg:pl-10 lg:pr-8 max-lg:px-4">
          <div className="rounded-2xl bg-[#f7f7f7] px-4 py-5 text-center text-[14px] font-medium text-[#767676]">
            Komentar dinonaktifkan untuk Pin ini.
          </div>
        </div>
      )}
    </div>
  );
};
