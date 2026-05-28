// components/MessageDropdown.tsx
import { X, Plus, UserPlus, Send } from "lucide-react";

interface MessageDropdownProps {
  onClose: () => void;
}

export function MessageDropdown({ onClose }: MessageDropdownProps) {
  return (
    <div 
      className="!w-[360px] !h-screen !bg-white rounded-r-[24px] rounded-l-none !border-0 flex flex-col pt-14 pb-6 font-sans select-none overflow-y-auto transition-all scrollbar-hide"
      style={{ 
        boxShadow: "16px 0 32px rgba(0, 0, 0, 0.08)",
        outline: "none",
        border: "none"
      }}
    >
      {/* ── HEADER DIALOG ── */}
      <div className="flex items-center justify-between pb-3.5 border-b-2 border-[#e9e9e9] !pl-6 !pr-6 flex-shrink-0 !bg-transparent !border-0 !outline-none">
        <span className="text-[14px] font-bold text-[#111] tracking-tight bg-transparent p-0 m-0 border-0 outline-none block">Pesan</span>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }} 
          className="p-1.5 hover:bg-gray-100 rounded-full text-[#111] transition-colors cursor-pointer flex items-center justify-center flex-shrink-0 !border-0 !bg-transparent !outline-none m-0"
        >
          <X size={16} strokeWidth={2.5} />
        </button>
      </div>

      {/* ── LIST ITEM UTAMA (Menu Aksi) ── */}
      <div className="flex flex-col gap-1 mt-4 !pl-6 !pr-6 w-full box-border flex-shrink-0">
        {/* Item 1: Pesan Baru */}
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group">
          <div className="w-10 h-10 bg-[#e60023] text-white rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 shadow-sm">
            <Plus size={20} strokeWidth={3} />
          </div>
          <span className="font-bold text-[14px] text-[#111]">Pesan baru</span>
        </div>

        {/* Item 2: Undang Teman */}
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group">
          <div className="w-10 h-10 bg-[#e9e9e9] text-[#111] rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105">
            <UserPlus size={18} strokeWidth={2} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-[14px] text-[#111] leading-tight">Undang teman-teman Anda</span>
            <span className="text-[12px] text-gray-500 tracking-wide truncate mt-0.5">Hubungkan untuk mulai mengobrol</span>
          </div>
        </div>
      </div>

      {/* ── AREA SEBELUMNYA YANG MELAYANG (SEKARANG COZY DI ATAS) ── */}
      <div className="flex flex-col items-center text-center px-4 pt-14 gap-4 w-full box-border">
        {/* Lingkaran Ilustrasi Send */}
        <div className="relative w-28 h-28 bg-[#f5f5f5] rounded-full flex items-center justify-center transition-transform hover:scale-105">
          <Send size={36} className="text-[#111] rotate-[-15deg] translate-x-0.5" strokeWidth={1.8} />
        </div>

        {/* Teks Deskripsi */}
        <div className="flex flex-col gap-1.5 max-w-[280px]">
          <h3 className="font-bold text-[16px] text-[#111] tracking-tight">Mulai percakapan</h3>
          <p className="text-[13px] leading-relaxed text-gray-500 font-normal">
            Gunakan pesan untuk mengobrol dengan teman, berbagi Pin dan papan, serta merencanakan ide bersama. Percakapan Anda akan muncul di sini.
          </p>
        </div>
      </div>

    </div>
  );
}