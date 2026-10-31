"use client";

import { useState, useEffect } from "react";

export default function AdminOrdersView() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch orders:", err);
        setIsLoading(false);
      });
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case "U obradi": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "U štampi": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "Poslato": return "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20";
      case "Isporučeno": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "Nepoznato";
    const date = new Date(isoString);
    return date.toLocaleString('sr-RS', { 
      day: '2-digit', month: '2-digit', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  // Metrics calculation
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const totalSales = orders.length;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Porudžbine</h1>
          <p className="text-gray-400 text-sm">Ukupno: <span className="font-bold text-cyan-400">{totalSales}</span> narudžbina | Promet: <span className="font-bold text-cyan-400">{totalRevenue.toLocaleString('sr-RS')} RSD</span></p>
        </div>
        <button className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Izvezi u CSV
        </button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-700 flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Pretraži po ID-u, kupcu ili email-u..." className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-slate-200 focus:ring-1 focus:ring-cyan-500 outline-none" />
          </div>
          <select className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-200 outline-none">
            <option>Svi statusi</option>
            <option>U obradi</option>
            <option>U štampi</option>
            <option>Poslato</option>
            <option>Isporučeno</option>
          </select>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-slate-400 flex flex-col items-center">
             <svg className="animate-spin h-8 w-8 text-cyan-500 mb-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
             Učitavanje porudžbina iz baze...
          </div>
        ) : orders.length === 0 ? (
           <div className="py-20 text-center text-slate-400">
             <div className="text-4xl mb-4">📭</div>
             <p>Trenutno nemate nijednu porudžbinu u sistemu.</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-slate-900/50 text-slate-400 text-sm border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 font-medium">Broj Porudžbine</th>
                  <th className="px-6 py-4 font-medium">Kupac</th>
                  <th className="px-6 py-4 font-medium">Datum</th>
                  <th className="px-6 py-4 font-medium">Artikli</th>
                  <th className="px-6 py-4 font-medium">Ukupno</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Akcije</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700 text-sm">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-cyan-400">{order.id}</td>
                    <td className="px-6 py-4">
                      <div className="text-slate-200 font-medium">{order.customer?.ime_prezime || `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || 'Nepoznat'}</div>
                      <div className="text-slate-500 text-xs">{order.customer?.email || '—'}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{formatDate(order.createdAt)}</td>
                    <td className="px-6 py-4 text-slate-300">
                      <span className="bg-slate-700 px-2 py-1 rounded text-xs">{order.items?.length || 0} stavki</span>
                    </td>
                    <td className="px-6 py-4 text-emerald-400 font-bold">{(order.total || 0).toLocaleString('sr-RS')} RSD</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-cyan-500 hover:text-cyan-400 font-medium transition-colors border border-cyan-500/30 hover:bg-cyan-500/10 px-3 py-1 rounded">
                        Detalji
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
