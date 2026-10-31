"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { useRouter } from "next/navigation";

function StickerConfiguratorInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const imageSrc = searchParams.get("img") || "";
  const imageTitle = searchParams.get("title") || "Zidni Stiker";
  const subcategoryId = searchParams.get("sub") || "";

  const [material, setMaterial] = useState("standard");
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);
  const [contourCut, setContourCut] = useState(true);

  const materials = [
    { id: "standard", name: "Standardna folija", pricePerSqm: 1500 },
    { id: "laminirana", name: "Laminirana folija", pricePerSqm: 2200 },
    { id: "premium", name: "Easy-Apply folija", pricePerSqm: 2800 },
  ];

  const selectedMaterial = materials.find((m) => m.id === material);
  const areaSqm = (width * height) / 10000;

  let totalPrice = areaSqm * selectedMaterial.pricePerSqm;
  let cutPrice = 0;

  if (contourCut) {
    cutPrice = areaSqm * 400; // 400 RSD per sqm for contour cutting
    totalPrice += cutPrice;
  }

  // Minimum order price for custom sticker
  if (totalPrice < 1000) {
    totalPrice = 1000;
  }

  const handleAddToCart = () => {
    const cartItem = {
      id: `stiker-custom-${subcategoryId}-${Date.now()}`,
      title: imageTitle,
      image: imageSrc,
      itemId: "zidni_stikeri",
      price: Math.round(totalPrice),
      quantity: 1,
      configuration: {
        material: selectedMaterial.name,
        width,
        height,
        areaSqm: areaSqm.toFixed(2),
        contourCut: contourCut ? "Konturno sečeno" : "Pravougaono sečeno",
        imageSrc,
      },
      finalPrice: Math.round(totalPrice),
      configurationKey: JSON.stringify({ material, width, height, contourCut, imageSrc }),
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <Link href="/category/zidni_stikeri" className="text-gray-400 hover:text-white transition-colors">Zidni stikeri</Link>
        {subcategoryId && (
          <>
            <span className="text-gray-600">/</span>
            <Link href={`/category/zidni_stikeri/${subcategoryId}`} className="text-gray-400 hover:text-white transition-colors">
              Dizajni
            </Link>
          </>
        )}
        <span className="text-gray-600">/</span>
        <span className="text-white font-medium">Konfiguracija</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* LEFT — Image Preview */}
        <div className="order-1">
          <div className="sticky top-36">
            {imageSrc ? (
              <div
                className="group rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40 bg-slate-950/80 cursor-zoom-in hover:border-white/20 transition-all"
                onClick={() => setShowLightbox(true)}
              >
                <div className="relative flex items-center justify-center p-6 min-h-[280px] lg:min-h-[360px]">
                  <img
                    src={imageSrc}
                    alt={imageTitle}
                    className="max-w-full max-h-[50vh] lg:max-h-[60vh] object-contain rounded-lg"
                  />
                  {/* Zoom hint */}
                  <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm border border-white/20 rounded-full p-2 opacity-60 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              </div>
            ) : (
              <div className="aspect-square rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <span className="text-6xl opacity-30">🖼️</span>
              </div>
            )}
            <p className="text-sm text-gray-500 mt-3 text-center">{imageTitle} · <span className="text-gray-600">klikni za uvećanje</span></p>
          </div>
        </div>

        {/* RIGHT — Configurator Form */}
        <div className="order-2 min-w-0">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-7 text-white overflow-hidden">
            
            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-accent,#d4a373)] mb-4 break-words">{imageTitle}</h1>
            
            {/* Price per sqm indicator */}
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-gray-400 text-sm">Cena od</span>
              <span className="text-2xl font-bold text-white">{selectedMaterial.pricePerSqm.toLocaleString('sr-RS')}</span>
              <span className="text-gray-400 text-sm">RSD / m²</span>
            </div>

            {/* Material Selection */}
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-3 font-medium">Vrsta folije</label>
              <div className="flex flex-wrap gap-2">
                {materials.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMaterial(m.id)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                      material === m.id
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/50 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                        : "bg-white/5 text-gray-400 border border-white/10 hover:border-white/25 hover:text-gray-300"
                    }`}
                  >
                    {m.name}
                    <span className={`ml-1.5 text-xs ${material === m.id ? "text-blue-400/70" : "text-gray-600"}`}>
                      {m.pricePerSqm} RSD
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dimensions */}
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-3 font-medium">Dimenzije (cm)</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    min={10}
                    max={300}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-14 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono text-base"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">širina</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    min={10}
                    max={300}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-14 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono text-base"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">visina</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Dozvoljene dimenzije od 10cm do 300cm.</p>
            </div>

            {/* Contour Cut Toggle */}
            <div className="flex items-center justify-between mb-6 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5">
              <div>
                <span className="text-sm text-gray-300 font-medium">Konturno (precizno) opsecanje stikera</span>
                <span className="text-xs text-gray-500 ml-2 block mt-0.5">+400 RSD/m² (za nepravilne oblike)</span>
              </div>
              <button
                onClick={() => setContourCut(!contourCut)}
                className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ${contourCut ? "bg-blue-500" : "bg-gray-700"}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${contourCut ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>

            {/* Price Breakdown */}
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 mb-6">
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Dimenzije</span>
                  <span className="font-mono text-gray-300">{width} × {height} cm</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Površina</span>
                  <span className="font-mono text-gray-300">{areaSqm.toFixed(2)} m²</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Materijal</span>
                  <span className="font-mono text-gray-300">{selectedMaterial.name} — {selectedMaterial.pricePerSqm.toLocaleString('sr-RS')} RSD/m²</span>
                </div>
                {contourCut && (
                  <div className="flex justify-between text-blue-400">
                    <span>Konturno sečenje</span>
                    <span className="font-mono">{Math.round(cutPrice).toLocaleString('sr-RS')} RSD</span>
                  </div>
                )}
                {areaSqm * (selectedMaterial.pricePerSqm + (contourCut ? 400 : 0)) < 1000 && (
                  <div className="flex justify-between text-amber-400 text-xs italic">
                    <span>Napomena</span>
                    <span>Minimalna vrednost porudžbine je 1.000 RSD</span>
                  </div>
                )}
                <div className="flex justify-between text-white font-bold text-lg pt-3 mt-1 border-t border-white/10">
                  <span>Ukupno</span>
                  <span className="font-mono text-cyan-400">{Math.round(totalPrice).toLocaleString('sr-RS')} RSD</span>
                </div>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-cyan-500/25 active:scale-[0.98] flex items-center justify-center gap-2 text-base"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              Dodaj u korpu
            </button>

            <p className="mt-5 text-xs text-gray-600 text-center">
              Kategorija: Zidni stikeri
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StickerProductPage() {
  return (
    <Suspense fallback={
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-white/5 rounded-2xl" />
          <div className="bg-white/5 rounded-3xl h-[600px]" />
        </div>
      </div>
    }>
      <StickerConfiguratorInner />
    </Suspense>
  );
}
