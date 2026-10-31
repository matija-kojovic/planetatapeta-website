"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";

export default function CartPage() {
  const { items, removeFromCart, cartTotal, isMounted } = useCart();

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-8">Vaša Korpa</h1>
      
      {items.length === 0 ? (
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-12 text-center shadow-2xl">
          <div className="text-6xl mb-6">🛒</div>
          <h2 className="text-2xl font-bold text-white mb-4">Vaša korpa je prazna</h2>
          <Link href="/" className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-cyan-500/25 transition-all">
            Započnite kupovinu
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-6">
            {items.map((item, idx) => (
              <div key={`${item.id}-${item.paperType}-${idx}`} className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 flex flex-col sm:flex-row gap-6 shadow-xl relative group">
                <div className="w-full sm:w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-xl flex items-center justify-center text-5xl shrink-0 overflow-hidden">
                  {item.image && item.image.startsWith('/') ? (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    item.icon || item.image || "📦"
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-1 leading-tight">{item.title}</h3>
                      <p className="text-sm text-cyan-300 font-medium mb-3">{item.paperType}</p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id, item.configurationKey || item.paperType)}
                      className="text-gray-400 hover:text-red-400 transition-colors shrink-0 bg-white/5 p-2 rounded-lg"
                      aria-label="Ukloni proizvod"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex justify-between items-end mt-4 pt-4 border-t border-white/5">
                    <p className="text-gray-300 text-sm sm:text-base">Kol: {item.quantity}</p>
                    <p className="text-lg sm:text-xl font-bold text-white">{(item.price * item.quantity).toLocaleString()} RSD</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-fuchsia-900/40 to-purple-900/40 border border-fuchsia-500/20 backdrop-blur-xl rounded-3xl p-8 shadow-2xl sticky top-28">
              <h2 className="text-2xl font-bold text-white mb-6">Pregled porudžbine</h2>
              
              <div className="space-y-4 mb-6 text-gray-300">
                <div className="flex justify-between">
                  <span>Međuzbir</span>
                  <span>{cartTotal.toLocaleString()} RSD</span>
                </div>
                <div className="flex justify-between">
                  <span>Dostava</span>
                  <span className="text-emerald-400">Besplatno</span>
                </div>
                <div className="h-px bg-white/10 my-4" />
                <div className="flex justify-between text-xl font-bold text-white">
                  <span>Ukupno</span>
                  <span className="text-cyan-300">{cartTotal.toLocaleString()} RSD</span>
                </div>
              </div>
              
              <Link href="/checkout" className="w-full inline-block text-center bg-white text-slate-900 font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-white/20 transition-all hover:scale-[1.02]">
                Završi kupovinu
              </Link>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
