"use client";

import { useState } from "react";

export default function NalepniceForm({ product, onAddToCart }) {
  const [height, setHeight] = useState(2);
  const [width, setWidth] = useState(2);
  const [material, setMaterial] = useState("Bela mat");
  const [cutType, setCutType] = useState("Konturno opsecanje");
  const [packaging, setPackaging] = useState("Na tabaku");
  const [design, setDesign] = useState("Nemam, napraviću ga online");
  const [speed, setSpeed] = useState("Normalna (7 radnih dana)");
  const [note, setNote] = useState("");
  const [quantity, setQuantity] = useState(50);

  // Bazna logika na osnovu dimenzija i količine
  const areaCm2 = height * width;
  
  // Neka fiktivna cena po cm2
  const pricePerCm2 = 0.35; 
  let subtotal = (areaCm2 * pricePerCm2) * quantity;
  
  // Doplata za pojedinacno pakovanje
  if (packaging === "Pojedinačno") {
      subtotal += (2 * quantity); // +2 RSD po komadu
  }

  const pricePerItem = subtotal / quantity;

  return (
    <div className="flex flex-col lg:flex-row gap-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-6xl mx-auto text-white">
      
      {/* Visual Presentation */}
      <div className="lg:w-1/2 flex flex-col">
        <div className="aspect-square bg-white/10 rounded-3xl flex items-center justify-center p-8 mb-6 border border-white/5 relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-duration-500"></div>
            <span className="text-9xl z-10 transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_0_30px_rgba(34,211,238,0.3)]">
                👑
            </span>
        </div>
        <div className="grid grid-cols-3 gap-4">
           {['🟡', '🟦', '🟣'].map((img, i) => (
               <div key={i} className="aspect-square bg-white/5 rounded-xl flex items-center justify-center text-4xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                   {img}
               </div>
           ))}
        </div>
      </div>

      {/* Form Area */}
      <div className="lg:w-1/2 flex flex-col">
        
        <div className="mb-6">
            <h1 className="text-2xl font-bold mb-4">{product.title || "Nalepnice (Stikeri)"}</h1>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                Štampanje nalepnica nikad nije bilo lakše, jeftinije i lagodnije! Jednostavno upload-ujte Vašu pripremu i poručite štampu online ili napravite sami dizajn putem našeg online dizajnera!
            </p>
            <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2"><span className="text-green-500">✅</span> Premium kvalitet i brza dostava</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✅</span> Personalizacija po Vašoj želji</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✅</span> Besplatna provera pripreme za svaku porudžbinu</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✅</span> Besplatna dostava za porudžbine preko 6.000rsd</li>
            </ul>
        </div>

        <div className="space-y-6">
            
            {/* Dimenzije */}
            <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Visina stikera (cm)</label>
                <input type="number" value={height} onChange={e => setHeight(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 focus:border-cyan-500 focus:outline-none" />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Širina stikera (cm)</label>
                <input type="number" value={width} onChange={e => setWidth(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 focus:border-cyan-500 focus:outline-none" />
            </div>
            
            {/* Cena readonly info */}
            <div>
                 <label className="block text-sm font-bold text-gray-300 mb-2">Cena (cm2) (RSD)</label>
                 <div className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-gray-400">{pricePerCm2}</div>
            </div>

            {/* Dropdowns */}
            <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Vrsta materijala</label>
                <select value={material} onChange={e=>setMaterial(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none appearance-none">
                    <option className="bg-gray-800">Bela mat</option>
                    <option className="bg-gray-800">Bela sjaj</option>
                    <option className="bg-gray-800">Providna</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Vrsta sečenja</label>
                <select value={cutType} onChange={e=>setCutType(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none appearance-none">
                    <option className="bg-gray-800">Konturno opsecanje</option>
                    <option className="bg-gray-800">Na meru</option>
                </select>
            </div>

            {/* Pakovanje Radio Cards */}
            <div>
               <label className="block text-sm font-bold text-gray-300 mb-2">Pakovanje</label>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div 
                    onClick={() => setPackaging("Na tabaku")}
                    className={`border ${packaging === "Na tabaku" ? "border-cyan-500 bg-cyan-500/10" : "border-white/10"} p-4 rounded-xl cursor-pointer text-center relative`}
                  >
                      {packaging === "Na tabaku" && <div className="absolute top-2 right-2 text-cyan-500">☑</div>}
                      <div className="text-4xl px-2">📄</div>
                      <div className="text-sm font-bold mt-2">Na tabaku</div>
                  </div>
                  <div 
                    onClick={() => setPackaging("Pojedinačno")}
                    className={`border ${packaging === "Pojedinačno" ? "border-cyan-500 bg-cyan-500/10" : "border-white/10"} p-4 rounded-xl cursor-pointer text-center relative`}
                  >
                      {packaging === "Pojedinačno" && <div className="absolute top-2 right-2 text-cyan-500">☑</div>}
                      <div className="text-4xl px-2">✂️</div>
                      <div className="text-sm font-bold mt-2">Pojedinačno</div>
                      <div className="text-xs text-gray-400 mt-1">(+2rsd/kom)</div>
                  </div>
               </div>
            </div>

            {/* Other Dropdowns */}
            <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Dizajn</label>
                <select value={design} onChange={e=>setDesign(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none appearance-none">
                    <option className="bg-gray-800">Nemam, napraviću ga online</option>
                    <option className="bg-gray-800">Imam svoj dizajn</option>
                </select>
                {design.includes('online') && (
                    <button className="mt-2 bg-[#ff4a4a] text-white px-4 py-1 text-sm font-bold rounded">Start Design</button>
                )}
            </div>
             <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Brzina izrade</label>
                <select value={speed} onChange={e=>setSpeed(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none appearance-none">
                    <option className="bg-gray-800">Normalna (7 radnih dana)</option>
                    <option className="bg-gray-800">Hitno (2 radna dana)</option>
                </select>
            </div>

            {/* Napomene */}
            <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Napomene</label>
                <textarea rows="3" value={note} onChange={e=>setNote(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none" />
            </div>

            {/* Kolicina */}
            <div>
                <label className="block text-sm font-bold text-gray-300 mb-4 border-b border-white/10 pb-2">Količina</label>
                <div className="space-y-2">
                    {[50, 100, 300, 500, 1000].map(val => (
                        <label key={val} className="flex items-center gap-3 cursor-pointer group">
                           <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${quantity === val ? "border-cyan-500" : "border-gray-500"}`}>
                              {quantity === val && <div className="w-2 h-2 rounded-full bg-cyan-500" />}
                           </div>
                           <span className={quantity === val ? "text-white" : "text-gray-400 group-hover:text-gray-300"}>{val}</span>
                        </label>
                    ))}
                    <label className="flex items-center gap-3 cursor-pointer group mt-2 pt-2 border-t border-white/5">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center border-gray-500`}></div>
                        <span className="text-gray-400">Proizvoljna količina</span>
                    </label>
                </div>
            </div>

            {/* Poništi odabir */}
            <div className="flex justify-end pt-4">
                <button className="bg-[#ff4a4a] text-white text-sm font-bold px-4 py-2">PONIŠTI ODABIR</button>
            </div>

            {/* Tabela Pregleda (Receipt) */}
            <div className="bg-white/5 border border-white/10 rounded-xl mt-8 overflow-hidden">
                 <div className="font-bold text-sm bg-black/20 px-4 py-3 border-b border-white/5">Pregled opcija i cena</div>
                 <div className="p-4 space-y-2 text-xs text-gray-300">
                    <div className="flex justify-between"><span>Visina stikera (cm): <span className="font-bold text-white">{height}</span></span> <span>{height * pricePerCm2} RSD</span></div>
                    <div className="flex justify-between"><span>Širina stikera (cm): <span className="font-bold text-white">{width}</span></span> <span>{width * pricePerCm2} RSD</span></div>
                    <div className="flex justify-between"><span>Cena (cm2) (RSD): <span className="font-bold text-white">{pricePerCm2}</span></span> <span>-</span></div>
                    <div className="flex justify-between"><span>Vrsta materijala: <span className="font-bold text-white">{material}</span></span> <span>0.00 RSD</span></div>
                    <div className="flex justify-between"><span>Vrsta sečenja: <span className="font-bold text-white">{cutType}</span></span> <span>0.00 RSD</span></div>
                    <div className="flex justify-between"><span>Pakovanje: <span className="font-bold text-white">{packaging}</span></span> <span>{packaging === "Pojedinačno" ? '2.00 RSD/kom' : '0.00 RSD'}</span></div>
                    <div className="flex justify-between break-words gap-4"><span>Dizajn: <span className="font-bold text-white">{design}</span></span> <span className="shrink-0">0.00 RSD</span></div>
                    <div className="flex justify-between"><span>Brzina izrade: <span className="font-bold text-white">{speed}</span></span> <span>0.00 RSD</span></div>
                 </div>
                 <div className="bg-black/40 px-4 py-3 border-t border-white/10 text-sm space-y-1">
                     <div className="flex justify-between"><span>Cena opcije</span> <span>{pricePerItem.toFixed(2)} RSD / 1 proizvod</span></div>
                     <div className="flex justify-between text-cyan-400 font-bold mt-2"><span>Krajnja cena</span> <span>{pricePerItem.toFixed(2)} RSD / 1 proizvod</span></div>
                     <div className="flex justify-between text-white font-extrabold text-lg mt-1 border-t border-white/10 pt-2"><span>Subtotal</span> <span>{subtotal.toFixed(2)} RSD / {quantity} proizvoda</span></div>
                 </div>
            </div>

             <button 
                onClick={() => onAddToCart({ ...product, configuration: { height, width, material, packaging, quantity }, finalPrice: subtotal })}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-green-900/50 text-lg mt-4"
              >
                Dodaj u korpu
             </button>

        </div>
      </div>
    </div>
  );
}
