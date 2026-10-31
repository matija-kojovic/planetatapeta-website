"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Pregled" },
  { href: "/admin/orders", label: "Porudžbine" },
  { href: "/admin/products", label: "Proizvodi i cene" },
  { href: "/admin/content", label: "Sadržaj sajta" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <aside className="border-b border-line bg-board lg:border-b-0 lg:border-r">
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-8 lg:sticky lg:top-0 lg:h-dvh lg:px-5 lg:py-8">
        <div className="flex items-center justify-between gap-4 lg:block">
          <Link href="/admin" className="font-display text-[1.375rem] leading-none no-underline">
            planetatapeta
          </Link>
          <p className="t-micro text-ink-2 lg:mt-1">Administracija</p>
        </div>
        <nav aria-label="Administracija" className="-mx-1 overflow-x-auto lg:mx-0 lg:mt-6">
          <ul className="flex gap-1 lg:flex-col">
            {ITEMS.map((item) => {
              const current = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={current ? "page" : undefined}
                    className="flex min-h-11 items-center whitespace-nowrap rounded-[3px] px-3 text-[0.9375rem] no-underline hover:bg-paper aria-[current=page]:bg-paper aria-[current=page]:font-semibold"
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="flex gap-2 lg:mt-auto lg:flex-col">
          <Link href="/" className="btn btn-quiet justify-start px-3 text-[0.875rem]">
            Otvori sajt
          </Link>
          <button type="button" onClick={logout} className="btn btn-quiet justify-start px-3 text-[0.875rem]">
            Odjavite se
          </button>
        </div>
      </div>
    </aside>
  );
}
