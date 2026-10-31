"use client";

import { useState } from "react";

export default function ContactForm() {
  const [formData, setFormData] = useState({ ime: "", prezime: "", email: "", telefon: "", poruka: "" });
  const [status, setStatus] = useState("idle");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.ime || !formData.prezime || !formData.email || !formData.telefon || !formData.poruka) return;
    
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="text-center py-12 px-6">
        <div className="text-6xl mb-6">✅</div>
        <h3 className="text-2xl font-bold text-white mb-3">Poruka uspešno poslata!</h3>
        <p className="text-gray-300 mb-8 max-w-sm mx-auto">Uspešno ste nas kontaktirali. Odgovorićemo vam na email u najkraćem mogućem roku.</p>
        <button onClick={() => { setStatus("idle"); setFormData({ ime: "", prezime: "", email: "", poruka: "" }); }} className="inline-block bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-xl transition-all">
          Nova poruka
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Ime *</label>
          <input required type="text" value={formData.ime} onChange={e => setFormData({...formData, ime: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all" placeholder="Petar" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Prezime *</label>
          <input required type="text" value={formData.prezime} onChange={e => setFormData({...formData, prezime: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all" placeholder="Petrović" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Email Adresa *</label>
          <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all" placeholder="petar@primer.rs" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Broj Telefona *</label>
          <input required type="tel" value={formData.telefon} onChange={e => setFormData({...formData, telefon: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all" placeholder="060 123 4567" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Poruka</label>
        <textarea required rows={5} value={formData.poruka} onChange={e => setFormData({...formData, poruka: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none" placeholder="Kako možemo da vam pomognemo danas?"></textarea>
      </div>
      
      {status === "error" && (
        <div className="text-red-400 text-sm font-medium">Došlo je do greške pri slanju. Proverite vezu ili pokušajte kasnije.</div>
      )}

      <button disabled={status === "loading"} type="submit" className="w-full disabled:opacity-50 bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-400 hover:to-purple-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-fuchsia-500/25 transition-all outline-none flex justify-center items-center gap-2">
        {status === "loading" ? "Slanje u toku..." : "Pošaljite poruku"}
      </button>
    </form>
  );
}
