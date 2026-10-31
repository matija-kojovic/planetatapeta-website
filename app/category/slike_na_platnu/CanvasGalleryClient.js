"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

function MultiPanelPreview({ src, alt }) {
  return (
    <div className="flex gap-1.5 justify-center items-center h-44 sm:h-52 lg:h-56 px-4 bg-slate-950/60 rounded-t-2xl overflow-hidden relative border-b border-white/5">
      {/* Shadow background simulation */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-[1]" />
      
      {/* Panel 1 */}
      <div className="relative overflow-hidden w-[18%] h-[65%] rounded-sm shadow-[0_10px_20px_rgba(0,0,0,0.5)] border border-white/10 transition-transform duration-500 group-hover:-translate-y-1 z-[2]">
        <img 
          src={src} 
          alt={alt} 
          className="absolute max-w-none w-[555%] h-[154%] object-cover top-1/2 -translate-y-1/2" 
          style={{ left: '0%' }} 
        />
      </div>
      {/* Panel 2 */}
      <div className="relative overflow-hidden w-[18%] h-[80%] rounded-sm shadow-[0_12px_24px_rgba(0,0,0,0.5)] border border-white/10 transition-transform duration-500 group-hover:-translate-y-2 z-[2]">
        <img 
          src={src} 
          alt={alt} 
          className="absolute max-w-none w-[555%] h-[125%] object-cover top-1/2 -translate-y-1/2" 
          style={{ left: '-100%' }} 
        />
      </div>
      {/* Panel 3 */}
      <div className="relative overflow-hidden w-[18%] h-[95%] rounded-sm shadow-[0_15px_30px_rgba(0,0,0,0.6)] border border-white/10 transition-transform duration-500 group-hover:-translate-y-3 z-[2]">
        <img 
          src={src} 
          alt={alt} 
          className="absolute max-w-none w-[555%] h-[105%] object-cover top-1/2 -translate-y-1/2" 
          style={{ left: '-200%' }} 
        />
      </div>
      {/* Panel 4 */}
      <div className="relative overflow-hidden w-[18%] h-[80%] rounded-sm shadow-[0_12px_24px_rgba(0,0,0,0.5)] border border-white/10 transition-transform duration-500 group-hover:-translate-y-2 z-[2]">
        <img 
          src={src} 
          alt={alt} 
          className="absolute max-w-none w-[555%] h-[125%] object-cover top-1/2 -translate-y-1/2" 
          style={{ left: '-300%' }} 
        />
      </div>
      {/* Panel 5 */}
      <div className="relative overflow-hidden w-[18%] h-[65%] rounded-sm shadow-[0_10px_20px_rgba(0,0,0,0.5)] border border-white/10 transition-transform duration-500 group-hover:-translate-y-1 z-[2]">
        <img 
          src={src} 
          alt={alt} 
          className="absolute max-w-none w-[555%] h-[154%] object-cover top-1/2 -translate-y-1/2" 
          style={{ left: '-400%' }} 
        />
      </div>
    </div>
  );
}

export default function CanvasGalleryClient({ images }) {
  const router = useRouter();

  const handleSelect = (img) => {
    router.push(`/product/slika-na-platnu?img=${encodeURIComponent(img.src)}&title=${encodeURIComponent(img.title)}`);
  };

  return (
    <div>
      <div className="text-center mb-8">
        <p className="text-sm text-gray-500">{images.length} dizajnova dostupno</p>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {images.map((img) => (
            <div
              key={img.id}
              onClick={() => handleSelect(img)}
              className="group relative bg-slate-900/80 border border-white/10 backdrop-blur-md rounded-2xl overflow-hidden hover:-translate-y-2 transition-all duration-500 hover:border-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer flex flex-col justify-between"
            >
              {/* Hover effect gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />

              {/* 5-panel split preview */}
              <div className="relative z-10">
                <MultiPanelPreview src={img.src} alt={img.title} />
              </div>

              {/* Title bar */}
              <div className="p-5 border-t border-white/5 relative z-10 flex items-center justify-between bg-black/20">
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                    {img.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">Višedelni komplet (blind ram)</p>
                </div>
                <div className="bg-white/10 group-hover:bg-amber-500/20 group-hover:text-amber-300 text-white border border-white/20 group-hover:border-amber-500/30 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300">
                  <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
          <div className="text-6xl mb-4 opacity-50">🖼️</div>
          <h3 className="text-2xl font-bold text-white mb-2">Nema dostupnih dizajnova</h3>
          <p className="text-gray-400">Uskoro dodajemo nove dizajne u ovu kategoriju.</p>
        </div>
      )}
    </div>
  );
}
