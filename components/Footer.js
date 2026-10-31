"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const [content, setContent] = useState(null);

  useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(data => setContent(data))
      .catch(console.error);
  }, []);

  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  const contact = content?.contact || {
    address: "Božice Divnić 10",
    city: "Beograd",
    zip: "11080",
    phone: "+381628148444",
    email: "info@stamparija.rs",
    instagram: "https://www.instagram.com/planetatapeta/"
  };

  return (
    <footer className="bg-white/5 backdrop-blur-md border-t border-white/10 pt-16 pb-8 mt-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logoZaSajt.jpeg"
                alt="Planetatapeta logo"
                width={44}
                height={44}
                className="rounded-lg shadow-lg shadow-white/10 ring-1 ring-white/20"
              />
              <h3 className="text-2xl font-bold text-white tracking-wider">PLANETATAPETA</h3>
            </div>
            <p className="text-gray-300 max-w-sm">
              Premium usluge digitalne štampe prilagođene vašim poslovnim potrebama.
              Jarke boje, oštri detalji i brza isporuka.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4 tracking-tight">Brzi Linkovi</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/" className="text-gray-300 hover:text-yellow-400 transition-colors">Početna</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-yellow-400 transition-colors">Kontakt</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Kontakt Info</h4>
            <ul className="space-y-2 text-gray-300 relative">
               {!content && <div className="absolute inset-0 bg-slate-800/50 backdrop-blur-[2px] animate-pulse rounded z-10"></div>}

              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {contact.phone}
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {contact.email}
              </li>
            </ul>
          </div>
        </div>
        {/* Social: Instagram, Viber, WhatsApp */}
        <div className="flex flex-wrap items-center gap-6 mb-8 relative">
          {!content && <div className="absolute inset-0 bg-slate-800/50 backdrop-blur-[2px] animate-pulse rounded-full z-10 w-48"></div>}
          <span className="text-sm font-medium text-gray-400">Pratite nas:</span>
          <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-11 h-11 rounded-full bg-white/10 text-white hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500 hover:scale-110 transition-all duration-300" aria-label="Instagram">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
          </a>
          <a href={`viber://chat?number=%2B${contact.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-11 h-11 rounded-full bg-white/10 text-white hover:bg-[#7360f2] hover:scale-110 transition-all duration-300" aria-label="Viber">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 512 512"><path d="M436.4 141.6c-4.4-48-26.6-86.8-66.3-116.5-62.7-47-152-47-215.3.8C89.4 69 73.1 133 80.2 195.4c1.7 15 6 31 16.2 43.1.6.7 1.4 2.1 2.2 2.8 19.3 19.3 19.3 53.6-2.5 73.5-3.3 3.3-7.5 7.1-11.8 11.2C71.3 338.4 61.2 352.3 64 366.4c3.6 18.2 21.8 28.3 39.8 28.3 17.5 0 28.8-5 44-12.7 10.3-5.3 22.1-9.9 33.8-9.9 14.6 0 29.3 5 44 14.9 31.8 21.5 68.7 30.6 106.7 30.6 63 0 121.7-27.4 162.2-75.9 44.5-53.5 53.3-133 41.9-200.1zM362.8 359c-8.9 9.1-16.1 19.1-29.4 16.4-38.3-7.5-70.1-23.3-99.3-46.7-33-26.6-59.5-59.3-80.4-98-13.8-25.8-21.5-54.7-21.5-85 0-9.4.5-18.8 1.4-28.7.6-5.8 4.7-9.4 10.8-10.2 15.5-2.2 29.3-1.6 44.2 3.8 6.6 2.5 9.4 7.5 10.5 14.7 2.2 14.1 4.7 28 8.6 41.6 2.5 8.9 .8 16.4-4.4 22.7-6.1 7.2-12.7 13.9-19.1 20.8-2.5 2.5-4.4 7.2-3.6 11.1 5 18 13.9 34.2 25.8 48 11.6 13.6 24.1 26.1 38 37.2 13.6 10.5 28.5 18 45.2 23.6 3.9 1.4 7.8 0 10.5-2.5 7.2-7.2 14.4-14.4 21.9-21.3 5.3-5.3 11.9-6.9 18.8-5.3 13.9 3.6 27.5 6.9 41.3 9.7 7.5 1.4 12.2 6.1 13 13.9 1.1 11.9 .8 23.6-.3 35.3-2.1 12.7-10.7 20-23.7 24.1zM294.6 195.4c-8.6 0-15.5-6.9-15.5-15.5s6.9-15.5 15.5-15.5c24.7 0 44.7 20 44.7 44.7 0 8.6-6.9 15.5-15.5 15.5s-15.5-6.9-15.5-15.5c0-7.7-6.2-13.9-13.9-13.9zM250.7 114.7c-8.6 0-15.5-6.9-15.5-15.5 0-41.9 34-75.9 75.9-75.9 8.6 0 15.5 6.9 15.5 15.5s-6.9 15.5-15.5 15.5c-24.8 0-45 20.2-45 45 .1 8.5-6.8 15.4-15.4 15.4zM399.7 204.9c-8.6 0-15.5-6.9-15.5-15.5 0-77.5-63.1-140.6-140.6-140.6-8.6 0-15.5-6.9-15.5-15.5s6.9-15.5 15.5-15.5c94.6 0 171.6 77 171.6 171.6 0 8.6-6.9 15.5-15.5 15.5z"/></svg>
          </a>
          <a href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-11 h-11 rounded-full bg-white/10 text-white hover:bg-[#25D366] hover:scale-110 transition-all duration-300" aria-label="WhatsApp">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
          </a>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Planetatapeta. Sva prava zadržana.</p>
          <div className="mt-4 md:mt-0 space-x-4">
            <Link href="/privacy" className="hover:text-yellow-400 transition-colors">Politika privatnosti</Link>
            <Link href="/terms" className="hover:text-yellow-400 transition-colors">Uslovi korišćenja</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
