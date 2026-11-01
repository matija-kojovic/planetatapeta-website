"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useCart } from "@/components/CartProvider";
import { BagIcon, CloseIcon, MenuIcon, PhoneIcon } from "@/components/icons";
import { phoneDigits } from "@/lib/site";

const isCurrent = (pathname, href) => pathname === href || pathname.startsWith(`${href}/`);

export function DesktopNav({ items }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Proizvodi" className="hidden lg:block">
      <ul className="flex items-center gap-1">
        {items.map((item) => {
          const current = isCurrent(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={`relative inline-flex min-h-11 items-center whitespace-nowrap px-2 text-[0.9375rem] no-underline transition-colors hover:text-teal xl:px-3 ${
                  current ? "text-ink after:absolute after:inset-x-2 after:bottom-1.5 after:h-px after:bg-gold xl:after:inset-x-3" : "text-ink-2"
                }`}
              >
                {item.navLabel}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function ContactLink() {
  const current = usePathname() === "/contact";
  return (
    <Link
      href="/contact"
      aria-current={current ? "page" : undefined}
      className={`btn btn-quiet relative hidden lg:inline-flex ${current ? "after:absolute after:inset-x-3 after:bottom-1.5 after:h-px after:bg-gold" : ""}`}
    >
      Kontakt
    </Link>
  );
}

export function CartLink() {
  const { count, ready } = useCart();
  const current = usePathname() === "/cart";
  const label = ready && count > 0 ? `Korpa, ${count} ${count === 1 ? "proizvod" : "proizvoda"}` : "Korpa";
  return (
    <Link
      href="/cart"
      aria-current={current ? "page" : undefined}
      className={`btn btn-quiet relative gap-3 px-3 ${current ? "after:absolute after:inset-x-3 after:bottom-1.5 after:h-px after:bg-gold" : ""}`}
      aria-label={label}
    >
      {/* The count sits on the icon, so it appears without shifting the header. */}
      <span className="relative">
        <BagIcon size={22} />
        {ready && count > 0 ? (
          <span
            className="tabular absolute -right-1.5 -top-2 grid h-[1.125rem] min-w-[1.125rem] place-items-center rounded-full bg-teal px-1 text-[0.6875rem] font-semibold leading-none text-white ring-2 ring-paper"
            aria-hidden="true"
          >
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </span>
      <span className="hidden sm:inline">Korpa</span>
    </Link>
  );
}

export function MobileMenu({ items, phone }) {
  const dialogRef = useRef(null);
  const pathname = usePathname();

  // Close when navigation happens (including browser back/forward).
  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  const open = () => dialogRef.current?.showModal();
  const close = () => dialogRef.current?.close();

  return (
    <div className="lg:hidden">
      <button type="button" className="btn btn-quiet px-3" onClick={open} aria-haspopup="dialog" aria-controls="mobile-menu">
        <MenuIcon size={22} />
        <span className="sr-only xs:not-sr-only">Meni</span>
      </button>

      <dialog
        id="mobile-menu"
        ref={dialogRef}
        aria-label="Meni"
        className="sheet m-0 ml-auto h-dvh max-h-dvh w-full max-w-[26rem] bg-paper p-0"
        onClick={(event) => event.target === dialogRef.current && close()}
      >
        <div className="flex min-h-full flex-col">
          <div className="flex h-[var(--header-h)] items-center justify-between border-b border-line px-[var(--gutter)]">
            <span className="font-display text-[1.5rem] leading-none">planetatapeta</span>
            <button type="button" className="btn btn-quiet -mr-3 px-3" onClick={close}>
              <CloseIcon size={22} />
              <span>Zatvori</span>
            </button>
          </div>

          <nav aria-label="Proizvodi" className="px-[var(--gutter)] py-4">
            <ul>
              {items.map((item) => (
                <li key={item.href} className="border-b border-line last:border-0">
                  <Link
                    href={item.href}
                    onClick={close}
                    aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
                    className="flex items-baseline justify-between gap-4 py-4 no-underline aria-[current=page]:text-teal"
                  >
                    <span className="font-display text-[1.625rem] leading-tight">{item.label}</span>
                    <span className="t-micro shrink-0 text-ink-2">{item.teaser}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto grid gap-2 border-t border-line px-[var(--gutter)] py-6">
            <Link href="/contact" onClick={close} className="btn btn-secondary">
              Kontakt i upiti
            </Link>
            {phone ? (
              <a href={`tel:+${phoneDigits(phone)}`} className="btn btn-quiet">
                <PhoneIcon />
                {phone}
              </a>
            ) : null}
          </div>
        </div>
      </dialog>
    </div>
  );
}
