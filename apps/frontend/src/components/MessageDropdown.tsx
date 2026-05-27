// components/MessageDropdown.tsx
import { X, Plus, UserPlus, Send } from "lucide-react";

interface MessageDropdownProps {
  onClose: () => void;
}

export function MessageDropdown({ onClose }: MessageDropdownProps) {
  return (
    <div 
      className="w-[360px] h-[calc(100vh-32px)] bg-white rounded-[24px] border border-gray-100 flex flex-col p-5 font-sans select-none transition-all"
      style={{ boxShadow: "0 4px 32px rgba(0, 0, 0, 0.1)" }}
    >
      {/* ── HEADER DIALOG ── */}
      {/* Spacing seimbang, teks 'Pesan' kecil rapi, tombol close pas di sudut */}
      <div className="flex items-center justify-between pb-3.5 border-b-2 border-[#e9e9e9] px-1">
        <span className="text-[14px] font-bold text-[#111] tracking-tight">Pesan</span>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }} 
          className="p-1.5 hover:bg-gray-100 rounded-full text-[#111] transition-colors cursor-pointer flex items-center justify-center"
        >
          <X size={16} strokeWidth={2.5} />
        </button>
      </div>

      {/* ── LIST ITEM UTAMA (Menu Aksi) ── */}
      {/* Jarak mt-4 memberikan gap aman dari garis pembatas abu-abu */}
      <div className="flex flex-col gap-1 mt-4">
        
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

      {/* ── AREA TENGAH: ILUSTRASI & DESKRIPSI ── */}
      {/* Centering total menggunakan flex-grow & justify-center agar posisi di UI selalu seimbang */}
      <div className="flex flex-col items-center text-center px-4 flex-grow justify-center gap-4">
        
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