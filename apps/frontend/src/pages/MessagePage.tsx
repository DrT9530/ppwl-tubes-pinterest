// components/MessageDropdown.tsx
import { X } from "lucide-react";
import illMessageBottle from "../assets/home/ill.messagebottle.spot.light.svg.webp";

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
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-[24px] h-[24px]">
            <path d="M23.3458 0.633387C22.4924 -0.211454 21.1083 -0.211454 20.2549 0.633387L18.7363 2.13571L21.8272 5.1931L23.3727 3.66441C24.2268 2.82023 24.1999 1.47756 23.3458 0.633387ZM17.762 3.10349L9.39669 11.3893L8.35883 15.6412L12.4876 14.4467L20.8963 6.23791L17.762 3.10349ZM4.70156 1.01393C2.10496 1.01393 0 3.16788 0 5.82491V19.1887C0 21.8458 2.10496 23.9997 4.70156 23.9997H18.2838C20.8804 23.9997 22.9854 21.8458 22.9854 19.1887V14.074C22.9854 13.1884 22.2838 12.5068 21.4182 12.5068C20.5527 12.5068 19.851 13.1884 19.851 14.074V19.1887C19.851 20.0744 19.1494 20.7924 18.2838 20.7924H4.70156C3.83603 20.7924 3.13437 20.0744 3.13437 19.1887V5.82491C3.13437 4.93923 3.83603 4.22125 4.70156 4.22125H9.92552C10.7911 4.22125 11.4927 3.50326 11.4927 2.61759C11.4927 1.73191 10.7911 1.01393 9.92552 1.01393H4.70156Z"></path>
          </svg>
        </div>
        <span className="font-semibold text-[15px] text-[#111]">Pesan baru</span>
      </div>

      {/* Item 2: Undang teman */}
      <div className="flex items-center gap-4 p-2.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors mb-6 group">
        <div className="w-12 h-12 bg-[#e9e9e9] text-[#111] rounded-full flex items-center justify-center transition-transform group-hover:scale-105">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-[22px] h-[22px]">
            <path d="M12 11a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11M8.5 5.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0M3 23h9v-2H4.06a8 8 0 0 1 11.05-6.37l.78-1.85A10 10 0 0 0 2 22a1 1 0 0 0 1 1m17-3h4v-2h-4v-4h-2v4h-4v2h4v4h2z"></path>
          </svg>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-[15px] text-[#111]">Undang teman-teman Anda</span>
          <span className="text-xs text-gray-500 truncate">Hubungkan untuk mulai mengobrol</span>
        </div>
      </div>

      {/* Area Tengah: Ilustrasi Botol Surat Kosong */}
      <div className="flex flex-col items-center text-center my-4 px-2 flex-grow justify-center">
        {/* Ilustrasi Botol Surat Minimalis khas Pinterest */}
        <div className="flex items-center justify-center mb-4">
          <img src={illMessageBottle} alt="Message Illustration" className="w-[140px] h-auto object-contain transition-transform hover:scale-105" />
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