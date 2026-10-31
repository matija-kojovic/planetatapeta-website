"use client";

import { useState } from "react";

export default function TapeteForm({ product, onAddToCart }) {
  const [material, setMaterial] = useState("klasik");
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(240);
  const [includeInstallation, setIncludeInstallation] = useState(false);

  const materials = [
    { id: "klasik", name: "Klasik", pricePerSqm: 700, img: "/materials/klasik.webp" },
    { id: "samolepljive", name: "Samolepljive", pricePerSqm: 900, img: "/materials/samolepljive.webp" },
    { id: "reljefne", name: "Reljefne", pricePerSqm: 1100, img: "/materials/reljefne.webp" },
  ];

  const selectedMaterial = materials.find((m) => m.id === material);
  const areaSqm = (width * height) / 10000;
  
  let totalPrice = areaSqm * selectedMaterial.pricePerSqm;
  let installationPrice = 0;
  
  if (includeInstallation) {
    installationPrice = areaSqm * 500; // Pretpostavka cene ugradnje 500 din po m2
    // Minimum za ugradnju (Na slici piše ispod 20m2 doplata 2000 din)
    if (areaSqm < 20) {
      installationPrice += 2000;
    }
    totalPrice += installationPrice;
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-2xl mx-auto text-white">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#f97316] mb-2">{product.title}</h1>
        <div className="text-sm text-gray-400 space-y-1 mb-6 bg-black/20 p-4 rounded-xl border border-white/5">
          <p>* Za montaže ispod 20 m² doplaćuje se izlazak na teren 2000 din</p>
          <p>* Za montaže van teritorije Beograda naplaćuju se dodatni putni troškovi.</p>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-bold mb-2">Izračunaj cenu tapeta:</h3>
        <p className="text-lg text-gray-300">{selectedMaterial.pricePerSqm},00 RSD / m²</p>
      </div>

      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-8">
        <h4 className="font-semibold mb-1">Podešavanje cene i površine</h4>
        <p className="text-sm text-gray-400 mb-6">Unesite dimenzije u centimetrima. Cena je po 1 m².</p>
        
        {/* Odabir materijala */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {materials.map((m) => (
            <button
              key={m.id}
              onClick={() => setMaterial(m.id)}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                material === m.id 
                  ? "border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.2)]" 
                  : "border-white/10 bg-white/5 hover:border-white/30"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-white/20 flex-shrink-0 flex items-center justify-center text-xs overflow-hidden">
                <span className="opacity-50">🖼️</span>
              </div>
              <div className="text-left">
                <div className={`font-bold text-sm ${material === m.id ? "text-blue-400" : "text-gray-300"}`}>{m.name}</div>
                <div className="text-xs text-gray-500">{m.pricePerSqm},00 RSD / m²</div>
              </div>
            </button>
          ))}
        </div>

        {/* Dimenzije */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 relative hidden-divider">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Širina (cm)</label>
            <input 
              type="number" 
              value={width} 
              onChange={(e) => setWidth(Number(e.target.value))}
              placeholder="npr. 300"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Visina (cm)</label>
            <input 
              type="number" 
              value={height} 
              onChange={(e) => setHeight(Number(e.target.value))}
              placeholder="npr. 240"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
            />
          </div>
        </div>

        {/* Ugradnja Toggle */}
        <div className="flex items-center justify-end gap-3 mb-8">
          <span className="text-sm text-gray-400">Ugradnja (+500 / m²)</span>
          <button 
            onClick={() => setIncludeInstallation(!includeInstallation)}
            className={`w-12 h-6 rounded-full transition-colors relative ${includeInstallation ? "bg-blue-500" : "bg-gray-700"}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${includeInstallation ? "translate-x-7" : "translate-x-1"}`} />
          </button>
        </div>

        {/* Kalkulacija Totala */}
        <div className="space-y-3 pt-6 border-t border-white/10 text-sm">
          <div className="flex justify-between text-gray-400">
            <span>Dimenzije</span>
            <span className="font-mono text-gray-300">{width} x {height} cm</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Površina</span>
            <span className="font-mono text-gray-300">{areaSqm.toFixed(2)} m²</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Cena po m²</span>
            <span className="font-mono text-gray-300">{selectedMaterial.pricePerSqm.toLocaleString('sr-RS')} RSD</span>
          </div>
          {includeInstallation && (
             <div className="flex justify-between text-blue-400">
             <span>Ugradnja</span>
             <span className="font-mono">{installationPrice.toLocaleString('sr-RS')} RSD</span>
           </div>
          )}
          <div className="flex justify-between text-white font-bold text-lg pt-3 mt-3 border-t border-white/10">
            <span>Ukupno</span>
            <span className="font-mono text-cyan-400">{Math.round(totalPrice).toLocaleString('sr-RS')} RSD</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
            <span className="opacity-50 text-xl">🛒</span>
        </div>
        <button 
          onClick={() => onAddToCart({ ...product, configuration: { material, width, height, includeInstallation }, finalPrice: totalPrice })}
          className="flex-1 bg-gray-500 hover:bg-gray-400 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-gray-500/20 active:scale-[0.98]"
        >
          Dodaj u korpu
        </button>
      </div>
      
      <div className="mt-8 text-sm text-gray-500 border-t border-white/10 pt-4">
        Kategorija: <span className="text-gray-400">Tapete</span>
      </div>
    </div>
  );
}
