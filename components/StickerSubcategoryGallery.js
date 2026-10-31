"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

// Subcategory definitions for stickers
const subcategoryMap = {
  decije: {
    label: "Dečiji stikeri",
    description: "Veseli motivi za dečije sobe — životinje, oblaci, crtani likovi.",
  },
  soba: {
    label: "Stikeri za sobu",
    description: "Elegantni i moderni stikeri za dnevnu sobu, spavaću sobu i druge prostore.",
  },
};

export default function StickerSubcategoryGallery({ subcategoryId, images }) {
  const router = useRouter();
  const sub = subcategoryMap[subcategoryId];

  if (!sub) return null;

  const handleSelect = (img) => {
    router.push(`/product/stiker?sub=${subcategoryId}&img=${encodeURIComponent(img.src)}&title=${encodeURIComponent(img.title)}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 mb-8 text-sm">
        <Link href="/" className="text-gray-400 hover:text-white transition-colors">Početna</Link>
        <span className="text-gray-600">/</span>
        <Link href="/category/zidni_stikeri" className="text-gray-400 hover:text-white transition-colors">Zidni stikeri</Link>
        <span className="text-gray-600">/</span>
        <span className="text-white font-medium">{sub.label}</span>
      </div>

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
          {sub.label}
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          {sub.description}
        </p>
        <p className="text-sm text-gray-500 mt-3">{images.length} dizajnova dostupno</p>
      </div>

      {/* Image Grid — click goes directly to configurator */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative bg-slate-900/80 border border-white/10 backdrop-blur-md rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300 hover:border-amber-500/30 hover:shadow-xl hover:shadow-amber-500/10 cursor-pointer"
              onClick={() => handleSelect(img)}
            >
              {/* Image container */}
              <div className="relative h-44 sm:h-52 lg:h-56 bg-slate-950/50 flex items-center justify-center p-2">
                <img
                  src={img.src}
                  alt={img.title}
                  className="max-w-full max-h-full object-contain rounded-lg animate-fade-in"
                  loading="lazy"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3 m-2 rounded-lg">
                  <span className="text-white text-sm font-medium bg-amber-500/80 backdrop-blur-sm px-4 py-1.5 rounded-full">
                    Izaberi →
                  </span>
                </div>
              </div>

              {/* Title bar */}
              <div className="px-3 py-2.5 border-t border-white/5 flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors truncate">
                  {img.title}
                </h3>
                <svg className="w-4 h-4 text-gray-600 group-hover:text-amber-400 flex-shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
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

      {/* Back navigation */}
      <div className="mt-12 text-center">
        <Link
          href="/category/zidni_stikeri"
          className="inline-flex items-center text-amber-400 hover:text-amber-300 font-medium transition-colors group"
        >
          <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Nazad na sve kategorije stikera
        </Link>
      </div>
    </div>
  );
}
