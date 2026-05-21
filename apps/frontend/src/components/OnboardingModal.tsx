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
    { id: "drawing", label: "Drawing", image: "https://i.pinimg.com/736x/21/dd/6d/21dd6d9255ec03ce653df3b84f3ccb0f.jpg" },
    { id: "wallpapers", label: "Phone wallpapers", image: "https://i.pinimg.com/736x/8f/35/28/8f35281e742880a6be12b5d4ba11a5ba.jpg" },
    { id: "relaxation", label: "Relaxation", image: "https://i.pinimg.com/736x/6f/a6/5e/6fa65e9c0f99723528b86eab53be865b.jpg" },
    { id: "weddings", label: "Weddings", image: "https://i.pinimg.com/736x/82/53/78/825378ca601b0dc5ab3a9f07d2f92476.jpg" },
    { id: "renovation", label: "Home renovation", image: "https://i.pinimg.com/736x/01/be/1e/01be1e360fbf92b34be94bb1082387d3.jpg" },
    { id: "sneakers", label: "Sneakers", image: "https://i.pinimg.com/736x/e4/c7/ab/e4c7abbaf73b5f00e9ec14fb7cdb04fc.jpg" },
    { id: "spaces", label: "Small spaces", image: "https://i.pinimg.com/736x/1a/f6/54/1af6540c4e09520a3af1a39d89280ab4.jpg" },
    { id: "classroom", label: "Classroom ideas", image: "https://i.pinimg.com/736x/55/7e/17/557e17ddb0f1fa43560249c5eb75225c.jpg" },
    { id: "pop", label: "Pop culture", image: "https://i.pinimg.com/736x/c5/40/ea/c540eab717b0d7756f16fcd3938508eb.jpg" },
    { id: "cooking", label: "Cooking", image: "https://i.pinimg.com/736x/77/8d/f3/778df31ed234b6b1cb1a1ef7a9cddb6e.jpg" },
    { id: "nature", label: "Nature photography", image: "https://i.pinimg.com/736x/d9/56/9b/d9569bbed4393e2ceb1af7ba64fdf86a.jpg" },
    { id: "quotes", label: "Quotes", image: "https://i.pinimg.com/736x/e8/1f/2f/e81f2fce4d436b7cfcdfa804aeb5b3c5.jpg" },
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
          <div className="flex flex-col px-10 pt-20 pb-10 h-full flex-grow text-left">
            <h1 className="text-[32px] font-semibold text-[#111] leading-tight mb-2 max-w-[350px]">
              Where do you live, and what language do you speak?
            </h1>
            <p className="text-[15px] text-[#111] mb-8">This information will always be private</p>
            
            <div className="flex flex-col gap-4 mb-10 max-w-[350px]">
              {/* Select Container */}
              <div className="relative border-2 border-[#cdcdcd] rounded-2xl focus-within:border-[#111] transition-colors p-2">
                <label className="text-[12px] text-[#111] absolute top-1.5 left-3">Country</label>
                <select 
                  value={country} 
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full pt-4 pb-1 px-1 bg-transparent text-[16px] text-[#111] outline-none appearance-none cursor-pointer"
                >
                  <option>Indonesia</option>
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>Japan</option>
                  <option>South Korea</option>
                </select>
                <svg className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 19.5L.66 8.29c-.88-.86-.88-2.27 0-3.14.88-.87 2.3-.87 3.18 0L12 13.21l8.16-8.06c.88-.87 2.3-.87 3.18 0 .88.87.88 2.28 0 3.14L12 19.5z"></path>
                </svg>
              </div>

              {/* Select Container */}
              <div className="relative border-2 border-[#cdcdcd] rounded-2xl focus-within:border-[#111] transition-colors p-2">
                <label className="text-[12px] text-[#111] absolute top-1.5 left-3">Language</label>
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full pt-4 pb-1 px-1 bg-transparent text-[16px] text-[#111] outline-none appearance-none cursor-pointer"
                >
                  <option>English (US)</option>
                  <option>Bahasa Indonesia</option>
                </select>
                <svg className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 19.5L.66 8.29c-.88-.86-.88-2.27 0-3.14.88-.87 2.3-.87 3.18 0L12 13.21l8.16-8.06c.88-.87 2.3-.87 3.18 0 .88.87.88 2.28 0 3.14L12 19.5z"></path>
                </svg>
              </div>
            </div>

            <div className="mt-auto flex justify-center">
              <button onClick={handleNext} className="w-full max-w-[350px] py-3.5 rounded-full font-semibold text-[15px] bg-[#e60023] text-white hover:bg-[#ad081b] transition-colors">
                Continue
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 3: Name --- */}
        {step === 3 && (
          <div className="flex flex-col px-10 pt-20 pb-10 h-full flex-grow text-left">
            <h1 className="text-[32px] font-semibold text-[#111] leading-tight mb-2 max-w-[350px]">
              Nice to meet you! What's your name?
            </h1>
            <p className="text-[15px] text-[#111] mb-8 max-w-[350px]">
              Your answers to the next few questions will help us find the right ideas for you
            </p>
            
            <div className="flex flex-col gap-2 mb-10 max-w-[350px]">
              <div className="relative border-2 border-[#cdcdcd] rounded-2xl focus-within:border-[#111] transition-colors p-2">
                <label className="text-[12px] text-[#111] absolute top-1.5 left-3">Name</label>
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pt-4 pb-1 px-1 bg-transparent text-[16px] text-[#111] outline-none"
                />
              </div>
              {user?.email && <p className="text-[12px] text-[#767676] ml-2">{user.email}</p>}
            </div>

            <div className="mt-auto flex flex-col items-center gap-4">
              <button 
                disabled={!name}
                onClick={handleNext} 
                className="w-full max-w-[350px] py-3.5 rounded-full font-semibold text-[15px] transition-colors"
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
          <div className="flex flex-col h-full min-h-0 overflow-hidden pt-10 px-5 pb-4">
            <div className="text-center mb-3 flex-shrink-0">
              <h1 className="text-[26px] font-semibold text-[#111] mb-1">What are you in the mood to do?</h1>
            </div>
            
            {/* Grid Area - Scrollable */}
            <div className="flex-grow min-h-0 overflow-y-auto px-1.5 pb-3" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
              <style>{`.overflow-y-auto::-webkit-scrollbar { display: none; }`}</style>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {moods.map((mood) => {
                  const isSelected = selectedMoods.includes(mood.id);
                  return (
                    <div 
                      key={mood.id}
                      onClick={() => handleMoodToggle(mood.id)}
                      className={`relative rounded-2xl overflow-hidden cursor-pointer transition-transform duration-200 aspect-[4/4.25] ${isSelected ? "scale-95" : "hover:scale-105"}`}
                    >
                      <img src={mood.image} alt={mood.label} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 flex flex-col justify-end p-3">
                        <span className="text-white font-bold text-[15px] drop-shadow-md leading-tight">{mood.label}</span>
                      </div>
                      {/* Selection Overlay */}
                      {isSelected && (
                        <>
                          <div className="absolute inset-0 border-[3px] border-black rounded-2xl pointer-events-none" />
                          <div className="absolute top-3 right-3 bg-black text-white rounded-full p-1 shadow-sm">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                            </svg>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Sticky Action Bar */}
            <div className="pt-3 flex-shrink-0 flex justify-center bg-white z-10 border-t border-transparent shadow-[0_-10px_20px_rgba(255,255,255,0.9)]">
              <button 
                disabled={selectedMoods.length < 3}
                onClick={handleFinish} 
                className="w-full max-w-[350px] py-3.5 rounded-full font-semibold text-[15px] transition-colors"
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
