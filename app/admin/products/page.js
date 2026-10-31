"use client";

import { useState, useEffect } from "react";
import ImageUpload from "@/components/ImageUpload";

export default function AdminProductsView() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New Product Form State
  const [formData, setFormData] = useState({
    title: "", categoryId: "digitalna_stampa", itemId: "", price: "", image: "📦"
  });

  const fetchProducts = () => {
    setIsLoading(true);
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch products:", err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Da li ste sigurni da želite da obrišete ovaj proizvod?")) return;
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchProducts();
    } catch (e) {
      console.error(e);
      alert("Greška pri brisanju.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseInt(formData.price) || 0
        })
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ title: "", categoryId: "digitalna_stampa", itemId: "", price: "", image: "📦" });
        fetchProducts();
      } else {
        alert("Greška pri dodavanju.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
           <h1 className="text-3xl font-bold text-white mb-2">Upravljanje Proizvodima</h1>
           <p className="text-slate-400 text-sm">Ukupno: <span className="font-bold text-cyan-400">{products.length}</span> proizvoda u bazi.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-2 px-6 rounded-lg shadow-lg flex items-center gap-2 transition-all">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Dodaj Novi Proizvod
        </button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="py-20 text-center text-slate-400">
             <svg className="animate-spin h-8 w-8 text-cyan-500 mb-4 mx-auto" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
             Učitavanje proizvoda...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-900/50 text-slate-400 text-sm border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 font-medium">Naziv i Ikonica</th>
                  <th className="px-6 py-4 font-medium">Kategorija</th>
                  <th className="px-6 py-4 font-medium">Podkategorija (ItemID)</th>
                  <th className="px-6 py-4 font-medium">Osnovna Cena</th>
                  <th className="px-6 py-4 font-medium text-right">Akcije</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {products.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-8 text-slate-400">Nema proizvoda u bazi.</td></tr>
                ) : products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded bg-slate-700 flex items-center justify-center text-xl overflow-hidden shrink-0">
                          {product.image?.startsWith('/') ? (
                            <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                          ) : (
                            <span>{product.image || '📦'}</span>
                          )}
                        </div>
                        <span className="font-medium text-slate-200">{product.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-cyan-400">{product.categoryId}</td>
                    <td className="px-6 py-4 text-slate-400">{product.itemId}</td>
                    <td className="px-6 py-4 text-emerald-400 font-bold">{product.price.toLocaleString('sr-RS')} RSD</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(product.id)} className="text-red-400 hover:text-red-300 font-medium px-3 py-1 bg-red-500/10 border border-red-500/20 rounded transition-colors">Obriši</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Novi Proizvod</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-1">Naziv proizvoda</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-cyan-500 outline-none" placeholder="npr. Vizit Karte Premium" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Glavna Kategorija</label>
                  <select value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white outline-none">
                    <option value="digitalna_stampa">Digitalna Štampa</option>
                    <option value="tekstil">Tekstil</option>
                    <option value="reklamni_materijal">Reklamni Materijal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Cena (RSD)</label>
                  <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-cyan-500 outline-none" placeholder="npr. 1500" />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">Potkategorija ID</label>
                <input required type="text" value={formData.itemId} onChange={e => setFormData({...formData, itemId: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-cyan-500 outline-none" placeholder="npr. majice" />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">Slika Proizvoda (Opciono)</label>
                <ImageUpload 
                  currentImage={formData.image} 
                  onUploadSuccess={(url) => setFormData({...formData, image: url})} 
                />
              </div>
              <div className="flex justify-end gap-3 mt-8 border-t border-slate-700 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">Otkaži</button>
                <button type="submit" disabled={isSubmitting} className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-900 font-bold py-2 px-6 rounded-lg shadow-lg transition-colors">
                  {isSubmitting ? "Čuvanje..." : "Dodaj Proizvod"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
