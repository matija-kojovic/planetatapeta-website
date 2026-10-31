"use client";

// DropdownMenu.jsx — Accessible horizontal dropdown menu (Menu System Bundle)
import Link from 'next/link';
import menuData from './MenuData';

export default function DropdownMenu({ data = menuData, isMobile = false, onMobileClose = null }) {
  return (
    <nav className={isMobile ? "flex flex-col w-full" : "flex items-center"} aria-label="Glavni meni">
      <ul className={isMobile ? "flex flex-col w-full" : "flex items-center"}>
        {data.menu.categories.map(cat => (
          <li key={cat.id} className="flex items-center w-full" role="menuitem">
            <Link
              href={cat.href || `/category/${cat.id}`}
              className={isMobile 
                ? "w-full px-6 py-4 text-lg font-medium text-white hover:text-amber-400 hover:bg-white/5 transition-colors border-b border-white/5 block"
                : "px-3 xl:px-4 py-[18px] text-[0.95rem] font-medium tracking-[0.02em] text-white hover:text-amber-400 transition-colors"}
              onClick={onMobileClose}
            >
              {cat.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
