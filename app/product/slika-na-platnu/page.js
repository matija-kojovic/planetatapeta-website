"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { useRouter } from "next/navigation";

function CanvasConfiguratorInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const imageSrc = searchParams.get("img") || "";
  const imageTitle = searchParams.get("title") || "Slika na Platnu";

  const [layout, setLayout] = useState("5-staggered"); // '1-panel', '3-panel', '5-staggered'
  const [sizePreset, setSizePreset] = useState("medium"); // 'small', 'medium', 'large', 'custom'
  
  // Custom dimensions (total width & height in cm)
  const [customWidth, setCustomWidth] = useState(150);
  const [customHeight, setCustomHeight] = useState(80);

  const [edgeStyle, setEdgeStyle] = useState("mirror"); // 'mirror', 'black', 'white'

  // Presets based on layout
  const presets = {
    "1-panel": [
      { id: "small", label: "50 × 40 cm", width: 50, height: 40, price: 2900 },
      { id: "medium", label: "70 × 50 cm", width: 70, height: 50, price: 3900 },
      { id: "large", label: "100 × 70 cm", width: 100, height: 70, price: 5400 },
    ],
    "3-panel": [
      { id: "small", label: "90 × 60 cm (3 delova)", width: 90, height: 60, price: 5800 },
      { id: "medium", label: "120 × 80 cm (3 delova)", width: 120, height: 80, price: 7900 },
      { id: "large", label: "150 × 100 cm (3 delova)", width: 150, height: 100, price: 10800 },
    ],
    "5-staggered": [
      { id: "small", label: "100 × 60 cm (5 delova)", width: 100, height: 60, price: 6900 },
      { id: "medium", label: "150 × 80 cm (5 delova)", width: 150, height: 80, price: 9200 },
      { id: "large", label: "200 × 100 cm (5 delova)", width: 200, height: 100, price: 12500 },
    ]
  };

  // Adjust size preset selection if layout changes
  useEffect(() => {
    if (sizePreset !== "custom") {
      setSizePreset("medium");
    }
  }, [layout]);

  // Dimensions
  const selectedPresetList = presets[layout] || [];
  const selectedPreset = selectedPresetList.find(p => p.id === sizePreset);
  
  const width = sizePreset === "custom" ? customWidth : (selectedPreset ? selectedPreset.width : 150);
  const height = sizePreset === "custom" ? customHeight : (selectedPreset ? selectedPreset.height : 80);

  // Price calculation for custom sizes
  const areaSqm = (width * height) / 10000;
  let customPrice = 0;
  if (layout === "1-panel") {
    customPrice = areaSqm * 5000 + 1500; // base price + per sqm
  } else if (layout === "3-panel") {
    customPrice = areaSqm * 6500 + 2500;
  } else {
    customPrice = areaSqm * 7000 + 3500;
  }

  // Round price to nearest 100 RSD
  const finalPrice = sizePreset === "custom" ? Math.round(customPrice / 100) * 100 : (selectedPreset ? selectedPreset.price : 9200);

  const handleAddToCart = () => {
    const layoutLabel = layout === "1-panel" ? "Jednodelna slika" : layout === "3-panel" ? "Trodelna slika" : "Petodelna slika (kaskadna)";
    const edgeLabel = edgeStyle === "mirror" ? "Ogledalo ivica (nastavak slike)" : edgeStyle === "black" ? "Crna ivica" : "Bela ivica";
    
    const cartItem = {
      id: `platno-custom-${layout}-${Date.now()}`,
      title: `${imageTitle} (${layoutLabel})`,
      image: imageSrc,
      itemId: "slike_na_platnu",
      price: Math.round(finalPrice),
      quantity: 1,
      configuration: {
        layout: layoutLabel,
        dimensions: `${width} × ${height} cm`,
        edgeStyle: edgeLabel,
        imageSrc,
      },
      finalPrice: Math.round(finalPrice),
      configurationKey: JSON.stringify({ layout, width, height, edgeStyle, imageSrc }),
    };
    addToCart(cartItem);
    router.push("/cart");
  };

  const [showLightbox, setShowLightbox] = useState(false);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (showLightbox) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showLightbox]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Lightbox */}
      {showLightbox && imageSrc && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-end pt-28 pb-10 px-4 sm:px-8"
          onClick={() => setShowLightbox(false)}
        >
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-6 right-4 sm:top-6 sm:right-6 z-[110] bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all"
            aria-label="Zatvori"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div onClick={(e) => e.stopPropagation()} className="max-w-6xl w-full flex flex-col items-center gap-3 mb-4">
            <img
              src={imageSrc}
              alt={imageTitle}
              className="max-w-full max-h-[calc(100vh-180px)] object-contain rounded-xl shadow-2xl"
            />
            <span className="text-gray-400 text-sm">{imageTitle}</span>
          </div>
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 mb-8 flex-wrap text-sm">
        <Link href="/" className="text-gray-400 hover:text-white transition-colors">Početna</Link>
        <span className="text-gray-600">/</span>
        <Link href="/category/slike_na_platnu" className="text-gray-400 hover:text-white transition-colors">Slike na platnu</Link>
        <span className="text-gray-600">/</span>
        <span className="text-white font-medium">Konfiguracija poliptiha</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* LEFT — Interactive Live Wall Mockup (7 cols) */}
        <div className="lg:col-span-7 order-1 sticky top-36">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl relative overflow-hidden">
            {/* Visualizer Room Background */}
            <div className="aspect-[16/10] w-full bg-[#1b2330] rounded-2xl relative flex items-center justify-center overflow-hidden border border-white/5 shadow-inner">
              {/* Room floor line */}
              <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-[#141a24] border-t border-white/5" />
              
              {/* Couch simulation (Vector style) */}
              <div className="absolute bottom-4 w-2/3 h-14 bg-slate-800/80 backdrop-blur-md rounded-xl border border-white/5 shadow-xl flex items-center justify-between px-8 z-[2]">
                <div className="w-12 h-6 bg-slate-700/50 rounded-lg" />
                <div className="w-24 h-6 bg-slate-700/50 rounded-lg" />
                <div className="w-12 h-6 bg-slate-700/50 rounded-lg" />
              </div>

              {/* WALL ART CONTAINER */}
              <div 
                className="absolute top-[20%] w-[80%] h-[45%] flex gap-1 sm:gap-2 justify-center items-center cursor-zoom-in group z-[3]"
                onClick={() => setShowLightbox(true)}
              >
                {/* 1-PANEL LAYOUT */}
                {layout === "1-panel" && (
                  <div className="relative overflow-hidden w-[60%] h-[90%] rounded-sm shadow-[0_15px_35px_rgba(0,0,0,0.6)] border border-white/10 transition-all duration-500 hover:-translate-y-1">
                    <img src={imageSrc} alt={imageTitle} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* 3-PANEL LAYOUT */}
                {layout === "3-panel" && (
                  <>
                    <div className="relative overflow-hidden w-[23%] h-[85%] rounded-sm shadow-[0_15px_30px_rgba(0,0,0,0.6)] border border-white/10 transition-all duration-500 hover:-translate-y-1">
                      <img src={imageSrc} className="absolute max-w-none w-[310%] h-full object-cover" style={{ left: '0%' }} />
                    </div>
                    <div className="relative overflow-hidden w-[23%] h-[85%] rounded-sm shadow-[0_15px_30px_rgba(0,0,0,0.6)] border border-white/10 transition-all duration-500 hover:-translate-y-1.5">
                      <img src={imageSrc} className="absolute max-w-none w-[310%] h-full object-cover" style={{ left: '-100%' }} />
                    </div>
                    <div className="relative overflow-hidden w-[23%] h-[85%] rounded-sm shadow-[0_15px_30px_rgba(0,0,0,0.6)] border border-white/10 transition-all duration-500 hover:-translate-y-1">
                      <img src={imageSrc} className="absolute max-w-none w-[310%] h-full object-cover" style={{ left: '-200%' }} />
                    </div>
                  </>
                )}

                {/* 5-PANEL STAGGERED LAYOUT */}
                {layout === "5-staggered" && (
                  <>
                    <div className="relative overflow-hidden w-[14%] h-[60%] rounded-sm shadow-[0_12px_24px_rgba(0,0,0,0.6)] border border-white/10 transition-all duration-500 hover:-translate-y-1">
                      <img src={imageSrc} className="absolute max-w-none w-[540%] h-[155%] object-cover top-1/2 -translate-y-1/2" style={{ left: '0%' }} />
                    </div>
                    <div className="relative overflow-hidden w-[14%] h-[75%] rounded-sm shadow-[0_15px_28px_rgba(0,0,0,0.6)] border border-white/10 transition-all duration-500 hover:-translate-y-1.5">
                      <img src={imageSrc} className="absolute max-w-none w-[540%] h-[126%] object-cover top-1/2 -translate-y-1/2" style={{ left: '-100%' }} />
                    </div>
                    <div className="relative overflow-hidden w-[14%] h-[90%] rounded-sm shadow-[0_18px_35px_rgba(0,0,0,0.7)] border border-white/10 transition-all duration-500 hover:-translate-y-2">
                      <img src={imageSrc} className="absolute max-w-none w-[540%] h-[106%] object-cover top-1/2 -translate-y-1/2" style={{ left: '-200%' }} />
                    </div>
                    <div className="relative overflow-hidden w-[14%] h-[75%] rounded-sm shadow-[0_15px_28px_rgba(0,0,0,0.6)] border border-white/10 transition-all duration-500 hover:-translate-y-1.5">
                      <img src={imageSrc} className="absolute max-w-none w-[540%] h-[126%] object-cover top-1/2 -translate-y-1/2" style={{ left: '-300%' }} />
                    </div>
                    <div className="relative overflow-hidden w-[14%] h-[60%] rounded-sm shadow-[0_12px_24px_rgba(0,0,0,0.6)] border border-white/10 transition-all duration-500 hover:-translate-y-1">
                      <img src={imageSrc} className="absolute max-w-none w-[540%] h-[155%] object-cover top-1/2 -translate-y-1/2" style={{ left: '-400%' }} />
                    </div>
                  </>
                )}
              </div>

              {/* Helper badge */}
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg px-2.5 py-1 text-xs text-gray-400">
                Prikaz u prostoru
              </div>
            </div>

            <p className="text-sm text-gray-500 mt-4 text-center">
              Prikazana simulacija za {layout === "1-panel" ? "jednodelnu" : layout === "3-panel" ? "trodelnu" : "petodelnu"} sliku na zidu.
            </p>
          </div>
        </div>

        {/* RIGHT — Configurator form (5 cols) */}
        <div className="lg:col-span-5 order-2 min-w-0">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-7 text-white">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-accent,#d4a373)] mb-3 break-words">{imageTitle}</h1>
            <p className="text-gray-400 text-sm mb-6">Premium blind-ram štampa na slikarskom platnu</p>

            {/* Layout Options */}
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-3 font-medium">Izaberite raspored platana</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setLayout("1-panel")}
                  className={`px-3 py-3 rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all border ${
                    layout === "1-panel"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                      : "bg-white/5 text-gray-400 border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="w-6 h-5 bg-white/20 rounded-sm" />
                  Jednodelna
                </button>
                <button
                  onClick={() => setLayout("3-panel")}
                  className={`px-3 py-3 rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all border ${
                    layout === "3-panel"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                      : "bg-white/5 text-gray-400 border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex gap-0.5 w-8 h-5 justify-center">
                    <div className="w-2 h-full bg-white/20 rounded-sm" />
                    <div className="w-2 h-full bg-white/20 rounded-sm" />
                    <div className="w-2 h-full bg-white/20 rounded-sm" />
                  </div>
                  Trodelna
                </button>
                <button
                  onClick={() => setLayout("5-staggered")}
                  className={`px-3 py-3 rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all border ${
                    layout === "5-staggered"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                      : "bg-white/5 text-gray-400 border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex gap-0.5 w-10 h-5 justify-center items-center">
                    <div className="w-1.5 h-[60%] bg-white/20 rounded-sm" />
                    <div className="w-1.5 h-[80%] bg-white/20 rounded-sm" />
                    <div className="w-1.5 h-[100%] bg-white/20 rounded-sm" />
                    <div className="w-1.5 h-[80%] bg-white/20 rounded-sm" />
                    <div className="w-1.5 h-[60%] bg-white/20 rounded-sm" />
                  </div>
                  Petodelna
                </button>
              </div>
            </div>

            {/* Size Options */}
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-3 font-medium">Dimenzije kompleta (ukupno)</label>
              <div className="space-y-2">
                {selectedPresetList.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setSizePreset(preset.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex justify-between items-center border ${
                      sizePreset === preset.id
                        ? "bg-blue-500/20 text-blue-300 border-blue-500/50"
                        : "bg-white/5 text-gray-300 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <span>{preset.label}</span>
                    <span className="font-mono text-cyan-400">{preset.price.toLocaleString('sr-RS')} RSD</span>
                  </button>
                ))}
                <button
                  onClick={() => setSizePreset("custom")}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex justify-between items-center border ${
                    sizePreset === "custom"
                      ? "bg-blue-500/20 text-blue-300 border-blue-500/50"
                      : "bg-white/5 text-gray-300 border-white/10 hover:border-white/20"
                  }`}
                >
                  <span>Sopstvene dimenzije</span>
                  <span className="text-xs text-gray-400">Izračunaj po m²</span>
                </button>
              </div>
            </div>

            {/* Custom Dimensions Form */}
            {sizePreset === "custom" && (
              <div className="mb-6 p-4 bg-white/[0.03] border border-white/10 rounded-xl animate-fade-in">
                <label className="block text-xs text-gray-400 mb-2 font-medium">Unesite ukupnu širinu i visinu (cm)</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      type="number"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 pr-14 text-white focus:outline-none focus:border-blue-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">širina</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 pr-14 text-white focus:outline-none focus:border-blue-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">visina</span>
                  </div>
                </div>
              </div>
            )}

            {/* Canvas Edge Options */}
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-3 font-medium">Stil ivice (bočne strane rama)</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setEdgeStyle("mirror")}
                  className={`px-2 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    edgeStyle === "mirror"
                      ? "bg-blue-500/20 text-blue-300 border-blue-500/50"
                      : "bg-white/5 text-gray-400 border-white/10"
                  }`}
                >
                  Ogledalo ivica
                </button>
                <button
                  onClick={() => setEdgeStyle("black")}
                  className={`px-2 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    edgeStyle === "black"
                      ? "bg-blue-500/20 text-blue-300 border-blue-500/50"
                      : "bg-white/5 text-gray-400 border-white/10"
                  }`}
                >
                  Crna ivica
                </button>
                <button
                  onClick={() => setEdgeStyle("white")}
                  className={`px-2 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    edgeStyle === "white"
                      ? "bg-blue-500/20 text-blue-300 border-blue-500/50"
                      : "bg-white/5 text-gray-400 border-white/10"
                  }`}
                >
                  Bela ivica
                </button>
              </div>
              <p className="text-[11px] text-gray-500 mt-2">
                * Kod ogledalo ivice, slika se preslikava i nastavlja na bočne strane blind rama (preporučeno).
              </p>
            </div>

            {/* Price Breakdown */}
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 mb-6">
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Izabrani raspored</span>
                  <span className="font-semibold text-gray-200">
                    {layout === "1-panel" ? "Jednodelna slika" : layout === "3-panel" ? "Trodelni komplet" : "Petodelni komplet"}
                  </span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Ukupna dimenzija</span>
                  <span className="font-mono text-gray-300">{width} × {height} cm</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Blind ram (debljina)</span>
                  <span className="text-gray-300">Drveni ram 2cm</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Ivice</span>
                  <span className="text-gray-300">{edgeStyle === "mirror" ? "Ogledalo" : edgeStyle === "black" ? "Crne" : "Bele"}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-lg pt-3 mt-1 border-t border-white/10">
                  <span>Ukupno za komplet</span>
                  <span className="font-mono text-amber-400">{Math.round(finalPrice).toLocaleString('sr-RS')} RSD</span>
                </div>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-amber-500/25 active:scale-[0.98] flex items-center justify-center gap-2 text-base"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              Dodaj komplet u korpu
            </button>

            <p className="mt-5 text-xs text-gray-600 text-center">
              Kategorija: Slike na platnu
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CanvasProductPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 aspect-[16/10] bg-white/5 rounded-2xl" />
          <div className="lg:col-span-5 bg-white/5 rounded-3xl h-[600px]" />
        </div>
      </div>
    }>
      <CanvasConfiguratorInner />
    </Suspense>
  );
}
