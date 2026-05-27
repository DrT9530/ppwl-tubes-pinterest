import React, { useState } from "react";
import { useCreateComment, useCreateReply } from "../hooks/useComments"; 
import { useAuthStore } from "../stores/auth.store";
import { MessageCircle, Smile, StickyNote, Image } from "lucide-react"; 
import type { CommentDTO, ReplyDTO } from "shared/types"; 

interface CommentSectionProps {
  postId: string;
  comments: CommentDTO[]; 
  onOpenAuthModal: () => void; 
}

export const CommentSection = ({ postId, comments, onOpenAuthModal }: CommentSectionProps) => {
  const { isAuthenticated, user } = useAuthStore();
  
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

  // Handler Submit Balasan Komentar
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
    <div className="flex flex-col gap-4 w-full text-[14px]">
      
      {/* List Komentar */}
      <div className="flex flex-col gap-3.5 mt-1 max-w-full overflow-hidden">
        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-[#767676] gap-2">
            <MessageCircle className="w-7 h-7 opacity-50" />
            <p className="text-xs">Belum ada komentar. Awali percakapan!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex flex-col w-full">
              {/* Row Komentar Utama */}
              <div className="flex items-start gap-2 w-full">
                {/* Avatar Pengomentar */}
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 mt-0.5">
                  <img 
                    src={comment.user?.avatarUrl || "https://vignette.wikia.nocookie.net/line/images/b/b3/2015-brown.png"} 
                    className="w-full h-full object-cover" 
                    alt="avatar" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://vignette.wikia.nocookie.net/line/images/b/b3/2015-brown.png";
                    }}
                  />
                </div>
                
                {/* Isi Komentar & Metadata */}
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] text-[#111111] leading-snug break-words">
                    <span className="font-bold mr-3 text-[#111111] hover:underline cursor-pointer">
                      {comment.user?.username || "User"}
                    </span>
                    {/* 👇 TAMBAHKAN INI DI ANTARA DUA SPAN */}
                    <span className="text-[#111111] font-normal">{comment.content}</span>
                  </div>
                  
                  {/* Tombol Aksi & Balas */}
                  <div className="flex items-center gap-4 mt-0.5 text-[11px] font-medium text-[#767676]">
                    <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                    <button 
                      onClick={() => {
                        if (!isAuthenticated) return onOpenAuthModal(); 
                        setReplyingToId(replyingToId === comment.id ? null : comment.id);
                      }} 
                      className="hover:underline cursor-pointer font-bold"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>

              {/* Input Form Balasan */}
              {replyingToId === comment.id && (
                <div className="flex gap-2 pl-10 mt-1.5 w-full">
                  <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className="flex items-center flex-1 border border-[#e2e2e2] rounded-full bg-white px-3 py-1 focus-within:border-[#767676]">
                    <input
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder={`Balas...`}
                      className="flex-1 text-xs text-[#111111] focus:outline-none bg-transparent py-1" 
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={createReplyMutation.isPending}
                    >
                      Balas
                    </button>
                  </form>
                </div>
              )}

              {/* Sub-list Balasan (Replies) */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-2 flex flex-col gap-2 pl-10 w-full border-l border-gray-100 ml-4"> 
                  {comment.replies.map((reply: ReplyDTO) => ( 
                    <div key={reply.id} className="flex items-start gap-2 w-full">
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 mt-0.5">
                        <img 
                          src={reply.user?.avatarUrl || "https://vignette.wikia.nocookie.net/line/images/b/b3/2015-brown.png"} 
                          className="w-full h-full object-cover" 
                          alt="avatar" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://vignette.wikia.nocookie.net/line/images/b/b3/2015-brown.png";
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] text-[#111111] leading-snug break-words">
                          <span className="font-bold mr-3 text-[#942636] hover:underline cursor-pointer">
                            {reply.user?.username || "User"}
                          </span>
                          {"\u00A0\u00A0\u00A0"}
                          <span className="text-[#111111] font-normal">{reply.content}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-[10px] text-[#767676]">
                          <span>{new Date(reply.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Form Input Tambah Komentar Utama */}
      <div className="flex items-center gap-2 w-full pt-3 mt-1 border-t border-gray-100">
        {/* Avatar User Aktif */}
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          <img 
            src={user?.avatarUrl || "https://vignette.wikia.nocookie.net/line/images/b/b3/2015-brown.png"} 
            className="w-full h-full object-cover" 
            alt="User avatar" 
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://vignette.wikia.nocookie.net/line/images/b/b3/2015-brown.png";
            }}
          />
        </div>
        
        {/* Box Input Semenjana & Proporsional */}
<form 
  onSubmit={handleCommentSubmit} 
  className="flex-1 flex items-center bg-[#f5f5f5] hover:bg-[#e9e9e9] rounded-[20px] pl-3.5 pr-3 py-2 min-h-[40px] transition-all focus-within:outline-none focus:outline-none" // <--- TAMBAHKAN DUA CLASS INI JIR
>
  <input 
    value={newComment}
    onChange={(e) => setNewComment(e.target.value)}
    onClick={() => !isAuthenticated && onOpenAuthModal()} 
    placeholder="Tambahkan komentar"
    spellCheck="false"
    className="flex-1 text-[13.5px] text-[#111111] bg-transparent outline-none focus:outline-none placeholder-[#767676] pr-2" 

          />
          
          {/* SISI KANAN INPUT: Icon Kecil Manis */}
          <div className="flex items-center gap-2 text-[#111111] flex-shrink-0">
            <button type="button" className="p-0.5 hover:bg-black/5 rounded-full transition cursor-pointer">
              <Smile size={18} className="text-[#111]" />
            </button>
            <button type="button" className="p-0.5 hover:bg-black/5 rounded-full transition cursor-pointer">
              <StickyNote size={18} className="text-[#111]" />
            </button>
            <button type="button" className="p-0.5 hover:bg-black/5 rounded-full transition cursor-pointer">
              <Image size={18} className="text-[#111]" />
            </button>

            {/* Tombol Kirim Text */}
            {newComment.trim() && (
              <button 
                type="submit" 
                disabled={createCommentMutation.isPending} 
                className="text-[13px] font-bold text-[#e60023] hover:text-[#b6001a] pl-1 transition-colors disabled:opacity-50 cursor-pointer" 
              >
                Kirim
              </button>
            )}
          </div>
        </form>
      </div>

    </div>
  );
};