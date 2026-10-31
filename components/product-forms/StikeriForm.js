"use client";

import { useState } from "react";

export default function StikeriForm({ product, onAddToCart, categoryType = "stikeri" }) {
  // Ovo će obraditi i Slike na platnu / Pleksiglas jer imaju isti raspored po slici 2 i 3
  
  const sizes = categoryType === "platno" 
    ? [{ id: "size1", label: "90 x 100cm", price: 8260 }, { id: "size2", label: "105 x 117cm", price: 10500 }, { id: "size3", label: "120 x 134cm", price: 12800 }]
    : [{ id: "size1", label: "90 x 97cm", price: 3100 }, { id: "size2", label: "100 x 107cm", price: 3800 }, { id: "size3", label: "120 x 124cm", price: 5200 }, { id: "size4", label: "150 x 166cm", price: 8900 }];

  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [note, setNote] = useState("");
  const [quantity, setQuantity] = useState(1);

  const totalPrice = selectedSize.price * quantity;

  return (
    <div className="flex flex-col lg:flex-row gap-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-5xl mx-auto text-white">
      
      {/* Image Gallery Side */}
      <div className="lg:w-3/5 bg-white/10 rounded-2xl flex flex-col items-center justify-center p-8 border border-white/5 aspect-square relative overflow-hidden group">
         <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
         <span className="text-9xl mb-4 relative z-10 transition-transform duration-500 group-hover:scale-110">
           {product.image || "🖼️"}
         </span>
         <h2 className="text-3xl font-light tracking-wide mt-auto justify-self-start w-full text-left relative z-10">
            {product.title}
         </h2>
      </div>

      {/* Form Side */}
      <div className="lg:w-2/5 flex flex-col pt-4">
        
        {/* Sizes */}
        <div className="mb-8 border-b border-white/10 pb-8">
          <label className="block text-sm text-gray-400 mb-4">Dostupne veličine (Š x V):</label>
          <div className="flex flex-wrap gap-3">
            {sizes.map((size) => (
              <button
                key={size.id}
                onClick={() => setSelectedSize(size)}
                className={`px-5 py-3 rounded-lg text-sm font-medium transition-all ${
                  selectedSize.id === size.id
                    ? "bg-[#2b7bc0] text-white shadow-lg shadow-blue-500/20"
                    : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                }`}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="mb-8 border-b border-white/10 pb-8">
          <label className="block text-sm text-gray-400 mb-4">Vaša napomena:</label>
          <textarea 
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#2b7bc0] focus:ring-1 focus:ring-[#2b7bc0] transition-all min-h-[100px] resize-y"
          />
        </div>

        {/* Quantity */}
        <div className="mb-8 border-b border-white/10 pb-8">
          <label className="block text-sm text-gray-400 mb-4">Koliko komada?</label>
          <div className="flex items-center">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-12 h-12 bg-[#2b7bc0] hover:bg-blue-600 text-white rounded-l-lg flex items-center justify-center text-xl font-bold transition-colors"
            >
              −
            </button>
            <div className="w-16 h-12 bg-white flex items-center justify-center text-gray-900 font-bold border-y border-white">
              {quantity}
            </div>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="w-12 h-12 bg-[#2b7bc0] hover:bg-blue-600 text-white rounded-r-lg flex items-center justify-center text-xl font-bold transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Total Price */}
        <div className="mb-8 border-b border-white/10 pb-8">
           <div className="flex items-end gap-2 text-xl">
             <span className="text-gray-400">Ukupan iznos:</span>
             <span className="font-bold text-3xl">{totalPrice.toLocaleString('sr-RS')} <span className="text-xl font-normal">din</span></span>
           </div>
        </div>

        {/* Add to cart */}
        <div className="mt-auto flex justify-end">
          <button 
             onClick={() => onAddToCart({ ...product, configuration: { size: selectedSize, note, quantity }, finalPrice: totalPrice })}
             className="bg-[#2b7bc0] hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium transition-all shadow-lg active:scale-95"
          >
            dodaj
          </button>
        </div>

      </div>
    </div>
  );
}
