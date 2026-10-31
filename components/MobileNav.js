"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import DropdownMenu from "@/components/DropdownMenu";

export default function MobileNav() {
  const { cartCount, isMounted } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <div className="flex items-center space-x-4 relative">
        {/* Cart Icon */}
        <Link href="/cart" onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:text-amber-400 transition-colors flex items-center p-2 relative gap-1 active:scale-95 touch-manipulation">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {isMounted && cartCount > 0 && (
            <span className="absolute top-0 right-0 bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg border border-yellow-400/20">
              {cartCount}
            </span>
          )}
        </Link>

        {/* Hamburger Button (Mobile) */}
        <button 
          className="md:hidden text-white p-2 focus:outline-none hover:text-amber-400 transition-colors active:scale-95 touch-manipulation"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-[#0a0f1d]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl z-40 max-h-[calc(100vh-80px)] overflow-y-auto">
          <nav className="flex flex-col px-4 pt-2 pb-6 gap-2">
            <Link 
              href="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-6 py-4 text-lg font-medium text-white hover:text-amber-400 hover:bg-white/5 rounded-xl transition-colors border-b border-white/5"
            >
              Početna
            </Link>
            <div className="mobile-dropdown-container">
              <DropdownMenu isMobile={true} onMobileClose={() => setIsMobileMenuOpen(false)} />
            </div>
            <Link 
              href="/contact" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-6 py-4 text-lg font-medium text-white hover:text-amber-400 hover:bg-white/5 rounded-xl transition-colors mt-2"
            >
              Kontakt
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
