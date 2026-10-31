"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";

export default function CheckoutPage() {
  const { items, cartTotal, isMounted, clearCart } = useCart();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState("");

  if (!isMounted) return null;

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (items.length === 0) return; // Prevent empty checkout
    
    setIsSubmitting(true);

    const formData = new FormData(e.target);
    const customer = {
      ime_prezime: formData.get("ime_prezime"),
      email: formData.get("email"),
      telefon: formData.get("telefon"),
      grad: formData.get("grad"),
      postanski_broj: formData.get("postanski_broj"),
      adresa: formData.get("adresa"),
      napomena: formData.get("napomena")
    };

    const payload = {
      customer,
      items: items.map(item => ({
        id: item.id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        configuration: item.configuration
      })),
      total: cartTotal
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        setOrderId(result.order.id);
        setIsSuccess(true);
        clearCart();
      } else {
        alert("Došlo je do greške prilikom obrade porudžbine.");
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Sistemska greška. Pokušajte ponovo kasnije.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl rounded-3xl p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent" />
          <div className="relative z-10">
            <div className="text-7xl mb-6">✨</div>
            <h1 className="text-4xl font-extrabold text-white mb-4">Porudžbina uspešna!</h1>
            <p className="text-xl text-emerald-300 mb-8 font-mono">Porudžbina #{orderId}</p>
            <p className="text-gray-300 mb-10 max-w-lg mx-auto">
              Vaši premium štampani proizvodi se pripremaju. Poslali smo vam email potvrde sa detaljima porudžbine.
            </p>
            <Link href="/" className="inline-block bg-white text-slate-900 font-bold py-4 px-8 rounded-xl hover:scale-105 transition-transform shadow-lg">
              Povratak na Početnu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-extrabold text-white tracking-tight mb-8">Kasa</h1>
      
      <form onSubmit={handleCheckout} className="bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl rounded-3xl p-8">
        <div className="mb-10">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-sm">1</span>
            Kontakt podaci
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-11">
            <input required name="ime_prezime" type="text" placeholder="Ime i prezime *" className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none md:col-span-2" />
            <input required name="email" type="email" placeholder="Email adresa *" className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none" />
            <input required name="telefon" type="tel" placeholder="Broj telefona *" className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none" />
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-fuchsia-500/20 text-fuchsia-300 flex items-center justify-center text-sm">2</span>
            Podaci za dostavu
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-11">
            <input required name="grad" type="text" placeholder="Grad *" className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none" />
            <input name="postanski_broj" type="text" placeholder="Poštanski broj" className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none" />
            <input required name="adresa" type="text" placeholder="Adresa *" className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none md:col-span-2" />
            <textarea name="napomena" placeholder="Polje za posebne napomene..." rows={4} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none md:col-span-2 resize-none"></textarea>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-2xl text-white font-bold">Ukupno: <span className="text-cyan-300">{cartTotal.toLocaleString('sr-RS')} RSD</span></div>
          <button disabled={isSubmitting} type="submit" className="w-full md:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold py-4 px-12 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-[1.02] transition-all flex justify-center items-center gap-2">
            {isSubmitting ? (
               <>
                 <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 Obrada...
               </>
            ) : "Naruči"}
          </button>
        </div>
      </form>
    </div>
  );
}
