// components/MessageDropdown.tsx
import { X, Search, ChevronLeft, ArrowUp } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { messageService, type ConversationSummary } from "../services/message.service";
import illMessageBottle from "../assets/home/ill.messagebottle.spot.light.svg.webp";
import { useAuthStore } from "../stores/auth.store";
import { SharePinModal } from "./SharePinModal";

type ViewState = "LIST" | "NEW" | "ROOM";

interface MessageDropdownProps {
  onClose: () => void;
}

export function MessageDropdown({ onClose }: MessageDropdownProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [view, setView] = useState<ViewState>("LIST");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // --- QUERIES ---

  const { data: conversationsRes } = useQuery({
    queryKey: ["conversations"],
    queryFn: messageService.getConversations,
  });
  const conversations = conversationsRes?.data || [];

  const { data: searchRes, isLoading: isSearching } = useQuery({
    queryKey: ["users", "search", debouncedSearch],
    queryFn: () => messageService.searchUsers(debouncedSearch),
    enabled: view === "NEW" && debouncedSearch.length > 0,
  });
  const searchResults = searchRes?.data || [];

  const { data: activeConvRes, refetch: refetchConv } = useQuery({
    queryKey: ["conversation", activeConversationId],
    queryFn: () => messageService.getConversation(activeConversationId!),
    enabled: !!activeConversationId && view === "ROOM",
    refetchInterval: 3000, // Fallback polling in case WS misses
  });
  const activeConversation = activeConvRes?.data;

  // --- MUTATIONS ---

  const createConvMutation = useMutation({
    mutationFn: (targetUserId: string) => messageService.createConversation(targetUserId),
    onSuccess: (res) => {
      setActiveConversationId(res.data?.id || null);
      setView("ROOM");
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: (payload: { content?: string; sharedPostId?: string }) => 
      messageService.sendMessage(activeConversationId!, payload),
    onSuccess: () => {
      setMessageInput("");
      refetchConv();
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  });

  useEffect(() => {
    if (view === "ROOM") {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, [view, activeConversation?.messages?.length]);

  // --- HANDLERS ---

  const handleStartChat = (targetUser: any) => {
    createConvMutation.mutate(targetUser.id);
  };

  const handleOpenRoom = (conv: ConversationSummary) => {
    setSelectedUser(conv.otherUser);
    setActiveConversationId(conv.id);
    setView("ROOM");
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    sendMessageMutation.mutate({ content: messageInput });
  };

  const handleSharePin = (postId: string) => {
    sendMessageMutation.mutate({ sharedPostId: postId });
  };

  const goBack = () => {
    if (view === "ROOM") setView("LIST");
    else if (view === "NEW") {
      setView("LIST");
      setSearchQuery("");
      setSelectedUser(null);
    }
  };

  // --- RENDERERS ---

  const renderList = () => (
    <div className="chat-dropdown-container" style={{ padding: '16px' }}>
      <div className="flex items-center justify-between mb-4 bg-white z-10" style={{ flexShrink: 0, paddingBottom: '8px' }}>
        <span className="text-[18px] font-semibold text-[#111]">Pesan</span>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-[#111] transition-colors cursor-pointer">
          <X size={20} />
        </button>
      </div>

      <div className="chat-list-item mb-2" onClick={() => setView("NEW")}>
        <div className="w-12 h-12 bg-[#e60023] text-white rounded-full flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-[24px] h-[24px]">
            <path d="M23.3458 0.633387C22.4924 -0.211454 21.1083 -0.211454 20.2549 0.633387L18.7363 2.13571L21.8272 5.1931L23.3727 3.66441C24.2268 2.82023 24.1999 1.47756 23.3458 0.633387ZM17.762 3.10349L9.39669 11.3893L8.35883 15.6412L12.4876 14.4467L20.8963 6.23791L17.762 3.10349ZM4.70156 1.01393C2.10496 1.01393 0 3.16788 0 5.82491V19.1887C0 21.8458 2.10496 23.9997 4.70156 23.9997H18.2838C20.8804 23.9997 22.9854 21.8458 22.9854 19.1887V14.074C22.9854 13.1884 22.2838 12.5068 21.4182 12.5068C20.5527 12.5068 19.851 13.1884 19.851 14.074V19.1887C19.851 20.0744 19.1494 20.7924 18.2838 20.7924H4.70156C3.83603 20.7924 3.13437 20.0744 3.13437 19.1887V5.82491C3.13437 4.93923 3.83603 4.22125 4.70156 4.22125H9.92552C10.7911 4.22125 11.4927 3.50326 11.4927 2.61759C11.4927 1.73191 10.7911 1.01393 9.92552 1.01393H4.70156Z"></path>
          </svg>
        </div>
        <span className="chat-list-name flex-1">Pesan baru</span>
      </div>

      <div className="chat-scroll-area pr-1">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center text-center my-8 px-2">
            <img src={illMessageBottle} alt="Message" className="w-[120px] mb-4" />
            <h3 className="font-bold text-[18px] text-[#111] mb-2">Mulai percakapan</h3>
            <p className="text-[14px] text-gray-500 max-w-[260px]">
              Gunakan pesan untuk mengobrol dengan teman, berbagi Pin dan papan.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 mt-2">
            {conversations.map((c) => (
              <div 
                key={c.id} 
                className="chat-list-item"
                onClick={() => handleOpenRoom(c)}
              >
                <img src={c.otherUser?.avatarUrl || "https://ui-avatars.com/api/?name=" + c.otherUser?.username} className="chat-list-avatar" />
                <div className="chat-list-text-wrapper min-w-0">
                  <span className="chat-list-name truncate">{c.otherUser?.username}</span>
                  <span className="chat-list-preview truncate">
                    {c.lastMessage ? (c.lastMessage.sharedPostId ? "Mengirim Pin" : c.lastMessage.content) : "Mulai percakapan"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderNew = () => (
    <div className="chat-dropdown-container">
      {/* Header */}
      <div className="chat-header">
        <div className="flex items-center gap-3">
          <button onClick={() => setView("LIST")} className="chat-btn-icon -ml-2">
            <ChevronLeft size={24} strokeWidth={2.5} />
          </button>
          <h2 className="chat-header-title text-xl">Pesan baru</h2>
        </div>
        <button 
          disabled={!selectedUser}
          onClick={() => handleStartChat(selectedUser)}
          className="chat-btn-primary"
        >
          Berikutnya
        </button>
      </div>

      {/* Search Input */}
      <div className="chat-search-container mt-2">
        <div className="chat-search-input-wrapper">
          <Search size={18} className="chat-search-icon" />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="chat-search-input"
            autoFocus
          />
        </div>
      </div>

      {/* Results */}
      <div className="chat-scroll-area">
        {searchResults.length > 0 && <div className="chat-search-result-title">Hasil Pencarian</div>}
        {isSearching ? (
          <div className="p-4 text-center text-[#767676] text-sm">Mencari...</div>
        ) : (
          searchResults.map((u) => (
            <div 
              key={u.id}
              onClick={() => setSelectedUser(u.id === selectedUser?.id ? null : u)}
              className="chat-list-item"
            >
              <img 
                src={u.avatarUrl || `https://ui-avatars.com/api/?name=${u.username}&background=random`} 
                alt={u.username}
                className="chat-list-avatar"
              />
              <span className="chat-list-name flex-1">{u.username}</span>
              {selectedUser?.id === u.id && (
                <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
              )}
            </div>
          ))
        )}
        {!isSearching && searchResults.length === 0 && searchQuery && (
          <div className="p-4 text-center text-[#767676] text-sm">Tidak ada hasil ditemukan.</div>
        )}
      </div>
    </div>
  );

  const renderRoom = () => {
    const otherParticipant = activeConversation?.participants?.find((p: any) => p.userId !== user?.id)?.user;
    
    return (
      <div className="chat-dropdown-container">
        {/* Header */}
        <div className="chat-header">
          <div className="flex items-center gap-2">
            <button onClick={goBack} className="chat-btn-icon -ml-2">
              <ChevronLeft size={24} strokeWidth={2.5} />
            </button>
            {otherParticipant && (
              <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1.5 pr-3 rounded-full transition-colors">
                {otherParticipant.avatarUrl ? (
                  <img src={otherParticipant.avatarUrl} className="chat-list-avatar" />
                ) : (
                  <div className="chat-list-avatar bg-gray-200 flex items-center justify-center font-bold text-[#111] text-sm">
                    {otherParticipant.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="chat-header-title">{otherParticipant.username}</span>
              </div>
            )}
          </div>
          <button className="chat-btn-icon -mr-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
          </button>
        </div>

        {/* Messages */}
        <div className="chat-scroll-area p-0">
          <div className="chat-room-intro">
             <div className="relative mb-2">
                {otherParticipant?.avatarUrl ? (
                  <img src={otherParticipant.avatarUrl} className="chat-room-intro-avatar" />
                ) : (
                  <div className="chat-room-intro-avatar bg-gray-200 flex items-center justify-center font-bold text-[#111] text-4xl">
                    {otherParticipant?.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                {/* Optional overlap indicator for user avatar can go here */}
             </div>
             <span className="chat-room-intro-name">{otherParticipant?.username}</span>
             <span className="chat-room-intro-desc">Ini bisa menjadi awal dari sesuatu yang baik</span>
          </div>

          <div className="chat-room-date-divider">
            <div className="h-[1px] bg-gray-200 flex-1 mx-4"></div>
            <span>Hari ini</span>
            <div className="h-[1px] bg-gray-200 flex-1 mx-4"></div>
          </div>

          <div className="flex flex-col mb-4">
            {activeConversation?.messages?.map((m: any) => {
              const isMe = m.senderId === user?.id;
              return (
                <div key={m.id} className={`chat-room-bubble-container ${isMe ? 'me' : 'other'}`}>
                  {isMe && <span className="chat-room-sender-label">Anda</span>}
                  <div className={`chat-room-bubble ${isMe ? 'me' : 'other'}`}>
                    {m.sharedPost && (
                      <div className="w-[200px] rounded-2xl overflow-hidden cursor-pointer bg-white mb-2 shadow-sm border border-gray-100">
                        <img src={m.sharedPost.imageUrl} alt="Pin" className="w-full h-auto object-cover" />
                        {m.sharedPost.caption && (
                          <div className="p-3 text-[13px] font-semibold text-[#111]">{m.sharedPost.caption}</div>
                        )}
                      </div>
                    )}
                    {m.content && <span>{m.content}</span>}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="chat-room-footer">
          <button 
            type="button" 
            onClick={() => setShowShareModal(true)}
            className="chat-room-add-btn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
          
          <form onSubmit={handleSendText} className="chat-room-input-container">
            <input 
              type="text" 
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Ketik pesan ..." 
              className="chat-room-input"
            />
            <button 
              type="submit" 
              disabled={!messageInput.trim()}
              className={`chat-room-send-btn ${messageInput.trim() ? 'active' : 'inactive'}`}
            >
              <ArrowUp size={20} strokeWidth={3} />
            </button>
          </form>
        </div>

        {showShareModal && (
          <SharePinModal 
            onClose={() => setShowShareModal(false)} 
            onSelectPin={handleSharePin} 
          />
        )}
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-3xl shadow-[0_0_24px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden font-sans"
      style={{
        width: "367.5px",
        height: "calc(100vh - 32px)",
        maxHeight: "800px",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {view === "LIST" && renderList()}
        {view === "NEW" && renderNew()}
        {view === "ROOM" && renderRoom()}
      </div>
    </div>
  );
}