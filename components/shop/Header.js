import Image from "next/image";
import Link from "next/link";
import { CATEGORIES } from "@/lib/catalog";
import { priceTeaser } from "@/lib/pricing";
import { CartLink, ContactLink, DesktopNav, MobileMenu } from "./HeaderClient";

export default function Header({ announcement, phone }) {
  const nav = CATEGORIES.map(({ slug, label, navLabel }) => ({
    href: `/${slug}`,
    label,
    navLabel,
    teaser: priceTeaser(slug),
  }));

  return (
    <>
      {announcement ? (
        <p className="bg-ink px-4 py-2 text-center text-[0.8125rem] text-paper">{announcement}</p>
      ) : null}
      <header className="sticky top-0 z-40 border-b border-line bg-paper">
        <div className="page flex h-[var(--header-h)] items-center gap-4 xl:gap-6">
          <Link href="/" className="flex shrink-0 items-center gap-2.5 no-underline" aria-label="planetatapeta, početna strana">
            <Image src="/brand/mark.webp" alt="" width={456} height={290} priority className="h-8 w-auto lg:h-10" />
            <span className="font-display text-[1.3rem] leading-none text-ink xs:text-[1.5rem] xl:text-[1.65rem]">planetatapeta</span>
          </Link>

          <DesktopNav items={nav} />

          <div className="ml-auto flex items-center gap-1">
            <ContactLink />
            <CartLink />
            <MobileMenu items={nav} phone={phone} />
          </div>
        </div>
      </header>
    </>
  );
}
