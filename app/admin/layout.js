"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Komandna Tabla", href: "/admin", icon: "📊" },
    { name: "Sadržaj Sajta", href: "/admin/content", icon: "📝" },
    { name: "Proizvodi", href: "/admin/products", icon: "🏷️" },
    { name: "Porudžbine", href: "/admin/orders", icon: "📦" },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex absolute inset-0 z-50">
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-700">
          <Link href="/" className="flex items-center gap-3 text-xl font-bold tracking-widest text-cyan-400">
            <Image
              src="/logoZaSajt.jpeg"
              alt="Planetatapeta logo"
              width={36}
              height={36}
              className="rounded-lg ring-1 ring-slate-600 shadow-md"
            />
            <span>PLANETATAPETA <span className="text-sm font-light text-slate-400 ml-1">ADMIN</span></span>
          </Link>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? "bg-cyan-500/10 text-cyan-400 font-medium" 
                    : "hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <Link href="/" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Nazad na Sajt
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-900 relative">
        <header className="h-16 border-b border-slate-700 flex items-center px-8 justify-between bg-slate-800/50 backdrop-blur-sm relative z-10">
          <h2 className="text-lg font-medium text-slate-300">
            {navItems.find(i => pathname === i.href || (pathname.startsWith(i.href) && i.href !== "/admin"))?.name || "Admin"}
          </h2>
          <div className="flex items-center gap-4">
            <span className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-slate-900 font-bold text-sm">A</span>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8 relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
