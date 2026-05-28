// components/SettingsDropdown.tsx
import { X, ExternalLink } from "lucide-react";

interface SettingsDropdownProps {
  onClose: () => void;
}

export function SettingsDropdown({ onClose }: SettingsDropdownProps) {
  const generalMenus = [
    { label: "Pengaturan", link: "#" },
    { label: "Persempit rekomendasi Anda", link: "#" },
    { label: "Tautan ke Pinterest", link: "#" },
    { label: "Pusat laporan dan pelanggaran", link: "#" },
    { label: "Instal aplikasi Windows", link: "#" },
    { label: "Jadilah penguji beta", link: "#", hasIcon: true },
  ];

  const supportMenus = [
    { label: "Pusat bantuan", hasIcon: true },
    { label: "Buat widget", hasIcon: true },
    { label: "Penghapusan", hasIcon: true },
    { label: "Iklan yang Dipersonalisasi", hasIcon: true },
    { label: "Hak privasi Anda", hasIcon: false },
    { label: "Kebijakan privasi", hasIcon: true },
    { label: "Persyaratan Layanan", hasIcon: true },
  ];

  return (
    <div 
      // pt-14 mengubah padding atas kontainer menjadi lebih tebal (56px) 
      // Ini otomatis mendorong seluruh elemen di dalamnya (termasuk judul) untuk turun ke bawah
      className="!w-[360px] !h-screen !bg-white rounded-r-[24px] rounded-l-none !border-0 flex flex-col pt-14 pb-6 font-sans select-none overflow-y-auto transition-all scrollbar-hide"
      style={{ 
        boxShadow: "16px 0 32px rgba(0, 0, 0, 0.08)",
        outline: "none",
        border: "none"
      }}
    >
      {/* ── HEADER ── */}
      {/* pb-6 memberikan jarak yang pas antara judul dengan baris menu pertama di bawahnya */}
      <div className="flex items-center justify-between pb-6 !pl-7 !pr-7 flex-shrink-0 !bg-transparent !border-0 !outline-none">
        <span className="text-[18px] font-bold text-[#111] tracking-tight bg-transparent p-0 m-0 border-0 outline-none block">
          Pengaturan & Dukungan
        </span>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }} 
          className="p-1.5 hover:bg-gray-100 rounded-full text-[#111] transition-colors cursor-pointer flex items-center justify-center flex-shrink-0 !border-0 !bg-transparent !outline-none m-0 evaluation-none"
        >
          <X size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* ── GRUP MENU 1: PENGATURAN UTAMA ── */}
      <div className="flex flex-col gap-1 !pl-6 !pr-6 w-full box-border">
        {generalMenus.map((menu, idx) => (
          <div
            key={idx}
            className="flex items-center justify-start gap-2.5 py-2.5 px-3 rounded-xl cursor-pointer transition-all !bg-transparent hover:!bg-gray-100 group !border-0 !outline-none w-full"
          >
            <span className="text-[14px] font-semibold tracking-tight text-[#111] !bg-transparent p-0 m-0 !border-0 !outline-none inline-block align-middle">
              {menu.label}
            </span>
            {menu.hasIcon && (
              <ExternalLink size={14} className="text-gray-400 group-hover:text-[#111] flex-shrink-0 inline-block align-middle" strokeWidth={2.5} />
            )}
          </div>
        ))}
      </div>

      {/* ── LABEL SEPARATOR: DUKUNGAN ── */}
      <div className="!pl-9 mt-5 mb-2">
        <span className="text-[12px] font-bold text-gray-400 tracking-wide block">Dukungan</span>
      </div>

      {/* ── GRUP MENU 2: DUKUNGAN & PRIVASI ── */}
      <div className="flex flex-col gap-1 pb-6 !pl-6 !pr-6 w-full box-border">
        {supportMenus.map((menu, idx) => (
          <div
            key={idx}
            className="flex items-center justify-start gap-2.5 py-2.5 px-3 rounded-xl cursor-pointer transition-all !bg-transparent hover:!bg-gray-100 group !border-0 !outline-none w-full"
          >
            <span className="text-[14px] font-semibold tracking-tight text-[#111] !bg-transparent p-0 m-0 !border-0 !outline-none inline-block align-middle">
              {menu.label}
            </span>
            {menu.hasIcon && (
              <ExternalLink size={14} className="text-gray-400 group-hover:text-[#111] flex-shrink-0 inline-block align-middle" strokeWidth={2.5} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}