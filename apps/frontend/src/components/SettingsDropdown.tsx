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

  const referenceLinks = [
    { label: "Tentang", link: "#" },
    { label: "Pers", link: "#" },
    { label: "Bisnis", link: "#" },
    { label: "Karier", link: "#" },
    { label: "Pengembang", link: "#" },
  ];

  return (
    <div className="settings-panel-container scrollbar-hide">
      {/* ── HEADER ── */}
      <div className="settings-panel-header">
        <span className="settings-panel-title">
          Pengaturan & Dukungan
        </span>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }} 
          className="settings-panel-close-btn"
          title="Tutup"
        >
          <X size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* ── GRUP MENU 1: PENGATURAN UTAMA ── */}
      <div className="settings-panel-menu-list">
        {generalMenus.map((menu, idx) => (
          <div key={idx} className="settings-panel-menu-item">
            <span className="settings-panel-menu-text">
              {menu.label}
            </span>
            {menu.hasIcon && (
              <ExternalLink size={14} className="settings-panel-menu-icon" strokeWidth={2.5} />
            )}
          </div>
        ))}
      </div>

      {/* ── LABEL SEPARATOR: DUKUNGAN ── */}
      <div className="settings-panel-section-label">
        <span className="settings-panel-section-title">Dukungan</span>
      </div>

      {/* ── GRUP MENU 2: DUKUNGAN & PRIVASI ── */}
      <div className="settings-panel-menu-list">
        {supportMenus.map((menu, idx) => (
          <div key={idx} className="settings-panel-menu-item">
            <span className="settings-panel-menu-text">
              {menu.label}
            </span>
            {menu.hasIcon && (
              <ExternalLink size={14} className="settings-panel-menu-icon" strokeWidth={2.5} />
            )}
          </div>
        ))}
      </div>

      {/* ── LABEL SEPARATOR: REFERENSI ── */}
      <div className="settings-panel-section-label">
        <span className="settings-panel-section-title">Referensi</span>
      </div>

      {/* ── GRUP REFERENSI (TENTANG, PERS, BISNIS...) ── */}
      <div className="settings-panel-link-group">
        {referenceLinks.map((link, idx) => (
          <a key={idx} href={link.link} className="settings-panel-link-item">
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}