import Link from "next/link";
import { collectionHref, getCollections } from "@/lib/catalog";

/** Collection filter (A): "Sve" plus each collection, as links so every collection keeps its own page. */
export default function CollectionChips({ category, active = null }) {
  const chips = [
    { key: "sve", label: "Sve", href: `/${category}`, current: active === null },
    ...getCollections(category).map((c) => ({ key: c.slug, label: c.label, href: collectionHref(category, c.slug), current: active === c.slug })),
  ];
  return (
    <nav aria-label="Kolekcije" className="page pt-7">
      <ul className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <li key={chip.key}>
            <Link
              href={chip.href}
              aria-current={chip.current ? "page" : undefined}
              className="inline-flex min-h-[2.625rem] items-center rounded-[var(--radius-control)] border border-edge px-4 text-[0.875rem] no-underline transition-colors hover:border-ink aria-[current=page]:border-ink aria-[current=page]:bg-ink aria-[current=page]:text-paper"
            >
              {chip.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
