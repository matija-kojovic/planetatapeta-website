import Link from "next/link";
import { headers } from "next/headers";
import Image from "next/image";
import DropdownMenu from "@/components/DropdownMenu";
import MobileNav from "@/components/MobileNav";
import { getContent } from "@/lib/db";

export default async function Header() {
  const headersList = await headers();
  const pathname = headersList.get("x-invoke-path") || "";

  if (pathname.startsWith('/admin')) {
    return null;
  }

  const content = getContent();
  const logoText = content?.header?.logoText || "PLANETATAPETA";
  const announcement = content?.header?.announcement || "";

  return (
    <>
      {/* Announcement Bar */}
      {announcement && (
        <div className="fixed top-0 w-full z-[60] text-center py-1.5 text-xs font-medium tracking-wide" style={{ backgroundColor: 'var(--color-accent, #eab308)', color: '#0f172a' }}>
          {announcement}
        </div>
      )}
      <header className={`fixed ${announcement ? 'top-8' : 'top-0'} w-full z-50 bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg transition-all`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 gap-4">
            <div className="flex-shrink-0 flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3">
                <Image
                  src="/logoZaSajt.jpeg"
                  alt="Planetatapeta logo"
                  width={44}
                  height={44}
                  className="rounded-lg shadow-lg shadow-teal-500/20 ring-1 ring-white/25 hover:ring-amber-400/40 transition-all duration-300"
                  priority
                />
                <span className="text-2xl font-bold text-white tracking-wider">{logoText}</span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center">
              <Link
                href="/"
                className="px-6 py-[18px] text-[0.95rem] font-medium tracking-[0.02em] text-white hover:text-amber-400 transition-colors"
              >
                Početna
              </Link>
              <DropdownMenu />
            </nav>

            <MobileNav />
          </div>
        </div>
      </header>
    </>
  );
}
