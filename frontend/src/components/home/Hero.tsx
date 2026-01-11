import { useState, useEffect } from 'react';
import { Search, Book, Clock, TrendingUp, X } from 'lucide-react';

const Hero = () => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [animateText, setAnimateText] = useState(false);

  useEffect(() => {
    setAnimateText(true);
  }, []);

  // Handle ESC key to close search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSearchActive(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Mock data for recommendations
  const recommendations = [
    { icon: <Clock className="w-4 h-4 text-blue-400" />, text: "Recent: Advanced Calculus Notes" },
    { icon: <TrendingUp className="w-4 h-4 text-green-400" />, text: "Trending: System Design" },
    { icon: <Book className="w-4 h-4 text-purple-400" />, text: "Book: Clean Code" },
  ];

  return (
    <section className={`relative px-4 sm:px-6 lg:px-8 bg-black text-white transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${isSearchActive ? 'pt-28 pb-96 min-h-screen' : 'pt-40 pb-20'}`}>

      {/* FULL SCREEN BLUR OVERLAY */}
      <div
        onClick={() => setIsSearchActive(false)}
        className={`fixed inset-0 bg-black/80 backdrop-blur-xl z-30 transition-all duration-700 ${isSearchActive ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
      />

      <div className="max-w-4xl mx-auto text-center relative z-40">

        {/* HERO TEXT: Hide when search is active */}
        <div className={`transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] overflow-hidden ${isSearchActive ? 'max-h-0 opacity-0 mb-0 scale-95 blur-sm' : 'max-h-[500px] opacity-100 mb-12 scale-100 blur-0'}`}>
          <h1 className="text-5xl sm:text-7xl tracking-tighter mb-8 overflow-hidden">
            <span className={`block font-bold text-white transition-transform duration-1000 ease-out ${animateText ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
              Knowledge,
            </span>
            <span className={`block font-bold text-blue-500 transition-transform duration-1000 ease-out delay-200 ${animateText ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
              simplified.
            </span>
          </h1>

          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Curated academic resources for the modern scholar. <br className="hidden sm:block" /> Books, notes, and discussions in one place.
          </p>
        </div>

        {/* SEARCH BAR CONTAINER */}
        <div
          className={`relative mx-auto w-full transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]
  ${isSearchActive ? 'max-w-[720px]' : 'max-w-[560px] group'}`}
        >
          {/* NEON SHIMMER BORDER */}
          <div
            className={`absolute -inset-[1px] rounded-[2rem] overflow-hidden transition-opacity duration-700
    ${isSearchActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-80'}`}
          >
            <div className="absolute inset-[-250%] animate-[spin_6s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_160deg,#4285f4_180deg,#9b72f3_210deg,#d96570_240deg,transparent_270deg)]" />
          </div>

          {/* MAIN CONTAINER */}
          <div className="relative bg-[#050505] rounded-[1.9rem] flex flex-col">

            {/* INPUT AREA */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search resources..."
                onFocus={() => setIsSearchActive(true)}
                className={`w-full h-[64px] pl-14 pr-12 rounded-[1.9rem]
        text-white bg-gray-900/90 border border-gray-800/50 outline-none
        transition-all duration-300 font-light placeholder:text-gray-500 text-lg
        ${isSearchActive
                    ? 'bg-black/50 border-transparent'
                    : 'focus:border-blue-500/30 group-hover:bg-gray-900'
                  }`}
              />

              {/* SEARCH ICON */}
              <Search className={`absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 transition-colors
        ${isSearchActive ? 'text-blue-500' : 'text-gray-500 group-focus-within:text-white'}`}
              />

              {/* CLOSE ICON */}
              {isSearchActive && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSearchActive(false);
                  }}
                  className="absolute right-5 top-1/2 -translate-y-1/2 p-1 rounded-full
          hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* RECOMMENDATION PANEL */}
            <div
              className={`overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]
      ${isSearchActive ? 'max-h-[420px] opacity-100 border-t border-white/5' : 'max-h-0 opacity-0'}`}
            >
              <div className="p-6 max-h-[420px] overflow-y-auto">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 ml-1">
                  Suggested
                </p>

                <div className="space-y-2">
                  {recommendations.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-3 rounded-xl
              hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-white/5 hover:bg-blue-500/20 transition-colors">
                        {item.icon}
                      </div>
                      <span className="text-gray-300 hover:text-white font-light transition-colors">
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* TAGS */}
                <div className="mt-6 pt-4 border-t border-white/5 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {['Physics', 'Chemistry', 'Math', 'Computer Science', 'Botany'].map(tag => (
                    <span
                      key={tag}
                      className="px-4 py-2 rounded-full bg-white/5 text-xs text-gray-400
                                 border border-white/5 hover:border-blue-500/30 hover:text-blue-400
                                 cursor-pointer transition-all whitespace-nowrap"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
