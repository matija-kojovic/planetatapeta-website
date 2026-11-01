"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { ArrowIcon, BagIcon, CloseIcon, MenuIcon, SearchIcon } from "@/components/icons";
import { phoneDigits } from "@/lib/site";

const isCurrent = (pathname, href) => pathname === href || pathname.startsWith(`${href}/`);
const OPEN_SEARCH = "planetatapeta:search";

/** Centred uppercase category row under the masthead (desktop). The current page is underlined, never bolder, so nothing shifts. */
export function DesktopNav({ items }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Proizvodi" className="hidden border-y border-line lg:block">
      <ul className="page flex flex-wrap justify-center gap-x-[2.125rem]">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
              className="-mb-px flex min-h-[3.125rem] items-center border-b-2 border-transparent text-[0.8125rem] font-medium uppercase tracking-[0.12em] no-underline transition-colors hover:border-teal aria-[current=page]:border-teal"
            >
              {item.navLabel}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Cart link with its count. The badge's slot is always there, so the count appearing does not move the header. */
export function CartLink() {
  const { count, ready } = useCart();
  const current = usePathname() === "/cart";
  const shown = ready && count > 0;
  const label = shown ? `Korpa, ${count} ${count === 1 ? "proizvod" : "proizvoda"}` : "Korpa";
  return (
    <Link
      href="/cart"
      aria-current={current ? "page" : undefined}
      className="flex min-h-11 min-w-11 items-center justify-end gap-2 text-[0.875rem] no-underline hover:text-teal"
      aria-label={label}
    >
      <BagIcon size={20} />
      <span className={`hidden lg:inline ${current ? "underline decoration-teal decoration-2 underline-offset-[6px]" : ""}`}>Korpa</span>
      <span
        className={`tabular grid h-5 min-w-5 place-items-center rounded-full bg-teal px-1.5 text-[0.71875rem] font-semibold leading-none text-field ${shown ? "" : "invisible"}`}
        aria-hidden="true"
      >
        {shown ? (count > 99 ? "99+" : count) : 0}
      </span>
    </Link>
  );
}

/** Phone menu: a sheet with the categories in the display face, search and the phone number. */
export function MobileMenu({ items, phone }) {
  const dialogRef = useRef(null);
  const pathname = usePathname();

  // Close when navigation happens (including browser back/forward).
  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  const open = () => dialogRef.current?.showModal();
  const close = () => dialogRef.current?.close();
  const search = () => {
    close();
    window.dispatchEvent(new Event(OPEN_SEARCH));
  };

  return (
    <div className="lg:hidden">
      <button type="button" className="-ml-3 grid min-h-11 min-w-11 place-items-center" onClick={open} aria-haspopup="dialog" aria-controls="mobile-menu" aria-label="Meni">
        <MenuIcon size={22} />
      </button>

      <dialog
        id="mobile-menu"
        ref={dialogRef}
        aria-label="Meni"
        className="sheet m-0 mr-auto h-dvh max-h-dvh w-full max-w-[26rem] bg-field p-0"
        onClick={(event) => event.target === dialogRef.current && close()}
      >
        <div className="flex min-h-full flex-col">
          <div className="flex min-h-[4.125rem] items-center justify-between border-b border-line px-5">
            <span className="font-display text-[1.3rem] font-medium tracking-[0.12em]">PLANETATAPETA</span>
            <button type="button" className="-mr-3 grid min-h-11 min-w-11 place-items-center" onClick={close} aria-label="Zatvori meni">
              <CloseIcon size={22} />
            </button>
          </div>

          <button type="button" onClick={search} className="flex min-h-[3.625rem] items-center gap-3 border-b border-line px-5 text-left text-ink-2">
            <SearchIcon size={18} />
            Pretraga
          </button>

          <nav aria-label="Proizvodi">
            <ul>
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
                    aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
                    className="flex min-h-[3.625rem] items-center justify-between gap-4 border-b border-line px-5 font-display text-[1.5rem] no-underline aria-[current=page]:text-teal"
                  >
                    {item.label}
                    <ArrowIcon size={20} />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <p className="px-5 pb-6 pt-5 text-[0.875rem] text-ink-2">
            <a href={`tel:+${phoneDigits(phone)}`} className="text-ink">
              {phone}
            </a>
          </p>
        </div>
      </dialog>
    </div>
  );
}

// Lowercase without diacritics, so "cvetna" finds "Cvetna" and "decije" finds "Dečije".
const fold = (text) => text.toLowerCase().replace(/đ/g, "dj").normalize("NFD").replace(/[̀-ͯ]/g, "");

/** "Pretraga": searches categories, collections and designs by name, without leaving the page. */
export function SearchDialog({ index }) {
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const pathname = usePathname();

  const folded = useMemo(() => index.map((entry) => ({ ...entry, key: fold(`${entry.name} ${entry.context}`) })), [index]);
  const words = fold(query).split(/\s+/).filter(Boolean);
  const results = words.length ? folded.filter((e) => words.every((w) => e.key.includes(w))).slice(0, 30) : folded.filter((e) => e.context === "Kategorija");

  const open = () => {
    dialogRef.current?.showModal();
    requestAnimationFrame(() => inputRef.current?.focus());
  };
  const close = () => dialogRef.current?.close();

  useEffect(() => {
    window.addEventListener(OPEN_SEARCH, open);
    return () => window.removeEventListener(OPEN_SEARCH, open);
  }, []);
  useEffect(() => {
    close();
  }, [pathname]);

  return (
    <>
      <button type="button" onClick={open} className="hidden min-h-11 items-center gap-2 text-[0.875rem] hover:text-teal lg:flex" aria-haspopup="dialog">
        <SearchIcon size={18} />
        Pretraga
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Pretraga"
        className="m-0 mx-auto mt-0 max-h-dvh w-full max-w-none bg-paper p-0 lg:mt-16 lg:max-h-[80dvh] lg:max-w-[46rem] lg:border lg:border-line"
        onClick={(event) => event.target === dialogRef.current && close()}
      >
        <div className="flex max-h-[inherit] flex-col">
          <div className="flex items-center gap-3 border-b border-line px-5 py-3">
            <SearchIcon size={20} className="shrink-0 text-ink-2" />
            <label htmlFor="site-search" className="sr-only">
              Pretražite dizajne i proizvode
            </label>
            <input
              ref={inputRef}
              id="site-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Pretražite dizajne i proizvode"
              autoComplete="off"
              className="min-h-11 min-w-0 flex-1 bg-transparent text-[1.0625rem] outline-none placeholder:text-[#6a7675]"
            />
            <button type="button" onClick={close} className="-mr-3 grid min-h-11 min-w-11 place-items-center" aria-label="Zatvori pretragu">
              <CloseIcon size={22} />
            </button>
          </div>

          <p role="status" className="t-label px-5 pb-2 pt-4">
            {words.length ? (results.length ? `Rezultati: ${results.length}${results.length === 30 ? "+" : ""}` : "Nema rezultata") : "Kategorije"}
          </p>
          <ul className="overflow-y-auto px-5 pb-5">
            {results.map((r) => (
              <li key={r.href} className="border-b border-line">
                <Link href={r.href} onClick={close} className="flex min-h-[3.5rem] items-center gap-4 py-2 no-underline hover:text-teal">
                  {r.src ? (
                    <span className="board w-12 shrink-0 !p-1">
                      <Image src={r.src} alt="" width={96} height={96} sizes="48px" />
                    </span>
                  ) : null}
                  <span className="min-w-0">
                    <span className="block font-medium leading-snug">{r.name}</span>
                    <span className="block text-[0.8125rem] text-ink-2">{r.context}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </>
  );
}
