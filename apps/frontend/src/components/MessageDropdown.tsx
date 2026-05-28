// components/MessageDropdown.tsx
import { X } from "lucide-react";
import illMessageBottle from "../assets/home/ill.messagebottle.spot.light.svg.webp";

interface MessageDropdownProps {
  onClose: () => void;
}

export function MessageDropdown({ onClose }: MessageDropdownProps) {
  return (
    <div className="message-panel-container scrollbar-hide">
      {/* ── HEADER DIALOG ── */}
      <div className="message-panel-header">
        <span className="message-panel-title">Pesan</span>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }} 
          className="message-panel-close-btn"
        >
          <X size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* ── LIST ITEM UTAMA (Menu Aksi) ── */}
      <div className="message-panel-menu-list">
        {/* Item 1: Pesan Baru */}
        <div className="message-panel-menu-item">
          <div className="message-panel-menu-icon-wrapper new-msg">
            <svg viewBox="0 0 24 24" fill="currentColor" className="message-panel-menu-icon-svg">
              <path d="M23.3458 0.633387C22.4924 -0.211454 21.1083 -0.211454 20.2549 0.633387L18.7363 2.13571L21.8272 5.1931L23.3727 3.66441C24.2268 2.82023 24.1999 1.47756 23.3458 0.633387ZM17.762 3.10349L9.39669 11.3893L8.35883 15.6412L12.4876 14.4467L20.8963 6.23791L17.762 3.10349ZM4.70156 1.01393C2.10496 1.01393 0 3.16788 0 5.82491V19.1887C0 21.8458 2.10496 23.9997 4.70156 23.9997H18.2838C20.8804 23.9997 22.9854 21.8458 22.9854 19.1887V14.074C22.9854 13.1884 22.2838 12.5068 21.4182 12.5068C20.5527 12.5068 19.851 13.1884 19.851 14.074V19.1887C19.851 20.0744 19.1494 20.7924 18.2838 20.7924H4.70156C3.83603 20.7924 3.13437 20.0744 3.13437 19.1887V5.82491C3.13437 4.93923 3.83603 4.22125 4.70156 4.22125H9.92552C10.7911 4.22125 11.4927 3.50326 11.4927 2.61759C11.4927 1.73191 10.7911 1.01393 9.92552 1.01393H4.70156Z"></path>
            </svg>
          </div>
          <span className="message-panel-menu-title">Pesan baru</span>
        </div>

        {/* Item 2: Undang Teman */}
        <div className="message-panel-menu-item">
          <div className="message-panel-menu-icon-wrapper invite-friends">
            <svg viewBox="0 0 24 24" fill="currentColor" className="message-panel-menu-icon-svg">
              <path d="M12 11a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11M8.5 5.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0M3 23h9v-2H4.06a8 8 0 0 1 11.05-6.37l.78-1.85A10 10 0 0 0 2 22a1 1 0 0 0 1 1m17-3h4v-2h-4v-4h-2v4h-4v2h4v4h2z"></path>
            </svg>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="message-panel-menu-title">Undang teman-teman Anda</span>
            <span className="message-panel-menu-subtitle truncate">Hubungkan untuk mulai mengobrol</span>
          </div>
        </div>
      </div>

      {/* ── AREA SEBELUMNYA YANG MELAYANG (SEKARANG COZY DI ATAS) ── */}
      <div className="message-panel-illustration-section">
        {/* Lingkaran Ilustrasi Send */}
        <div className="message-panel-image-wrapper">
          <img 
            src={illMessageBottle} 
            alt="Message Illustration" 
            className="message-panel-image" 
          />
        </div>

        {/* Teks Deskripsi */}
        <div className="message-panel-desc-section">
          <h3 className="message-panel-desc-title">Mulai percakapan</h3>
          <p className="message-panel-desc-text">
            Gunakan pesan untuk mengobrol dengan teman, berbagi Pin dan papan, serta merencanakan ide bersama. Percakapan Anda akan muncul di sini.
          </p>
        </div>
      </div>
    </div>
  );
}