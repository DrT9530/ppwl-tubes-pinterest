import { useState } from "react";
import { useAuthStore } from "../stores/auth.store";

interface OnboardingModalProps {
  onComplete: () => void;
}

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [birthdate, setBirthdate] = useState("");
  const [country, setCountry] = useState("Indonesia");
  const [language, setLanguage] = useState("English (US)");
  const [name, setName] = useState(user?.username || "");
  const [_gender, setGender] = useState("");
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [isTurningFeed, setIsTurningFeed] = useState(false);

  const moods = [
  { id: "1", label: "Reading", icon: "📚", bg: "bg-[#F0F5F9]" },
  { id: "2", label: "Gaming", icon: "🎮", bg: "bg-[#F9F3EE]" },
  { id: "3", label: "Cooking", icon: "🍳", bg: "bg-[#EDF7ED]" },
  { id: "4", label: "Coding", icon: "💻", bg: "bg-[#F3EAF8]" },
  { id: "5", label: "Music", icon: "🎵", bg: "bg-[#FFF4E5]" },
  { id: "6", label: "Travel", icon: "✈️", bg: "bg-[#E6F4EA]" },
];

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => Math.max(1, prev - 1));

  const handleMoodToggle = (id: string) => {
    setSelectedMoods((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleFinish = () => {
    setIsTurningFeed(true);
    setTimeout(() => {
      onComplete();
    }, 3000);
  };

  if (isTurningFeed) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white">
        <div className="spinner spinner-lg mb-6" style={{ borderColor: "#e9e9e9", borderTopColor: "#e60023", width: "60px", height: "60px", borderWidth: "6px" }} />
        <h2 className="text-[28px] font-semibold text-center mt-4">Turning your feed just for you</h2>
        <p className="text-[#767676] mt-2">Getting your recommendations ready...</p>
      </div>
    );
  }

  // Helper to render the red progress bar
  const renderProgress = () => {
    if (step === 1) return null;
    return (
      <div className="absolute top-6 left-0 right-0 flex justify-center pointer-events-none">
        <div className="flex gap-1.5 items-center bg-gray-200/0">
          {[2, 3, 4, 5].map((s) => (
            <div 
              key={s} 
              className={`h-1.5 rounded-full transition-all duration-300 ${s === step ? "w-8 bg-[#e60023]" : s < step ? "w-2 bg-[#e60023]" : "w-2 bg-[#e9e9e9]"}`}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-[32px] shadow-2xl w-full relative flex flex-col overflow-hidden animate-fade-in-up" 
           style={{ 
             maxWidth: step === 5 ? "780px" : "484px",
             minHeight: step === 5 ? undefined : "400px",
             height: step === 5 ? "min(620px, calc(100vh - 32px))" : undefined,
             transition: "max-width 0.3s ease"
           }}>
        
        {/* Back Button */}
        {step > 1 && step <= 5 && (
          <button onClick={handleBack} className="absolute top-4 left-4 p-3 rounded-full hover:bg-gray-100 transition-colors z-10">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M15.5 21a1.5 1.5 0 01-1.06-.44l-8-8a1.5 1.5 0 010-2.12l8-8a1.5 1.5 0 112.12 2.12L9.62 12l6.94 6.94a1.5 1.5 0 01-1.06 2.56z"/>
            </svg>
          </button>
        )}
        
        {renderProgress()}

        {/* --- STEP 1: Birthdate --- */}
        {step === 1 && (
          <div className="flex flex-col items-center justify-center p-10 h-full flex-grow">
            <div className="text-[32px] mb-3">🎂</div>
            <h1 className="text-[28px] font-semibold mb-4 text-[#111]">Enter your birthdate</h1>
            <p className="text-[14px] text-[#111] mb-8 text-center max-w-[340px] leading-relaxed">
              To help keep Pinterest safe, we now require your birthdate. Your birthdate also helps us provide more personalized recommendations and relevant ads. We won't share this information without your permission and it won't be visible on your profile.
            </p>
            
            <div className="w-full max-w-[260px] flex flex-col gap-2">
              <input
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                className="w-full px-4 py-3.5 border-2 border-[#cdcdcd] rounded-2xl text-[16px] text-[#111] focus:border-[#111] outline-none transition-colors"
              />
              <p className="text-[12px] text-[#767676] text-center mb-6">Use your own birthday, even if this a business account</p>
              
              <button
                disabled={!birthdate}
                onClick={handleNext}
                className="w-full py-3.5 rounded-full font-semibold text-[15px] transition-colors bg-[#e9e9e9] text-[#a5a5a5] disabled:bg-[#e9e9e9] disabled:text-[#a5a5a5]"
                style={{
                  backgroundColor: birthdate ? "#e60023" : "#e9e9e9",
                  color: birthdate ? "white" : "#a5a5a5",
                }}
              >
                Create account
              </button>
            </div>
          </div>
        )}

{/* --- STEP 2: Location/Language --- */}
{step === 2 && (
  <div className="flex flex-col items-center justify-center px-9 py-10 text-center w-full min-h-[500px]">
    
    {/* Header Section */}
    <div className="mb-8">
      <h1 className="text-[24px] sm:text-[26px] font-semibold text-[#111] tracking-tight max-w-[340px] leading-tight mb-2">
        Where do you live, and what language do you speak?
      </h1>
      <p className="text-[14px] text-[#767676]">
        This information will always be private
      </p>
    </div>
    
    {/* Form Section: Label sekarang di LUAR kotak */}
    <div className="w-full max-w-[280px] flex flex-col gap-5 text-left mb-10">
      
      {/* Country Group */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[14px] font-semibold text-[#111] ml-1">Country</label>
        <div className="relative border-2 border-[#cdcdcd] rounded-2xl focus-within:border-[#111] transition-colors bg-white px-3 py-2.5">
          <select 
            value={country} 
            onChange={(e) => setCountry(e.target.value)}
            className="w-full bg-transparent text-[15px] font-medium text-[#111] outline-none appearance-none cursor-pointer"
          >
            <option>Indonesia</option>
            <option>United States</option>
            <option>United Kingdom</option>
            <option>Japan</option>
            <option>South Korea</option>
          </select>
          <svg className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#111]" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 19.5L.66 8.29c-.88-.86-.88-2.27 0-3.14.88-.87 2.3-.87 3.18 0L12 13.21l8.16-8.06c.88-.87 2.3-.87 3.18 0 .88.87.88 2.28 0 3.14L12 19.5z"></path>
          </svg>
        </div>
      </div>

      {/* Language Group */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[14px] font-semibold text-[#111] ml-1">Language</label>
        <div className="relative border-2 border-[#cdcdcd] rounded-2xl focus-within:border-[#111] transition-colors bg-white px-3 py-2.5">
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full bg-transparent text-[15px] font-medium text-[#111] outline-none appearance-none cursor-pointer"
          >
            <option>English (US)</option>
            <option>Bahasa Indonesia</option>
          </select>
          <svg className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#111]" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 19.5L.66 8.29c-.88-.86-.88-2.27 0-3.14.88-.87 2.3-.87 3.18 0L12 13.21l8.16-8.06c.88-.87 2.3-.87 3.18 0 .88.87.88 2.28 0 3.14L12 19.5z"></path>
          </svg>
        </div>
      </div>
    </div>

    {/* Button Section */}
    <div className="w-full max-w-[280px]">
      <button onClick={handleNext} className="w-full py-3.5 rounded-full font-bold text-[15px] bg-[#e60023] text-white hover:bg-[#ad081b] transition-all shadow-sm">
        Continue
      </button>
    </div>
    
  </div>
)}

        {/* --- STEP 3: Name --- */}
{step === 3 && (
  <div className="flex flex-col items-center justify-center px-9 py-10 text-center w-full min-h-[460px]">
    
    {/* Email ditaruh di paling atas sebagai penanda konteks akun */}
    {user?.email && (
      <p className="text-[12px] text-[#767676] mb-2 font-medium tracking-wide truncate max-w-[280px]">
        {user.email}
      </p>
    )}

    {/* Judul Utama */}
    <h1 className="text-[24px] sm:text-[26px] font-semibold mb-2 text-[#111] tracking-tight max-w-[340px] leading-tight">
      Nice to meet you! What's your name?
    </h1>
    
    {/* Deskripsi */}
    <p className="text-[14px] text-[#767676] mb-8 max-w-[320px] leading-relaxed">
      Your answers to the next few questions will help us find the right ideas for you
    </p>
    
    {/* Form Input Container */}
    <div className="w-full max-w-[280px] text-left block">
      {/* Label Name - Menempel pas di atas outline */}
      <label className="block text-[14px] font-semibold text-[#111] ml-1 mb-1.5 leading-none">
        Name
      </label>
      
      {/* Outline Tabel Isi Name */}
      <div className="w-full border-2 border-[#cdcdcd] rounded-2xl focus-within:border-[#111] transition-colors bg-white px-4 py-3">
        <input 
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="First name"
          className="w-full bg-transparent text-[15px] font-medium text-[#111] outline-none placeholder-[#a5a5a5]"
        />
      </div>
    </div>

    {/* Tombol Aksi - Diturunkan sedikit (mt-8) biar dapet gap ideal mirip birthdate */}
    <div className="w-full max-w-[280px] mt-8">
      <button 
        disabled={!name}
        onClick={handleNext} 
        className="w-full py-3.5 rounded-full font-semibold text-[15px] transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed"
        style={{
          backgroundColor: name ? "#e60023" : "#e9e9e9",
          color: name ? "white" : "#a5a5a5",
        }}
      >
        Continue
      </button>
    </div>

  </div>
)}

        {/* --- STEP 4: Gender --- */}
        {step === 4 && (
          <div className="flex flex-col items-center justify-center p-10 h-full flex-grow">
            <h1 className="text-[32px] font-semibold text-[#111] mb-2 mt-4 text-center">How do you identify?</h1>
            <p className="text-[15px] text-[#111] mb-8 text-center">This information will always be private</p>
            
            <div className="flex flex-col gap-3 w-full max-w-[280px]">
              {["Female", "Male", "Other"].map((g) => (
                <button 
                  key={g}
                  onClick={() => {
                    setGender(g);
                    handleNext();
                  }}
                  className="w-full py-3.5 bg-[#e9e9e9] hover:bg-[#e2e2e2] rounded-full font-semibold text-[15px] text-[#111] transition-colors"
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}

{/* --- STEP 5: Mood --- */}
{step === 5 && (
  <div className="flex flex-col items-center justify-center px-9 py-10 text-center w-full min-h-[460px]">
    
    {/* Judul Utama & Deskripsi */}
    <div className="mb-6 flex-shrink-0">
      <h1 className="text-[24px] sm:text-[26px] font-semibold text-[#111] tracking-tight max-w-[340px] leading-tight mb-1">
        What are you in the mood to do?
      </h1>
      <p className="text-[14px] text-[#767676]">
        Pick 3 or more to continue
      </p>
    </div>
    
    {/* Grid Area - Ditambahkan flex-grow agar mendorong tombol di bawahnya */}
    <div className="w-full max-w-[340px] max-h-[240px] flex-grow overflow-y-auto px-1.5 pb-2" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
      <style>{`.overflow-y-auto::-webkit-scrollbar { display: none; }`}</style>
      
      <div className="grid grid-cols-3 gap-3">
        {moods.map((mood) => {
          const isSelected = selectedMoods.includes(mood.id);
          return (
            <div 
              key={mood.id}
              onClick={() => handleMoodToggle(mood.id)}
              className={`relative rounded-2xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 aspect-square border-2 ${mood.bg} ${
                isSelected ? "border-black scale-95 shadow-sm" : "border-transparent hover:scale-105"
              }`}
            >
              {/* Icon Emoji Besar */}
              <div className="text-[26px] mb-2 select-none">{mood.icon}</div>
              
              {/* Label Teks Minimalis */}
              <span className="text-[#111] font-semibold text-[13px] leading-tight break-words max-w-full">
                {mood.label}
              </span>
              
              {/* Tanda Centang */}
              {isSelected && (
                <div className="absolute top-2 right-2 bg-black text-white rounded-full p-0.5 shadow-sm">
                  <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor">
                    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>

    {/* Tombol Aksi - Diubah ke mt-10 agar turun ke bawah dan tidak tabrakan */}
    <div className="w-full max-w-[280px] mt-10 flex-shrink-0">
      <button 
        disabled={selectedMoods.length < 3}
        onClick={handleFinish} 
        className="w-full py-3.5 rounded-full font-semibold text-[15px] transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed"
        style={{
          backgroundColor: selectedMoods.length >= 3 ? "#e60023" : "#e9e9e9",
          color: selectedMoods.length >= 3 ? "white" : "#a5a5a5",
        }}
      >
        {selectedMoods.length >= 3 ? "Continue" : "Pick 3 or more to continue"}
      </button>
    </div>

  </div>
)}
      </div>
    </div>
  );
}