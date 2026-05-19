import React, { useState } from "react";
import { useCreateComment, useCreateReply } from "../hooks/useComments"; 
import { useAuthStore } from "../stores/auth.store";
import { MessageCircle } from "lucide-react"; 
import type { CommentDTO, ReplyDTO } from "shared/types"; 

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
    <div className="flex flex-col gap-4">
      {/* Form Tambah Komentar Baru */}
      <form onSubmit={handleCommentSubmit} className="flex gap-2">
        <input 
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onClick={() => !isAuthenticated && onOpenAuthModal()} 
          placeholder="Tambahkan komentar..."
          className="border border-[#CDCDCD] rounded-full px-4 py-2 flex-1 text-[#111111] focus:outline-none focus:border-[#767676]" 
        />
        <button 
          type="submit" 
          disabled={createCommentMutation.isPending} 
          className="bg-[#E60023] hover:bg-[#ad001a] text-white font-semibold rounded-full px-4 transition-colors disabled:opacity-50" 
        >
          {createCommentMutation.isPending ? "Mengirim..." : "Kirim"}
        </button>
      </form>

      {/* List Komentar */}
      <div className="flex flex-col gap-5 mt-2">
        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-[#767676] gap-2">
            <MessageCircle className="w-8 h-8 opacity-50" />
            <p className="text-sm">Belum ada komentar. Awali percakapan!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-2 w-full">
              {/* KIRI: Avatar Utama */}
              <img 
                src={comment.user?.avatarUrl || "/placeholder-avatar.png"} 
                className="w-8 h-8 rounded-full object-cover mt-0.5 flex-shrink-0" 
                alt={comment.user?.username} 
              />
              
              {/* KANAN: Blok Konten Utama */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* Baris Konten */}
                <p className="text-sm text-[#111111] leading-relaxed break-words">
                  <span className="font-bold mr-2 text-[#111111] hover:underline cursor-pointer">
                    {comment.user?.username}
                  </span>
                  {comment.content}
                </p>
                
                {/* Baris Metadata & Aksi */}
                <div className="flex items-center gap-3 mt-1 text-xs text-[#767676]">
                  <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                  <button 
                    onClick={() => {
                      if (!isAuthenticated) return onOpenAuthModal(); 
                      setReplyingToId(replyingToId === comment.id ? null : comment.id);
                    }} 
                    className="font-semibold hover:underline"
                  >
                    Reply
                  </button>
                </div>

                {/* Form Input Balasan */}
                {replyingToId === comment.id && (
                  <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className="mt-2 flex gap-2 w-full">
                    <input
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder={`Balas @${comment.user?.username}...`}
                      className="border border-[#CDCDCD] rounded-full px-3 py-1.5 flex-1 text-sm text-[#111111] focus:outline-none focus:border-[#767676]" 
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={createReplyMutation.isPending}
                      className="bg-[#111111] hover:bg-[#222222] text-white text-xs font-semibold rounded-full px-3 transition-colors disabled:opacity-50 flex-shrink-0"
                    >
                      {createReplyMutation.isPending ? "..." : "Balas"}
                    </button>
                  </form>
                )}

                {/* List Balasan / Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-3 flex flex-col gap-3 border-l-2 border-[#CDCDCD] pl-3 w-full"> 
                    {comment.replies.map((reply: ReplyDTO) => ( 
                      <div key={reply.id} className="flex items-start gap-2 w-full">
                        <img 
                          src={reply.user?.avatarUrl || "/placeholder-avatar.png"} 
                          className="w-6 h-6 rounded-full object-cover mt-0.5 flex-shrink-0" 
                          alt={reply.user?.username} 
                        />
                        <div className="flex-1 flex flex-col min-w-0">
                          <p className="text-xs text-[#111111] leading-relaxed break-words">
                            <span className="font-bold mr-2 text-[#111111] hover:underline cursor-pointer">
                              {reply.user?.username}
                            </span>
                            {reply.content}
                          </p>
                          <div className="flex items-center gap-3 mt-0.5 text-[10px] text-[#767676]">
                            <span>{new Date(reply.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};