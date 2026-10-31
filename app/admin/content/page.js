"use client";

import { useState, useEffect } from "react";

export default function AdminContentView() {
  const [content, setContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(data => {
        setContent(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch content:", err);
        setIsLoading(false);
      });
  }, []);

  const handleChange = (section, field, value) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
      });
      if (res.ok) alert("Sistemska podešavanja uspešno sačuvana!");
      else alert("Došlo je do greške pri čuvanju.");
    } catch (e) {
      console.error(e);
      alert("Greška sa mrežom.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-slate-400">
         <svg className="animate-spin h-8 w-8 text-cyan-500 mb-4 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
         </svg>
         Učitavanje CMS podešavanja...
      </div>
    );
  }

  if (!content) return <div className="text-red-400">Greška pri učitavanju sadržaja sajta.</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Sadržaj Sajta (CMS)</h1>
          <p className="text-slate-400 text-sm">Prilagodite tekstove na početnoj strani, kontakt detalje i SEO meta podatke.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold py-2 px-6 rounded-lg shadow-lg flex items-center gap-2 transition-all"
        >
          {isSaving ? "Čuvanje..." : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Sačuvaj Promene
            </>
          )}
        </button>
      </div>

      <div className="space-y-6">
        {/* THEME SECTION */}
        <section className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-2 flex items-center gap-2">
            <svg className="w-5 h-5 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
            Boje i Tema
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-slate-400 text-sm mb-1">Primarna Boja (Cyan)</label>
              <div className="flex gap-2">
                <input type="color" value={content.theme?.primaryColor || '#06b6d4'} onChange={e => handleChange('theme', 'primaryColor', e.target.value)} className="w-12 h-10 rounded cursor-pointer bg-slate-900 border border-slate-600" />
                <input type="text" value={content.theme?.primaryColor || ''} onChange={e => handleChange('theme', 'primaryColor', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white text-sm outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1">Sekundarna (Fuchsia)</label>
              <div className="flex gap-2">
                <input type="color" value={content.theme?.secondaryColor || '#d946ef'} onChange={e => handleChange('theme', 'secondaryColor', e.target.value)} className="w-12 h-10 rounded cursor-pointer bg-slate-900 border border-slate-600" />
                <input type="text" value={content.theme?.secondaryColor || ''} onChange={e => handleChange('theme', 'secondaryColor', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white text-sm outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1">Boja Akcenta (Žuta)</label>
              <div className="flex gap-2">
                <input type="color" value={content.theme?.accentColor || '#eab308'} onChange={e => handleChange('theme', 'accentColor', e.target.value)} className="w-12 h-10 rounded cursor-pointer bg-slate-900 border border-slate-600" />
                <input type="text" value={content.theme?.accentColor || ''} onChange={e => handleChange('theme', 'accentColor', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white text-sm outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1">Pozadina Sajta</label>
              <div className="flex gap-2">
                <input type="color" value={content.theme?.bgColor || '#0f172a'} onChange={e => handleChange('theme', 'bgColor', e.target.value)} className="w-12 h-10 rounded cursor-pointer bg-slate-900 border border-slate-600" />
                <input type="text" value={content.theme?.bgColor || ''} onChange={e => handleChange('theme', 'bgColor', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white text-sm outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1">Boja Teksta</label>
              <div className="flex gap-2">
                <input type="color" value={content.theme?.textColor || '#f8fafc'} onChange={e => handleChange('theme', 'textColor', e.target.value)} className="w-12 h-10 rounded cursor-pointer bg-slate-900 border border-slate-600" />
                <input type="text" value={content.theme?.textColor || ''} onChange={e => handleChange('theme', 'textColor', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white text-sm outline-none" />
              </div>
            </div>
          </div>
        </section>

        {/* HEADER SECTION */}
        <section className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-2">Navigacija (Header)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-sm mb-1">Tekst Logotipa</label>
              <input type="text" value={content.header?.logoText || ''} onChange={e => handleChange('header', 'logoText', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-cyan-500 outline-none" />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1">Glavna Najava (Traka ispod navigacije)</label>
              <input type="text" value={content.header?.announcement || ''} onChange={e => handleChange('header', 'announcement', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-cyan-500 outline-none" />
            </div>
          </div>
        </section>

        {/* HERO SECTION */}
        <section className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-2">Početna Strana (Hero)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-sm mb-1">Naslov (Prvi red)</label>
              <input type="text" value={content.hero.titleLine1 || ''} onChange={e => handleChange('hero', 'titleLine1', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-cyan-500 outline-none" />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1">Naslov (Drugi red - Žuti naglasak)</label>
              <input type="text" value={content.hero.titleLine2 || ''} onChange={e => handleChange('hero', 'titleLine2', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-cyan-500 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-slate-400 text-sm mb-1">Podnaslov (Opis ispod naslova)</label>
              <textarea value={content.hero.subtitle || ''} onChange={e => handleChange('hero', 'subtitle', e.target.value)} rows="2" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-cyan-500 outline-none"></textarea>
            </div>
            <div className="md:col-span-2">
              <label className="block text-slate-400 text-sm mb-1">Tekst na glavnom dugmetu</label>
              <input type="text" value={content.hero.buttonText || ''} onChange={e => handleChange('hero', 'buttonText', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-cyan-500 outline-none" />
            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-2">Kontakt Detalji Futer / Mape</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-sm mb-1">Ulica i broj</label>
              <input type="text" value={content.contact.address || ''} onChange={e => handleChange('contact', 'address', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-cyan-500 outline-none" />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1">Grad</label>
              <input type="text" value={content.contact.city || ''} onChange={e => handleChange('contact', 'city', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-cyan-500 outline-none" />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1">Poštanski broj</label>
              <input type="text" value={content.contact.zip || ''} onChange={e => handleChange('contact', 'zip', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-cyan-500 outline-none" />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1">Email adresa</label>
              <input type="email" value={content.contact.email || ''} onChange={e => handleChange('contact', 'email', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-cyan-500 outline-none" />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1">Broj Telefona / Viber</label>
              <input type="text" value={content.contact.phone || ''} onChange={e => handleChange('contact', 'phone', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-cyan-500 outline-none" />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1">Instagram Link</label>
              <input type="text" value={content.contact.instagram || ''} onChange={e => handleChange('contact', 'instagram', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-cyan-500 outline-none" />
            </div>
          </div>
        </section>

        {/* SEO SECTION */}
        <section className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-2">SEO i Meta podaci</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-slate-400 text-sm mb-1">Glavni naslov sajta (Meta Title)</label>
              <input type="text" value={content.seo.title || ''} onChange={e => handleChange('seo', 'title', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-cyan-500 outline-none" />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1">Opis sajta (Meta Description)</label>
              <textarea value={content.seo.description || ''} onChange={e => handleChange('seo', 'description', e.target.value)} rows="3" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-cyan-500 outline-none"></textarea>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
