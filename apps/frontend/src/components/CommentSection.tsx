import React, { useState } from "react";
import { useCreateComment, useCreateReply } from "../hooks/useComments"; 
import { useAuthStore } from "../stores/auth.store";
import { MessageCircle } from "lucide-react"; 
import type { CommentDTO, ReplyDTO } from "shared/types"; 
import toast from "react-hot-toast"; 

interface CommentSectionProps {
  postId: string;
  comments: CommentDTO[]; 
  onOpenAuthModal: () => void; 
}

export const CommentSection = ({ postId, comments, onOpenAuthModal }: CommentSectionProps) => {
  const { isAuthenticated } = useAuthStore();
  
  // State untuk komentar utama
  const [newComment, setNewComment] = useState("");
  
  // State untuk sistem reply (balasan)
  const [replyingToId, setReplyingToId] = useState<string | null>(null); 
  const [replyContent, setReplyContent] = useState("");

  // TanStack Query Hooks 
  const createCommentMutation = useCreateComment();
  const createReplyMutation = useCreateReply();

  // Handler Submit Komentar Utama 
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Jika tidak terautentikasi, hentikan proses dan buka modal login
    if (!isAuthenticated) {
      onOpenAuthModal();
      return;
    } 
    
    if (newComment.trim()) {
      createCommentMutation.mutate(
        { postId, content: newComment },
        { onSuccess: () => setNewComment("") }
      );
    }
  };

  // Handler Submit Balasan Komentar (Sudah diperbaiki dari typo e=:)
  const handleReplySubmit = (e: React.FormEvent, commentId: string) => {
    e.preventDefault();
    
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

  return (
    <div className="flex flex-col gap-5">
      {/* Form Tambah Komentar Baru - Premium Pinterest DraftEditor composer */}
      <form onSubmit={handleCommentSubmit} className="flex gap-3 items-center">
        {/* Current user's avatar */}
        <div className="w-10 h-10 rounded-full bg-[#f1f1f1] flex-shrink-0 overflow-hidden border border-gray-100 flex items-center justify-center font-bold text-[#111] select-none text-[15px]">
          {isAuthenticated && useAuthStore.getState().user?.username
            ? useAuthStore.getState().user?.username.charAt(0).toUpperCase()
            : "U"}
        </div>

        <div className="flex-1 flex items-center gap-2 border border-[#e2e2e2] bg-[#f0f0f0]/60 hover:bg-[#e9e9e9]/70 focus-within:bg-white focus-within:border-[#a0a0a0] rounded-[24px] px-4 py-2.5 transition-all duration-200 shadow-inner">
          <input 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onClick={() => !isAuthenticated && onOpenAuthModal()} 
            placeholder="Tambahkan komentar"
            className="bg-transparent border-none flex-1 text-[15.5px] text-[#111111] focus:outline-none placeholder-[#767676] min-w-0" 
          />
          
          {/* Action Selectors inside the input bar */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button 
              type="button"
              onClick={() => toast.success("Emoji selector opened")}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 active:scale-95 transition-all"
              title="Pilih emoji"
            >
              <svg aria-hidden="true" className="text-[#5f5f5f]" height="20" viewBox="0 0 24 24" width="20" fill="currentColor">
                <path d="M7 8.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0m10 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m.64 4.27A8.8 8.8 0 0 1 12 15c-2 0-3.91-.8-5.64-2.23l1.28-1.54A6.8 6.8 0 0 0 12 13q2.18.02 4.36-1.77zM24 12a12 12 0 1 1-24 0 12 12 0 0 1 24 0M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20"></path>
              </svg>
            </button>
            <button 
              type="button"
              onClick={() => toast.success("Sticker selector opened")}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 active:scale-95 transition-all"
              title="Pilih stiker"
            >
              <svg aria-hidden="true" className="text-[#5f5f5f]" height="20" viewBox="0 0 24 24" width="20" fill="currentColor">
                <path d="M5 1a4 4 0 0 0-4 4v14a4 4 0 0 0 4 4h5v-2H5a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1h-4a4 4 0 0 0-3.7 2.5 4.5 4.5 0 0 1-3.48-1.91l-1.64 1.15A6.5 6.5 0 0 0 12 16.48V23h.76a4 4 0 0 0 2.83-1.17l6.24-6.24A4 4 0 0 0 23 12.76V5a4 4 0 0 0-4-4zm15.41 13.17-6.24 6.24-.17.16V16c0-1.1.9-2 2-2h4.57zM7.5 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m9-3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3"></path>
              </svg>
            </button>
            <button 
              type="button"
              onClick={() => toast.success("Photo uploader opened")}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 active:scale-95 transition-all"
              title="Pilih foto"
            >
              <svg aria-hidden="true" className="text-[#5f5f5f]" height="20" viewBox="0 0 24 24" width="20" fill="currentColor">
                <path d="M18 8a2 2 0 1 0-4 0 2 2 0 0 0 4 0M5 1a4 4 0 0 0-4 4v14a4 4 0 0 0 4 4h14a4 4 0 0 0 4-4V5a4 4 0 0 0-4-4zm16 4v9h-4.17a5.8 5.8 0 0 1-4.12-1.7l-.24-.24A7.04 7.04 0 0 0 3 11.63V5c0-1.1.9-2 2-2h14a2 2 0 0 1 2 2M3 19v-4.59l.94-.94a5.04 5.04 0 0 1 7.12 0l.23.24A7.8 7.8 0 0 0 16.83 16H21v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Submit button dynamically sliding or showing based on text content */}
        {newComment.trim().length > 0 && (
          <button 
            type="submit" 
            disabled={createCommentMutation.isPending} 
            className="bg-[#E60023] hover:bg-[#ad001a] text-white font-bold rounded-full w-10 h-10 flex items-center justify-center shrink-0 shadow-md transition-all duration-200 scale-100 animate-fade-in" 
            title="Kirim Komentar"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white transform rotate-45 mr-0.5">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        )}
      </form>

      {/* List Komentar */}
      <div className="flex flex-col gap-6 mt-2">
        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-[#767676] gap-3">
            <MessageCircle className="w-9 h-9 opacity-40 text-[#767676]" />
            <p className="text-[15px] font-medium text-[#767676]">Belum ada komentar. Awali percakapan!</p>
          </div>
        ) : (
          comments.map((comment) => {
            const commentInitials = comment.user?.username ? comment.user.username.charAt(0).toUpperCase() : "U";
            return (
              <div key={comment.id} className="flex items-start gap-3 w-full group">
                {/* KIRI: Avatar Utama */}
                {comment.user?.avatarUrl ? (
                  <img 
                    src={comment.user.avatarUrl} 
                    className="w-9 h-9 rounded-full object-cover mt-0.5 flex-shrink-0 border border-gray-100 shadow-sm" 
                    alt={comment.user.username} 
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#f1f1f1] flex-shrink-0 mt-0.5 overflow-hidden flex items-center justify-center font-bold text-[#111] text-[14px] border border-gray-200 select-none">
                    {commentInitials}
                  </div>
                )}
                
                {/* KANAN: Blok Konten Utama */}
                <div className="flex-1 flex flex-col min-w-0">
                  {/* Baris Konten */}
                  <p className="text-[15px] text-[#111111] leading-relaxed break-words">
                    <span className="font-bold mr-2 text-[#111111] hover:underline cursor-pointer">
                      {comment.user?.username}
                    </span>
                    {comment.content}
                  </p>
                  
                  {/* Baris Metadata & Aksi */}
                  <div className="flex items-center gap-4 mt-1.5 text-[13px] font-semibold text-[#767676]">
                    <span className="text-[12px] text-[#767676] font-normal">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    <button 
                      onClick={() => {
                        if (!isAuthenticated) return onOpenAuthModal(); 
                        setReplyingToId(replyingToId === comment.id ? null : comment.id);
                      }} 
                      className="hover:text-[#111] transition-colors"
                    >
                      Reply
                    </button>
                  </div>

                  {/* Form Input Balasan */}
                  {replyingToId === comment.id && (
                    <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className="mt-3 flex gap-2 w-full items-center">
                      <div className="flex-1 flex items-center bg-[#f0f0f0]/60 border border-[#e2e2e2] rounded-full px-3 py-1.5 focus-within:bg-white focus-within:border-[#a0a0a0] transition-all">
                        <input
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder={`Balas @${comment.user?.username}...`}
                          className="bg-transparent border-none flex-1 text-[14px] text-[#111111] focus:outline-none placeholder-[#767676] min-w-0" 
                          autoFocus
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={createReplyMutation.isPending}
                        className="bg-[#111111] hover:bg-[#222222] text-white text-xs font-bold rounded-full px-4 py-2 transition-all active:scale-95 disabled:opacity-50 flex-shrink-0 shadow-sm"
                      >
                        {createReplyMutation.isPending ? "..." : "Balas"}
                      </button>
                    </form>
                  )}

                  {/* List Balasan / Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 flex flex-col gap-4 border-l-2 border-[#e2e2e2] pl-4 w-full"> 
                      {comment.replies.map((reply: ReplyDTO) => {
                        const replyInitials = reply.user?.username ? reply.user.username.charAt(0).toUpperCase() : "U";
                        return (
                          <div key={reply.id} className="flex items-start gap-2.5 w-full">
                            {reply.user?.avatarUrl ? (
                              <img 
                                src={reply.user.avatarUrl} 
                                className="w-7 h-7 rounded-full object-cover mt-0.5 flex-shrink-0 border border-gray-100" 
                                alt={reply.user.username} 
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-[#f1f1f1] flex-shrink-0 mt-0.5 overflow-hidden flex items-center justify-center font-bold text-[#111] text-[11px] border border-gray-200 select-none">
                                {replyInitials}
                              </div>
                            )}
                            <div className="flex-1 flex flex-col min-w-0">
                              <p className="text-[14px] text-[#111111] leading-relaxed break-words">
                                <span className="font-bold mr-1.5 text-[#111111] hover:underline cursor-pointer">
                                  {reply.user?.username}
                                </span>
                                {reply.content}
                              </p>
                              <div className="flex items-center gap-3 mt-1 text-[11px] text-[#767676]">
                                <span>{new Date(reply.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};