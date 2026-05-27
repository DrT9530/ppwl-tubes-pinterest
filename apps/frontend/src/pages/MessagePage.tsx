// components/MessageDropdown.tsx
import { X, Plus, UserPlus } from "lucide-react";

interface MessageDropdownProps {
  onClose: () => void;
}

export function MessageDropdown({ onClose }: MessageDropdownProps) {
  return (
    <div 
      className="absolute right-16 top-16 w-[360px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-50 flex flex-col p-5 font-sans animate-fade-in"
      style={{ boxShadow: "0 0 24px rgba(0, 0, 0, 0.1)" }}
    >
      {/* Header Dropdown */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-[16px] font-semibold text-[#111]">Pesan</span>
        <button 
          onClick={onClose} 
          className="p-1.5 hover:bg-gray-100 rounded-full text-[#111] transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Item 1: Pesan Baru */}
      <div className="flex items-center gap-4 p-2.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors mb-2 group">
        <div className="w-12 h-12 bg-[#e60023] text-white rounded-full flex items-center justify-center transition-transform group-hover:scale-105">
          <Plus size={24} strokeWidth={2.5} />
        </div>
        <span className="font-semibold text-[15px] text-[#111]">Pesan baru</span>
      </div>

      {/* Item 2: Undang teman */}
      <div className="flex items-center gap-4 p-2.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors mb-6 group">
        <div className="w-12 h-12 bg-[#e9e9e9] text-[#111] rounded-full flex items-center justify-center transition-transform group-hover:scale-105">
          <UserPlus size={22} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-[15px] text-[#111]">Undang teman-teman Anda</span>
          <span className="text-xs text-gray-500 truncate">Hubungkan untuk mulai mengobrol</span>
        </div>
      </div>

      {/* Area Tengah: Ilustrasi Botol Surat Kosong */}
      <div className="flex flex-col items-center text-center my-4 px-2 flex-grow justify-center">
        {/* Ilustrasi Botol Surat Minimalis khas Pinterest */}
        <div className="relative w-36 h-36 bg-[#e3f2fd] rounded-full flex items-center justify-center mb-4">
          <svg viewBox="0 0 24 24" className="w-20 h-20 text-[#1976d2]/70 animate-pulse" fill="none" stroke="currentColor" strokeWidth="1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
          <div className="absolute bottom-6 right-8 bg-[#ffeb3b] w-3 h-3 rounded-full animate-ping" />
        </div>

        {/* Teks Mulai Percakapan */}
        <h3 className="font-bold text-[18px] text-[#111] mb-2">Mulai percakapan</h3>
        <p className="text-[13px] leading-relaxed text-[#111] max-w-[280px]">
          Gunakan pesan untuk mengobrol dengan teman, berbagi Pin dan papan, serta merencanakan ide bersama. Percakapan Anda akan muncul di sini.
        </p>
      </div>
    </div>
  );
}