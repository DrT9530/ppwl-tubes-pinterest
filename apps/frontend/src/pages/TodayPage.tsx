import { Link } from "react-router-dom";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { todayCategories } from "../data/todayCategories";

export default function TodayPage() {
  const currentDate = new Date();
  const formattedDate = format(currentDate, "d MMMM yyyy", { locale: id });

  return (
    <div className="today-page-container animate-fade-in flex flex-col items-center w-full">
      <div className="today-page-header">
        <p className="today-page-date text-lg font-medium text-gray-500">{formattedDate}</p>
        <h1 className="today-page-title">Dapatkan inspirasi</h1>
      </div>

      <div className="w-full max-w-[824px] flex justify-center">
        <div className="today-cards-grid">
          {todayCategories.map((cat) => (
            <Link
              key={cat.id}
              to={`/today/${cat.slug}`}
              className="group relative rounded-[36px] overflow-hidden block shadow-sm aspect-[4/3] w-full sm:w-[400px]"
            >
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10 duration-500" />
              <img
                src={cat.coverImage}
                alt={cat.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
              <div className="today-card-text-container absolute bottom-0 left-0 right-0 z-20">
                <h2 className="today-card-title">
                  {cat.title}
                </h2>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom checkmark and back to home section */}
      <div className="today-bottom-section">
        {/* Checkmark in circle */}
        <div className="today-bottom-icon-container">
          <svg viewBox="0 0 24 24" fill="currentColor" className="today-bottom-check-icon">
            <path d="m10 17.41-4.7-4.7 1.4-1.42 3.3 3.3 7.3-7.3 1.4 1.42zM24 12a12 12 0 1 1-24 0 12 12 0 0 1 24 0M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20"></path>
          </svg>
        </div>

        <div className="today-bottom-info-box">
          <p className="today-bottom-subtitle">
            Cukup sekian untuk hari ini
          </p>
          <h2 className="today-bottom-title">
            Kembali lagi besok untuk mendapatkan lebih banyak inspirasi
          </h2>
        </div>

        <Link to="/" className="today-bottom-btn">
          Kunjungi sajian beranda
        </Link>
      </div>
    </div>
  );
}
