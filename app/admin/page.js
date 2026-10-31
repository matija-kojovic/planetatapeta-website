export default function AdminDashboard() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Pregled Kontrolne Table</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <p className="text-slate-400 text-sm font-medium mb-1">Ukupno Porudžbina</p>
          <div className="text-3xl font-bold text-white mb-2">1,284</div>
          <p className="text-emerald-400 text-sm flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            12% od prošlog meseca
          </p>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <p className="text-slate-400 text-sm font-medium mb-1">Ukupan Prihod</p>
          <div className="text-3xl font-bold text-cyan-400 mb-2">8.439.200 RSD</div>
          <p className="text-emerald-400 text-sm flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            8% od prošlog meseca
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <p className="text-slate-400 text-sm font-medium mb-1">Aktivni Proizvodi</p>
          <div className="text-3xl font-bold text-white mb-2">24</div>
          <p className="text-slate-400 text-sm mt-1">
            Kroz 5 kategorija
          </p>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-700 flex justify-between items-center">
          <h3 className="text-lg font-medium text-white">Nedavna Aktivnost</h3>
        </div>
        <div className="divide-y divide-slate-700">
          {Array.from({ length: 5 }).map((_, idx) => {
            const orderNum = 1234 + idx;             // početni broj + indeks
            return (
              <div
                key={orderNum}
                className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-lg">
                    {idx % 2 === 0 ? "📦" : "💰"}
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      Nova porudžbina #PS-{orderNum}
                    </p>
                    <p className="text-sm text-slate-400">
                      Kreirao petar.petrovic@primer.rs
                    </p>
                  </div>
                </div>
                <div className="text-sm text-slate-500">
                  pre {idx} sati
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
